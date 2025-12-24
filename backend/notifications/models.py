from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    """Push notification records"""
    
    NOTIFICATION_TYPES = [
        ('tag', 'New Tag'),
        ('approval', 'User Approved'),
        ('game_start', 'Game Started'),
        ('game_end', 'Game Ended'),
        ('achievement', 'New Achievement'),
        ('custom', 'Custom'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
        help_text='If null, sent to all users'
    )
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(blank=True, null=True, help_text='Additional data')
    
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Push notification details
    push_sent = models.BooleanField(default=False)
    push_sent_at = models.DateTimeField(null=True, blank=True)
    push_error = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['user', '-sent_at']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        user_str = self.user.username if self.user else 'All Users'
        return f"{self.notification_type} → {user_str}: {self.title}"
