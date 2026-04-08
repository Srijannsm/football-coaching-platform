import re

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

PHONE_REGEX = re.compile(r"^\+?\d{7,15}$")


def validate_phone_number(value):
    if value and not PHONE_REGEX.match(value.replace(" ", "")):
        raise ValidationError("Enter a valid phone number (7–15 digits, optional + prefix).")


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
    deleted_at = models.DateTimeField(null=True, blank=True, editable=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True, validators=[validate_phone_number])
    is_email_verified = models.BooleanField(default=False)

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

    @property
    def is_admin(self):
        return self.role == self.ROLE_ADMIN

    def delete(self, using=None, keep_parents=False):
        """Soft delete: deactivate user but keep record for booking history."""
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(using=using, update_fields=["is_active", "deleted_at"])

    def hard_delete(self, using=None, keep_parents=False):
        super().delete(using=using, keep_parents=keep_parents)

    def restore(self):
        self.is_active = True
        self.deleted_at = None
        self.save(update_fields=["is_active", "deleted_at"])

    def __str__(self):
        return f"{self.role.capitalize()} - {self.first_name} {self.last_name}"


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
    nationality = models.CharField(max_length=100, blank=True)
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, validators=[validate_phone_number])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Player - {self.user.first_name} {self.user.last_name}"



class CoachProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="coach_profile"
    )
    image = models.ImageField(upload_to="coaches/", blank=True, null=True)
    bio = models.TextField(blank=True)
    years_experience = models.PositiveIntegerField(blank=True, null=True)
    coaching_level = models.CharField(max_length=120, blank=True)
    specialties = models.CharField(max_length=255, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    availability_schedule = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Coach - {self.user.first_name} {self.user.last_name}"
