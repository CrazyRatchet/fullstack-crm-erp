from drf_spectacular.utils import extend_schema
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import RegisterSerializer, LoginSerializer, UserSerializer, UpdateUserSerializer
from users.permissions import IsAdminOrAbove

User = get_user_model()

class RegisterView(APIView):
    """
    Endpoint for user registration.
    POST /api/v1/auth/register/
    """

    # Allow unauthenticated access to this endpoint
    permission_classes = []

    @extend_schema(
        request=RegisterSerializer,
        responses={201: RegisterSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully.",
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "username": user.username,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    Endpoint for user login.
    POST /api/v1/auth/login/
    """

    # Allow unauthenticated access to this endpoint
    permission_classes = []

    @extend_schema(
        request=LoginSerializer,
        responses={200: None},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # Verify credentials against the database
        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Generate JWT tokens for the authenticated user
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )

class UserListView(generics.ListAPIView):
    """
    List all users within the same tenant.
    GET /api/v1/users/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrAbove]

    def get_queryset(self):
        # Only return users belonging to the same tenant
        return User.objects.filter(tenant=self.request.user.tenant)


class UserDetailView(APIView):
    """
    Retrieve or update a specific user.
    GET /api/v1/users/<id>/
    PATCH /api/v1/users/<id>/
    """
    permission_classes = [IsAdminOrAbove]

    def get_object(self, request, pk):
        # Get user within the same tenant
        return User.objects.filter(tenant=request.user.tenant, pk=pk).first()

    def get(self, request, pk):
        user = self.get_object(request, pk)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, pk):
        user = self.get_object(request, pk)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateUserSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeactivateUserView(APIView):
    """
    Deactivate a user account.
    PATCH /api/v1/users/<id>/deactivate/
    """
    permission_classes = [IsAdminOrAbove]

    def patch(self, request, pk):
        # Get user within the same tenant
        user = User.objects.filter(tenant=request.user.tenant, pk=pk).first()

        if not user:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Prevent deactivating yourself
        if user == request.user:
            return Response(
                {'error': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.save()
        return Response(
            {'message': f'User {user.email} has been deactivated.'},
            status=status.HTTP_200_OK,
        )