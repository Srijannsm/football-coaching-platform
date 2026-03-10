from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Booking
from .serializers import BookingCreateSerializer, BookingListSerializer


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(player=self.request.user.player_profile)


class MyBookingListView(generics.ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.select_related(
            "player__user",
            "session__program",
            "session__coach",
        ).filter(
            player=self.request.user.player_profile
        ).order_by("-booked_at")