from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PlayerProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    # Fields shown when editing an existing user
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("role", "phone_number")}),
    )

    # Fields shown when creating a new user in admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Additional Info",
            {"fields": ("role", "phone_number", "email", "first_name", "last_name")},
        ),
    )

    list_display = (
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_staff",
        "is_active",
    )
    list_filter = ("role", "is_staff", "is_active")


@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "age", "preferred_foot", "player_rating")
    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "user__email",
    )
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "user":
            kwargs["queryset"] = User.objects.filter(role=User.ROLE_PLAYER)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
