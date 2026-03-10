from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import PlayerProfile
from .serializers import PlayerRegisterSerializer, PlayerProfileSerializer


class PlayerRegisterView(generics.CreateAPIView):
    serializer_class = PlayerRegisterSerializer
    permission_classes = [permissions.AllowAny]


class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "player" or not hasattr(request.user, "player_profile"):
            return Response(
                {"detail": "Player profile not found."},
                status=404
            )

        serializer = PlayerProfileSerializer(request.user.player_profile)
        return Response(serializer.data)