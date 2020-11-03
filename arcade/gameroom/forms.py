from .models import GameSession
from django.db import models
from django.forms import ModelForm
from django import forms

class GameSessionForm(ModelForm):
    class Meta:
        model = GameSession
        fields = ["user", "game", "score"]
        widgets ={'user': forms.HiddenInput(), 'game': forms.HiddenInput(), 'score': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['score'].widget.attrs.update({'id': 'score', 'type': 'hidden'})
        self.fields['user'].widget.attrs.update({ 'type': 'hidden'})
        self.fields['game'].widget.attrs.update({ 'type': 'hidden'})



