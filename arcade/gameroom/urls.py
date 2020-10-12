from django.urls import path
from . import views
app_name = 'gameroom'


urlpatterns = [
    path('', views.index, name='home'),
    path('play', views.play, name='play'),
    path('register', views.register, name='register'),
    path('login', views.login, name='login')] 