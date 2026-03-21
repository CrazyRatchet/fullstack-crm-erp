from drf_spectacular.utils import extend_schema
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import RegisterSerializer, LoginSerializer, UserSerializer, UpdateUserSerializer
from users.permissions import IsAdminOrAbove
from core.services import AuditService
from core.models import AuditLog

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
            AuditService.log(
                action=AuditLog.Action.REGISTER,
                request=request,
                user=user,
                metadata={'email': user.email},
            )
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
            AuditService.log(
                action=AuditLog.Action.LOGIN_FAILED,
                request=request,
                metadata={'email': email},
            )
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Generate JWT tokens for the authenticated user
        refresh = RefreshToken.for_user(user)

        AuditService.log(
            action=AuditLog.Action.LOGIN_SUCCESS,
            request=request,
            user=user,
            metadata={'email': user.email},
        )

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
                    "role": user.role,
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
        # Return empty queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return User.objects.none()
        # Only return users belonging to the same tenant
        return User.objects.filter(tenant=self.request.user.tenant).order_by('created_at')

class UserDetailView(APIView):
    """
    Retrieve or update a specific user.
    GET /api/v1/users/<id>/
    PATCH /api/v1/users/<id>/
    """
    permission_classes = [IsAdminOrAbove]

    @extend_schema(responses={200: UserSerializer})
    def get_object(self, request, pk):
        # Get user within the same tenant
        return User.objects.filter(tenant=request.user.tenant, pk=pk).first()

    @extend_schema(request=UpdateUserSerializer, responses={200: UserSerializer})
    def get(self, request, pk):
        user = self.get_object(request, pk)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    @extend_schema(request=UpdateUserSerializer, responses={200: UserSerializer})
    def patch(self, request, pk):
        user = self.get_object(request, pk)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateUserSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            action = (
                AuditLog.Action.ROLE_CHANGED
                if 'role' in request.data
                else AuditLog.Action.USER_UPDATED
            )
            AuditService.log(
                action=action,
                request=request,
                user=request.user,
                metadata={'updated_user': user.email, 'changes': request.data},
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeactivateUserView(APIView):
    """
    Deactivate a user account.
    PATCH /api/v1/users/<id>/deactivate/
    """
    permission_classes = [IsAdminOrAbove]

    @extend_schema(request=UpdateUserSerializer, responses={200: UserSerializer})
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
        AuditService.log(
            action=AuditLog.Action.USER_DEACTIVATED,
            request=request,
            user=request.user,
            metadata={'deactivated_user_email': user.email},
        )
        return Response(
            {'message': f'User {user.email} has been deactivated.'},
            status=status.HTTP_200_OK,
        )