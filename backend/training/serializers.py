from rest_framework import serializers
from .models import TrainingProgram, TrainingSession


class TrainingProgramSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = TrainingProgram
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "description",
            "hero_image",
            "hero_image_url",
            "display_order",
            "session_type",
            "default_duration_minutes",
            "default_price",
            "is_active",
            "created_at",
        ]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image and hasattr(obj.hero_image, "url"):
            return request.build_absolute_uri(obj.hero_image.url) if request else obj.hero_image.url
        return None


class TrainingSessionSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source="program.title", read_only=True)
    program_slug = serializers.CharField(source="program.slug", read_only=True)
    session_type = serializers.CharField(source="program.session_type", read_only=True)
    coach_full_name = serializers.SerializerMethodField()
    hero_image_url = serializers.SerializerMethodField()
    booked_players_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    is_booked_by_current_user = serializers.SerializerMethodField()

    class Meta:
        model = TrainingSession
        fields = [
            "id",
            "program",
            "program_title",
            "program_slug",
            "session_type",
            "coach",
            "coach_full_name",
            "hero_image",
            "hero_image_url",
            "session_date",
            "start_time",
            "end_time",
            "location",
            "max_players",
            "price",
            "is_published",
            "is_cancelled",
            "notes",
            "booked_players_count",
            "available_slots",
            "is_full",
            "is_booked_by_current_user",
            "created_at",
        ]

    def get_coach_full_name(self, obj):
        full_name = f"{obj.coach.first_name} {obj.coach.last_name}".strip()
        return full_name or obj.coach.username

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image and hasattr(obj.hero_image, "url"):
            return request.build_absolute_uri(obj.hero_image.url) if request else obj.hero_image.url
        return None

    def get_booked_players_count(self, obj):
        annotated = getattr(obj, "_booked_count", None)
        if annotated is not None:
            return annotated
        return obj.booked_players_count

    def get_available_slots(self, obj):
        booked = self.get_booked_players_count(obj)
        return max(obj.max_players - booked, 0)

    def get_is_full(self, obj):
        return self.get_booked_players_count(obj) >= obj.max_players

    def get_is_booked_by_current_user(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        user = request.user

        if not hasattr(user, "player_profile"):
            return False

        return obj.bookings.filter(
            player=user.player_profile,
            status__in=["pending", "confirmed"],
        ).exists()
