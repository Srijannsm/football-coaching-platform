from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PlayerProfile, CoachProfile

User = get_user_model()


class PlayerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    age = serializers.IntegerField(required=False, allow_null=True)
    image = serializers.ImageField(required=False, allow_null=True)
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
            "image",
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
            "image": validated_data.pop("image", None),
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
            role=User.ROLE_PLAYER, password=password, **validated_data
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
    coach_profile_id = serializers.SerializerMethodField()

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
            "coach_profile_id",
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username

    def get_player_profile_id(self, obj):
        if hasattr(obj, "player_profile"):
            return obj.player_profile.id
        return None
    
    def get_coach_profile_id(self, obj):
        if hasattr(obj, "coach_profile"):
            return obj.coach_profile.id
        return None


class PlayerProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", required=True)
    last_name = serializers.CharField(source="user.last_name", required=True)
    email = serializers.EmailField(source="user.email", required=True)
    phone_number = serializers.CharField(
        source="user.phone_number",
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    image = serializers.ImageField(required=False, allow_null=True)
    remove_image = serializers.BooleanField(
        write_only=True, required=False, default=False
    )

    class Meta:
        model = PlayerProfile
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "age",
            "image",
            "remove_image",
            "preferred_foot",
            "player_rating",
            "primary_position",
            "secondary_position",
            "height_cm",
            "weight_kg",
        ]
        read_only_fields = ["id", "username", "player_rating"]

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        email = user_data.get("email")

        if email:
            email = email.strip().lower()
            user_data["email"] = email

            existing_user = User.objects.filter(email__iexact=email).exclude(
                id=self.instance.user.id
            )
            if existing_user.exists():
                raise serializers.ValidationError(
                    {"email": "A user with this email already exists."}
                )

        return attrs

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        remove_image = validated_data.pop("remove_image", False)

        user = instance.user
        user.first_name = user_data.get("first_name", user.first_name)
        user.last_name = user_data.get("last_name", user.last_name)
        user.email = user_data.get("email", user.email)
        user.phone_number = user_data.get("phone_number", user.phone_number)
        user.save()

        instance.age = validated_data.get("age", instance.age)
        instance.preferred_foot = validated_data.get(
            "preferred_foot", instance.preferred_foot
        )
        instance.primary_position = validated_data.get(
            "primary_position", instance.primary_position
        )
        instance.secondary_position = validated_data.get(
            "secondary_position", instance.secondary_position
        )
        instance.height_cm = validated_data.get("height_cm", instance.height_cm)
        instance.weight_kg = validated_data.get("weight_kg", instance.weight_kg)

        if remove_image:
            if instance.image:
                instance.image.delete(save=False)
            instance.image = None
        elif "image" in validated_data:
            instance.image = validated_data.get("image")

        instance.save()
        return instance


class CoachProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    full_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CoachProfile
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone_number",
            "bio",
            "years_experience",
            "coaching_level",
            "specialties",
            "image",
            "image_url",
            "updated_at",
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None    
