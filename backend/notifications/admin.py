from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'sent_at', 'push_sent', 'read_at']
    list_filter = ['notification_type', 'push_sent', 'sent_at']
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['sent_at', 'push_sent_at', 'read_at']
    
    fieldsets = [
        ('Notification Details', {
            'fields': ('user', 'notification_type', 'title', 'message', 'data')
        }),
        ('Status', {
            'fields': ('sent_at', 'read_at', 'push_sent', 'push_sent_at', 'push_error')
        }),
    ]
