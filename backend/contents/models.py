from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Coach(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coach_profile",
        limit_choices_to={"role": "coach"},
    )
    bio = models.TextField(blank=True)
    specialty = models.CharField(max_length=255, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="coaches/", blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "user__first_name", "user__last_name"]

    def __str__(self):
        full_name = f"{self.user.first_name} {self.user.last_name}".strip()
        return full_name or self.user.username


class Testimonial(models.Model):
    ROLE_PLAYER = "player"
    ROLE_PARENT = "parent"

    ROLE_CHOICES = [
        (ROLE_PLAYER, "Player"),
        (ROLE_PARENT, "Parent"),
    ]

    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField()
    image = models.ImageField(upload_to="testimonials/", blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "-created_at"]
        
    def clean(self):
        if self.rating < 1 or self.rating > 5:
            raise ValidationError({"rating": "Rating must be between 1 and 5."})    

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"