from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.contrib.auth.models import User
from .models import GameSession
from .forms import GameSessionForm
from django.urls import reverse

# Create your views here.
games = {x: 'js/' + x +'.js' for x in ['tetris', 'space-invaders', 'snake']}

def index(request):
    return render(request, "gameroom/index.html", {'games': list(games.keys())})

def play(request, game):
    print(games[game])
    if request.method == 'POST':
        form = GameSessionForm(request.POST)
        if form.is_valid():
            form.save()
            return render(request, "gameroom/play.html", {'game': game, 'path': games[game], 'form': GameSessionForm()})
        else:
            return render(request, "gameroom/play.html", {'game': game, 'path': games[game], 'form': form})
    else:
        form = GameSessionForm()
        return render(request, "gameroom/play.html", {'game': game, 'path': games[game], 'form': form})
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
    user = None if not request.user.is_authenticated else request.user
    topScores = GameSession.objects.order_by('score', 'date').reverse()
    form = {'user': user,
            'topScores': topScores}
    return render(request, 'gameroom/leaderboard.html', form)

def userProfile(request):
    userSessions = GameSession.objects.filter(user_id = request.user.id).order_by('date')
    return render(request, 'gameroom/userProfile.html', {'userSessions': userSessions})

