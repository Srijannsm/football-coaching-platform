from rest_framework import serializers
from .models import Booking, Payment
from django.db import transaction
from django.utils import timezone
from datetime import datetime


class BookingCreateSerializer(serializers.ModelSerializer):
    payment_method = serializers.ChoiceField(
        choices=[Payment.METHOD_CASH, Payment.METHOD_ESEWA, Payment.METHOD_KHALTI],
        write_only=True,
        default=Payment.METHOD_CASH,
    )

    class Meta:
        model = Booking
        fields = ["id", "session", "booked_at", "payment_method"]
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

        if value.session_date is None or value.start_time is None:
            raise serializers.ValidationError(
                "This session does not have a scheduled date or time yet."
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
        method = validated_data.pop("payment_method", Payment.METHOD_CASH)

        # All bookings start as pending. Cash bookings stay pending until the
        # admin manually confirms them. Online payments (eSewa/Khalti) will be
        # confirmed by the PaymentVerifyView callback once the gateway responds.
        initial_status = Booking.STATUS_PENDING

        with transaction.atomic():
            # Lock the session row so concurrent requests queue up rather than
            # both passing the is_full check simultaneously.
            from training.models import TrainingSession
            locked_session = TrainingSession.objects.select_for_update().get(pk=session.pk)

            existing_booking = Booking.objects.filter(
                player=player_profile, session=locked_session
            ).first()

            if existing_booking:
                if existing_booking.status == Booking.STATUS_CANCELLED:
                    if locked_session.is_full:
                        raise serializers.ValidationError(
                            {"session": "This session is already full."}
                        )
                    existing_booking.status = initial_status
                    existing_booking.save()
                    booking = existing_booking
                    # Remove the old payment record so a new one can be created
                    # (OneToOneField would raise IntegrityError otherwise).
                    Payment.objects.filter(booking=booking).delete()
                else:
                    raise serializers.ValidationError(
                        {"session": "You have already booked this session."}
                    )
            else:
                if locked_session.is_full:
                    raise serializers.ValidationError(
                        {"session": "This session is already full."}
                    )
                booking = Booking.objects.create(
                    player=player_profile,
                    session=locked_session,
                    status=initial_status,
                )

            Payment.objects.create(
                booking=booking,
                method=method,
                status=Payment.STATUS_PENDING,
                amount=locked_session.price,
            )

            return booking


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
    payment_method = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

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
            "payment_method",
            "payment_status",
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

    def get_payment_method(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.method if payment else None

    def get_payment_status(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.status if payment else None


class BookingCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "status"]
        read_only_fields = ["id", "status"]

class DashboardNextBookingSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(
        source="session.program.title",
        read_only=True,
    )
    session_date = serializers.DateField(source="session.session_date", read_only=True)
    start_time = serializers.TimeField(source="session.start_time", read_only=True)
    end_time = serializers.TimeField(source="session.end_time", read_only=True)
    location = serializers.CharField(source="session.location", read_only=True)
    coach_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "status",
            "program_title",
            "session_date",
            "start_time",
            "end_time",
            "location",
            "coach_full_name",
        ]

    def get_coach_full_name(self, obj):
        full_name = (
            f"{obj.session.coach.first_name} {obj.session.coach.last_name}".strip()
        )
        return full_name or obj.session.coach.username


class PlayerDashboardSerializer(serializers.Serializer):
    user = serializers.DictField()
    stats = serializers.DictField()
    next_booking = DashboardNextBookingSerializer(allow_null=True)
    recent_bookings = BookingListSerializer(many=True)