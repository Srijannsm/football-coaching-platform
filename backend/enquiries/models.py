import re

from django.core.exceptions import ValidationError
from django.db import models

PHONE_REGEX = re.compile(r"^\+?\d{7,15}$")


def validate_phone_number(value):
    if not PHONE_REGEX.match(value.replace(" ", "")):
        raise ValidationError("Enter a valid phone number (7–15 digits, optional + prefix).")


class Enquiry(models.Model):
    STATUS_NEW = "new"
    STATUS_CONTACTED = "contacted"
    STATUS_CLOSED = "closed"

    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_CONTACTED, "Contacted"),
        (STATUS_CLOSED, "Closed"),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, validators=[validate_phone_number])
    message = models.TextField()
    program = models.ForeignKey(
        "training.TrainingProgram",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enquiries",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
    )
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        if self.program:
            return f"{self.name} - {self.program.title}"
        return self.name