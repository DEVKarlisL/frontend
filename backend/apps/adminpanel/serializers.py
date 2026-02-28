"""Admin panel app serializers."""
from rest_framework import serializers
from .models import SystemSettings, AdminLog, Report
from apps.users.serializers import UserSerializer


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for SystemSettings model."""
    
    class Meta:
        model = SystemSettings
        fields = [
            'id', 'anti_snipe_default_seconds', 'min_reserve_price',
            'max_auction_duration_days', 'kyc_enabled',
            'seller_verification_enabled', 'deposit_system_enabled',
            'fraud_detection_enabled', 'auto_ban_on_fraud', 'updated_at', 'favicon'
        ]
        read_only_fields = ['id', 'updated_at']


class AdminLogSerializer(serializers.ModelSerializer):
    """Serializer for AdminLog model."""
    
    admin = UserSerializer(read_only=True)
    target_user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminLog
        fields = [
            'id', 'admin', 'action', 'target_user', 'description',
            'details', 'created_at'
        ]
        read_only_fields = ['id', 'admin', 'created_at']


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report model."""
    
    reporter = UserSerializer(read_only=True)
    reported_user = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reported_user', 'report_type',
            'description', 'status', 'reviewed_by', 'review_notes', 'created_at'
        ]
        read_only_fields = ['id', 'reporter', 'reviewed_by']
