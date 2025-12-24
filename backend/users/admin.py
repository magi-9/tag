from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'full_name', 'is_approved', 'total_points', 'is_staff']
    list_filter = ['is_approved', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Game Info', {
            'fields': ('is_approved', 'approved_at', 'approved_by', 'phone', 'avatar')
        }),
        ('Statistics', {
            'fields': ('total_tags_given', 'total_tags_received', 'total_points', 'total_time_held')
        }),
    )
    
    readonly_fields = ['approved_at', 'total_tags_given', 'total_tags_received', 'total_points', 'total_time_held']
