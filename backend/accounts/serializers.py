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
        choices=PlayerProfile.FOOT_CHOICES, required=False, allow_blank=True
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
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs

    def validate_username(self, value):
        value = value.strip().lower()

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if value and User.objects.filter(email__iexact=value).exists():
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

        validated_data["username"] = validated_data["username"].strip().lower()

        if validated_data.get("email"):
            validated_data["email"] = validated_data["email"].strip().lower()

        user = User.objects.create_user(
            role=User.ROLE_PLAYER,
            password=password,
            **validated_data
        )

        PlayerProfile.objects.create(user=user, **player_profile_data)

        return user


class PlayerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = PlayerProfile
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "age",
            "preferred_foot",
            "player_rating",
            "primary_position",
            "secondary_position",
            "height_cm",
            "weight_kg",
        ]


class MeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    player_profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "player_profile_id",
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username

    def get_player_profile_id(self, obj):
        if hasattr(obj, "player_profile"):
            return obj.player_profile.id
        return None
