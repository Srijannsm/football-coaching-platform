from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Coach
from .serializers import CoachSerializer


class CoachListAPIView(generics.ListAPIView):
    queryset = Coach.objects.filter(is_active=True).select_related("user")
    serializer_class = CoachSerializer
    permission_classes = [AllowAny]