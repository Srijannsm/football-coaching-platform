"""
Celery tasks for all async email sending.

Rules:
- Tasks only accept primitive arguments (IDs, strings) — never model instances.
  Instances can't be serialised across the Redis broker.
- Every task uses autoretry_for so transient SMTP failures are retried
  automatically (up to 3 times, with exponential back-off).
- Failures after all retries are logged as ERROR so they appear in Sentry.
"""

import logging

from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


def fire_task(task, *args):
    """
    Dispatch a Celery task asynchronously.
    Falls back to synchronous execution if the broker (Redis) is unavailable,
    so the app never returns a 500 just because Redis isn't running.
    """
    try:
        task.delay(*args)
    except Exception as exc:
        logger.warning(
            "Celery broker unavailable (%s) — running %s synchronously. "
            "Start Redis with: redis-server",
            type(exc).__name__,
            task.name,
        )
        task.apply(args=args)

RETRY_KWARGS = dict(
    autoretry_for=(Exception,),
    max_retries=3,
    default_retry_delay=30,   # seconds; doubles each retry (exponential back-off)
    retry_backoff=True,
    retry_jitter=True,
)


@shared_task(bind=True, name="adminpanel.send_booking_admin_notification", **RETRY_KWARGS)
def send_booking_admin_notification_task(self, booking_id: int):
    from bookings.models import Booking
    from adminpanel.email_utils import send_booking_admin_notification

    try:
        booking = Booking.objects.select_related(
            "player__user", "session__program"
        ).get(pk=booking_id)
    except Booking.DoesNotExist:
        logger.warning("send_booking_admin_notification_task: booking %s not found", booking_id)
        return

    send_booking_admin_notification(booking)


@shared_task(bind=True, name="adminpanel.send_cancellation_admin_notification", **RETRY_KWARGS)
def send_cancellation_admin_notification_task(self, booking_id: int):
    from bookings.models import Booking
    from adminpanel.email_utils import send_cancellation_admin_notification

    try:
        booking = Booking.objects.select_related(
            "player__user", "session__program"
        ).get(pk=booking_id)
    except Booking.DoesNotExist:
        logger.warning("send_cancellation_admin_notification_task: booking %s not found", booking_id)
        return

    send_cancellation_admin_notification(booking)


@shared_task(bind=True, name="adminpanel.send_verification_email", **RETRY_KWARGS)
def send_verification_email_task(self, user_id: int):
    from django.contrib.auth import get_user_model
    from adminpanel.email_utils import send_verification_email

    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning("send_verification_email_task: user %s not found", user_id)
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    send_verification_email(user, frontend_url)


@shared_task(bind=True, name="adminpanel.send_password_reset_email", **RETRY_KWARGS)
def send_password_reset_email_task(self, user_id: int, token: str):
    from django.contrib.auth import get_user_model
    from adminpanel.email_utils import send_password_reset_email

    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning("send_password_reset_email_task: user %s not found", user_id)
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    send_password_reset_email(user, frontend_url, token)


@shared_task(bind=True, name="adminpanel.send_welcome_email", **RETRY_KWARGS)
def send_welcome_email_task(self, user_id: int):
    from django.contrib.auth import get_user_model
    from adminpanel.email_utils import send_welcome_email

    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning("send_welcome_email_task: user %s not found", user_id)
        return

    send_welcome_email(user)


@shared_task(bind=True, name="adminpanel.send_registration_admin_notification", **RETRY_KWARGS)
def send_registration_admin_notification_task(self, user_id: int):
    from django.contrib.auth import get_user_model
    from adminpanel.email_utils import send_registration_admin_notification

    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning("send_registration_admin_notification_task: user %s not found", user_id)
        return

    send_registration_admin_notification(user)


@shared_task(bind=True, name="adminpanel.send_session_cancelled_to_players", **RETRY_KWARGS)
def send_session_cancelled_to_players_task(self, session_id: int):
    from training.models import TrainingSession
    from adminpanel.email_utils import send_session_cancelled_to_players

    try:
        session = TrainingSession.objects.select_related("program", "coach").get(pk=session_id)
    except TrainingSession.DoesNotExist:
        logger.warning("send_session_cancelled_to_players_task: session %s not found", session_id)
        return

    send_session_cancelled_to_players(session)
