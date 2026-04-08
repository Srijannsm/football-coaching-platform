from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from .models import TrainingSession


@receiver(pre_save, sender=TrainingSession)
def _track_cancelled_state(sender, instance, **kwargs):
    """Store the previous is_cancelled value so post_save can detect the transition."""
    if instance.pk:
        try:
            instance._was_cancelled = (
                TrainingSession.objects.filter(pk=instance.pk)
                .values_list("is_cancelled", flat=True)
                .get()
            )
        except TrainingSession.DoesNotExist:
            instance._was_cancelled = False
    else:
        instance._was_cancelled = False


@receiver(post_save, sender=TrainingSession)
def on_session_cancelled(sender, instance, created, **kwargs):
    """When a session transitions from active → cancelled, email all booked players."""
    if created:
        return
    was_cancelled = getattr(instance, "_was_cancelled", True)
    if not was_cancelled and instance.is_cancelled:
        from adminpanel.tasks import send_session_cancelled_to_players_task, fire_task
        fire_task(send_session_cancelled_to_players_task, instance.pk)
