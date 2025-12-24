# Generated manually - Initial migration

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from datetime import timedelta


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GameSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game_start_date', models.DateTimeField()),
                ('game_end_date', models.DateTimeField()),
                ('tag_points_rank_1', models.IntegerField(default=50, help_text='Points for tagging rank 1 player')),
                ('tag_points_rank_2', models.IntegerField(default=40, help_text='Points for tagging rank 2 player')),
                ('tag_points_rank_3', models.IntegerField(default=30, help_text='Points for tagging rank 3 player')),
                ('tag_points_rank_4', models.IntegerField(default=20, help_text='Points for tagging rank 4 player')),
                ('tag_points_rank_5', models.IntegerField(default=10, help_text='Points for tagging rank 5 player')),
                ('tag_points_rank_other', models.IntegerField(default=5, help_text='Points for tagging rank 6+ player')),
                ('time_penalty_per_hour', models.IntegerField(default=5, help_text='Points deducted per hour of holding tag')),
                ('bonus_untagged_day', models.IntegerField(default=35, help_text='Bonus points for untagged isolated day')),
                ('first_place_prize', models.TextField(default='Hlavná výhra', help_text='Prize description for winner')),
                ('last_place_prize', models.TextField(default='Antikvýhra - Surströmming', help_text='Anti-prize for last place')),
                ('current_tag_holder', models.ForeignKey(blank=True, help_text='Player currently holding the tag', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='holding_tag', to=settings.AUTH_USER_MODEL)),
                ('tag_holder_since', models.DateTimeField(blank=True, help_text='When did current holder get the tag', null=True)),
                ('enable_notifications', models.BooleanField(default=True)),
                ('notification_title', models.CharField(default='Nový tag!', max_length=200)),
                ('notification_message_template', models.TextField(default='{tagger} tagol {tagged}!', help_text='Use {tagger} and {tagged} placeholders')),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Game Settings',
                'verbose_name_plural': 'Game Settings',
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tagged_at', models.DateTimeField(default='django.utils.timezone.now')),
                ('location', models.CharField(blank=True, max_length=200, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='tags/')),
                ('points_awarded', models.IntegerField(default=0, help_text='Points awarded to tagger')),
                ('time_penalty', models.IntegerField(default=0, help_text='Penalty to tagged player')),
                ('time_held', models.DurationField(default=timedelta, help_text='Time tagged player held the tag')),
                ('verified', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tagger', models.ForeignKey(help_text='Player who made the tag', on_delete=django.db.models.deletion.CASCADE, related_name='tags_given', to=settings.AUTH_USER_MODEL)),
                ('tagged', models.ForeignKey(help_text='Player who was tagged', on_delete=django.db.models.deletion.CASCADE, related_name='tags_received', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-tagged_at'],
            },
        ),
        migrations.CreateModel(
            name='PlayerStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_tags', models.IntegerField(default=0)),
                ('total_tagged', models.IntegerField(default=0)),
                ('total_points', models.IntegerField(default=0)),
                ('current_rank', models.IntegerField(blank=True, null=True)),
                ('best_rank', models.IntegerField(blank=True, null=True)),
                ('total_time_held', models.DurationField(default=timedelta)),
                ('longest_hold', models.DurationField(default=timedelta)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='stats', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Player Stats',
                'verbose_name_plural': 'Player Stats',
            },
        ),
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('achievement_type', models.CharField(choices=[('tag_streak', 'Tag Streak'), ('quick_tag', 'Quick Tag'), ('survivor', 'Survivor'), ('marathon', 'Marathon'), ('points_milestone', 'Points Milestone')], max_length=50)),
                ('earned_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='achievements', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-earned_at'],
            },
        ),
    ]
