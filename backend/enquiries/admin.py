from django.contrib import admin
from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "phone",
        "program",
        "status",
        "created_at",
    )
    search_fields = ("name", "email", "phone", "message", "admin_notes")
    list_filter = ("status", "program", "created_at")
    ordering = ("-created_at",)
