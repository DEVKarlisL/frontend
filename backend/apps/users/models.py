"""Users app models."""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import URLValidator, EmailValidator
from django.utils import timezone


class User(AbstractUser):
    """Custom user model with additional fields."""
    
    # Profile
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Status
    is_verified = models.BooleanField(default=False)
    is_seller = models.BooleanField(default=False)
    is_business = models.BooleanField(default=False)
    
    # Metrics
    feedback_score = models.FloatField(default=0.0)
    total_auctions = models.IntegerField(default=0)
    total_bids = models.IntegerField(default=0)
    
    # Activity tracking
    last_activity = models.DateTimeField(default=timezone.now, null=True, blank=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.username})"
    
    def update_activity(self):
        """Update user's last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])
    
    @property
    def is_online(self):
        """Check if user is online (last activity within 5 minutes)"""
        from datetime import timedelta
        if not self.last_activity:
            return False
        return (timezone.now() - self.last_activity) < timedelta(minutes=5)


class UserProfile(models.Model):
    """Extended user profile information."""
    
    NOTIFICATION_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Preferences
    notification_preference = models.CharField(
        max_length=20,
        choices=NOTIFICATION_CHOICES,
        default='email'
    )
    receive_marketing = models.BooleanField(default=False)
    receive_auction_alerts = models.BooleanField(default=True)
    
    # KYC (optional, disabled by default)
    kyc_verified = models.BooleanField(default=False)
    kyc_submitted_at = models.DateTimeField(null=True, blank=True)
    kyc_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Verification
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone_verified = models.BooleanField(default=False)
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_profile'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user.username}"


class BusinessAccount(models.Model):
    """Business seller account with subscription."""
    
    SUBSCRIPTION_TIERS = [
        ('free', 'Free'),
        ('basic', 'Basic - $29/month'),
        ('pro', 'Pro - $99/month'),
        ('enterprise', 'Enterprise - Custom'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business_account')
    business_name = models.CharField(max_length=255)
    business_registration_number = models.CharField(max_length=255, unique=True)
    
    subscription_tier = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_TIERS,
        default='free'
    )
    subscription_active = models.BooleanField(default=False)
    subscription_started_at = models.DateTimeField(null=True, blank=True)
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    
    bulk_upload_allowed = models.BooleanField(default=False)
    api_access_allowed = models.BooleanField(default=False)
    api_key = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_business_account'
        verbose_name = 'Business Account'
        verbose_name_plural = 'Business Accounts'
    
    def __str__(self):
        return f"{self.business_name} ({self.user.username})"
