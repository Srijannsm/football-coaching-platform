from rest_framework import serializers
from .models import TrainingProgram, TrainingSession


class TrainingProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingProgram
        fields = [
            "id",
            "title",
            "description",
            "session_type",
            "default_duration_minutes",
            "default_price",
            "is_active",
            "created_at",
        ]


class TrainingSessionSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source="program.title", read_only=True)
    session_type = serializers.CharField(source="program.session_type", read_only=True)
    coach_username = serializers.CharField(source="coach.username", read_only=True)
    booked_players_count = serializers.ReadOnlyField()
    available_slots = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()

    class Meta:
        model = TrainingSession
        fields = [
            "id",
            "program",
            "program_title",
            "session_type",
            "coach",
            "coach_username",
            "session_date",
            "start_time",
            "end_time",
            "location",
            "max_players",
            "price",
            "is_published",
            "is_cancelled",
            "notes",
            "booked_players_count",
            "available_slots",
            "is_full",
            "created_at",
        ]