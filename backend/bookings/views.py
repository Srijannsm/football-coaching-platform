from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingCancelSerializer,
)

class BookingListView(generics.ListAPIView):
    queryset = Booking.objects.filter()
    serializer_class = BookingListSerializer
    permission_classes = [AllowAny]

class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]


class MyBookingListView(generics.ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
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
            queryset = queryset.filter(
                session__session_date__lt=timezone.localdate()
            )

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

    def get_queryset(self):
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
                {"detail": "Cannot cancel a booking for a session that has already started or passed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.STATUS_CANCELLED
        booking.save()

        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)