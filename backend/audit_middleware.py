import threading

_thread_locals = threading.local()


def get_current_user():
    """Return the authenticated user from the current request thread, or None."""
    return getattr(_thread_locals, "user", None)


def set_current_user(user):
    """Explicitly set the current user in thread-local storage.

    Called by CookieJWTAuthentication after resolving the JWT so that signals
    fired during view execution can access the real authenticated user instead
    of falling back to the anonymous user that the middleware saw at startup.
    """
    _thread_locals.user = user


class AuthenticatedUserMiddleware:
    """
    Middleware that initialises thread-local user storage per request.

    The value is intentionally reset to None here and then overwritten by
    CookieJWTAuthentication.authenticate() once the JWT cookie is validated,
    which happens later during DRF view dispatch.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Reset at the start of every request so stale data never leaks
        # between requests on the same thread.
        _thread_locals.user = None
        return self.get_response(request)
