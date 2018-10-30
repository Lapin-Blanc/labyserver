from django.urls import path
from .views import login, logout, index, join_game, create_game, game_list, leave_game, keep_alive, exchange_code, end_round, create_map, map_editor, home, map_list

app_name = 'laby'
urlpatterns = [
    path('', home, name='home'),
    path('index/', index, name='index'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('create/', create_game, name='create_game'),
    path('game_list/', game_list, name='game_list'),
    path('game/<int:game_id>/', join_game, name='join_game'),
    path('game/<int:game_id>/leave/', leave_game, name='leave_game'),
    path('game/<int:game_id>/keep_alive/', keep_alive, name='keep_alive'),
    path('game/<int:game_id>/exchange_code/', exchange_code, name='exchange_code'),
    path('game/<int:game_id>/end_round/', end_round, name='end_round'),
    path('map/list/', map_list, name='map_list'),
    path('map/create/', create_map, name='create_map'),
    path('map/<int:map_id>/edit/', create_map, name='create_map'),
]
