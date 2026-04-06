from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class AdminPermissionTests(APITestCase):
    """
    Verify that admin-only endpoints enforce IsAdminRole.
    Uses the admin dashboard URL as a representative guarded endpoint.
    """

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1", email="admin@test.com",
            password="pass12345", role="admin",
        )
        self.player = User.objects.create_user(
            username="player1", email="player@test.com",
            password="pass12345", role="player",
        )
        self.coach = User.objects.create_user(
            username="coach1", email="coach@test.com",
            password="pass12345", role="coach",
        )
        self.superuser = User.objects.create_superuser(
            username="super1", email="super@test.com",
            password="pass12345",
        )

    def test_admin_can_access_dashboard(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_superuser_can_access_dashboard(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_player_cannot_access_dashboard(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_cannot_access_dashboard(self):
        self.client.force_authenticate(user=self.coach)
        response = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access_dashboard(self):
        response = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminPlayerListTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1", email="admin@test.com",
            password="pass12345", role="admin",
        )
        self.player = User.objects.create_user(
            username="player1", email="player@test.com",
            password="pass12345", role="player",
        )

    def test_admin_can_list_players(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-players"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_player_cannot_list_players(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.get(reverse("admin-players"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_list_players(self):
        response = self.client.get(reverse("admin-players"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminEnquiryTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1", email="admin@test.com",
            password="pass12345", role="admin",
        )
        self.player = User.objects.create_user(
            username="player1", email="player@test.com",
            password="pass12345", role="player",
        )

    def test_admin_can_list_enquiries(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-enquiries"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_player_cannot_list_enquiries(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.get(reverse("admin-enquiries"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
