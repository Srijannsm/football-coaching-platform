from datetime import date, datetime

from django.conf import settings
from django.db import models


def _make_json_serializable(val):
    if isinstance(val, datetime):
        return val.isoformat()
    if isinstance(val, date):
        return val.isoformat()
    return val


class AuditLog(models.Model):
    ACTION_CREATE = "create"
    ACTION_UPDATE = "update"
    ACTION_DELETE = "delete"

    ACTIONS = [
        (ACTION_CREATE, "Created"),
        (ACTION_UPDATE, "Changed"),
        (ACTION_DELETE, "Deleted"),
    ]

    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=10, choices=ACTIONS)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=255)
    changes = models.JSONField(null=True, blank=True)
    summary = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "Audit logs"

    def __str__(self):
        return f"[{self.action}] {self.model_name} #{self.object_id} by {self.user}"

    # Human-readable label for each tracked model
    _MODEL_LABELS = {
        "User": "user account",
        "Booking": "booking",
        "TrainingProgram": "training program",
        "TrainingSession": "training session",
        "Enquiry": "enquiry",
        "GalleryCategory": "gallery category",
        "GalleryItem": "gallery item",
    }

    # Fields that are never tracked — mirrors _SKIP_FIELDS in audit_signals.py
    _SKIP_FIELDS = {"id", "created_at", "updated_at", "booked_at", "password", "last_login"}

    @classmethod
    def _model_label(cls, model_name):
        return cls._MODEL_LABELS.get(model_name, model_name.lower())

    @classmethod
    def _instance_name(cls, instance):
        """Return a human-readable identifier for the instance (e.g. its title or email)."""
        for attr in ("title", "name", "email", "username"):
            val = getattr(instance, attr, None)
            if val:
                return str(val)
        return f"#{instance.pk}"

    @classmethod
    def log_create(cls, instance, user=None):
        model_name = instance.__class__.__name__
        label = cls._model_label(model_name)
        name = cls._instance_name(instance)
        cls.objects.create(
            user=user,
            action=cls.ACTION_CREATE,
            model_name=model_name,
            object_id=str(instance.pk),
            changes=None,
            summary=f"Added a new {label}: {name}",
        )

    @classmethod
    def _human_field_name(cls, field_name):
        return field_name.replace("_", " ").title()

    @classmethod
    def _build_summary(cls, model_name, changes):
        changed_keys = list(changes.keys())
        if not changed_keys:
            return ""
        label = cls._model_label(model_name)
        field_labels = [cls._human_field_name(k).lower() for k in changed_keys]
        if len(field_labels) == 1:
            return f"Changed {field_labels[0]} on {label}"
        elif len(field_labels) <= 3:
            return f"Changed {', '.join(field_labels)} on {label}"
        return f"Changed {len(field_labels)} fields on {label}"

    @classmethod
    def log_update(cls, instance, user=None, old_data=None):
        if not old_data:
            return
        changes = {}
        for field in instance._meta.fields:
            # Skip fields that are always excluded
            if field.name in cls._SKIP_FIELDS:
                continue
            # Skip fields that were not captured in the snapshot — no baseline
            # to compare against, so we cannot reliably detect a change.
            if field.name not in old_data:
                continue
            old = old_data.get(field.name)
            new = getattr(instance, field.attname, None)
            if old != new:
                changes[field.name] = {
                    "old": _make_json_serializable(old),
                    "new": _make_json_serializable(new),
                }
        if changes:
            summary = cls._build_summary(instance.__class__.__name__, changes)
            cls.objects.create(
                user=user,
                action=cls.ACTION_UPDATE,
                model_name=instance.__class__.__name__,
                object_id=str(instance.pk),
                changes=changes,
                summary=summary,
            )

    @classmethod
    def log_delete(cls, instance, user=None):
        model_name = instance.__class__.__name__
        label = cls._model_label(model_name)
        name = cls._instance_name(instance)
        cls.objects.create(
            user=user,
            action=cls.ACTION_DELETE,
            model_name=model_name,
            object_id=str(instance.pk),
            summary=f"Removed {label}: {name}",
        )


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
