from rest_framework import serializers
from config.validators import validate_phone_number
from .models import Enquiry


class EnquiryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ["id", "name", "email", "phone", "message", "program", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value

    def validate_phone(self, value):
        return validate_phone_number(value.strip())

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message is too short.")
        return value
