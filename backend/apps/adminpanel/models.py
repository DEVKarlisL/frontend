"""Admin panel models."""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SystemSettings(models.Model):
    """Global system settings."""
    
    # Auction settings
    anti_snipe_default_seconds = models.IntegerField(default=30)
    min_reserve_price = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    max_auction_duration_days = models.IntegerField(default=30)
    
    # Feature toggles
    kyc_enabled = models.BooleanField(default=False)
    seller_verification_enabled = models.BooleanField(default=False)
    deposit_system_enabled = models.BooleanField(default=False)
    
    # Fraud detection
    fraud_detection_enabled = models.BooleanField(default=True)
    auto_ban_on_fraud = models.BooleanField(default=False)
    
    updated_at = models.DateTimeField(auto_now=True)
    favicon = models.ImageField(upload_to='favicons/', null=True, blank=True, help_text='Favicon for the website')
    
    class Meta:
        db_table = 'adminpanel_system_settings'
        verbose_name_plural = 'System Settings'
    
    def __str__(self):
        return "System Settings"


class AdminLog(models.Model):
    """Log of admin actions."""
    
    ACTION_CHOICES = [
        ('user_ban', 'User ban'),
        ('user_unban', 'User unban'),
        ('auction_cancel', 'Auction cancellation'),
        ('settings_change', 'Settings change'),
        ('fraud_review', 'Fraud review'),
        ('payment_refund', 'Payment refund'),
    ]
    
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    
    target_user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='admin_actions_against'
    )
    
    description = models.TextField()
    details = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'adminpanel_admin_log'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.admin.username} - {self.action}"


class Report(models.Model):
    """User report for abuse."""
    
    REPORT_TYPE_CHOICES = [
        ('fraud', 'Fraud'),
        ('counterfeit', 'Counterfeit item'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate content'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Under investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_created')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_against')
    
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    description = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reports_reviewed'
    )
    review_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'adminpanel_report'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report against {self.reported_user.username}"
