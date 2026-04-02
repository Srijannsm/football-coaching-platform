from django.apps import AppConfig


class EnquiriesConfig(AppConfig):
    name = "enquiries"

    def ready(self):
        import enquiries.signals  # noqa: F401
