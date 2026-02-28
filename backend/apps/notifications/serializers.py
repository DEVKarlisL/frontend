"""Notifications app serializers."""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, Message, AuditLog
from apps.users.serializers import UserSerializer

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'channel', 'title',
            'message', 'is_read', 'read_at', 'related_object_id',
            'related_object_type', 'sent_at'
        ]
        read_only_fields = ['id', 'user', 'read_at', 'sent_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model."""
    
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='recipient'
    )
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'recipient', 'recipient_id', 'subject',
            'content', 'is_read', 'read_at'
        ]
        read_only_fields = ['id', 'sender', 'read_at']


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'action', 'resource_type', 'resource_id',
            'old_values', 'new_values', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
