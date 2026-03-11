from rest_framework import serializers
from .models import Booking
from django.utils import timezone
from datetime import datetime


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "session", "booked_at"]
        read_only_fields = ["id", "booked_at"]

    def validate_session(self, value):
        if value.is_cancelled:
            raise serializers.ValidationError("Cannot book a cancelled session.")

        if not value.is_published:
            raise serializers.ValidationError("Cannot book an unpublished session.")

        if not value.program.is_active:
            raise serializers.ValidationError(
                "Cannot book a session from an inactive training program."
            )

        session_start = datetime.combine(value.session_date, value.start_time)
        session_start = timezone.make_aware(
            session_start,
            timezone.get_current_timezone(),
        )

        if session_start <= timezone.localtime():
            raise serializers.ValidationError("Cannot book a past session.")

        return value

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        if user.role != "player":
            raise serializers.ValidationError("Only players can create bookings.")

        if not hasattr(user, "player_profile"):
            raise serializers.ValidationError("Player profile does not exist.")

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        player_profile = request.user.player_profile
        session = validated_data["session"]

        existing_booking = Booking.objects.filter(
            player=player_profile, session=session
        ).first()

        if existing_booking:
            if existing_booking.status == Booking.STATUS_CANCELLED:
                if session.is_full:
                    raise serializers.ValidationError(
                        {"session": "This session is already full."}
                    )

                existing_booking.status = Booking.STATUS_CONFIRMED
                existing_booking.save()
                return existing_booking

            raise serializers.ValidationError(
                {"session": "You have already booked this session."}
            )

        if session.is_full:
            raise serializers.ValidationError(
                {"session": "This session is already full."}
            )

        return Booking.objects.create(
            player=player_profile,
            session=session,
            status=Booking.STATUS_CONFIRMED,
        )


class BookingListSerializer(serializers.ModelSerializer):
    booked_by = serializers.SerializerMethodField()
    session_date = serializers.DateField(source="session.session_date", read_only=True)
    start_time = serializers.TimeField(source="session.start_time", read_only=True)
    end_time = serializers.TimeField(source="session.end_time", read_only=True)
    location = serializers.CharField(source="session.location", read_only=True)
    price = serializers.DecimalField(
        source="session.price", max_digits=8, decimal_places=2, read_only=True
    )
    coach_full_name = serializers.SerializerMethodField()
    program_title = serializers.CharField(
        source="session.program.title", read_only=True
    )
    session_type = serializers.CharField(
        source="session.program.session_type", read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "status",
            "booked_at",
            "session",
            "program_title",
            "booked_by",
            "session_type",
            "session_date",
            "start_time",
            "end_time",
            "location",
            "price",
            "coach_full_name",
        ]

    def get_booked_by(self, obj):
        user = obj.player.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or user.username

    def get_coach_full_name(self, obj):
        full_name = (
            f"{obj.session.coach.first_name} {obj.session.coach.last_name}".strip()
        )
        return full_name or obj.session.coach.username


class BookingCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "status"]
        read_only_fields = ["id", "status"]
