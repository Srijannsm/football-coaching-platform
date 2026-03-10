from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PlayerProfile

User = get_user_model()


class PlayerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    age = serializers.IntegerField(required=False, allow_null=True)
    preferred_foot = serializers.ChoiceField(
        choices=PlayerProfile.FOOT_CHOICES,
        required=False,
        allow_blank=True
    )
    primary_position = serializers.CharField(required=False, allow_blank=True)
    secondary_position = serializers.CharField(required=False, allow_blank=True)
    height_cm = serializers.IntegerField(required=False, allow_null=True)
    weight_kg = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
            "age",
            "preferred_foot",
            "primary_position",
            "secondary_position",
            "height_cm",
            "weight_kg",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                 "Passwords do not match."
            })
        return attrs

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        player_profile_data = {
            "age": validated_data.pop("age", None),
            "preferred_foot": validated_data.pop("preferred_foot", ""),
            "primary_position": validated_data.pop("primary_position", ""),
            "secondary_position": validated_data.pop("secondary_position", ""),
            "height_cm": validated_data.pop("height_cm", None),
            "weight_kg": validated_data.pop("weight_kg", None),
        }

        password = validated_data.pop("password")

        user = User.objects.create_user(
            role=User.ROLE_PLAYER,
            password=password,
            **validated_data
        )

        PlayerProfile.objects.create(
            user=user,
            **player_profile_data
        )

        return user


class PlayerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model = PlayerProfile
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "age",
            "preferred_foot",
            "player_rating",
            "primary_position",
            "secondary_position",
            "height_cm",
            "weight_kg",
        ]