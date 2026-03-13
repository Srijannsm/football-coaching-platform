from rest_framework import serializers
from .models import Coach, Testimonial


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


class TestimonialSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Testimonial
        fields = [
            "id",
            "name",
            "role",
            "quote",
            "rating",
            "image",
            "display_order",
        ]
        
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value    