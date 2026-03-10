from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class TrainingProgram(models.Model):
    SESSION_TYPE_ONE_TO_ONE = "one_to_one"
    SESSION_TYPE_GROUP = "group"

    SESSION_TYPE_CHOICES = [
        (SESSION_TYPE_ONE_TO_ONE, "One to One"),
        (SESSION_TYPE_GROUP, "Group"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES)
    default_duration_minutes = models.PositiveIntegerField()
    default_price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class TrainingSession(models.Model):
    program = models.ForeignKey(
        TrainingProgram,
        on_delete=models.CASCADE,
        related_name="sessions"
    )
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="assigned_training_sessions"
    )
    session_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=255)
    max_players = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_published = models.BooleanField(default=True)
    is_cancelled = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["session_date", "start_time"]
        indexes = [
            models.Index(fields=["session_date"]),
            models.Index(fields=["is_published", "is_cancelled"]),
        ]

    def __str__(self):
        return f"{self.program.title} - {self.session_date} {self.start_time}"

    @property
    def booked_players_count(self):
        return self.bookings.filter(status="confirmed").count()

    @property
    def available_slots(self):
        return self.max_players - self.booked_players_count

    @property
    def is_full(self):
        return self.booked_players_count >= self.max_players

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be earlier than end time.")

        if self.max_players < 1:
            raise ValidationError("Max players must be at least 1.")

        if self.program.session_type == TrainingProgram.SESSION_TYPE_ONE_TO_ONE and self.max_players != 1:
            raise ValidationError("One-to-one sessions must have max players = 1.")

        if self.coach.role != "coach":
            raise ValidationError("Selected user must have coach role.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)