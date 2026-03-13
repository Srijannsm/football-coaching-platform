from django.urls import path
from .views import CoachListAPIView, TestimonialListView

urlpatterns = [
    path("coaches/", CoachListAPIView.as_view(), name="coach-list"),
    path("testimonials/", TestimonialListView.as_view(), name="testimonial-list"),
]
