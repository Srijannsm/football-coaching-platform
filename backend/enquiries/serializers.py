from rest_framework import serializers
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
        value = value.strip()
        if len(value) < 7:
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message is too short.")
        return value


class AdminEnquiryListSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source="program.title", read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "program",
            "program_title",
            "status",
            "created_at",
        ]


class AdminEnquiryDetailSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source="program.title", read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "message",
            "program",
            "program_title",
            "status",
            "admin_notes",
            "created_at",
        ]


class AdminEnquiryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ["status", "admin_notes"]