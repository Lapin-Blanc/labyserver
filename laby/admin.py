from django.contrib import admin
from .models import Game, Rounds, Map, Player
# Register your models here.

class RoundsInline(admin.TabularInline):
  model = Rounds
  fields = ['round_number', 'player', 'code', 'submitted', 'ran', 'score',]
  extra = 0

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
  list_display = ['name', 'p1', 'p2', 'time_created', 'time_modified', 'over']
  inlines = [RoundsInline]

@admin.register(Rounds)
class RoundsAdmin(admin.ModelAdmin):
  pass

@admin.register(Map)
class RoundsAdmin(admin.ModelAdmin):
  list_display = ['map_name']

@admin.register(Player)
class RoundsAdmin(admin.ModelAdmin):
  list_display = ['nickname']
