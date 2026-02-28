"""Users app views."""
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .models import UserProfile, BusinessAccount
from .serializers import UserSerializer, UserProfileSerializer, BusinessAccountSerializer


def _track_activity(user):
    if user and user.is_authenticated:
        user.update_activity()

User = get_user_model()


class RegisterView(APIView):
    """Register new user."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Create new user account."""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Allow public read access, write access only for admins."""
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    def retrieve(self, request, *args, **kwargs):
        """Get user details and track activity for current user if authenticated."""
        # Update activity only for authenticated user viewing their own profile
        if request.user.is_authenticated and int(kwargs.get('pk', 0)) == request.user.id:
            _track_activity(request.user)
        
        return super().retrieve(request, *args, **kwargs)


class CurrentUserView(APIView):
    """Get current authenticated user."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user data and track activity."""
        # Update last activity
        _track_activity(request.user)
        
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UpdateProfileView(APIView):
    """Update current user profile."""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        """Update current user profile."""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change password for current user."""
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response(
                {'error': 'Both current_password and new_password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify current password
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password length
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )


class UserProfileViewSet(viewsets.ViewSet):
    """ViewSet for UserProfile model."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_profile(self, user):
        """Get or create user profile."""
        profile, _ = UserProfile.objects.get_or_create(user=user)
        return profile
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile."""
        profile = self.get_profile(request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        """Update current user profile."""
        profile = self.get_profile(request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BusinessAccountViewSet(viewsets.ViewSet):
    """ViewSet for BusinessAccount model."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user business account."""
        try:
            account = BusinessAccount.objects.get(user=request.user)
            serializer = BusinessAccountSerializer(account)
            return Response(serializer.data)
        except BusinessAccount.DoesNotExist:
            return Response({'detail': 'No business account found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def create_business_account(self, request):
        """Create business account for current user."""
        if BusinessAccount.objects.filter(user=request.user).exists():
            return Response({'detail': 'Business account already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = BusinessAccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['put'])
    def update_business_account(self, request):
        """Update current user business account."""
        try:
            account = BusinessAccount.objects.get(user=request.user)
            serializer = BusinessAccountSerializer(account, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except BusinessAccount.DoesNotExist:
            return Response({'detail': 'No business account found'}, status=status.HTTP_404_NOT_FOUND)
