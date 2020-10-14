from django.db import models
from datetime import date
from django.contrib.auth.models import User

# Create your models here.

class GameSession(models.Model):
    id = models.ForeignKey(User, on_delete=models.CASCADE, primary_key=True)
    game = models.CharField(max_length=64)
    score = models.IntegerField()
    date = models.DateField(default=date.today)

    def __str__(self):
        return str(self.id)