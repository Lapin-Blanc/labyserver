from django.db import models
from django.utils import timezone
from django.db.models import Max


# Player ################
class Player(models.Model):
  nickname = models.CharField('Pseudo', max_length=50, unique=True)

  def __str__(self):
    return "{}".format(self.nickname)

# Game ##################
class Game(models.Model):
  name = models.CharField('Nom de la partie', max_length=50, unique=True, blank=False, null=False)
  over = models.BooleanField('Game over', default=False)
  p1 = models.ForeignKey(Player, 
        verbose_name = 'Joueur un',
        on_delete = models.SET_NULL,
        null = True,
        related_name = 'game_p1')
  p2 = models.ForeignKey(Player, 
        verbose_name = 'Joueur deux',
        on_delete = models.SET_NULL,
        null = True,
        related_name = 'game_p2')
  time_created = models.DateTimeField('Date de création', auto_now_add=True)
  time_modified = models.DateTimeField('Dernière modification', auto_now=True)
     
  def last_round(self):
    rounds = self.rounds_set.all()
    if rounds:
      return rounds.aggregate(Max('round_number'))['round_number__max']
    return 1
  
  def last_round_time(self):
    return self.rounds_set.all().aggregate(Max('time_modified'))['time_modified__max']
  
  def age(self):
    if self.last_round_time() :
      return (timezone.now() - self.last_round_time()).seconds
    return (timezone.now() - self.time_modified).seconds

  class Meta:
    verbose_name = 'partie'
    verbose_name_plural = 'parties'
    ordering = ['-time_created',]
  
  def __str__(self):
    return "Partie {} [{}]".format(self.name, self.time_created)
  

# Rounds ##################
class Rounds(models.Model):
  game = models.ForeignKey(Game, on_delete=models.CASCADE)
  round_number = models.IntegerField('Round number', default=1)
  player = models.ForeignKey(Player, 
        verbose_name = 'joueur',
        on_delete = models.SET_NULL,
        null = True,
        related_name = 'roune_player')
  code = models.TextField('Player code', blank=True, default='')
  submitted = models.BooleanField('Code validé', default=False)
  ran = models.BooleanField('Code effectué', default=False)
  time_created = models.DateTimeField('Date de création', auto_now_add=True)
  time_modified = models.DateTimeField('Dernière modification', auto_now=True)
  score = models.IntegerField('Score', default=0)
  
  class Meta:
    verbose_name = 'tour'
    verbose_name_plural = 'tours'
    ordering = ['-round_number', '-time_modified']
  
  def __str__(self):
    return "Round {}, player = {}, submitted = {} ran = {}".format(
        self.round_number,
        self.player,
        self.submitted,
        self.ran)
