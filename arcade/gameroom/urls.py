from django.urls import path, include
from . import views
app_name = 'gameroom'


urlpatterns = [
    path('', views.index, name='home'),
    path('play/<str:game>', views.play, name='play'),
    path('register', views.register, name='register'),
    path('leaderboard', views.leaderboard, name='leaderboard')
    path('accounts/', include('django.contrib.auth.urls'))]