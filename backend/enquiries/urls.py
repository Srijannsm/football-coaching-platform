from django.urls import path
from .views import (
    EnquiryCreateView,
    AdminEnquiryListView,
    AdminEnquiryDetailView,
)

urlpatterns = [
    path("enquiries/", EnquiryCreateView.as_view(), name="enquiry-create"),
    path("admin/enquiries/", AdminEnquiryListView.as_view(), name="admin-enquiry-list"),
    path("admin/enquiries/<int:pk>/", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
]