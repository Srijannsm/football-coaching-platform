from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    PlayerRegisterSerializer,
    PlayerProfileSerializer,
    MeSerializer,
    PlayerProfileUpdateSerializer,
    CoachProfileSerializer,
    ChangePasswordSerializer,
)
from .models import CoachProfile

VERIFICATION_TOKEN_EXPIRY = 86400  # 24 hours
PASSWORD_RESET_TOKEN_EXPIRY = 3600  # 1 hour
PASSWORD_RESET_SIGNER_SALT = "password-reset"


def _set_auth_cookies(response, access_token, refresh_token=None):
    """Helper to stamp auth cookies onto a response."""
    jwt_settings = settings.SIMPLE_JWT
    secure = not settings.DEBUG

    response.set_cookie(
        "access_token",
        access_token,
        max_age=int(jwt_settings.get("ACCESS_TOKEN_LIFETIME", timedelta(hours=12)).total_seconds()),
        httponly=True,
        secure=secure,
        samesite="Lax",
    )

    if refresh_token is not None:
        response.set_cookie(
            "refresh_token",
            refresh_token,
            max_age=int(jwt_settings.get("REFRESH_TOKEN_LIFETIME", timedelta(days=1)).total_seconds()),
            httponly=True,
            secure=secure,
            samesite="Lax",
        )


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Login: validates credentials, sets HttpOnly JWT cookies, returns no tokens
    in the response body.
    """
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data["access"]
        refresh_token = serializer.validated_data["refresh"]

        user = serializer.user if hasattr(serializer, 'user') else None
        body = {"detail": "Login successful."}
        if user:
            body["is_email_verified"] = user.is_email_verified

        response = Response(body, status=status.HTTP_200_OK)
        _set_auth_cookies(response, access_token, refresh_token)
        return response


class CookieTokenRefreshView(APIView):
    """
    Token refresh: reads the refresh_token cookie, issues a new access_token
    cookie. No tokens are exposed in the response body.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "No refresh token provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
        except TokenError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response({"detail": "Token refreshed."}, status=status.HTTP_200_OK)
        _set_auth_cookies(response, access_token)
        return response


class LogoutView(APIView):
    """Logout: clears both auth cookies."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response



class PlayerRegisterView(generics.CreateAPIView):
    serializer_class = PlayerRegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class MyProfileView(generics.RetrieveAPIView):
    serializer_class = PlayerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user

        if not user.is_player:
            raise PermissionDenied("Only players can access this profile.")

        if not hasattr(user, "player_profile"):
            raise NotFound("Player profile not found.")

        return user.player_profile


class MeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        data = serializer.data
        data["is_email_verified"] = request.user.is_email_verified
        return Response(data)


class PlayerProfileDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PlayerProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        user = self.request.user

        if not user.is_player:
            raise PermissionDenied("Only players can access this profile.")

        if not hasattr(user, "player_profile"):
            raise NotFound("Player profile does not exist.")

        return user.player_profile

class CoachProfileListView(generics.ListAPIView):
    serializer_class = CoachProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            CoachProfile.objects.select_related("user")
            .filter(
                user__role="coach",
                user__is_active=True,
            )
            .order_by("user__first_name", "user__last_name", "user__username")
        )


class CoachProfileDetailView(generics.RetrieveAPIView):
    serializer_class = CoachProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        return (
            CoachProfile.objects.select_related("user")
            .filter(user__role="coach", user__is_active=True)
        )


class VerifyEmailView(APIView):
    """Validate a signed token and mark the user's email as verified."""

    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response(
                {"detail": "No verification token provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        signer = TimestampSigner()
        try:
            email = signer.unsign(token, max_age=VERIFICATION_TOKEN_EXPIRY)
        except SignatureExpired:
            return Response(
                {"detail": "Verification link has expired."},
                status=status.HTTP_410_GONE,
            )
        except BadSignature:
            return Response(
                {"detail": "Invalid verification token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_user_model().objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_email_verified:
            return Response(
                {"detail": "Email already verified."},
                status=status.HTTP_200_OK,
            )

        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

        return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """Allow an authenticated user to change their own password."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """
    Accept an email address and send a reset link if the account exists.
    Always returns 200 to avoid leaking whether an email is registered.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response(
                {"detail": "Email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_user_model().objects.filter(email__iexact=email).first()
        if user:
            signer = TimestampSigner(salt=PASSWORD_RESET_SIGNER_SALT)
            token = signer.sign(user.email)
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            from adminpanel.email_utils import send_password_reset_email
            send_password_reset_email(user, frontend_url, token)

        # Always return the same response to prevent email enumeration.
        return Response(
            {"detail": "If an account with that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """Validate the reset token and set a new password."""
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token", "").strip()
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if not token:
            return Response(
                {"detail": "Reset token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not new_password:
            return Response(
                {"detail": "New password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(new_password) < 8:
            return Response(
                {"detail": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if new_password != confirm_password:
            return Response(
                {"detail": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        signer = TimestampSigner(salt=PASSWORD_RESET_SIGNER_SALT)
        try:
            email = signer.unsign(token, max_age=PASSWORD_RESET_TOKEN_EXPIRY)
        except SignatureExpired:
            return Response(
                {"detail": "This reset link has expired. Please request a new one."},
                status=status.HTTP_410_GONE,
            )
        except BadSignature:
            return Response(
                {"detail": "Invalid reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_user_model().objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)


class SendVerificationEmailView(APIView):
    """Re-send the verification email for the authenticated user."""

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        user = request.user
        if user.is_email_verified:
            return Response(
                {"detail": "Email already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.email:
            return Response(
                {"detail": "No email address on file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from adminpanel.email_utils import send_verification_email

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        send_verification_email(user, frontend_url)

        return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)
