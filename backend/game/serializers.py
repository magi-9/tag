from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import GameSettings, Tag, Achievement, PlayerStats
from users.serializers import UserSerializer

User = get_user_model()


class GameSettingsSerializer(serializers.ModelSerializer):
    is_game_active = serializers.ReadOnlyField()
    
    class Meta:
        model = GameSettings
        fields = [
            'id', 'game_start_date', 'game_end_date',
            'tag_points_rank_1', 'tag_points_rank_2', 'tag_points_rank_3',
            'tag_points_rank_4', 'tag_points_rank_5', 'tag_points_rank_other',
            'time_penalty_per_hour', 'bonus_untagged_day',
            'first_place_prize', 'last_place_prize',
            'enable_notifications', 'notification_title', 'notification_message_template',
            'is_game_active', 'updated_at', 'current_tag_holder', 'tag_holder_since'
        ]
        read_only_fields = ['id', 'is_game_active', 'updated_at', 'tag_holder_since']


class TagSerializer(serializers.ModelSerializer):
    tagger_name = serializers.CharField(source='tagger.full_name', read_only=True)
    tagged_name = serializers.CharField(source='tagged.full_name', read_only=True)
    tag_date = serializers.ReadOnlyField()
    
    class Meta:
        model = Tag
        fields = [
            'id', 'tagger', 'tagger_name', 'tagged', 'tagged_name',
            'tagged_at', 'tag_date', 'location', 'notes', 'photo',
            'points_awarded', 'time_penalty', 'time_held',
            'verified', 'created_at'
        ]
        read_only_fields = [
            'id', 'points_awarded', 'time_penalty', 'time_held',
            'verified', 'created_at'
        ]


class CreateTagSerializer(serializers.Serializer):
    tagged_user_id = serializers.IntegerField()
    location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    photo = serializers.ImageField(required=False)
    
    def validate_tagged_user_id(self, value):
        try:
            user = User.objects.get(id=value, is_approved=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found or not approved")
        return value
    
    def validate(self, data):
        request = self.context.get('request')
        if request and data['tagged_user_id'] == request.user.id:
            raise serializers.ValidationError("You cannot tag yourself")
        return data


class AchievementSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'user', 'user_name', 'achievement_type',
            'title', 'description', 'value', 'icon', 'awarded_at'
        ]
        read_only_fields = ['id', 'awarded_at']


class PlayerStatsSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = PlayerStats
        fields = [
            'id', 'user', 'user_name', 'date',
            'was_tagged', 'tags_given_today', 'tags_received_today',
            'points_earned_today', 'time_held_today',
            'cumulative_points', 'cumulative_tags_given',
            'cumulative_tags_received', 'cumulative_time_held', 'rank'
        ]
        read_only_fields = ['id']


class LeaderboardSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    user = UserSerializer()
    points = serializers.IntegerField()
    tags_given = serializers.IntegerField()
    tags_received = serializers.IntegerField()
    time_held = serializers.DurationField()
    is_current_holder = serializers.BooleanField()
