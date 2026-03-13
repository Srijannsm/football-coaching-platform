from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_ADMIN = "admin"
    ROLE_COACH = "coach"
    ROLE_PLAYER = "player"

    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_COACH, "Coach"),
        (ROLE_PLAYER, "Player"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_PLAYER)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.username:
            self.username = self.username.strip().lower()
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)
        
    @property
    def is_coach(self):
        return self.role == self.ROLE_COACH

    @property
    def is_player(self):
        return self.role == self.ROLE_PLAYER
    
    def __str__(self):
        return f" {self.role.capitalize()} - {self.first_name} {self.last_name}"


class PlayerProfile(models.Model):
    FOOT_LEFT = "left"
    FOOT_RIGHT = "right"
    FOOT_BOTH = "both"

    FOOT_CHOICES = [
        (FOOT_LEFT, "Left"),
        (FOOT_RIGHT, "Right"),
        (FOOT_BOTH, "Both"),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="player_profile"
    )
    # first_name = models.CharField(max_length=150)
    # last_name = models.CharField(max_length=150)
    age = models.PositiveIntegerField(blank=True, null=True)
    image = models.ImageField(upload_to="players/", blank=True, null=True)
    preferred_foot = models.CharField(max_length=10, choices=FOOT_CHOICES, blank=True)
    player_rating = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    primary_position = models.CharField(max_length=50, blank=True)
    secondary_position = models.CharField(max_length=50, blank=True)
    height_cm = models.PositiveIntegerField(blank=True, null=True)
    weight_kg = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Player - {self.user.first_name} {self.user.last_name}"
