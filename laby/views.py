from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.db import IntegrityError
from django.utils import timezone

from .models import Game, Rounds, Player

# Login and logout ###################
def login(request):
  if not request.method=='POST':
    return render(request, 'login.html')
  pseudo = request.POST['pseudo']
  if len(pseudo) < 5:
    return render(request, 'login.html', {
        'error_message': "Le pseudo doit faire au moins 5 caractères",
    })
  player, created = Player.objects.get_or_create( nickname=pseudo )
  request.session['player_id'] = player.id
  request.session['nickname'] = player.nickname
  return HttpResponseRedirect(reverse('laby:index'))

def logout(request):
  player = get_object_or_404(Player, id=request.session['player_id'])
  games = Game.objects.filter(p1 = player)
  for game in games :
    game.p1 = None
    game.rounds_set.all().delete()
    game.save()
  games = Game.objects.filter(p2 = player)
  for game in games :
    game.p2 = None
    game.rounds_set.all().delete()
    game.save()
  try:
      del request.session['player_id']
      del request.session['nickname']
  except KeyError:
      pass
  return render(request, 'login.html')

def index(request):
  try:
    p = get_object_or_404(Player, id=request.session['player_id'])
    return render(request, 'index.html', {'player' : p})
  except KeyError:
    return HttpResponseRedirect(reverse('laby:login',))
# End login and logout ################


# Game management #####################
def game_list(request):
  game_list = Game.objects.all()
  return render(request, 'game_list.html', {'game_list' : game_list})
  
def create_game(request):
  player = Player.objects.get(id=request.session['player_id'])
  new_game = Game(name=request.POST['gamename'], p1 = player)
  if len(new_game.name) < 5:
    return render(request, 'index.html', {
        'error_message': "Le nom de la partie doit faire au moins 5 caractères"
     })
  try:
    new_game.save()
  except (IntegrityError):
    return render(request, 'index.html', {
        'error_message': "Une partie avec ce nom existe déjà"
        # ~ 'game_list':game_list
     })
  return HttpResponseRedirect(reverse('laby:join_game', args=(new_game.id,)))

def join_game(request, game_id):
  g = get_object_or_404(Game, id=game_id)
  player = Player.objects.get(id=request.session['player_id'])
  pos = 0
  if ((g.p1 and g.p2) and not ((g.p1==player) or (g.p2==player))):
    # both places are occupied, not by us
    return render(request, 'index.html', {
        'error_message': "Toutes les places de cette partie sont occupées",
        'player' : player,
     })
  elif (not g.p1) and (not g.p2):
    print("ENTER AS FIRST PLAYER")
    g.p1 = player
  elif (not g.p1) and (g.p2) and (not g.p2==player):
    print("JOINING AS FIRST PLAYER")
    g.p1 = player
  elif (not g.p2) and (g.p1) and (not g.p1==player):
    print("JOINING AS SECOND PLAYER")
    g.p2 = player
  g.save()
  if g.p1 == player : pos = 0
  if g.p2 == player : pos = 1
  ctxt = {
    'game' : g,
    'player' : player,
    'position' : pos,
  }
  return render(request, 'game_board.html', ctxt)

def leave_game(request, game_id):
  g = get_object_or_404(Game, id=game_id)
  player = Player.objects.get(id=request.session['player_id'])
  if g.p1 == player:
    g.p1 = None
  if g.p2 == player:
    g.p2 = None
  g.rounds_set.all().delete()
  g.save()
  return HttpResponseRedirect(reverse('laby:index',))

def keep_alive(request, game_id):
  g = get_object_or_404(Game, id=game_id)
  player = Player.objects.get(id=request.session['player_id'])
  opponent = None
  opponent_id = None
  opponent_nickname = None
  if g.p1 == player :
    if g.p2 :
      opponent = g.p2
      opponent_id = opponent.id
      opponent_nickname = opponent.nickname
  if g.p2 == player :
    if g.p1 :
      opponent = g.p1
      opponent_id = opponent.id
      opponent_nickname = opponent.nickname
  g.save() # update timestamp
  response = JsonResponse({
    'opponent': opponent_id,
    'nickname': opponent_nickname,
    }, status=200)
  return response
# End Game management #####################


# Code management #########################    
def exchange_code(request, game_id):
  g = get_object_or_404(Game, id=game_id)
  player = Player.objects.get(id=request.session['player_id'])
  r_num = int(request.POST['round_number'])
  code = request.POST['code']

  try :
    g.rounds_set.get(player=player, round_number=r_num);
  except Rounds.DoesNotExist :
    g.rounds_set.create(player=player, code=code, round_number=r_num);

  if g.p1 == player :
    r = g.rounds_set.filter(player=g.p2, round_number=r_num).last()
  if g.p2 == player :
    r = g.rounds_set.filter(player=g.p1, round_number=r_num).last()
  
  if r:
    response = JsonResponse({
      'status': 'code received',
      'code' : r.code,
      'next_round' : r_num + 1,
      }, status=200)
  else:
    response = JsonResponse({
      'status': 'waiting for code',
      }, status=202)
  return response

def end_round(request, game_id):
  g = get_object_or_404(Game, id=game_id)
  player = Player.objects.get(id=request.session['player_id'])
  r_num = int(request.POST['round_number'])
  r = g.rounds_set.get(player=player, round_number=r_num);
  r.score = int(request.POST['score'])
  r.ran = True
  r.save()
  
  if g.p1 == player :
    r = g.rounds_set.filter(player=g.p2, round_number=r_num, ran=True).last()
  if g.p2 == player :
    r = g.rounds_set.filter(player=g.p1, round_number=r_num, ran=True).last()
  
  if r:
    response = JsonResponse({
      'status': 'remote code ran',
      'next_round' : r_num + 1,
      }, status=200)
  else:
    response = JsonResponse({
      'status': 'waiting for remote code to be ran',
      }, status=202)
  return response
  
