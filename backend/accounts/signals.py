from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def on_new_player(sender, instance, created, **kwargs):
    if not created or instance.role != "player":
        return

    from adminpanel.models import Notification
    from adminpanel.tasks import (
        send_registration_admin_notification_task,
        send_verification_email_task,
        fire_task,
    )

    player_name = f"{instance.first_name} {instance.last_name}".strip() or instance.username

    Notification.objects.create(
        title=f"New player registered: {player_name}",
        message=f"@{instance.username} just joined the academy.",
        notification_type=Notification.TYPE_REGISTRATION,
        link="/admin-dashboard/players",
    )

    fire_task(send_registration_admin_notification_task, instance.pk)
    fire_task(send_verification_email_task, instance.pk)
