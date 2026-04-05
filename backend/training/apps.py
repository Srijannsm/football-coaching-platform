from django.apps import AppConfig


class TrainingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "training"
    default = True

    def ready(self):
        import training.signals  # noqa: F401
