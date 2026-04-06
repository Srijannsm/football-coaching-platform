import datetime

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from training.models import TrainingProgram, TrainingSession


def make_program(session_type="group", is_active=True, title="Test Program"):
    return TrainingProgram.objects.create(
        title=title,
        description="Test description",
        session_type=session_type,
        default_duration_minutes=60,
        default_price="50.00",
        is_active=is_active,
    )


def make_session(program, coach, days_ahead=7, published=True, cancelled=False, max_players=10):
    session_date = timezone.localdate() + datetime.timedelta(days=days_ahead)
    return TrainingSession.objects.create(
        program=program,
        coach=coach,
        session_date=session_date,
        start_time=datetime.time(10, 0),
        end_time=datetime.time(11, 0),
        location="Training Ground",
        max_players=max_players,
        price="50.00",
        is_published=published,
        is_cancelled=cancelled,
    )


class TrainingSessionListTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            username="coach1", email="coach@test.com",
            password="pass12345", role="coach",
        )
        self.program = make_program()
        self.session = make_session(self.program, self.coach)

    def test_anonymous_can_list_sessions(self):
        url = reverse("training-session-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_returns_future_published_sessions(self):
        url = reverse("training-session-list")
        response = self.client.get(url)
        ids = [s["id"] for s in response.data["results"]]
        self.assertIn(self.session.id, ids)

    def test_cancelled_sessions_excluded(self):
        cancelled = make_session(self.program, self.coach, days_ahead=14, cancelled=True)
        url = reverse("training-session-list")
        response = self.client.get(url)
        ids = [s["id"] for s in response.data["results"]]
        self.assertNotIn(cancelled.id, ids)

    def test_unpublished_sessions_excluded(self):
        unpublished = make_session(self.program, self.coach, days_ahead=14, published=False)
        url = reverse("training-session-list")
        response = self.client.get(url)
        ids = [s["id"] for s in response.data["results"]]
        self.assertNotIn(unpublished.id, ids)

    def test_sessions_from_inactive_program_excluded(self):
        inactive_program = make_program(is_active=False, title="Inactive")
        inactive_session = make_session(inactive_program, self.coach, days_ahead=14)
        url = reverse("training-session-list")
        response = self.client.get(url)
        ids = [s["id"] for s in response.data["results"]]
        self.assertNotIn(inactive_session.id, ids)

    def test_past_sessions_excluded(self):
        # Create a past session by directly bypassing make_session date logic
        past_date = timezone.localdate() - datetime.timedelta(days=1)
        past_session = TrainingSession.objects.create(
            program=self.program,
            coach=self.coach,
            session_date=past_date,
            start_time=datetime.time(10, 0),
            end_time=datetime.time(11, 0),
            location="Ground",
            max_players=10,
            price="50.00",
            is_published=True,
            is_cancelled=False,
        )
        url = reverse("training-session-list")
        response = self.client.get(url)
        ids = [s["id"] for s in response.data["results"]]
        self.assertNotIn(past_session.id, ids)

    def test_filter_by_program(self):
        other_program = make_program(title="Other Program")
        other_session = make_session(other_program, self.coach, days_ahead=14)

        url = reverse("training-session-list")
        response = self.client.get(url, {"program": self.program.id})
        ids = [s["id"] for s in response.data["results"]]
        self.assertIn(self.session.id, ids)
        self.assertNotIn(other_session.id, ids)

    def test_filter_by_session_type(self):
        one_to_one_program = make_program(session_type="one_to_one", title="1-to-1")
        # one_to_one sessions are hard-capped at max_players=1 by model validation
        one_to_one_session = make_session(one_to_one_program, self.coach, days_ahead=14, max_players=1)

        url = reverse("training-session-list")
        response = self.client.get(url, {"session_type": "one_to_one"})
        ids = [s["id"] for s in response.data["results"]]
        self.assertIn(one_to_one_session.id, ids)
        self.assertNotIn(self.session.id, ids)


class TrainingSessionDetailTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            username="coach1", email="coach@test.com",
            password="pass12345", role="coach",
        )
        self.program = make_program()
        self.session = make_session(self.program, self.coach)

    def test_anonymous_can_retrieve_session(self):
        url = reverse("training-session-detail", kwargs={"pk": self.session.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.session.id)

    def test_cancelled_session_returns_404(self):
        self.session.is_cancelled = True
        self.session.save()
        url = reverse("training-session-detail", kwargs={"pk": self.session.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unpublished_session_returns_404(self):
        self.session.is_published = False
        self.session.save()
        url = reverse("training-session-detail", kwargs={"pk": self.session.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nonexistent_session_returns_404(self):
        url = reverse("training-session-detail", kwargs={"pk": 99999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
