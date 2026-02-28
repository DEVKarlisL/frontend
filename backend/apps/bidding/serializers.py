"""Bidding app serializers."""
from rest_framework import serializers
from .models import Bid, AutoBidRule, BidHistory
from apps.users.serializers import UserSerializer
from apps.auctions.serializers import AuctionSerializer
from apps.auctions.models import Auction


class BidSerializer(serializers.ModelSerializer):
    """Serializer for Bid model."""
    
    bidder = UserSerializer(read_only=True)
    auction = AuctionSerializer(read_only=True)
    auction_id = serializers.PrimaryKeyRelatedField(
        queryset=Auction.objects.all(),
        write_only=True,
        source='auction'
    )
    
    class Meta:
        model = Bid
        fields = [
            'id', 'auction', 'auction_id', 'bidder', 'amount',
            'is_auto_bid', 'auto_bid_rule', 'created_at'
        ]
        read_only_fields = ['id', 'bidder', 'is_auto_bid', 'created_at']
    
    def validate(self, attrs):
        """Validate that user is not already the highest bidder."""
        auction = attrs.get('auction')
        request = self.context.get('request')
        
        if auction and request and request.user:
            # Get the last bid for this auction
            last_bid = auction.bids.order_by('-created_at').first()
            if last_bid and last_bid.bidder == request.user:
                raise serializers.ValidationError(
                    {'detail': 'Jūs jau esat augstākais solītājs'}
                )
        
        return attrs


class AutoBidRuleSerializer(serializers.ModelSerializer):
    """Serializer for AutoBidRule model."""
    
    bidder = UserSerializer(read_only=True)
    auction = AuctionSerializer(read_only=True)
    auction_id = serializers.PrimaryKeyRelatedField(
        queryset=Auction.objects.all(),
        write_only=True,
        source='auction'
    )
    
    class Meta:
        model = AutoBidRule
        fields = [
            'id', 'auction', 'auction_id', 'bidder', 'max_bid', 'is_active'
        ]
        read_only_fields = ['id', 'bidder']


class BidHistorySerializer(serializers.ModelSerializer):
    """Serializer for BidHistory model."""
    
    bidder = UserSerializer(read_only=True)
    auction = AuctionSerializer(read_only=True)
    previous_highest_bidder = UserSerializer(read_only=True)
    
    class Meta:
        model = BidHistory
        fields = [
            'id', 'auction', 'bidder', 'bid_amount',
            'previous_highest_amount', 'previous_highest_bidder', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
