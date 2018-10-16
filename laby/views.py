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
  
# ~ def message(request, game_id):
  # ~ if request.method == "POST":
    # ~ code_ready = request.POST['code_ready']
    # ~ code = request.POST['code']
    # ~ r_num = request.POST['round']
    # ~ p = get_object_or_404(Player, id=request.session['player_id'])
    # ~ g = get_object_or_404(Game, id=game_id)
    
    # ~ json_ctxt = {}
    
    # ~ # Updating player last_seen time
    # ~ if p == g.player_one :
      # ~ g.p1_last_seen = timezone.now()
    # ~ if p == g.player_two :
      # ~ g.p2_last_seen = timezone.now()
    
    # ~ # Cleaning inactive player
    # ~ if not g.p1_active() : g.player_one = None
    # ~ if not g.p2_active() : g.player_two = None
    # ~ g.save()
    
    # ~ # Game activity response
    # ~ json_ctxt['game_active'] = g.active()
    
    # ~ # Message processing
    # ~ if g.active() :
      # ~ if p == g.player_one : # Player one
        # ~ json_ctxt['opponent'] = g.player_two.nickname
        # ~ if code_ready :
          # ~ r, c = g.rounds_set.get_or_create(round_number=r_num)
          # ~ r.player_one_code = code
          # ~ json_ctxt['code_submitted'] = True
          # ~ r.save()
      
      # ~ else :                 # Player two
        # ~ json_ctxt['opponent'] = g.player_one.nickname
        # ~ if code_ready :
          # ~ r, c = g.rounds_set.get_or_create(round_number=r_num)
          # ~ r.player_one_code = code
          # ~ json_ctxt['code_submitted'] = True
          # ~ r.save()
   
    # ~ response = JsonResponse(json_ctxt, status=200)
    # ~ return response
  


# ~ def gameView(request, game_id):
  # ~ ctxt = {}
  # ~ g = Game.objects.get(id=game_id)
  # ~ ctxt['game'] = g
  # ~ rounds = g.rounds_set.all()
  # ~ if not rounds : # First round, first player
    # ~ r = g.rounds_set.create()
  # ~ else:
    # ~ r = g.rounds_set.last()
  # ~ ctxt['player'] = r.last_active
  # ~ r.last_active = (r.last_active + 1) % 2
  # ~ r.save()
  # ~ ctxt['code'] = '';
  # ~ ctxt['round_number'] = r.round_number
  # ~ return render(request, 'game.html', ctxt)
  

# ~ def getCode(request):
  # ~ if request.method == "POST":
    # ~ game = Game.objects.get(id=request.POST['game_id'])
    # ~ r_num = int(request.POST['round_number'])
    # ~ player = int(request.POST['player'])
    # ~ code = request.POST['code']    
    # ~ r = game.rounds_set.get(round_number=r_num, over=False)
    # ~ if player == 0 :
      # ~ if not r.p_one_submitted:
        # ~ r.player_one_code = code
        # ~ r.p_one_submitted = True
        # ~ r.save()
      # ~ if r.p_two_submitted :
        # ~ response = JsonResponse({
          # ~ 'code': r.player_two_code,
          # ~ }, status=200)
      # ~ else :
        # ~ response = JsonResponse({
          # ~ 'reason': 'waiting for player two\'s code'
          # ~ }, status=202)
    # ~ if player == 1 :
      # ~ if not r.p_two_submitted:
        # ~ r.player_two_code = code
        # ~ r.p_two_submitted = True
        # ~ r.save()
      # ~ if r.p_one_submitted :
        # ~ response = JsonResponse({
          # ~ 'code': r.player_one_code,
          # ~ }, status=200)
      # ~ else :
        # ~ response = JsonResponse({
          # ~ 'reason': 'waiting for player two\'s code'
          # ~ }, status=202)
    # ~ return response

# ~ def endRound(request):
  # ~ if request.method == "POST":
    # ~ game = Game.objects.get(id=request.POST['game_id'])
    # ~ r_num = int(request.POST['round_number'])
    # ~ player = int(request.POST['player'])
    # ~ r = game.rounds_set.get(round_number=r_num)
    # ~ if player == 0 :
      # ~ r.p_one_ran = True
    # ~ if player == 1 :
      # ~ r.p_two_ran = True
    # ~ if (r.p_one_ran and r.p_two_ran):
      # ~ r.over = True
      # ~ game.rounds_set.create(round_number=r_num+1)
    # ~ r.save()
    # ~ response = JsonResponse({
      # ~ 'next_round': r_num+1,
      # ~ }, status=200)
    # ~ return response
    
    
