"""Fraud app models."""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FraudSignal(models.Model):
    """Fraud detection signal."""
    
    SIGNAL_TYPE_CHOICES = [
        ('multi_account', 'Multiple accounts'),
        ('velocity', 'High velocity activity'),
        ('pattern', 'Suspicious pattern'),
        ('payment_mismatch', 'Payment mismatch'),
        ('geographic_anomaly', 'Geographic anomaly'),
        ('device_fingerprint', 'Device fingerprint mismatch'),
    ]
    
    RISK_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fraud_signals')
    signal_type = models.CharField(max_length=50, choices=SIGNAL_TYPE_CHOICES)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES)
    
    description = models.TextField()
    evidence = models.JSONField(null=True, blank=True)
    
    is_reviewed = models.BooleanField(default=False)
    is_confirmed = models.BooleanField(default=False)
    
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='fraud_reviews'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fraud_signal'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'risk_level']),
            models.Index(fields=['is_reviewed', 'risk_level']),
        ]
    
    def __str__(self):
        return f"{self.signal_type} - {self.user.username} ({self.risk_level})"


class MultiAccountDetection(models.Model):
    """Detect linked multi-accounts."""
    
    primary_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='primary_account_links')
    linked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='linked_accounts')
    
    detection_method = models.CharField(max_length=255)
    confidence_score = models.FloatField(default=0.0)
    
    is_confirmed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fraud_multi_account_detection'
        unique_together = ['primary_user', 'linked_user']
    
    def __str__(self):
        return f"{self.primary_user.username} <-> {self.linked_user.username}"


class VelocityCheck(models.Model):
    """Check for suspicious activity velocity."""
    
    ACTION_TYPES = [
        ('bid', 'Bid'),
        ('login', 'Login'),
        ('payment', 'Payment'),
        ('account_creation', 'Account creation'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='velocity_checks')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    
    action_count = models.IntegerField()
    time_window_seconds = models.IntegerField(default=3600)
    
    threshold_exceeded = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fraud_velocity_check'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.action_type}"
