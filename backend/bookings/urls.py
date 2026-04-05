from django.urls import path
from .views import (
    BookingCreateView,
    MyBookingListView,
    BookingCancelView,
    BookingListView,
    PlayerDashboardView,
    PaymentInitiateView,
    PaymentVerifyView,
)

urlpatterns = [
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("all-bookings/", BookingListView.as_view(), name="view-all-bookings"),
    path("my-bookings/", MyBookingListView.as_view(), name="my-booking-list"),
    path(
        "my-bookings/<int:pk>/cancel/",
        BookingCancelView.as_view(),
        name="my-booking-cancel",
    ),
    path("bookings/dashboard/", PlayerDashboardView.as_view(), name="player-dashboard"),
    path("payments/initiate/", PaymentInitiateView.as_view(), name="payment-initiate"),
    path("payments/verify/", PaymentVerifyView.as_view(), name="payment-verify"),
]
