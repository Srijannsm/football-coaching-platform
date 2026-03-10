from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import PlayerRegisterView, MyProfileView

urlpatterns = [
    path("register/", PlayerRegisterView.as_view(), name="player-register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MyProfileView.as_view(), name="my-profile"),
]