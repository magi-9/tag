from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone
from pywebpush import webpush, WebPushException
from django.conf import settings
import json

User = get_user_model()


@shared_task
def send_tag_notification(tag_id):
    """Send push notification when a new tag occurs"""
    from game.models import Tag, GameSettings
    from .models import Notification
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    try:
        tag = Tag.objects.get(id=tag_id)
        game_settings = GameSettings.get_settings()
        
        if not game_settings.enable_notifications:
            return
        
        # Format notification message
        message = game_settings.notification_message_template.format(
            tagger=tag.tagger.full_name,
            tagged=tag.tagged.full_name
        )
        
        title = game_settings.notification_title
        
        # Get all approved users except the tagger
        users = User.objects.filter(is_approved=True).exclude(id=tag.tagger.id)
        
        # Send to each user via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'game_updates',
            {
                'type': 'new_tag',
                'data': {
                    'tag_id': tag.id,
                    'tagger': tag.tagger.full_name,
                    'tagged': tag.tagged.full_name,
                    'message': message,
                    'timestamp': tag.tagged_at.isoformat()
                }
            }
        )
        
        # Send push notifications
        for user in users:
            notification = Notification.objects.create(
                user=user,
                notification_type='tag',
                title=title,
                message=message,
                data={
                    'tag_id': tag.id,
                    'tagger_id': tag.tagger.id,
                    'tagged_id': tag.tagged.id
                }
            )
            
            # Send web push if user has subscription
            if user.push_subscription:
                send_web_push.delay(notification.id)
        
    except Tag.DoesNotExist:
        pass


@shared_task
def send_web_push(notification_id):
    """Send web push notification to user"""
    from .models import Notification
    
    try:
        notification = Notification.objects.get(id=notification_id)
        
        if not notification.user or not notification.user.push_subscription:
            return
        
        subscription_info = notification.user.push_subscription
        
        payload = json.dumps({
            'title': notification.title,
            'body': notification.message,
            'icon': '/icon-192x192.png',
            'badge': '/badge-72x72.png',
            'data': notification.data or {},
            'tag': notification.notification_type,
            'requireInteraction': True
        })
        
        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": f"mailto:{settings.VAPID_ADMIN_EMAIL}"
                }
            )
            
            notification.push_sent = True
            notification.push_sent_at = timezone.now()
            notification.save()
            
        except WebPushException as e:
            notification.push_error = str(e)
            notification.save()
            
            # If subscription is invalid, clear it
            if e.response and e.response.status_code in [404, 410]:
                notification.user.push_subscription = None
                notification.user.save()
    
    except Notification.DoesNotExist:
        pass


@shared_task
def send_bulk_notification(title, message, notification_type='custom', user_ids=None):
    """Send notification to multiple users or all users"""
    from .models import Notification
    
    if user_ids:
        users = User.objects.filter(id__in=user_ids, is_approved=True)
    else:
        users = User.objects.filter(is_approved=True)
    
    for user in users:
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message
        )
        
        if user.push_subscription:
            send_web_push.delay(notification.id)


@shared_task
def send_game_start_notification():
    """Notify all users that the game has started"""
    from game.models import GameSettings
    
    settings = GameSettings.get_settings()
    
    send_bulk_notification.delay(
        title='Hra začala!',
        message=f'Tag Game je aktívna! Koniec: {settings.game_end_date.strftime("%d.%m.%Y %H:%M")}',
        notification_type='game_start'
    )


@shared_task
def send_game_end_notification():
    """Notify all users that the game has ended"""
    send_bulk_notification.delay(
        title='Hra skončila!',
        message='Tag Game sa skončila. Pozrite si finálne výsledky!',
        notification_type='game_end'
    )
