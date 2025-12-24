from django.contrib import admin
from .models import GameSettings, Tag, Achievement, PlayerStats


@admin.register(GameSettings)
class GameSettingsAdmin(admin.ModelAdmin):
    list_display = ['game_start_date', 'game_end_date', 'is_game_active', 'updated_at']
    fieldsets = [
        ('Game Period', {
            'fields': ('game_start_date', 'game_end_date')
        }),
        ('Scoring Rules', {
            'fields': (
                'tag_points_rank_1', 'tag_points_rank_2', 'tag_points_rank_3',
                'tag_points_rank_4', 'tag_points_rank_5', 'tag_points_rank_other',
                'time_penalty_per_hour', 'bonus_untagged_day'
            )
        }),
        ('Prizes', {
            'fields': ('first_place_prize', 'last_place_prize')
        }),
        ('Notifications', {
            'fields': ('enable_notifications', 'notification_title', 'notification_message_template')
        }),
    ]
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not GameSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion
        return False


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['tagger', 'tagged', 'tagged_at', 'points_awarded', 'time_penalty', 'verified']
    list_filter = ['verified', 'tagged_at']
    search_fields = ['tagger__username', 'tagged__username']
    readonly_fields = ['points_awarded', 'time_penalty', 'time_held', 'created_at']
    
    fieldsets = [
        ('Tag Details', {
            'fields': ('tagger', 'tagged', 'tagged_at', 'location', 'notes', 'photo')
        }),
        ('Calculated Values', {
            'fields': ('points_awarded', 'time_penalty', 'time_held')
        }),
        ('Verification', {
            'fields': ('verified',)
        }),
    ]


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement_type', 'title', 'awarded_at']
    list_filter = ['achievement_type', 'awarded_at']
    search_fields = ['user__username', 'title']


@admin.register(PlayerStats)
class PlayerStatsAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'cumulative_points', 'rank', 'was_tagged']
    list_filter = ['date', 'was_tagged']
    search_fields = ['user__username']
    readonly_fields = ['date']
