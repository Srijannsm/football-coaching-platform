from rest_framework import serializers

from accounts.models import User
from bookings.models import Booking
from enquiries.models import Enquiry
from training.models import TrainingProgram, TrainingSession


class AdminDashboardStatsSerializer(serializers.Serializer):
    total_players = serializers.IntegerField()
    total_coaches = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    total_programs = serializers.IntegerField()
    active_programs = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    confirmed_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    upcoming_sessions = serializers.IntegerField()
    cancelled_sessions = serializers.IntegerField()
    unpublished_sessions = serializers.IntegerField()
    total_enquiries = serializers.IntegerField()
    new_enquiries = serializers.IntegerField()
    contacted_enquiries = serializers.IntegerField()
    closed_enquiries = serializers.IntegerField()


class RecentBookingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    player_name = serializers.CharField()
    session_title = serializers.CharField()
    session_date = serializers.DateField(allow_null=True)
    status = serializers.CharField()
    booked_at = serializers.DateTimeField()


class RecentEnquirySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    program_title = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()


class UpcomingSessionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    program_title = serializers.CharField()
    coach_name = serializers.CharField()
    session_date = serializers.DateField(allow_null=True)
    start_time = serializers.TimeField(allow_null=True)
    location = serializers.CharField()
    max_players = serializers.IntegerField()
    booked_players_count = serializers.IntegerField()
    available_slots = serializers.IntegerField()


class AdminDashboardSerializer(serializers.Serializer):
    stats = AdminDashboardStatsSerializer()
    recent_bookings = RecentBookingSerializer(many=True)
    recent_enquiries = RecentEnquirySerializer(many=True)
    upcoming_sessions_preview = UpcomingSessionSerializer(many=True)


class AdminPlayerListSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    preferred_foot = serializers.SerializerMethodField()
    primary_position = serializers.SerializerMethodField()
    player_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "is_active",
            "date_joined",
            "age",
            "preferred_foot",
            "primary_position",
            "player_rating",
        ]

    def _get_profile(self, obj):
        try:
            return obj.player_profile
        except Exception:
            return None

    def get_age(self, obj):
        profile = self._get_profile(obj)
        return profile.age if profile else None

    def get_preferred_foot(self, obj):
        profile = self._get_profile(obj)
        return profile.preferred_foot if profile else ""

    def get_primary_position(self, obj):
        profile = self._get_profile(obj)
        return profile.primary_position if profile else ""

    def get_player_rating(self, obj):
        profile = self._get_profile(obj)
        return profile.player_rating if profile else None


class AdminPlayerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "is_active",
        ]


class AdminBookingManageSerializer(serializers.ModelSerializer):
    booked_by = serializers.SerializerMethodField()
    program_title = serializers.CharField(source="session.program.title", read_only=True)
    session_date = serializers.DateField(source="session.session_date", allow_null=True, read_only=True)
    start_time = serializers.TimeField(source="session.start_time", allow_null=True, read_only=True)
    location = serializers.CharField(source="session.location", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "status",
            "booked_at",
            "booked_by",
            "program_title",
            "session_date",
            "start_time",
            "location",
        ]

    def get_booked_by(self, obj):
        full_name = f"{obj.player.user.first_name} {obj.player.user.last_name}".strip()
        return full_name or obj.player.user.username


class AdminBookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["status"]


class AdminTrainingProgramSerializer(serializers.ModelSerializer):
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
        read_only_fields = ["slug", "created_at"]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image and hasattr(obj.hero_image, "url"):
            return request.build_absolute_uri(obj.hero_image.url) if request else obj.hero_image.url
        return None


class AdminTrainingSessionManageSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source="program.title", read_only=True)
    coach_name = serializers.SerializerMethodField()
    booked_players_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = TrainingSession
        fields = [
            "id",
            "program",
            "program_title",
            "coach",
            "coach_name",
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
            "created_at",
        ]
        read_only_fields = [
            "created_at",
            "booked_players_count",
            "available_slots",
        ]

    def get_coach_name(self, obj):
        full_name = f"{obj.coach.first_name} {obj.coach.last_name}".strip()
        return full_name or obj.coach.username

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image and hasattr(obj.hero_image, "url"):
            return request.build_absolute_uri(obj.hero_image.url) if request else obj.hero_image.url
        return None

    def get_booked_players_count(self, obj):
        annotated_value = getattr(obj, "booked_players_count_value", None)
        if annotated_value is not None:
            return annotated_value
        return obj.booked_players_count

    def get_available_slots(self, obj):
        booked_count = self.get_booked_players_count(obj)
        return max(obj.max_players - booked_count, 0)


class AdminEnquiryListSerializer(serializers.ModelSerializer):
    program_title = serializers.SerializerMethodField()

    class Meta:
        model = Enquiry
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "message",
            "program_title",
            "status",
            "admin_notes",
            "created_at",
        ]

    def get_program_title(self, obj):
        return obj.program.title if obj.program else None


class AdminEnquiryUpdateSerializer(serializers.ModelSerializer):
    program_title = serializers.SerializerMethodField()

    class Meta:
        model = Enquiry
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "message",
            "program_title",
            "status",
            "admin_notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "name",
            "email",
            "phone",
            "message",
            "program_title",
            "created_at",
        ]

    def get_program_title(self, obj):
        return obj.program.title if obj.program else None


class AdminCoachOptionSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "full_name"]

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username