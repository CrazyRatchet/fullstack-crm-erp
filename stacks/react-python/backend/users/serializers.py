from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    # Write-only fields not stored directly in the model
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone",
        ]

    def validate(self, attrs):
        # Check that both passwords match
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        # Remove password_confirm before creating the user
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        # create_user handles password hashing automatically
        user = User.objects.create_user(password=password, **validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)