from django.db import models
from django.conf import settings


class Booking(models.Model):
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_CANCELLED = "cancelled"
    STATUS_ATTENDED = "attended"
    STATUS_MISSED = "missed"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_ATTENDED, "Attended"),
        (STATUS_MISSED, "Missed"),
    ]

    player = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings"
    )
    session = models.ForeignKey(
        "training.TrainingSession", on_delete=models.CASCADE, related_name="bookings"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_CONFIRMED
    )
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("player", "session")

    def __str__(self):
        return f"{self.player.username} -> {self.session}"
