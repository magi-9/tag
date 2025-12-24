import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from game.models import GameSettings

User = get_user_model()


@pytest.mark.django_db
class TestAuthAPI:
    """Test user authentication"""

    def test_user_registration(self):
        """Test user registration"""
        client = APIClient()
        response = client.post(
            '/api/users/register/',
            {
                'username': 'newuser',
                'email': 'newuser@test.com',
                'password': 'testpass123',
                'full_name': 'Test User'
            },
            format='json'
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_user_login(self):
        """Test user login"""
        User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        client = APIClient()
        response = client.post(
            '/api/users/token/',
            {
                'username': 'testuser',
                'password': 'testpass123'
            },
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data


@pytest.mark.django_db
class TestGameAPI:
    """Test game API endpoints"""

    def test_leaderboard_public(self):
        """Test that leaderboard is public"""
        client = APIClient()
        response = client.get('/api/game/leaderboard/')
        assert response.status_code == status.HTTP_200_OK

    def test_rules_public(self):
        """Test that rules are public"""
        client = APIClient()
        response = client.get('/api/game/settings/rules/')
        assert response.status_code == status.HTTP_200_OK
        assert 'scoring' in response.data

    def test_achievements_public(self):
        """Test that achievements are public"""
        client = APIClient()
        response = client.get('/api/game/achievements/')
        assert response.status_code == status.HTTP_200_OK
