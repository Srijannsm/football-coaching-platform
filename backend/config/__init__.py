# This makes the Celery app available as `from config.celery import app`
# and ensures it is loaded whenever Django starts.
from .celery import app as celery_app

__all__ = ("celery_app",)
