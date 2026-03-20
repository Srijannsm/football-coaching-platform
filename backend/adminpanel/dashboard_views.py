from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from bookings.models import Booking
from enquiries.models import Enquiry
from training.models import TrainingProgram, TrainingSession

from .permissions import IsAdminRole
from .serializers import AdminDashboardSerializer


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
                "available_slots": session.available_slots,
            }
            for session in upcoming_sessions_qs
        ]

        data = {
            "stats": stats,
            "recent_bookings": recent_bookings,
            "recent_enquiries": recent_enquiries,
            "upcoming_sessions_preview": upcoming_sessions_preview,
        }

        serializer = AdminDashboardSerializer(data)
        return Response(serializer.data)
