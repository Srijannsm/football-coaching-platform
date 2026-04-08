import re

from django.core.exceptions import ValidationError

PHONE_REGEX = re.compile(r"^\+?\d{7,15}$")


def validate_phone_number(value):
    """Reusable phone validator — allows optional leading +, 7–15 digits.
    Raises django.core.exceptions.ValidationError so it works as both a
    Django model field validator and a DRF serializer validator.
    """
    if value and not PHONE_REGEX.match(value.replace(" ", "")):
        raise ValidationError(
            "Enter a valid phone number (7–15 digits, optional + prefix)."
        )
    return value
