from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GameSettingsViewSet, TagViewSet, LeaderboardViewSet,
    AchievementViewSet, PlayerStatsViewSet
)

router = DefaultRouter()
router.register(r'settings', GameSettingsViewSet, basename='game-settings')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'stats', PlayerStatsViewSet, basename='player-stats')

urlpatterns = [
    path('', include(router.urls)),
]
