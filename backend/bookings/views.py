from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingCancelSerializer,
    PlayerDashboardSerializer,
)
from adminpanel.permissions import IsAdminRole


class BookingListView(generics.ListAPIView):
    queryset = Booking.objects.select_related("player__user", "session__program", "session__coach")
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]


class MyBookingListView(generics.ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, "player_profile"):
            return Booking.objects.none()

        queryset = Booking.objects.select_related(
            "player__user",
            "session__program",
            "session__coach",
        ).filter(player=self.request.user.player_profile)

        booking_status = self.request.query_params.get("status")

        if booking_status == "upcoming":
            queryset = queryset.filter(
                session__session_date__gte=timezone.localdate()
            ).exclude(status=Booking.STATUS_CANCELLED)

        elif booking_status == "past":
            queryset = queryset.filter(session__session_date__lt=timezone.localdate())

        elif booking_status == "cancelled":
            queryset = queryset.filter(status=Booking.STATUS_CANCELLED)

        elif booking_status == "all":
            pass

        else:
            queryset = queryset.exclude(status=Booking.STATUS_CANCELLED)

        return queryset.order_by("-booked_at")


class BookingCancelView(generics.UpdateAPIView):
    serializer_class = BookingCancelSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch", "head", "options"]

    def get_queryset(self):
        if not hasattr(self.request.user, "player_profile"):
            return Booking.objects.none()

        return Booking.objects.select_related("player__user", "session").filter(
            player=self.request.user.player_profile
        )

    def update(self, request, *args, **kwargs):
        booking = self.get_object()

        if booking.status == Booking.STATUS_CANCELLED:
            return Response(
                {"detail": "This booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_start = datetime.combine(
            booking.session.session_date,
            booking.session.start_time,
        )

        if timezone.is_naive(session_start):
            session_start = timezone.make_aware(
                session_start,
                timezone.get_current_timezone(),
            )

        if session_start <= timezone.localtime():
            return Response(
                {
                    "detail": "Cannot cancel a booking for a session that has already started or passed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.STATUS_CANCELLED
        booking.save()

        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PlayerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "player":
            return Response(
                {"detail": "Only players can access the player dashboard."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not hasattr(user, "player_profile"):
            return Response(
                {"detail": "Player profile does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()

        bookings = Booking.objects.select_related(
            "player__user",
            "session__program",
            "session__coach",
        ).filter(player=user.player_profile)

        active_bookings = bookings.exclude(status=Booking.STATUS_CANCELLED)

        upcoming_bookings = active_bookings.filter(session__session_date__gte=today)

        next_booking = upcoming_bookings.order_by(
            "session__session_date",
            "session__start_time",
        ).first()

        recent_bookings = bookings.order_by("-booked_at")[:5]

        dashboard_data = {
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
            },
            "stats": {
                "total_bookings": bookings.count(),
                "upcoming_bookings": upcoming_bookings.count(),
                "cancelled_bookings": bookings.filter(
                    status=Booking.STATUS_CANCELLED
                ).count(),
                "confirmed_bookings": bookings.filter(
                    status=Booking.STATUS_CONFIRMED
                ).count(),
                "attended_sessions": bookings.filter(
                    status=Booking.STATUS_ATTENDED
                ).count(),
            },
            "next_booking": next_booking,
            "recent_bookings": recent_bookings,
        }

        serializer = PlayerDashboardSerializer(dashboard_data)
        return Response(serializer.data)
