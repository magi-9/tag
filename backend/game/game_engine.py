from django.utils import timezone
from django.db.models import F, Q, Sum, Count
from django.contrib.auth import get_user_model
from datetime import timedelta
from .models import GameSettings, Tag, Achievement, PlayerStats

User = get_user_model()


class GameEngine:
    """Core game logic for calculating points, penalties, and achievements"""
    
    @staticmethod
    def get_current_tag_holder():
        """Get the player currently holding the tag"""
        # First check if there's a configured current holder in settings
        settings = GameSettings.get_settings()
        if settings.current_tag_holder:
            return settings.current_tag_holder
        
        # Otherwise get from latest tag
        latest_tag = Tag.objects.filter(verified=True).order_by('-created_at').first()
        return latest_tag.tagged_user if latest_tag else None
    
    @staticmethod
    def calculate_leaderboard():
        """Calculate current leaderboard with live data"""
        settings = GameSettings.get_settings()
        users = User.objects.filter(is_approved=True, is_participating=True)
        leaderboard = []
        current_holder = GameEngine.get_current_tag_holder()
        
        for user in users:
            # Get all tags where user was tagged (they held the tag)
            tags_received = Tag.objects.filter(tagged=user, verified=True).order_by('tagged_at')
            
            total_points = 0
            total_time_held = timedelta()
            
            # Calculate points from tagging others
            tags_given = Tag.objects.filter(tagger=user, verified=True)
            for tag in tags_given:
                total_points += tag.points_awarded
            
            # Calculate penalties from being caught
            for tag in tags_received:
                total_points -= tag.time_penalty
            
            # Add bonus for untagged days
            total_points += GameEngine.calculate_untagged_bonus(user, settings)
            
            # Calculate total time held
            for i, tag in enumerate(tags_received):
                if i < len(tags_received) - 1:
                    next_tag = tags_received[i + 1]
                    time_diff = next_tag.tagged_at - tag.tagged_at
                else:
                    # If this is the last tag and user is current holder
                    if user == current_holder:
                        time_diff = timezone.now() - tag.tagged_at
                    else:
                        time_diff = timedelta()
                
                total_time_held += time_diff
            
            leaderboard.append({
                'user': user,
                'points': total_points,
                'tags_given': tags_given.count(),
                'tags_received': tags_received.count(),
                'time_held': total_time_held,
                'is_current_holder': user == current_holder
            })
        
        # Sort by points (descending)
        leaderboard.sort(key=lambda x: x['points'], reverse=True)
        
        # Add rank
        for i, entry in enumerate(leaderboard, start=1):
            entry['rank'] = i
        
        return leaderboard
    
    @staticmethod
    def calculate_untagged_bonus(user, settings):
        """Calculate bonus points for days user was not tagged"""
        # Get all unique dates with tags
        all_tag_dates = set(
            Tag.objects.filter(verified=True)
            .values_list('tagged_at__date', flat=True)
            .distinct()
        )
        
        # Get dates user was tagged
        user_tagged_dates = set(
            Tag.objects.filter(tagged=user, verified=True)
            .values_list('tagged_at__date', flat=True)
        )
        
        bonus_points = 0
        
        for date in all_tag_dates:
            if date not in user_tagged_dates:
                # Check previous and next day
                prev_day = date - timedelta(days=1)
                next_day = date + timedelta(days=1)
                
                if prev_day not in user_tagged_dates and next_day not in user_tagged_dates:
                    bonus_points += settings.bonus_untagged_day
        
        return bonus_points
    
    @staticmethod
    def process_new_tag(tagger, tagged, location=None, notes=None, photo=None):
        """Process a new tag event and calculate points/penalties"""
        settings = GameSettings.get_settings()
        
        # Verify game is active
        if not settings.is_game_active:
            raise ValueError("Game is not currently active")
        
        # Verify both users are approved and participating
        if not tagger.is_approved or not tagged.is_approved:
            raise ValueError("Both users must be approved to play")
            
        if not tagger.is_participating:
            raise ValueError(f"User {tagger.username} is not participating in the game")
        if not tagged.is_participating:
            raise ValueError(f"User {tagged.username} is not participating in the game")
        
        # Verify tagged player is the current holder
        current_holder = GameEngine.get_current_tag_holder()
        if current_holder and current_holder != tagged:
            raise ValueError(f"Cannot tag {tagged.username}, current holder is {current_holder.username}")
        
        # Get previous tag to calculate time held
        previous_tag = Tag.objects.filter(tagged=tagged, verified=True).order_by('-tagged_at').first()
        
        if previous_tag:
            time_held = timezone.now() - previous_tag.tagged_at
        else:
            # First tag of the game or this player's first time holding
            time_held = timedelta()
        
        # Calculate penalty for time held
        hours_held = time_held.total_seconds() / 3600
        time_penalty = int(hours_held) * settings.time_penalty_per_hour
        
        # Get current leaderboard to determine tagged player's rank
        leaderboard = GameEngine.calculate_leaderboard()
        tagged_rank = next(
            (entry['rank'] for entry in leaderboard if entry['user'] == tagged),
            len(leaderboard)
        )
        
        # Award points based on rank
        points_list = settings.tag_points_list
        if tagged_rank <= len(points_list):
            points_awarded = points_list[tagged_rank - 1]
        else:
            points_awarded = points_list[-1]
        
        # Create the tag record
        tag = Tag.objects.create(
            tagger=tagger,
            tagged=tagged,
            tagged_at=timezone.now(),
            location=location,
            notes=notes,
            photo=photo,
            points_awarded=points_awarded,
            time_penalty=time_penalty,
            time_held=time_held,
            verified=True
        )
        
        # Update user statistics
        tagger.total_tags_given = F('total_tags_given') + 1
        tagger.total_points = F('total_points') + points_awarded
        tagger.save()
        tagger.refresh_from_db()
        
        tagged.total_tags_received = F('total_tags_received') + 1
        tagged.total_points = F('total_points') - time_penalty
        tagged.total_time_held = F('total_time_held') + time_held
        tagged.save()
        tagged.refresh_from_db()

        # Recalculate achievements after each verified tag to keep them up-to-date
        GameEngine.calculate_achievements()
        
        return tag
    
    @staticmethod
    def calculate_achievements():
        """Calculate and award achievements to players"""
        Achievement.objects.all().delete()  # Clear old achievements
        
        leaderboard = GameEngine.calculate_leaderboard()
        
        if not leaderboard:
            return
        
        # Worst Player (lowest points)
        worst = min(leaderboard, key=lambda x: x['points'])
        Achievement.objects.create(
            user=worst['user'],
            achievement_type='worst_player',
            title='Worst Player',
            description='Player with the lowest points',
            value=f"{worst['points']} points",
            icon='💩'
        )
        
        # Fastest Player (least time held)
        fastest = min(leaderboard, key=lambda x: x['time_held'].total_seconds())
        Achievement.objects.create(
            user=fastest['user'],
            achievement_type='fastest_player',
            title='Fastest Player',
            description='Player with the least time holding the tag',
            value=str(fastest['time_held']),
            icon='⚡'
        )
        
        # Slowest Player (most time held)
        slowest = max(leaderboard, key=lambda x: x['time_held'].total_seconds())
        Achievement.objects.create(
            user=slowest['user'],
            achievement_type='slowest_player',
            title='Slowest Player',
            description='Player with the most time holding the tag',
            value=str(slowest['time_held']),
            icon='🐌'
        )
        
        # Most Active Tagger
        most_tags = max(leaderboard, key=lambda x: x['tags_given'])
        Achievement.objects.create(
            user=most_tags['user'],
            achievement_type='most_tags_given',
            title='Most Active Tagger',
            description='Player who tagged others the most',
            value=f"{most_tags['tags_given']} tags",
            icon='🏹'
        )
        
        # Most Caught
        most_caught = max(leaderboard, key=lambda x: x['tags_received'])
        Achievement.objects.create(
            user=most_caught['user'],
            achievement_type='most_tags_received',
            title='Most Caught',
            description='Player who was tagged the most',
            value=f"{most_caught['tags_received']} times",
            icon='🎯'
        )
        
        # Fastest/Slowest catches
        tags = Tag.objects.filter(verified=True).order_by('tagged_at')
        
        if len(tags) > 1:
            min_time = None
            max_time = None
            fastest_tag = None
            slowest_tag = None
            
            for i in range(len(tags) - 1):
                time_diff = tags[i + 1].tagged_at - tags[i].tagged_at
                
                if min_time is None or time_diff < min_time:
                    min_time = time_diff
                    fastest_tag = tags[i + 1]
                
                if max_time is None or time_diff > max_time:
                    max_time = time_diff
                    slowest_tag = tags[i + 1]
            
            if fastest_tag:
                Achievement.objects.create(
                    user=fastest_tag.tagger,
                    achievement_type='fastest_catch',
                    title='Fastest Catch',
                    description=f'Caught {fastest_tag.tagged.full_name}',
                    value=str(min_time),
                    icon='🚀'
                )
            
            if slowest_tag:
                Achievement.objects.create(
                    user=slowest_tag.tagged,
                    achievement_type='slowest_catch',
                    title='Slowest Catch',
                    description=f'Held the tag for the longest time before being caught',
                    value=str(max_time),
                    icon='⏰'
                )
