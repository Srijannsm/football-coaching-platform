from django.db import models
from django.conf import settings


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
