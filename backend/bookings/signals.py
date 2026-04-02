from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Booking


@receiver(pre_save, sender=Booking)
def _track_old_status(sender, instance, **kwargs):
    """Store the previous status so post_save can detect cancellations."""
    if instance.pk:
        try:
            instance._old_status = Booking.objects.get(pk=instance.pk).status
        except Booking.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=Booking)
def on_booking_change(sender, instance, created, **kwargs):
    from adminpanel.models import Notification
    from adminpanel.email_utils import (
        send_booking_admin_notification,
        send_cancellation_admin_notification,
    )

    player = instance.player.user
    player_name = f"{player.first_name} {player.last_name}".strip() or player.username
    session_label = f"{instance.session.program.title} on {instance.session.session_date}"

    if created:
        Notification.objects.create(
            title=f"New booking: {player_name}",
            message=session_label,
            notification_type=Notification.TYPE_BOOKING,
            link="/admin-dashboard/bookings",
        )
        send_booking_admin_notification(instance)

    elif (
        getattr(instance, "_old_status", None) != Booking.STATUS_CANCELLED
        and instance.status == Booking.STATUS_CANCELLED
    ):
        Notification.objects.create(
            title=f"Booking cancelled: {player_name}",
            message=session_label,
            notification_type=Notification.TYPE_CANCELLATION,
            link="/admin-dashboard/bookings",
        )
        send_cancellation_admin_notification(instance)
