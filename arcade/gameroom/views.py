from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.contrib.auth.models import User
from .models import GameSession
from django.urls import reverse

# Create your views here.
games = {x: 'js/' + x +'.js' for x in ['tetris', 'space-invaders', 'snake']}

def index(request):
    return render(request, "gameroom/index.html", {'games': list(games.keys())})

def play(request, game):
    print(games[game])
    return render(request, "gameroom/play.html", {'game': game, 'path': games[game]})
#
def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse("gameroom:home"))
        else:
            return render(request, 'gameroom/register.html', {'form': form})

    else:
        form = UserCreationForm()
    return render(request, 'gameroom/register.html', {'form': form})

def leaderboard(request):
    user = None if !request.user.is_authenticated else request.user
    topUSers = User.objects.all()
    form = {'user': user}
    return render(request, 'gameroom/leaderboard.html')
