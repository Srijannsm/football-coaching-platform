from django.urls import path
from .views import TrainingProgramListView, TrainingSessionListView

urlpatterns = [
    path("training-programs/", TrainingProgramListView.as_view(), name="training-program-list"),
    path("training-sessions/", TrainingSessionListView.as_view(), name="training-session-list"),
]