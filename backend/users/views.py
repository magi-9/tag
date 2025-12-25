from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    CustomTokenObtainPairSerializer, PushSubscriptionSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Register a new user (requires admin approval to play)"""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Registration successful. Wait for admin approval to start playing.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Admin approves user to play"""
        user = self.get_object()
        user.is_approved = True
        user.approved_at = timezone.now()
        user.approved_by = request.user
        user.save()
        return Response({
            'message': f'User {user.username} approved',
            'user': UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def revoke_approval(self, request, pk=None):
        """Admin revokes user approval"""
        user = self.get_object()
        user.is_approved = False
        user.approved_at = None
        user.save()
        return Response({
            'message': f'User {user.username} approval revoked',
            'user': UserSerializer(user).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending_approvals(self, request):
        """Get list of users pending approval"""
        users = User.objects.filter(is_approved=False, is_staff=False)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def subscribe_push(self, request):
        """Subscribe to push notifications"""
        serializer = PushSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(request.user)
        return Response({'message': 'Push notification subscription saved'})
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get leaderboard of approved users"""
        users = User.objects.filter(is_approved=True).order_by('-total_points')
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change password for current user"""
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Heslo bolo úspešne zmenené.'}, status=status.HTTP_200_OK)
