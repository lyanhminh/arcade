from django.urls import path
from . import views
app_name = 'gameroom'


urlpatterns = [
    path('<str:loggedInUser>', views.index, name='home'),
    path('play/<str:game>', views.play, name='play'),
    path('register', views.register, name='register'),
    path('login', views.login, name='login')] 