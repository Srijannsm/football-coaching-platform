from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "player",
        "session",
        "status",
        "booked_at",
    )
    list_filter = (
        "status",
        "booked_at",
        "session__session_date",
    )
    search_fields = (
        "player__user__username",
        "session__program__title",
        "session__coach__username",
    )
    ordering = ("-booked_at",)
