from rest_framework import serializers
from .models import Booking


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
            raise serializers.ValidationError("Cannot book a session from an inactive training program.")

        if value.is_full:
            raise serializers.ValidationError("This session is already full.")

        return value

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        if user.role != "player":
            raise serializers.ValidationError("Only players can create bookings.")

        if not hasattr(user, "player_profile"):
            raise serializers.ValidationError("Player profile does not exist.")

        session = attrs["session"]
        player_profile = user.player_profile

        existing_booking = Booking.objects.filter(
            player=player_profile,
            session=session
        ).exclude(status=Booking.STATUS_CANCELLED)

        if existing_booking.exists():
            raise serializers.ValidationError("You have already booked this session.")

        return attrs


class BookingListSerializer(serializers.ModelSerializer):
    session_date = serializers.DateField(source="session.session_date", read_only=True)
    start_time = serializers.TimeField(source="session.start_time", read_only=True)
    end_time = serializers.TimeField(source="session.end_time", read_only=True)
    location = serializers.CharField(source="session.location", read_only=True)
    price = serializers.DecimalField(source="session.price", max_digits=8, decimal_places=2, read_only=True)
    coach_username = serializers.CharField(source="session.coach.username", read_only=True)
    program_title = serializers.CharField(source="session.program.title", read_only=True)
    session_type = serializers.CharField(source="session.program.session_type", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "status",
            "booked_at",
            "session",
            "program_title",
            "session_type",
            "session_date",
            "start_time",
            "end_time",
            "location",
            "price",
            "coach_username",
        ]