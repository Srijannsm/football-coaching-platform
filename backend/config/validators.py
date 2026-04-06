import re

from rest_framework import serializers

PHONE_REGEX = re.compile(r"^\+?\d{7,15}$")


def validate_phone_number(value):
    """Reusable phone validator — allows optional leading +, 7–15 digits."""
    if value and not PHONE_REGEX.match(value.replace(" ", "")):
        raise serializers.ValidationError(
            "Enter a valid phone number (7–15 digits, optional + prefix)."
        )
    return value
