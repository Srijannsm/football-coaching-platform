import datetime

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import PlayerProfile, User
from bookings.models import Booking
from training.models import TrainingProgram, TrainingSession


def make_session(program, coach, max_players=10, days_ahead=7, published=True, cancelled=False):
    """Create a future training session."""
    future_date = timezone.localdate() + datetime.timedelta(days=days_ahead)
    return TrainingSession.objects.create(
        program=program,
        coach=coach,
        session_date=future_date,
        start_time=datetime.time(10, 0),
        end_time=datetime.time(11, 0),
        location="Training Ground",
        max_players=max_players,
        price="50.00",
        is_published=published,
        is_cancelled=cancelled,
    )


class BookingCreateTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            username="coach1", email="coach@test.com",
            password="pass12345", role="coach",
        )
        self.player1 = User.objects.create_user(
            username="player1", email="player1@test.com",
            password="pass12345", role="player",
        )
        self.profile1 = PlayerProfile.objects.create(user=self.player1)

        self.admin = User.objects.create_user(
            username="admin1", email="admin@test.com",
            password="pass12345", role="admin",
        )

        self.program = TrainingProgram.objects.create(
            title="Group Training",
            description="Group sessions",
            session_type="group",
            default_duration_minutes=60,
            default_price="50.00",
            is_active=True,
        )
        self.session = make_session(self.program, self.coach)

    def test_player_can_book_session(self):
        self.client.force_authenticate(user=self.player1)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Booking.objects.filter(player=self.profile1, session=self.session).exists()
        )

    def test_unauthenticated_cannot_book(self):
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_player_cannot_book(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_coach_cannot_book(self):
        self.client.force_authenticate(user=self.coach)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_book_cancelled_session(self):
        self.session.is_cancelled = True
        self.session.save()
        self.client.force_authenticate(user=self.player1)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_book_unpublished_session(self):
        self.session.is_published = False
        self.session.save()
        self.client.force_authenticate(user=self.player1)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_book_session_from_inactive_program(self):
        self.program.is_active = False
        self.program.save()
        self.client.force_authenticate(user=self.player1)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_double_book_same_session(self):
        Booking.objects.create(
            player=self.profile1,
            session=self.session,
            status=Booking.STATUS_CONFIRMED,
        )
        self.client.force_authenticate(user=self.player1)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_book_full_session(self):
        # Create a capacity-1 session and fill it with player2
        player2 = User.objects.create_user(
            username="player2", email="player2@test.com",
            password="pass12345", role="player",
        )
        profile2 = PlayerProfile.objects.create(user=player2)

        full_session = make_session(self.program, self.coach, max_players=1)
        Booking.objects.create(
            player=profile2,
            session=full_session,
            status=Booking.STATUS_CONFIRMED,
        )

        self.client.force_authenticate(user=self.player1)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": full_session.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rebooking_cancelled_slot_succeeds_when_space_available(self):
        # Player cancels their booking then rebooks
        booking = Booking.objects.create(
            player=self.profile1,
            session=self.session,
            status=Booking.STATUS_CANCELLED,
        )
        self.assertFalse(booking.pk is None)

        self.client.force_authenticate(user=self.player1)
        url = reverse("booking-create")
        response = self.client.post(url, {"session": self.session.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.STATUS_CONFIRMED)


class BookingCancelTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            username="coach1", email="coach@test.com",
            password="pass12345", role="coach",
        )
        self.player1 = User.objects.create_user(
            username="player1", email="player1@test.com",
            password="pass12345", role="player",
        )
        self.profile1 = PlayerProfile.objects.create(user=self.player1)

        self.player2 = User.objects.create_user(
            username="player2", email="player2@test.com",
            password="pass12345", role="player",
        )
        self.profile2 = PlayerProfile.objects.create(user=self.player2)

        self.program = TrainingProgram.objects.create(
            title="Group Training",
            description="Group sessions",
            session_type="group",
            default_duration_minutes=60,
            default_price="50.00",
            is_active=True,
        )
        self.session = make_session(self.program, self.coach)

    def test_player_can_cancel_own_booking(self):
        booking = Booking.objects.create(
            player=self.profile1,
            session=self.session,
            status=Booking.STATUS_CONFIRMED,
        )
        self.client.force_authenticate(user=self.player1)
        url = reverse("my-booking-cancel", kwargs={"pk": booking.id})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.STATUS_CANCELLED)

    def test_player_cannot_cancel_another_players_booking(self):
        """
        BookingCancelView filters queryset to own bookings, so accessing
        another player's booking ID returns 404 — not 403.
        """
        booking = Booking.objects.create(
            player=self.profile2,
            session=self.session,
            status=Booking.STATUS_CONFIRMED,
        )
        self.client.force_authenticate(user=self.player1)
        url = reverse("my-booking-cancel", kwargs={"pk": booking.id})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_cancel_already_cancelled_booking(self):
        booking = Booking.objects.create(
            player=self.profile1,
            session=self.session,
            status=Booking.STATUS_CANCELLED,
        )
        self.client.force_authenticate(user=self.player1)
        url = reverse("my-booking-cancel", kwargs={"pk": booking.id})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_cannot_cancel(self):
        booking = Booking.objects.create(
            player=self.profile1,
            session=self.session,
            status=Booking.STATUS_CONFIRMED,
        )
        url = reverse("my-booking-cancel", kwargs={"pk": booking.id})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MyBookingListTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            username="coach1", email="coach@test.com",
            password="pass12345", role="coach",
        )
        self.player1 = User.objects.create_user(
            username="player1", email="player1@test.com",
            password="pass12345", role="player",
        )
        self.profile1 = PlayerProfile.objects.create(user=self.player1)

        self.player2 = User.objects.create_user(
            username="player2", email="player2@test.com",
            password="pass12345", role="player",
        )
        self.profile2 = PlayerProfile.objects.create(user=self.player2)

        self.program = TrainingProgram.objects.create(
            title="Group Training",
            description="Group sessions",
            session_type="group",
            default_duration_minutes=60,
            default_price="50.00",
            is_active=True,
        )

    def test_player_only_sees_own_bookings(self):
        session1 = make_session(self.program, self.coach)
        session2 = make_session(self.program, self.coach, days_ahead=14)

        Booking.objects.create(player=self.profile1, session=session1, status=Booking.STATUS_CONFIRMED)
        Booking.objects.create(player=self.profile2, session=session2, status=Booking.STATUS_CONFIRMED)

        self.client.force_authenticate(user=self.player1)
        url = reverse("my-booking-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result_sessions = [b["session"] for b in response.data["results"]]
        self.assertIn(session1.id, result_sessions)
        self.assertNotIn(session2.id, result_sessions)

    def test_unauthenticated_cannot_list_bookings(self):
        url = reverse("my-booking-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminBookingAccessTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            username="coach1", email="coach@test.com",
            password="pass12345", role="coach",
        )
        self.player = User.objects.create_user(
            username="player1", email="player@test.com",
            password="pass12345", role="player",
        )
        PlayerProfile.objects.create(user=self.player)

        self.admin = User.objects.create_user(
            username="admin1", email="admin@test.com",
            password="pass12345", role="admin",
        )

    def test_admin_can_list_all_bookings(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("view-all-bookings")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_player_cannot_list_all_bookings(self):
        self.client.force_authenticate(user=self.player)
        url = reverse("view-all-bookings")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_cannot_list_all_bookings(self):
        self.client.force_authenticate(user=self.coach)
        url = reverse("view-all-bookings")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_list_all_bookings(self):
        url = reverse("view-all-bookings")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
