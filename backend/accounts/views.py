from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied, NotFound

from .serializers import (
    PlayerRegisterSerializer,
    PlayerProfileSerializer,
    MeSerializer,
    PlayerProfileUpdateSerializer,
)



class PlayerRegisterView(generics.CreateAPIView):
    serializer_class = PlayerRegisterSerializer
    permission_classes = [permissions.AllowAny]
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