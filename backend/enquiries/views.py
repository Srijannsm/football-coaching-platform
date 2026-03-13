from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Enquiry
from .permissions import IsAdminRole
from .serializers import (
    EnquiryCreateSerializer,
    AdminEnquiryListSerializer,
    AdminEnquiryDetailSerializer,
    AdminEnquiryUpdateSerializer,
)


class EnquiryCreateView(generics.CreateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryCreateSerializer
    permission_classes = [AllowAny]


class AdminEnquiryListView(generics.ListAPIView):
    serializer_class = AdminEnquiryListSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return Enquiry.objects.select_related("program").all()


class AdminEnquiryDetailView(generics.RetrieveUpdateAPIView):
    queryset = Enquiry.objects.select_related("program").all()
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.request.method in ["PATCH", "PUT"]:
            return AdminEnquiryUpdateSerializer
        return AdminEnquiryDetailSerializer