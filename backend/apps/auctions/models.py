"""Auction app models."""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Category(models.Model):
    """Auction category."""
    
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=255, blank=True)
    widget_settings = models.JSONField(default=dict, blank=True, help_text='Widget display settings (background, size, etc.)')
    display_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auctions_category'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name


class Auction(models.Model):
    """Auction listing."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('ended', 'Ended'),
        ('sold', 'Sold'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic info
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='auctions')
    location = models.CharField(max_length=100, blank=True, null=True, help_text='City or location of the item')
    
    # Seller
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auctions_seller')
    
    # Pricing
    starting_price = models.DecimalField(max_digits=10, decimal_places=2)
    reserve_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    buy_now_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    current_highest_bid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_increment = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    
    # Winner
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='auctions_won')
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Duration
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Anti-snipe
    anti_snipe_seconds = models.IntegerField(default=30, help_text='Extend auction if bid within this many seconds of end')
    
    # Metadata
    view_count = models.IntegerField(default=0)
    bid_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auctions_auction'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['end_time']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        return self.status == 'active' and timezone.now() < self.end_time
    
    @property
    def is_ended(self):
        return self.status == 'ended' or timezone.now() >= self.end_time


class Watchlist(models.Model):
    """User watchlist for auctions."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='watchlist_entries')
    
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'auctions_watchlist'
        unique_together = ['user', 'auction']
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.user.username} watching {self.auction.title}"
