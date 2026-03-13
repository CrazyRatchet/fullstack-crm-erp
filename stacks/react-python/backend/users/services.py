from django.contrib.auth import get_user_model

User = get_user_model()


class UserService:
    @staticmethod
    def register_user(validated_data: dict) -> User:
        """
        Creates a new user from validated registration data.
        The serializer handles password hashing via create_user.
        """
        from users.serializers import RegisterSerializer

        serializer = RegisterSerializer(data=validated_data)
        serializer.is_valid(raise_exception=True)
        return serializer.save()