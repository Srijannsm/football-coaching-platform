from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Enquiry
from .serializers import EnquiryCreateSerializer


class EnquiryCreateView(generics.CreateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryCreateSerializer
    permission_classes = [AllowAny]
