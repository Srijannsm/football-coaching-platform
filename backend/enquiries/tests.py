from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from enquiries.models import Enquiry


VALID_PAYLOAD = {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "phone": "9800000001",
    "message": "I want to know more about the group sessions.",
}


class EnquiryCreateTests(APITestCase):
    """Public endpoint — anyone can submit an enquiry."""

    def _post(self, data):
        return self.client.post(reverse("enquiry-create"), data)

    def test_anonymous_user_can_submit_enquiry(self):
        response = self._post(VALID_PAYLOAD)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enquiry.objects.count(), 1)

    def test_created_enquiry_has_new_status(self):
        self._post(VALID_PAYLOAD)
        enquiry = Enquiry.objects.get()
        self.assertEqual(enquiry.status, Enquiry.STATUS_NEW)

    def test_response_includes_id_and_created_at(self):
        response = self._post(VALID_PAYLOAD)
        self.assertIn("id", response.data)
        self.assertIn("created_at", response.data)

    def test_missing_required_fields_returns_400(self):
        for field in ("name", "email", "phone", "message"):
            payload = {**VALID_PAYLOAD}
            payload.pop(field)
            response = self._post(payload)
            self.assertEqual(
                response.status_code, status.HTTP_400_BAD_REQUEST,
                msg=f"Expected 400 when '{field}' is missing",
            )

    def test_name_too_short_returns_400(self):
        response = self._post({**VALID_PAYLOAD, "name": "A"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_phone_too_short_returns_400(self):
        response = self._post({**VALID_PAYLOAD, "phone": "123"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)

    def test_message_too_short_returns_400(self):
        response = self._post({**VALID_PAYLOAD, "message": "Short"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)

    def test_invalid_email_returns_400(self):
        response = self._post({**VALID_PAYLOAD, "email": "not-an-email"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_program_field_is_optional(self):
        """Enquiries can be submitted without choosing a specific program."""
        response = self._post({**VALID_PAYLOAD, "program": ""})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(Enquiry.objects.get().program)
