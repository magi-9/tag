from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_name', 'notification_type',
            'title', 'message', 'data', 'sent_at', 'read_at',
            'is_read', 'push_sent', 'push_sent_at'
        ]
        read_only_fields = ['id', 'sent_at', 'push_sent', 'push_sent_at']
    
    def get_is_read(self, obj):
        return obj.read_at is not None


class SendNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(
        choices=Notification.NOTIFICATION_TYPES,
        default='custom'
    )
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        help_text='If empty, sends to all users'
    )
