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
from gallery.models import GalleryCategory, GalleryItem
from training.models import TrainingProgram, TrainingSession

from .models import Notification
from .permissions import IsAdminRole, AdminRateThrottle
from .serializers import (
    AdminDashboardSerializer,
    AdminNotificationSerializer,
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
    AdminGalleryCategorySerializer,
    AdminGalleryItemSerializer,
)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

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
                "booked_players_count": session.booked_players_count_value,
                "available_slots": max(
                    session.max_players - session.booked_players_count_value, 0
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
    throttle_classes = [AdminRateThrottle]

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
    throttle_classes = [AdminRateThrottle]


class AdminBookingListView(generics.ListAPIView):
    serializer_class = AdminBookingManageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def get_queryset(self):
        queryset = Booking.objects.select_related(
            "player__user",
            "session__program",
            "session__coach",
            "payment",
        ).order_by("-booked_at")

        status_filter = self.request.query_params.get("status")
        player_id = self.request.query_params.get("player_id")
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        if player_id:
            queryset = queryset.filter(player_id=player_id)    

        return queryset


class AdminBookingDetailView(generics.RetrieveDestroyAPIView):
    queryset = Booking.objects.select_related("player__user", "session__program", "payment")
    serializer_class = AdminBookingManageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]


class AdminBookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = AdminBookingStatusUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Booking.objects.select_related("player__user", "session__program")


def _require_ids(request):
    """Return (ids, error_response). ids is a non-empty list or None on failure."""
    ids = request.data.get("ids")
    if not ids or not isinstance(ids, list):
        return None, Response(
            {"detail": "ids must be a non-empty list."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return ids, None


class AdminBulkBookingStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    VALID_STATUSES = [
        Booking.STATUS_PENDING,
        Booking.STATUS_CONFIRMED,
        Booking.STATUS_CANCELLED,
    ]

    def post(self, request):
        booking_ids = request.data.get("booking_ids")
        new_status = request.data.get("status")
        cancellation_reason = request.data.get("cancellation_reason", "")

        if not booking_ids or not isinstance(booking_ids, list):
            return Response(
                {"detail": "booking_ids must be a non-empty list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status not in self.VALID_STATUSES:
            return Response(
                {"detail": f"Invalid status. Must be one of: {self.VALID_STATUSES}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_fields = {"status": new_status}
        if new_status == Booking.STATUS_CANCELLED:
            update_fields["cancellation_reason"] = cancellation_reason

        updated = Booking.objects.filter(id__in=booking_ids).update(**update_fields)
        return Response({"updated": updated}, status=status.HTTP_200_OK)


class AdminBulkBookingDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def post(self, request):
        ids, err = _require_ids(request)
        if err:
            return err
        deleted, _ = Booking.objects.filter(id__in=ids).delete()
        return Response({"deleted": deleted}, status=status.HTTP_200_OK)


class AdminBulkEnquiryDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def post(self, request):
        ids, err = _require_ids(request)
        if err:
            return err
        deleted, _ = Enquiry.objects.filter(id__in=ids).delete()
        return Response({"deleted": deleted}, status=status.HTTP_200_OK)


class AdminBulkEnquiryStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    VALID_STATUSES = [
        Enquiry.STATUS_NEW,
        Enquiry.STATUS_CONTACTED,
        Enquiry.STATUS_CLOSED,
    ]

    def post(self, request):
        ids, err = _require_ids(request)
        if err:
            return err

        new_status = request.data.get("status")
        if new_status not in self.VALID_STATUSES:
            return Response(
                {"detail": f"Invalid status. Must be one of: {self.VALID_STATUSES}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = Enquiry.objects.filter(id__in=ids).update(status=new_status)
        return Response({"updated": updated}, status=status.HTTP_200_OK)


class AdminBulkSessionDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def post(self, request):
        ids, err = _require_ids(request)
        if err:
            return err
        deleted, _ = TrainingSession.objects.filter(id__in=ids).delete()
        return Response({"deleted": deleted}, status=status.HTTP_200_OK)


class AdminBulkSessionStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    VALID_ACTIONS = ["publish", "unpublish", "cancel"]

    def post(self, request):
        ids, err = _require_ids(request)
        if err:
            return err

        action = request.data.get("action")
        if action not in self.VALID_ACTIONS:
            return Response(
                {"detail": f"Invalid action. Must be one of: {self.VALID_ACTIONS}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = TrainingSession.objects.filter(id__in=ids)
        if action == "publish":
            updated = qs.update(is_published=True, is_cancelled=False)
        elif action == "unpublish":
            updated = qs.update(is_published=False)
        else:  # cancel
            updated = qs.update(is_cancelled=True)

        return Response({"updated": updated}, status=status.HTTP_200_OK)


class AdminBulkProgramDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def post(self, request):
        ids, err = _require_ids(request)
        if err:
            return err
        deleted, _ = TrainingProgram.objects.filter(id__in=ids).delete()
        return Response({"deleted": deleted}, status=status.HTTP_200_OK)


class AdminTrainingProgramListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminTrainingProgramSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

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
    throttle_classes = [AdminRateThrottle]


class AdminTrainingSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminTrainingSessionManageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

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
    throttle_classes = [AdminRateThrottle]

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
    throttle_classes = [AdminRateThrottle]

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
    throttle_classes = [AdminRateThrottle]


class AdminCoachListView(generics.ListAPIView):
    serializer_class = AdminCoachOptionSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def get_queryset(self):
        return User.objects.filter(
            role=User.ROLE_COACH,
            is_active=True,
        ).order_by("first_name", "last_name", "username")


class AdminCoachDirectoryListView(generics.ListAPIView):
    serializer_class = AdminCoachListSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

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
    throttle_classes = [AdminRateThrottle]


class AdminNotificationListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def get(self, request):
        notifications = Notification.objects.order_by("-created_at")[:50]
        serializer = AdminNotificationSerializer(notifications, many=True)
        unread_count = Notification.objects.filter(is_read=False).count()
        return Response({"results": serializer.data, "unread_count": unread_count})


class AdminNotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        notification.is_read = True
        notification.save()
        return Response({"detail": "Marked as read."})


class AdminNotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def post(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})


# ── Gallery ───────────────────────────────────────────────────────────────────

class AdminGalleryCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminGalleryCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def get_queryset(self):
        return GalleryCategory.objects.annotate(
            item_count=Count("items")
        ).order_by("display_order", "name")


class AdminGalleryCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminGalleryCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]
    queryset = GalleryCategory.objects.all()

    def update(self, request, *args, **kwargs):
        kwargs.setdefault("partial", True)
        return super().update(request, *args, **kwargs)


class AdminGalleryItemListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminGalleryItemSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]

    def get_queryset(self):
        qs = GalleryItem.objects.select_related("category")
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs.order_by("category__display_order", "display_order", "-created_at")


class AdminGalleryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminGalleryItemSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    throttle_classes = [AdminRateThrottle]
    queryset = GalleryItem.objects.select_related("category")

    def update(self, request, *args, **kwargs):
        kwargs.setdefault("partial", True)
        return super().update(request, *args, **kwargs)
