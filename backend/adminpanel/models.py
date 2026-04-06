from django.db import models


class Notification(models.Model):
    TYPE_ENQUIRY = "enquiry"
    TYPE_BOOKING = "booking"
    TYPE_CANCELLATION = "cancellation"
    TYPE_REGISTRATION = "registration"

    TYPE_CHOICES = [
        (TYPE_ENQUIRY, "New Enquiry"),
        (TYPE_BOOKING, "New Booking"),
        (TYPE_CANCELLATION, "Booking Cancelled"),
        (TYPE_REGISTRATION, "New Registration"),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    recipient_user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
