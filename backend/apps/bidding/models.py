"""Bidding app models."""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.auctions.models import Auction

User = get_user_model()


class Bid(models.Model):
    """Individual bid on an auction."""
    
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    is_auto_bid = models.BooleanField(default=False)
    auto_bid_rule = models.ForeignKey(
        'AutoBidRule', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='bids'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bidding_bid'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['auction', 'created_at']),
            models.Index(fields=['bidder', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.bidder.username} bid ${self.amount} on {self.auction.title}"


class AutoBidRule(models.Model):
    """Proxy auto-bidding rule."""
    
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='auto_bid_rules')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auto_bid_rules')
    max_bid = models.DecimalField(max_digits=10, decimal_places=2)
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bidding_auto_bid_rule'
        unique_together = ['auction', 'bidder']
    
    def __str__(self):
        return f"Auto bid rule for {self.bidder.username} on {self.auction.title}"


class BidHistory(models.Model):
    """Immutable bid history for audit."""
    
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bid_history')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bid_history')
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    previous_highest_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    previous_highest_bidder = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='bid_history_as_previous'
    )
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bidding_bid_history'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Bid history for {self.auction.title}"
