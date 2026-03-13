from django.contrib import admin
from .models import Coach, Testimonial


@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ("user", "specialty", "experience_years", "display_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("user__first_name", "user__last_name", "user__email", "specialty")
    ordering = ("display_order",)
    
@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "rating", "display_order", "is_active", "created_at")
    list_filter = ("role", "is_active", "created_at")
    search_fields = ("name", "quote")
    ordering = ("display_order", "-created_at")    