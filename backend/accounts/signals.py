from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def on_new_player(sender, instance, created, **kwargs):
    if not created or instance.role != "player":
        return

    from adminpanel.models import Notification
    from adminpanel.email_utils import (
        send_registration_admin_notification,
        send_welcome_email,
    )

    player_name = f"{instance.first_name} {instance.last_name}".strip() or instance.username

    Notification.objects.create(
        title=f"New player registered: {player_name}",
        message=f"@{instance.username} just joined the academy.",
        notification_type=Notification.TYPE_REGISTRATION,
        link="/admin-dashboard/players",
    )

    send_registration_admin_notification(instance)
    send_welcome_email(instance)
