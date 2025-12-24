from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import models
from .models import GameSettings, Tag, Achievement, PlayerStats
from .serializers import (
    GameSettingsSerializer, TagSerializer, CreateTagSerializer,
    AchievementSerializer, PlayerStatsSerializer, LeaderboardSerializer
)
from .game_engine import GameEngine
from notifications.tasks import send_tag_notification

User = get_user_model()


class GameSettingsViewSet(viewsets.ModelViewSet):
    queryset = GameSettings.objects.all()
    serializer_class = GameSettingsSerializer
    
    def get_permissions(self):
        if self.action in ['retrieve', 'list', 'current', 'rules']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current game settings"""
        settings = GameSettings.get_settings()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def rules(self, request):
        """Get game rules and scoring as public info"""
        settings = GameSettings.get_settings()
        return Response({
            'rules': 'Tagging Game - Tag the player who is currently holding the tag to earn points!',
            'game_period': {
                'start': settings.game_start_date,
                'end': settings.game_end_date,
            },
            'scoring': {
                'rank_1': settings.tag_points_rank_1,
                'rank_2': settings.tag_points_rank_2,
                'rank_3': settings.tag_points_rank_3,
                'rank_4': settings.tag_points_rank_4,
                'rank_5': settings.tag_points_rank_5,
                'rank_6_plus': settings.tag_points_rank_other,
                'time_penalty_per_hour': settings.time_penalty_per_hour,
                'untagged_day_bonus': settings.bonus_untagged_day,
            },
            'prizes': {
                'first_place': settings.first_place_prize,
                'last_place': settings.last_place_prize,
            }
        })
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.filter(verified=True)
    serializer_class = TagSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(
                models.Q(tagger_id=user_id) | models.Q(tagged_id=user_id)
            )
        
        return queryset
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_tag(self, request):
        """Create a new tag event - only tag holder can tag"""
        # Check if user is the current tag holder
        current_holder = GameEngine.get_current_tag_holder()
        if current_holder != request.user:
            return Response(
                {'error': 'Only the current tag holder can tag someone else'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CreateTagSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        try:
            tagged_user = User.objects.get(id=serializer.validated_data['tagged_user_id'])
            
            tag = GameEngine.process_new_tag(
                tagger=request.user,
                tagged=tagged_user,
                location=serializer.validated_data.get('location'),
                notes=serializer.validated_data.get('notes'),
                photo=serializer.validated_data.get('photo')
            )
            
            # Send notification asynchronously
            send_tag_notification.delay(tag.id)
            
            return Response({
                'message': 'Tag created successfully',
                'tag': TagSerializer(tag).data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Tagged user not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def current_holder(self, request):
        """Get the player currently holding the tag"""
        try:
            holder = GameEngine.get_current_tag_holder()
            if not holder:
                return Response({'user': None, 'since': None})

            from users.serializers import UserSerializer
            last_tag = Tag.objects.filter(tagged=holder).order_by('-tagged_at').first()
            settings = GameSettings.get_settings()
            since = None
            if last_tag:
                since = last_tag.tagged_at
            elif settings and settings.tag_holder_since:
                since = settings.tag_holder_since
            return Response({
                'user': UserSerializer(holder).data,
                'since': since
            })
        except Exception as exc:
            # If settings are not yet configured or DB is empty, return a safe empty state
            return Response({'user': None, 'since': None, 'detail': str(exc)}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get tag history with pagination"""
        tags = self.get_queryset()
        page = self.paginate_queryset(tags)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        """Admin verifies a tag"""
        tag = self.get_object()
        tag.verified = True
        tag.save()
        return Response({'message': 'Tag verified'})
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAdminUser])
    def delete_tag(self, request, pk=None):
        """Admin deletes a disputed tag"""
        tag = self.get_object()
        tag.delete()
        return Response({'message': 'Tag deleted'}, status=status.HTTP_204_NO_CONTENT)


class LeaderboardViewSet(viewsets.ViewSet):
    """ViewSet for leaderboard data"""
    
    permission_classes = [permissions.AllowAny]
    
    def list(self, request):
        """Get current leaderboard"""
        leaderboard = GameEngine.calculate_leaderboard()
        serializer = LeaderboardSerializer(leaderboard, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def live(self, request):
        """Get live leaderboard with real-time updates"""
        return self.list(request)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def recalculate(self, request):
        """Admin triggers achievement recalculation"""
        GameEngine.calculate_achievements()
        return Response({'message': 'Achievements recalculated'})
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def create_custom(self, request):
        """Admin creates a custom achievement"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlayerStatsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlayerStats.objects.all()
    serializer_class = PlayerStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
