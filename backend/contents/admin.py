from django.contrib import admin
from .models import Coach


@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ("user", "specialty", "experience_years", "display_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("user__first_name", "user__last_name", "user__email", "specialty")
    ordering = ("display_order",)