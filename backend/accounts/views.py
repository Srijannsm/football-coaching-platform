from datetime import timedelta

from django.conf import settings
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
)
from .models import CoachProfile


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

        response = Response({"detail": "Login successful."}, status=status.HTTP_200_OK)
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
        return Response(serializer.data)


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