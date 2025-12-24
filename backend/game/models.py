from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class GameSettings(models.Model):
    """Singleton model for game configuration (admin configurable)"""
    
    # Game period
    game_start_date = models.DateTimeField()
    game_end_date = models.DateTimeField()
    
    # Scoring rules
    tag_points_rank_1 = models.IntegerField(default=50, help_text='Points for tagging rank 1 player')
    tag_points_rank_2 = models.IntegerField(default=40, help_text='Points for tagging rank 2 player')
    tag_points_rank_3 = models.IntegerField(default=30, help_text='Points for tagging rank 3 player')
    tag_points_rank_4 = models.IntegerField(default=20, help_text='Points for tagging rank 4 player')
    tag_points_rank_5 = models.IntegerField(default=10, help_text='Points for tagging rank 5 player')
    tag_points_rank_other = models.IntegerField(default=5, help_text='Points for tagging rank 6+ player')
    
    time_penalty_per_hour = models.IntegerField(default=5, help_text='Points deducted per hour of holding tag')
    bonus_untagged_day = models.IntegerField(default=35, help_text='Bonus points for untagged isolated day')
    
    # Prizes
    first_place_prize = models.TextField(default='Hlavná výhra', help_text='Prize description for winner')
    last_place_prize = models.TextField(default='Antikvýhra - Surströmming', help_text='Anti-prize for last place')
    
    # Initial tag holder
    current_tag_holder = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='holding_tag',
        help_text='Player currently holding the tag'
    )
    tag_holder_since = models.DateTimeField(null=True, blank=True, help_text='When did current holder get the tag')
    
    # Notifications
    enable_notifications = models.BooleanField(default=True)
    notification_title = models.CharField(max_length=200, default='Nový tag!')
    notification_message_template = models.TextField(
        default='{tagger} tagol {tagged}!',
        help_text='Use {tagger} and {tagged} placeholders'
    )
    
    # Update tracking
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = 'Game Settings'
        verbose_name_plural = 'Game Settings'
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton pattern)
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'game_start_date': timezone.now(),
                'game_end_date': timezone.now() + timedelta(days=30)
            }
        )
        return obj
    
    def __str__(self):
        return f"Game Settings ({self.game_start_date.date()} - {self.game_end_date.date()})"
    
    @property
    def is_game_active(self):
        now = timezone.now()
        return self.game_start_date <= now <= self.game_end_date
    
    @property
    def tag_points_list(self):
        return [
            self.tag_points_rank_1,
            self.tag_points_rank_2,
            self.tag_points_rank_3,
            self.tag_points_rank_4,
            self.tag_points_rank_5,
            self.tag_points_rank_other
        ]


class Tag(models.Model):
    """Record of each tag event"""
    
    tagger = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tags_given',
        help_text='Player who made the tag'
    )
    tagged = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tags_received',
        help_text='Player who was tagged'
    )
    
    tagged_at = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Calculated at time of tag
    points_awarded = models.IntegerField(default=0, help_text='Points awarded to tagger')
    time_penalty = models.IntegerField(default=0, help_text='Penalty to tagged player')
    time_held = models.DurationField(default=timedelta, help_text='Time tagged player held the tag')
    
    # For verification/disputes
    photo = models.ImageField(upload_to='tags/', blank=True, null=True)
    verified = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-tagged_at']
        indexes = [
            models.Index(fields=['-tagged_at']),
            models.Index(fields=['tagger']),
            models.Index(fields=['tagged']),
        ]
    
    def __str__(self):
        return f"{self.tagger.username} → {self.tagged.username} ({self.tagged_at.date()})"
    
    @property
    def tag_date(self):
        return self.tagged_at.date()


class Achievement(models.Model):
    """Special achievements for players"""
    
    ACHIEVEMENT_TYPES = [
        ('worst_player', 'Worst Player'),
        ('fastest_player', 'Fastest Player'),
        ('slowest_player', 'Slowest Player'),
        ('fastest_catch', 'Fastest Catch'),
        ('slowest_catch', 'Slowest Catch'),
        ('most_tags_given', 'Most Active Tagger'),
        ('most_tags_received', 'Most Caught'),
        ('custom', 'Custom Achievement'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=50, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    value = models.CharField(max_length=100, blank=True, help_text='Achievement value (time, count, etc.)')
    
    icon = models.CharField(max_length=50, default='🏆')
    awarded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-awarded_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class PlayerStats(models.Model):
    """Daily snapshot of player statistics"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_stats')
    date = models.DateField()
    
    was_tagged = models.BooleanField(default=False)
    tags_given_today = models.IntegerField(default=0)
    tags_received_today = models.IntegerField(default=0)
    points_earned_today = models.IntegerField(default=0)
    time_held_today = models.DurationField(default=timedelta)
    
    cumulative_points = models.IntegerField(default=0)
    cumulative_tags_given = models.IntegerField(default=0)
    cumulative_tags_received = models.IntegerField(default=0)
    cumulative_time_held = models.DurationField(default=timedelta)
    
    rank = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-date', '-cumulative_points']
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['-cumulative_points']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"
