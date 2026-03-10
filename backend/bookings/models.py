from django.db import models
from django.core.exceptions import ValidationError


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
        "accounts.PlayerProfile", on_delete=models.CASCADE, related_name="bookings"
    )
    session = models.ForeignKey(
        "training.TrainingSession", on_delete=models.CASCADE, related_name="bookings"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_CONFIRMED
    )
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["player", "session"], name="unique_player_session_booking"
            )
        ]
        ordering = ["-booked_at"]

    def __str__(self):
        return f"{self.player.user.username} -> {self.session}"

    def clean(self):
        if self.player.user.role != "player":
            raise ValidationError("Only player profiles can create bookings.")

        if self.session.is_cancelled:
            raise ValidationError("Cannot book a cancelled session.")

        if not self.session.is_published:
            raise ValidationError("Cannot book an unpublished session.")

        if not self.session.program.is_active:
            raise ValidationError(
                "Cannot book a session from an inactive training program."
            )

        if (
            self.status in [self.STATUS_PENDING, self.STATUS_CONFIRMED]
            and self.session.is_full
        ):
            if not self.pk:
                raise ValidationError("This session is already full.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
