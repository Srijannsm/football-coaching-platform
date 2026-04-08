from rest_framework.permissions import BasePermission
from rest_framework.throttling import UserRateThrottle


class IsAdminRole(BasePermission):
    """
    Allows access only to admin-role users or Django superusers.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or getattr(user, "is_admin", False))
        )


class AdminRateThrottle(UserRateThrottle):
    """
    Stricter rate limit for admin endpoints (60/min).
    Uses a separate cache scope so admin and player request counts are
    tracked independently — a compromised admin token cannot borrow from
    the regular user bucket.
    """

    scope = "admin"
