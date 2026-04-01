from django.urls import path
from .views import (
    PlayerRegisterView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    MyProfileView,
    MeView,
    PlayerProfileDetailUpdateView,
    CoachProfileListView,
)

urlpatterns = [
    path("register/", PlayerRegisterView.as_view(), name="player-register"),
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("my-profile/", MyProfileView.as_view(), name="my-profile"),
    path("me/", MeView.as_view(), name="me"),
    path("player/profile/", PlayerProfileDetailUpdateView.as_view(), name="player-profile"),
    path("coaches/profiles/", CoachProfileListView.as_view(), name="coach-profiles"),
]
