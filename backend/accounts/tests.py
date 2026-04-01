from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import PlayerProfile, User


class AuthTests(APITestCase):
    def setUp(self):
        self.player = User.objects.create_user(
            username="testplayer",
            email="player@test.com",
            password="testpass123",
            role="player",
            first_name="Test",
            last_name="Player",
        )
        PlayerProfile.objects.create(user=self.player)

        self.coach = User.objects.create_user(
            username="testcoach",
            email="coach@test.com",
            password="testpass123",
            role="coach",
        )

        self.admin = User.objects.create_user(
            username="testadmin",
            email="admin@test.com",
            password="testpass123",
            role="admin",
        )

    def _login(self, username="testplayer", password="testpass123"):
        """Log in and return the response. Cookies are set on self.client."""
        url = reverse("token_obtain_pair")
        return self.client.post(url, {"username": username, "password": password})

    # ── Registration ──────────────────────────────────────────────────────────

    def test_register_player_success(self):
        url = reverse("player-register")
        data = {
            "username": "newplayer",
            "email": "new@test.com",
            "password": "newpass123",
            "confirm_password": "newpass123",
            "first_name": "New",
            "last_name": "Player",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newplayer").exists())

    def test_register_normalises_username_to_lowercase(self):
        url = reverse("player-register")
        data = {
            "username": "MixedCase",
            "email": "mixed@test.com",
            "password": "pass12345",
            "confirm_password": "pass12345",
            "first_name": "A",
            "last_name": "B",
        }
        self.client.post(url, data)
        self.assertTrue(User.objects.filter(username="mixedcase").exists())

    def test_register_duplicate_username_returns_400(self):
        url = reverse("player-register")
        data = {
            "username": "testplayer",
            "email": "other@test.com",
            "password": "pass12345",
            "first_name": "Dup",
            "last_name": "User",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password_returns_400(self):
        url = reverse("player-register")
        data = {
            "username": "shortpwuser",
            "email": "short@test.com",
            "password": "abc",
            "first_name": "Short",
            "last_name": "PW",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Login ─────────────────────────────────────────────────────────────────

    def test_login_sets_httponly_cookies(self):
        response = self._login()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)
        self.assertTrue(response.cookies["access_token"]["httponly"])
        self.assertTrue(response.cookies["refresh_token"]["httponly"])

    def test_login_does_not_expose_tokens_in_body(self):
        response = self._login()
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_login_invalid_credentials_returns_401(self):
        response = self._login(password="wrongpassword")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("access_token", response.cookies)

    # ── Token refresh ─────────────────────────────────────────────────────────

    def test_token_refresh_with_valid_cookie_issues_new_access_token(self):
        self._login()
        url = reverse("token_refresh")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.cookies)

    def test_token_refresh_without_cookie_returns_401(self):
        url = reverse("token_refresh")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Logout ────────────────────────────────────────────────────────────────

    def test_logout_clears_access_cookie(self):
        self._login()
        url = reverse("logout")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if "access_token" in response.cookies:
            self.assertEqual(response.cookies["access_token"].value, "")

    # ── /api/me/ ──────────────────────────────────────────────────────────────

    def test_me_returns_user_data_when_authenticated(self):
        self._login()
        url = reverse("me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testplayer")
        self.assertEqual(response.data["role"], "player")

    def test_me_requires_authentication(self):
        url = reverse("me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Profile access ────────────────────────────────────────────────────────

    def test_player_can_access_own_profile(self):
        self.client.force_authenticate(user=self.player)
        url = reverse("my-profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_coach_cannot_access_player_profile_endpoint(self):
        self.client.force_authenticate(user=self.coach)
        url = reverse("my-profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_access_player_profile_endpoint(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("my-profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access_profile(self):
        url = reverse("my-profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── User model behaviour ──────────────────────────────────────────────────

    def test_user_role_properties(self):
        self.assertTrue(self.player.is_player)
        self.assertFalse(self.player.is_coach)
        self.assertFalse(self.player.is_admin)

        self.assertTrue(self.coach.is_coach)
        self.assertFalse(self.coach.is_player)

        self.assertTrue(self.admin.is_admin)
        self.assertFalse(self.admin.is_player)
