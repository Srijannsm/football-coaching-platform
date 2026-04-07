from datetime import datetime, date

from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from audit_middleware import get_current_user
from adminpanel.models import AuditLog

User = get_user_model()

_SKIP_FIELDS = {"id", "created_at", "updated_at", "booked_at", "password", "last_login"}

_pre_save_cache = {}


def _make_serializable(val):
    """Convert non-JSON-serializable values to JSON-safe types."""
    if isinstance(val, datetime):
        return val.isoformat()
    if isinstance(val, date):
        return val.isoformat()
    return val


def _get_serializable_fields(model):
    """Return field names that should be audited."""
    tracked = []
    for f in model._meta.fields:
        if f.name not in _SKIP_FIELDS and f.concrete:
            tracked.append(f.name)
    return tracked


def _capture_snapshot(instance):
    """Capture a dict of auditable field values."""
    snap = {}
    for name in _get_serializable_fields(instance.__class__):
        val = getattr(instance, name, None)
        if hasattr(val, "pk"):
            val = val.pk
        snap[name] = _make_serializable(val)
    return snap


# --- pre_save: store old values ---
@receiver(pre_save, sender=User)
def _track_user_old(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = User.objects.get(pk=instance.pk)
            _pre_save_cache[f"user_{instance.pk}"] = _capture_snapshot(old)
        except User.DoesNotExist:
            pass


@receiver(pre_save, sender="training.TrainingProgram")
@receiver(pre_save, sender="training.TrainingSession")
@receiver(pre_save, sender="bookings.Booking")
@receiver(pre_save, sender="enquiries.Enquiry")
@receiver(pre_save, sender="gallery.GalleryCategory")
@receiver(pre_save, sender="gallery.GalleryItem")
def _track_old_values(sender, instance, **kwargs):
    if instance.pk:
        key = f"{sender._meta.label_lower}_{instance.pk}"
        try:
            old = sender.objects.get(pk=instance.pk)
            _pre_save_cache[key] = _capture_snapshot(old)
        except sender.DoesNotExist:
            pass


# --- post_save: log create or update ---
@receiver(post_save, sender=User)
def _log_user_change(sender, instance, created, **kwargs):
    user = get_current_user()
    if created:
        AuditLog.log_create(instance, user=user)
    else:
        old = _pre_save_cache.pop(f"user_{instance.pk}", None)
        AuditLog.log_update(instance, user=user, old_data=old)


@receiver(post_save, sender="training.TrainingProgram")
@receiver(post_save, sender="training.TrainingSession")
@receiver(post_save, sender="bookings.Booking")
@receiver(post_save, sender="enquiries.Enquiry")
@receiver(post_save, sender="gallery.GalleryCategory")
@receiver(post_save, sender="gallery.GalleryItem")
def _log_model_change(sender, instance, created, **kwargs):
    user = get_current_user()
    key = f"{sender._meta.label_lower}_{instance.pk}"
    old = _pre_save_cache.pop(key, None)
    if created:
        AuditLog.log_create(instance, user=user)
    else:
        AuditLog.log_update(instance, user=user, old_data=old)


# --- post_delete: log deletion ---
@receiver(post_delete, sender=User)
def _log_user_delete(sender, instance, **kwargs):
    user = get_current_user()
    name = instance.email or instance.username or f"#{instance.pk}"
    AuditLog.objects.create(
        user=user,
        action=AuditLog.ACTION_DELETE,
        model_name="User",
        object_id=str(instance.pk),
        summary=f"Removed user account: {name}",
    )


@receiver(post_delete, sender="training.TrainingProgram")
@receiver(post_delete, sender="training.TrainingSession")
@receiver(post_delete, sender="bookings.Booking")
@receiver(post_delete, sender="enquiries.Enquiry")
@receiver(post_delete, sender="gallery.GalleryCategory")
@receiver(post_delete, sender="gallery.GalleryItem")
def _log_model_delete(sender, instance, **kwargs):
    user = get_current_user()
    AuditLog.log_delete(instance, user=user)
