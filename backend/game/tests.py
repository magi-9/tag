from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from .models import GameSettings, Tag, Achievement, PlayerStats
from .game_engine import GameEngine

User = get_user_model()


class GameSettingsTests(TestCase):
    """Test GameSettings model and API"""

    def setUp(self):
        self.settings = GameSettings.get_settings()
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='admin123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)

    def test_get_settings(self):
        """Test retrieving game settings"""
        self.assertIsNotNone(self.settings)
        self.assertGreater(self.settings.tag_points_rank_1, 0)

    def test_update_settings(self):
        """Test updating game settings"""
        response = self.client.put(
            f'/api/game/settings/{self.settings.id}/',
            {
                'tag_points_rank_1': 100,
                'game_start_date': timezone.now(),
                'game_end_date': timezone.now() + timedelta(days=30)
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_rules_endpoint_public(self):
        """Test that rules endpoint is public"""
        client = APIClient()
        response = client.get('/api/game/settings/rules/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('rules', response.data)
        self.assertIn('scoring', response.data)


class GameEngineTests(TestCase):
    """Test game engine logic"""

    def setUp(self):
        self.user1 = User.objects.create_user(
            username='player1',
            email='p1@test.com',
            password='pass123', is_approved=True
        )
        self.user2 = User.objects.create_user(
            username='player2',
            email='p2@test.com',
            password='pass123', is_approved=True
        )
        self.user3 = User.objects.create_user(
            username='player3',
            email='p3@test.com',
            password='pass123', is_approved=True
        )
        
        # Set initial tag holder
        self.settings = GameSettings.get_settings()
        self.settings.current_tag_holder = self.user1
        self.settings.save()

    def test_get_current_tag_holder(self):
        """Test getting current tag holder"""
        holder = GameEngine.get_current_tag_holder()
        self.assertEqual(holder, self.user1)

    def test_process_new_tag(self):
        self.settings.current_tag_holder = self.user1
        self.settings.save()
        """Test creating a new tag"""
        initial_count = Tag.objects.count()
        
        tag = GameEngine.process_new_tag(
            tagger=self.user1,
            tagged=self.user2,
            location='Test location',
            notes='Test notes'
        )
        
        self.assertEqual(Tag.objects.count(), initial_count + 1)
        self.assertEqual(tag.tagger, self.user1)
        self.assertEqual(tag.tagged, self.user2)

    def test_calculate_leaderboard(self):
        self.settings.current_tag_holder = self.user1
        self.settings.save()
        """Test leaderboard calculation"""
        # Create some tags
        GameEngine.process_new_tag(self.user1, self.user2); self.settings.current_tag_holder = self.user2; self.settings.save()
        GameEngine.process_new_tag(self.user2, self.user3); self.settings.current_tag_holder = self.user3; self.settings.save()
        
        leaderboard = GameEngine.calculate_leaderboard()
        self.assertGreater(len(leaderboard), 0)


class TagViewSetTests(TestCase):
    """Test Tag API endpoints"""

    def setUp(self):
        self.user1 = User.objects.create_user(
            username='player1',
            email='p1@test.com',
            password='pass123', is_approved=True
        )
        self.user2 = User.objects.create_user(
            username='player2',
            email='p2@test.com',
            password='pass123', is_approved=True
        )
        
        self.settings = GameSettings.get_settings()
        self.settings.current_tag_holder = self.user1
        self.settings.save()
        
        self.client = APIClient()

    def test_create_tag_as_holder(self):
        """Test creating a tag as the current holder"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.post(
            '/api/game/tags/create_tag/',
            {
                'tagged_user_id': self.user2.id,
                'location': 'Test location',
                'notes': 'Test notes'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_tag_as_non_holder(self):
        """Test that non-holders cannot create tags"""
        self.client.force_authenticate(user=self.user2)
        
        response = self.client.post(
            '/api/game/tags/create_tag/',
            {
                'tagged_user_id': self.user1.id
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_current_holder_endpoint(self):
        """Test current_holder endpoint"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/game/tags/current_holder/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data.get('user'))


class AchievementTests(TestCase):
    """Test achievement system"""

    def setUp(self):
        self.user1 = User.objects.create_user(
            username='player1',
            email='p1@test.com',
            password='pass123', is_approved=True
        )
        self.user2 = User.objects.create_user(
            username='player2',
            email='p2@test.com',
            password='pass123', is_approved=True
        )
        
        self.settings = GameSettings.get_settings()
        self.settings.current_tag_holder = self.user1
        self.settings.save()

    def test_calculate_achievements(self):
        self.settings.current_tag_holder = self.user1
        self.settings.save()
        """Test automatic achievement calculation"""
        # Create some tags to generate data
        GameEngine.process_new_tag(self.user1, self.user2); self.settings.current_tag_holder = self.user2; self.settings.save()
        GameEngine.calculate_achievements()
        
        # Should have achievements
        achievements = Achievement.objects.all()
        self.assertGreater(achievements.count(), 0)

    def test_achievement_types(self):
        self.settings.current_tag_holder = self.user1
        self.settings.save()
        """Test that achievements have proper types"""
        GameEngine.process_new_tag(self.user1, self.user2); self.settings.current_tag_holder = self.user2; self.settings.save()
        GameEngine.calculate_achievements()
        
        achievements = Achievement.objects.all()
        valid_types = [
            'worst_player', 'fastest_player', 'slowest_player',
            'most_tags_given', 'most_tags_received', 'fastest_catch'
        ]
        
        for achievement in achievements:
            self.assertIn(achievement.achievement_type, valid_types)
