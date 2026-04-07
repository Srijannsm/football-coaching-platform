from audit_middleware import set_current_user
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    Reads the JWT access token from the 'access_token' HttpOnly cookie
    instead of the Authorization header.

    Also writes the resolved user into thread-local storage so that Django
    signals fired during the same request (e.g. post_save audit hooks) can
    identify who triggered the action — fixing the "System" label that
    appeared when the middleware ran before DRF authentication.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)
        set_current_user(user)
        return user, validated_token
