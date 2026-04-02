from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Enquiry


@receiver(post_save, sender=Enquiry)
def on_new_enquiry(sender, instance, created, **kwargs):
    if not created:
        return

    from adminpanel.models import Notification
    from adminpanel.email_utils import (
        send_enquiry_admin_notification,
        send_enquiry_confirmation,
    )

    short_msg = instance.message[:100] + ("…" if len(instance.message) > 100 else "")
    Notification.objects.create(
        title=f"New enquiry from {instance.name}",
        message=short_msg,
        notification_type=Notification.TYPE_ENQUIRY,
        link="/admin-dashboard/enquiries",
    )

    send_enquiry_admin_notification(instance)
    send_enquiry_confirmation(instance)
