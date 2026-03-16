from django.urls import path
from .views import (
    TrainingProgramListView,
    TrainingSessionListView,
    TrainingSessionDetailView,
)

urlpatterns = [
    path(
        "training-programs/",
        TrainingProgramListView.as_view(),
        name="training-program-list",
    ),
    path(
        "training-sessions/",
        TrainingSessionListView.as_view(),
        name="training-session-list",
    ),
    path(
        "training-sessions/<int:pk>/",
        TrainingSessionDetailView.as_view(),
        name="training-session-detail",
    ),
]
