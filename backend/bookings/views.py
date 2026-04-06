from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime

from .models import Booking, Payment
from .serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingCancelSerializer,
    PlayerDashboardSerializer,
)
from adminpanel.permissions import IsAdminRole


class BookingListView(generics.ListAPIView):
    queryset = Booking.objects.select_related(
        "player__user", "session__program", "session__coach", "payment"
    )
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not request.user.is_email_verified:
            return Response(
                {"detail": "Please verify your email before booking sessions."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)


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
            "payment",
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
        booking.cancellation_reason = request.data.get("cancellation_reason", "")
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
            "payment",
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


class PaymentInitiateView(APIView):
    """
    Initiates an online payment session with eSewa or Khalti.

    TODO: Replace stub logic with real gateway SDK calls once credentials are
    available in settings (ESEWA_MERCHANT_CODE, ESEWA_SECRET_KEY, KHALTI_SECRET_KEY).

    Expected request body:
        { "booking_id": <int>, "method": "esewa" | "khalti" }

    Real response will contain a redirect URL or form payload for the gateway
    checkout page. For eSewa, build the HMAC-signed form payload and return the
    ESEWA_PAYMENT_URL alongside it. For Khalti, call their /epayment/initiate/
    API and return the payment_url from the response.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        method = request.data.get("method")

        if method not in [Payment.METHOD_ESEWA, Payment.METHOD_KHALTI]:
            return Response(
                {"detail": "Invalid payment method. Must be 'esewa' or 'khalti'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = Payment.objects.select_related(
                "booking__player__user"
            ).get(
                booking_id=booking_id,
                booking__player=request.user.player_profile,
                method=method,
                status=Payment.STATUS_PENDING,
            )
        except Payment.DoesNotExist:
            return Response(
                {"detail": "No pending payment found for this booking."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # TODO: Integrate real gateway here.
        # eSewa example:
        #   payload = build_esewa_form_payload(payment)
        #   return Response({"redirect_url": settings.ESEWA_PAYMENT_URL, "form_data": payload})
        # Khalti example:
        #   pidx = khalti_initiate_payment(payment)
        #   return Response({"redirect_url": f"https://pay.khalti.com/?pidx={pidx}"})

        return Response(
            {
                "detail": "Payment gateway not yet configured.",
                "stub": True,
                "booking_id": booking_id,
                "method": method,
                "amount": str(payment.amount),
            },
            status=status.HTTP_200_OK,
        )


class PaymentVerifyView(APIView):
    """
    Receives the redirect / callback from eSewa or Khalti after the player
    completes (or abandons) payment on the gateway page.

    Permission is AllowAny because gateway callbacks are server-to-server
    POST requests that do not carry JWT cookies.

    TODO: Replace stub with real signature/hash verification using gateway
    credentials. On successful verification, inside transaction.atomic():
        1. Set payment.status = Payment.STATUS_COMPLETED
        2. Set payment.transaction_id = <gateway transaction id>
        3. Set payment.gateway_data  = <full raw payload>
        4. Set booking.status = Booking.STATUS_CONFIRMED
    On failure:
        1. Set payment.status = Payment.STATUS_FAILED
        (Leave booking.status = STATUS_PENDING; admin can still confirm manually.)
    """

    permission_classes = [AllowAny]

    def post(self, request):
        # TODO: Parse gateway-specific callback payload here.
        # eSewa sends: oid (our booking id), amt, refId, scd, su/fu params.
        # Khalti sends: pidx, txnId, amount, status, mobile, etc.

        return Response(
            {
                "detail": "Payment verification not yet implemented.",
                "stub": True,
            },
            status=status.HTTP_200_OK,
        )
