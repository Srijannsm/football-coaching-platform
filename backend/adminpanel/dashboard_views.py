from django.db.models import Count, Q, Value
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.db.models.functions import Concat

from accounts.models import User, CoachProfile, PlayerProfile
from bookings.models import Booking
from enquiries.models import Enquiry
from training.models import TrainingProgram, TrainingSession

from .permissions import IsAdminRole
from .serializers import (
    AdminDashboardSerializer,
    AdminPlayerListSerializer,
    AdminPlayerUpdateSerializer,
    AdminBookingManageSerializer,
    AdminBookingStatusUpdateSerializer,
    AdminTrainingProgramSerializer,
    AdminTrainingSessionManageSerializer,
    AdminEnquiryListSerializer,
    AdminEnquiryUpdateSerializer,
    AdminCoachOptionSerializer,
    AdminCoachListSerializer,
    AdminCoachUpdateSerializer,
)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        today = timezone.localdate()

        stats = {
            "total_players": User.objects.filter(role=User.ROLE_PLAYER).count(),
            "total_coaches": User.objects.filter(role=User.ROLE_COACH).count(),
            "total_admins": User.objects.filter(role=User.ROLE_ADMIN).count(),
            "total_programs": TrainingProgram.objects.count(),
            "active_programs": TrainingProgram.objects.filter(is_active=True).count(),
            "total_bookings": Booking.objects.count(),
            "pending_bookings": Booking.objects.filter(
                status=Booking.STATUS_PENDING
            ).count(),
            "confirmed_bookings": Booking.objects.filter(
                status=Booking.STATUS_CONFIRMED
            ).count(),
            "cancelled_bookings": Booking.objects.filter(
                status=Booking.STATUS_CANCELLED
            ).count(),
            "upcoming_sessions": TrainingSession.objects.filter(
                session_date__gte=today,
                is_cancelled=False,
                is_published=True,
            ).count(),
            "cancelled_sessions": TrainingSession.objects.filter(
                is_cancelled=True
            ).count(),
            "unpublished_sessions": TrainingSession.objects.filter(
                is_published=False
            ).count(),
            "total_enquiries": Enquiry.objects.count(),
            "new_enquiries": Enquiry.objects.filter(status=Enquiry.STATUS_NEW).count(),
            "contacted_enquiries": Enquiry.objects.filter(
                status=Enquiry.STATUS_CONTACTED
            ).count(),
            "closed_enquiries": Enquiry.objects.filter(
                status=Enquiry.STATUS_CLOSED
            ).count(),
        }

        recent_bookings_qs = Booking.objects.select_related(
            "player__user",
            "session__program",
        ).order_by("-booked_at")[:5]

        recent_bookings = [
            {
                "id": booking.id,
                "player_name": (
                    f"{booking.player.user.first_name} {booking.player.user.last_name}".strip()
                    or booking.player.user.username
                ),
                "session_title": booking.session.program.title,
                "session_date": booking.session.session_date,
                "status": booking.status,
                "booked_at": booking.booked_at,
            }
            for booking in recent_bookings_qs
        ]

        recent_enquiries_qs = Enquiry.objects.select_related("program").order_by(
            "-created_at"
        )[:5]

        recent_enquiries = [
            {
                "id": enquiry.id,
                "name": enquiry.name,
                "email": enquiry.email,
                "phone": enquiry.phone,
                "program_title": enquiry.program.title if enquiry.program else None,
                "status": enquiry.status,
                "created_at": enquiry.created_at,
            }
            for enquiry in recent_enquiries_qs
        ]

        upcoming_sessions_qs = (
            TrainingSession.objects.select_related("program", "coach")
            .annotate(
                booked_players_count_value=Count(
                    "bookings",
                    filter=Q(
                        bookings__status__in=[
                            Booking.STATUS_PENDING,
                            Booking.STATUS_CONFIRMED,
                        ]
                    ),
                )
            )
            .filter(
                session_date__gte=today,
                is_cancelled=False,
                is_published=True,
            )
            .order_by("session_date", "start_time")[:5]
        )

        upcoming_sessions_preview = [
            {
                "id": session.id,
                "program_title": session.program.title,
                "coach_name": (
                    f"{session.coach.first_name} {session.coach.last_name}".strip()
                    or session.coach.username
                ),
                "session_date": session.session_date,
                "start_time": session.start_time,
                "location": session.location,
                "max_players": session.max_players,
                "booked_players_count": session.booked_players_count,
                "available_slots": max(
                    session.max_players - session.booked_players_count, 0
                ),
            }
            for session in upcoming_sessions_qs
        ]

        payload = {
            "stats": stats,
            "recent_bookings": recent_bookings,
            "recent_enquiries": recent_enquiries,
            "upcoming_sessions_preview": upcoming_sessions_preview,
        }

        serializer = AdminDashboardSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminPlayerListView(generics.ListAPIView):
    serializer_class = AdminPlayerListSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = (
            PlayerProfile.objects
            .select_related("user")
            .filter(user__role=User.ROLE_PLAYER)
            .order_by("-user__date_joined")
        )

        search = self.request.query_params.get("search", "").strip()
        is_active = self.request.query_params.get("is_active")

        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__phone_number__icontains=search)
                | Q(primary_position__icontains=search)
                | Q(preferred_foot__icontains=search)
            ).distinct()

        if is_active is not None:
            if is_active.lower() == "true":
                queryset = queryset.filter(user__is_active=True)
            elif is_active.lower() == "false":
                queryset = queryset.filter(user__is_active=False)

        return queryset


