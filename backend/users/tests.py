from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

class AdminPasswordResetTests(APITestCase):
    def setUp(self):
        # Create admin user
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword'
        )

        # Create regular user
        self.user = User.objects.create_user(
            username='user',
            email='user@example.com',
            password='userpassword'
        )

        # Create another regular user (attacker)
        self.attacker = User.objects.create_user(
            username='attacker',
            email='attacker@example.com',
            password='attackerpassword'
        )

    def test_admin_can_reset_password(self):
        """Admin should be able to reset any user's password"""
        self.client.force_authenticate(user=self.admin)
        url = reverse('user-admin-reset-password', kwargs={'pk': self.user.id})
        data = {'new_password': 'newpassword123'}

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))

    def test_non_admin_cannot_reset_password(self):
        """Regular user should not be able to reset another user's password"""
        self.client.force_authenticate(user=self.attacker)
        url = reverse('user-admin-reset-password', kwargs={'pk': self.user.id})
        data = {'new_password': 'hackedpassword'}

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Verify password NOT changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('userpassword'))

    def test_password_validation(self):
        """Password should meet minimum requirements (min_length=8 from serializer)"""
        self.client.force_authenticate(user=self.admin)
        url = reverse('user-admin-reset-password', kwargs={'pk': self.user.id})
        data = {'new_password': 'short'}

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Verify password NOT changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('userpassword'))

    def test_unauthenticated_cannot_reset_password(self):
        """Unauthenticated user should not be able to reset password"""
        url = reverse('user-admin-reset-password', kwargs={'pk': self.user.id})
        data = {'new_password': 'hackedpassword'}

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
