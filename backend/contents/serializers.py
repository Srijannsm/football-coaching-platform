from rest_framework import serializers
from .models import Coach


class CoachSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "bio",
            "specialty",
            "experience_years",
            "image",
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username
