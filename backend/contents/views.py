from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Coach, Testimonial
from .serializers import CoachSerializer, TestimonialSerializer


class CoachListAPIView(generics.ListAPIView):
    queryset = Coach.objects.filter(is_active=True).select_related("user")
    serializer_class = CoachSerializer
    permission_classes = [AllowAny]
    
class TestimonialListView(generics.ListAPIView):
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Testimonial.objects.filter(is_active=True).order_by("display_order", "-created_at")    