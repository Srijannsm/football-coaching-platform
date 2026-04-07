from rest_framework import serializers

from accounts.models import User, PlayerProfile, CoachProfile
from config.validators import validate_phone_number
from bookings.models import Booking
from config.image_utils import process_image, validate_image_file
from enquiries.models import Enquiry
from gallery.models import GalleryCategory, GalleryItem
from training.models import TrainingProgram, TrainingSession
from .models import Notification, AuditLog


class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "notification_type", "link", "is_read", "recipient_user", "created_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "timestamp",
            "user",
            "user_name",
            "action",
            "model_name",
            "object_id",
            "changes",
            "summary",
        ]

    def get_user_name(self, obj):
        if obj.user:
            full = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full or obj.user.email or obj.user.username
        return "System"


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
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PlayerProfile
        fields = [
            "id",
            "user_id",
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
            "nationality",
            "emergency_contact_name",
            "emergency_contact_phone",
            "image_url",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class AdminPlayerUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)
    email = serializers.EmailField(source="user.email", required=False)
    phone_number = serializers.CharField(source="user.phone_number", required=False, allow_blank=True)
    is_active = serializers.BooleanField(source="user.is_active", required=False)

    primary_position = serializers.CharField(required=False, allow_blank=True)
    player_rating = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=4,
        decimal_places=2,
    )
    image = serializers.ImageField(required=False, allow_null=True)
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = PlayerProfile
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "is_active",
            "primary_position",
            "player_rating",
            "nationality",
            "emergency_contact_name",
            "emergency_contact_phone",
            "image",
            "remove_image",
        ]

    def validate_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate_phone_number(self, value):
        return validate_phone_number(value)

    def validate_emergency_contact_phone(self, value):
        return validate_phone_number(value)

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        remove_image = validated_data.pop("remove_image", False)

        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Process image before setting attributes
        if "image" in validated_data and validated_data["image"]:
            validated_data["image"] = process_image(validated_data["image"])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if remove_image:
            if instance.image:
                instance.image.delete(save=False)
            instance.image = None

        instance.save()
        return instance

class AdminBookingManageSerializer(serializers.ModelSerializer):
    booked_by = serializers.SerializerMethodField()
    program_title = serializers.CharField(source="session.program.title", read_only=True)
    session_date = serializers.DateField(source="session.session_date", allow_null=True, read_only=True)
    start_time = serializers.TimeField(source="session.start_time", allow_null=True, read_only=True)
    location = serializers.CharField(source="session.location", read_only=True)
    payment_method = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "status",
            "cancellation_reason",
            "booked_at",
            "booked_by",
            "program_title",
            "session_date",
            "start_time",
            "location",
            "payment_method",
            "payment_status",
        ]

    def get_booked_by(self, obj):
        full_name = f"{obj.player.user.first_name} {obj.player.user.last_name}".strip()
        return full_name or obj.player.user.username

    def get_payment_method(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.method if payment else None

    def get_payment_status(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.status if payment else None


class AdminBookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["status", "cancellation_reason"]


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
            "deleted_at",
            "created_at",
        ]
        read_only_fields = ["slug", "created_at", "deleted_at"]

    def validate_hero_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def create(self, validated_data):
        if validated_data.get("hero_image"):
            validated_data["hero_image"] = process_image(validated_data["hero_image"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("hero_image"):
            validated_data["hero_image"] = process_image(validated_data["hero_image"])
        return super().update(instance, validated_data)

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
            "is_active",
            "deleted_at",
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

    def validate_hero_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def create(self, validated_data):
        if validated_data.get("hero_image"):
            validated_data["hero_image"] = process_image(validated_data["hero_image"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("hero_image"):
            validated_data["hero_image"] = process_image(validated_data["hero_image"])
        return super().update(instance, validated_data)

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


class AdminCoachListSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CoachProfile
        fields = [
            "id",
            "user_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "is_active",
            "date_joined",
            "years_experience",
            "coaching_level",
            "specialties",
            "certifications",
            "availability_schedule",
            "bio",
            "image_url",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class AdminCoachUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)
    email = serializers.EmailField(source="user.email", required=False)
    phone_number = serializers.CharField(source="user.phone_number", required=False, allow_blank=True)
    is_active = serializers.BooleanField(source="user.is_active", required=False)

    image = serializers.ImageField(required=False, allow_null=True)
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = CoachProfile
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "is_active",
            "years_experience",
            "coaching_level",
            "specialties",
            "certifications",
            "availability_schedule",
            "bio",
            "image",
            "remove_image",
        ]

    def validate_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate_phone_number(self, value):
        return validate_phone_number(value)

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        remove_image = validated_data.pop("remove_image", False)

        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Process image before setting attributes
        if "image" in validated_data and validated_data["image"]:
            validated_data["image"] = process_image(validated_data["image"])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if remove_image:
            if instance.image:
                instance.image.delete(save=False)
            instance.image = None

        instance.save()
        return instance


class AdminGalleryCategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = GalleryCategory
        fields = ["id", "name", "slug", "description", "display_order", "is_active", "created_at", "item_count"]
        read_only_fields = ["id", "slug", "created_at"]

    def get_item_count(self, obj):
        return obj.items.count()


class AdminGalleryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = [
            "id",
            "category",
            "category_name",
            "media_type",
            "image",
            "image_url",
            "video_url",
            "video_file",
            "video_file_url",
            "thumbnail",
            "thumbnail_url",
            "caption",
            "display_order",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "category_name", "image_url", "thumbnail_url", "video_file_url"]

    def validate_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate_thumbnail(self, value):
        if value:
            validate_image_file(value)
        return value

    def create(self, validated_data):
        if validated_data.get("image"):
            validated_data["image"] = process_image(validated_data["image"])
        if validated_data.get("thumbnail"):
            validated_data["thumbnail"] = process_image(validated_data["thumbnail"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("image"):
            validated_data["image"] = process_image(validated_data["image"])
        if validated_data.get("thumbnail"):
            validated_data["thumbnail"] = process_image(validated_data["thumbnail"])
        return super().update(instance, validated_data)

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and hasattr(obj.thumbnail, "url"):
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None

    def get_video_file_url(self, obj):
        request = self.context.get("request")
        if obj.video_file and hasattr(obj.video_file, "url"):
            return request.build_absolute_uri(obj.video_file.url) if request else obj.video_file.url
        return None