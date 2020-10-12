from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
from django.urls import reverse

# Create your views here.
users = []
loggedInUser = None

class User:
    def __init__(self, first, last, email):
        self.first = first
        self.last = last
        self.email = email

    def __repr__(self):
        return f"{self.first} {self.last} with email {self.email}"

class RegisterForm(forms.Form):
    firstName = forms.CharField(max_length = 64, min_length = 2, label='FIRST NAME')
    lastName = forms.CharField(max_length = 64, min_length = 2, label='LAST NAME')
    email = forms.EmailField(max_length = 64, min_length = 6, label='EMAIL')

class LoginForm(forms.Form):
    email = forms.EmailField(max_length = 64, min_length =6, label='EMAIL')
    password = forms.CharField(min_length = 8, label = "PASSWORD")

def index(request, loggedInUser=''):
    games = {'tetris': "tetris",
             'snake': 'snake',
             'spaceInvaders': 'space-invaders'}
    return render(request, "gameroom/index.html", {'loggedInUser': loggedInUser, 'games':games})

def play(request, game):
    return render(request, "gameroom/play.html", {'game':game})

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST) 
        if form.is_valid():
            first = form.cleaned_data['firstName']
            last = form.cleaned_data['lastName']
            email = form.cleaned_data['email']
            users.append(User(first, last, email))
            return HttpResponseRedirect(reverse("gameroom:home"))
        else:
            return render(request, 'gameroom/register.html', {'form':form})
    return render(request, 'gameroom/register.html', {'form': RegisterForm()})

def login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        loggedInUser = None
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            if email in [x.email for x in users]:
                loggedInUser = next(filter(lambda user: user.email == email, users))
            return HttpResponseRedirect(reverse("gameroom:home", kwargs={ 'loggedInUser': loggedInUser }))
        else:
            return render(request, 'gameroom/login.html', {'form': form})
    else:
        return render(request, 'gameroom/login.html', {'form': LoginForm()})



