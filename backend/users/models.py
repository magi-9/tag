from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from datetime import timedelta


class User(AbstractUser):
    """Custom User model with additional fields"""
    
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # User status
    is_participating = models.BooleanField(default=True, help_text='Whether the user is actively participating in the game')
    is_approved = models.BooleanField(default=False, help_text='Admin must approve user to play')
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_users'
    )
    
    # Stats
    total_tags_given = models.IntegerField(default=0)
    total_tags_received = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)
    total_time_held = models.DurationField(default=timedelta)
    
    # Push notification subscription
    push_subscription = models.JSONField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_points']
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
