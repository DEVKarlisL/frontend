"""Fraud app serializers."""
from rest_framework import serializers
from .models import FraudSignal, MultiAccountDetection, VelocityCheck
from apps.users.serializers import UserSerializer


class FraudSignalSerializer(serializers.ModelSerializer):
    """Serializer for FraudSignal model."""
    
    user = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = FraudSignal
        fields = [
            'id', 'user', 'signal_type', 'risk_level', 'description',
            'evidence', 'is_reviewed', 'is_confirmed', 'reviewed_by',
            'reviewed_at'
        ]
        read_only_fields = ['id', 'user', 'reviewed_by', 'reviewed_at']


class MultiAccountDetectionSerializer(serializers.ModelSerializer):
    """Serializer for MultiAccountDetection model."""
    
    primary_user = UserSerializer(read_only=True)
    linked_user = UserSerializer(read_only=True)
    
    class Meta:
        model = MultiAccountDetection
        fields = [
            'id', 'primary_user', 'linked_user', 'detection_method',
            'confidence_score', 'is_confirmed'
        ]
        read_only_fields = ['id']


class VelocityCheckSerializer(serializers.ModelSerializer):
    """Serializer for VelocityCheck model."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = VelocityCheck
        fields = [
            'id', 'user', 'action_type', 'action_count',
            'time_window_seconds', 'threshold_exceeded'
        ]
        read_only_fields = ['id', 'user']
