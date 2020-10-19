from django.db import models
from datetime import date
from django.contrib.auth.models import User

# Create your models here.

class GameSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="gameSession")
    game = models.CharField(max_length=64)
    score = models.IntegerField()
    date = models.DateField(default=date.today)

    def __str__(self):
        return f" {str(self.id)}: {self.user.username} "