class AdminPlayerDetailView(generics.RetrieveUpdateAPIView):
    queryset = (
        PlayerProfile.objects
        .select_related("user")
        .filter(user__role=User.ROLE_PLAYER)
    )
    serializer_class = AdminPlayerUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AdminBookingListView(generics.ListAPIView):
    serializer_class = AdminBookingManageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = Booking.objects.select_related(
            "player__user",
            "session__program",
            "session__coach",
        ).order_by("-booked_at")

        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset


class AdminBookingDetailView(generics.RetrieveDestroyAPIView):
    queryset = Booking.objects.select_related("player__user", "session__program")
    serializer_class = AdminBookingManageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AdminBookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = AdminBookingStatusUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Booking.objects.select_related("player__user", "session__program")


class AdminTrainingProgramListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminTrainingProgramSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = TrainingProgram.objects.all().order_by("display_order", "title")

        status_filter = self.request.query_params.get("status")
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)

        return queryset


class AdminTrainingProgramDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrainingProgram.objects.all()
    serializer_class = AdminTrainingProgramSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AdminTrainingSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminTrainingSessionManageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = (
            TrainingSession.objects.select_related("program", "coach")
            .annotate(
                booked_players_count_value=Count(
                    "bookings",
                    filter=Q(
                        bookings__status__in=[
                            Booking.STATUS_PENDING,
                            Booking.STATUS_CONFIRMED,
                        ]
                    ),
                )
            )
            .order_by("session_date", "start_time")
        )

        status_filter = self.request.query_params.get("status")
        if status_filter == "published":
            queryset = queryset.filter(is_published=True, is_cancelled=False)
        elif status_filter == "unpublished":
            queryset = queryset.filter(is_published=False, is_cancelled=False)
        elif status_filter == "cancelled":
            queryset = queryset.filter(is_cancelled=True)

        return queryset


class AdminTrainingSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminTrainingSessionManageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return TrainingSession.objects.select_related("program", "coach").annotate(
            booked_players_count_value=Count(
                "bookings",
                filter=Q(
                    bookings__status__in=[
                        Booking.STATUS_PENDING,
                        Booking.STATUS_CONFIRMED,
                    ]
                ),
            )
        )


class AdminEnquiryListView(generics.ListAPIView):
    serializer_class = AdminEnquiryListSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = Enquiry.objects.select_related("program").order_by("-created_at")

        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset


class AdminEnquiryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Enquiry.objects.select_related("program").all()
    serializer_class = AdminEnquiryUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AdminCoachListView(generics.ListAPIView):
    serializer_class = AdminCoachOptionSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return User.objects.filter(
            role=User.ROLE_COACH,
            is_active=True,
        ).order_by("first_name", "last_name", "username")


class AdminCoachDirectoryListView(generics.ListAPIView):
    serializer_class = AdminCoachListSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = (
            CoachProfile.objects.select_related("user")
            .filter(user__role=User.ROLE_COACH)
            .order_by("-user__date_joined")
        )

        search = self.request.query_params.get("search", "").strip()
        is_active = self.request.query_params.get("is_active")

        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__phone_number__icontains=search)
                | Q(specialties__icontains=search)
                | Q(coaching_level__icontains=search)
            ).distinct()

        if is_active is not None:
            if is_active.lower() == "true":
                queryset = queryset.filter(user__is_active=True)
            elif is_active.lower() == "false":
                queryset = queryset.filter(user__is_active=False)

        return queryset


class AdminCoachDetailView(generics.RetrieveUpdateAPIView):
    queryset = CoachProfile.objects.select_related("user").filter(
        user__role=User.ROLE_COACH
    )
    serializer_class = AdminCoachUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
