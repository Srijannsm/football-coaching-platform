from django.urls import path
from .views import CoachListAPIView

urlpatterns = [
    path("coaches/", CoachListAPIView.as_view(), name="coach-list"),
]
