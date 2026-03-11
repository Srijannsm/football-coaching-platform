from django.urls import path
from .views import BookingCreateView, MyBookingListView, BookingCancelView, BookingListView

urlpatterns = [
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("all-bookings/", BookingListView.as_view(), name="view-all-bookings"),
    path("my-bookings/", MyBookingListView.as_view(), name="my-booking-list"),
    path("my-bookings/<int:pk>/cancel/", BookingCancelView.as_view(), name="my-booking-cancel"),
]