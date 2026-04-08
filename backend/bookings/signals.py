from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Booking, Payment


@receiver(pre_save, sender=Booking)
def _track_old_status(sender, instance, **kwargs):
    """Store the previous status so post_save can detect transitions."""
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
    from adminpanel.tasks import (
        send_booking_admin_notification_task,
        send_cancellation_admin_notification_task,
        fire_task,
    )

    player = instance.player.user
    player_name = f"{player.first_name} {player.last_name}".strip() or player.username
    session_label = f"{instance.session.program.title} on {instance.session.session_date}"
    old_status = getattr(instance, "_old_status", None)

    if created:
        # Brand-new booking — notify admin via in-app notification (sync, fast)
        # and send email asynchronously via Celery.
        Notification.objects.create(
            title=f"New booking: {player_name}",
            message=session_label,
            notification_type=Notification.TYPE_BOOKING,
            link="/admin-dashboard/bookings",
        )
        fire_task(send_booking_admin_notification_task, instance.pk)

    elif old_status == Booking.STATUS_CANCELLED and instance.status != Booking.STATUS_CANCELLED:
        # Player re-booked a previously cancelled session.
        Notification.objects.create(
            title=f"Re-booking: {player_name}",
            message=session_label,
            notification_type=Notification.TYPE_BOOKING,
            link="/admin-dashboard/bookings",
        )
        fire_task(send_booking_admin_notification_task, instance.pk)

    elif old_status != Booking.STATUS_CANCELLED and instance.status == Booking.STATUS_CANCELLED:
        # Booking was cancelled.
        Notification.objects.create(
            title=f"Booking cancelled: {player_name}",
            message=session_label,
            notification_type=Notification.TYPE_CANCELLATION,
            link="/admin-dashboard/bookings",
        )
        fire_task(send_cancellation_admin_notification_task, instance.pk)

    # Keep payment status in sync with booking status changes.
    if not created:
        try:
            payment = instance.payment
            if instance.status == Booking.STATUS_CONFIRMED and payment.status == Payment.STATUS_PENDING:
                payment.status = Payment.STATUS_COMPLETED
                payment.save(update_fields=["status", "updated_at"])
            elif instance.status == Booking.STATUS_PENDING and payment.status == Payment.STATUS_COMPLETED:
                payment.status = Payment.STATUS_PENDING
                payment.save(update_fields=["status", "updated_at"])
        except Payment.DoesNotExist:
            pass
