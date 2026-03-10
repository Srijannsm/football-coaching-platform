from django.contrib import admin
from .models import TrainingProgram, TrainingSession
from bookings.models import Booking
from accounts.models import User


class BookingInline(admin.TabularInline):
    model = Booking
    extra = 0
    fields = ("player", "status", "booked_at")
    readonly_fields = ("booked_at",)
    
    
@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "session_type",
        "default_duration_minutes",
        "default_price",
        "is_active",
        "created_at",
    )
    list_filter = ("session_type", "is_active", "created_at")
    search_fields = ("title", "description")
    ordering = ("title",)


@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = (
        "program",
        "coach",
        "session_date",
        "start_time",
        "end_time",
        "location",
        "max_players",
        "price",
        "is_published",
        "is_cancelled",
        "booked_players_count",
        "available_slots",
    )
    list_filter = (
        "program__session_type",
        "is_published",
        "is_cancelled",
        "session_date",
        "coach",
    )
    search_fields = (
        "program__title",
        "coach__username",
        "location",
        "notes",
    )
    ordering = ("session_date", "start_time")
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "coach":
            kwargs["queryset"] = User.objects.filter(role=User.ROLE_COACH)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)