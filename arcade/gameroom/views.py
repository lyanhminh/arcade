from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.contrib.auth.models import User
from django.urls import reverse

# Create your views here.

def index(request, loggedInUser=''):
    games = ["tetris", 'snake', 'space-invaders']
    return render(request, "gameroom/index.html", {'games': games})

def play(request, game):
    return render(request, "gameroom/play.html", {'game':game})
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

#
