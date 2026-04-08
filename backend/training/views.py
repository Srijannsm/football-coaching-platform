from django.db.models import Count, Q
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import TrainingProgram, TrainingSession
from .serializers import TrainingProgramSerializer, TrainingSessionSerializer
from bookings.models import Booking
from django.utils.timezone import localdate


def _annotate_session_counts(queryset):
    return queryset.annotate(
        _booked_count=Count(
            "bookings",
            filter=Q(
                bookings__status__in=[
                    Booking.STATUS_PENDING,
                    Booking.STATUS_CONFIRMED,
                ]
            ),
        )
    )


class TrainingProgramListView(generics.ListAPIView):
    queryset = TrainingProgram.objects.filter(is_active=True)
    serializer_class = TrainingProgramSerializer
    permission_classes = [AllowAny]


class TrainingSessionListView(generics.ListAPIView):
    serializer_class = TrainingSessionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = _annotate_session_counts(
            TrainingSession.objects.select_related("program", "coach").filter(
                is_published=True,
                is_cancelled=False,
                program__is_active=True,
                session_date__gte=localdate(),
            )
        )

        program_id = self.request.query_params.get("program")
        session_date = self.request.query_params.get("date")
        session_type = self.request.query_params.get("session_type")

        if program_id:
            queryset = queryset.filter(program_id=program_id)

        if session_date:
            queryset = queryset.filter(session_date=session_date)

        if session_type:
            queryset = queryset.filter(program__session_type=session_type)

        return queryset.order_by("session_date", "start_time")


class TrainingSessionDetailView(generics.RetrieveAPIView):
    serializer_class = TrainingSessionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # No date filter here — past sessions must remain accessible so players
        # can view details of sessions they already booked.
        return _annotate_session_counts(
            TrainingSession.objects.select_related("program", "coach").filter(
                is_published=True,
                is_cancelled=False,
                program__is_active=True,
            )
        )
