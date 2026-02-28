"""Auctions app serializers."""
from rest_framework import serializers
from .models import Auction, Category, Watchlist
from apps.users.serializers import UserSerializer
from django.utils import timezone


CATEGORY_PLACEHOLDER_IMAGES = {
    "Automašīnas": "https://picsum.photos/seed/car/800/600",
    "Īpašumi": "https://picsum.photos/seed/house/800/600",
    "Pulksteņi": "https://picsum.photos/seed/watch/800/600",
    "Kuģi": "https://picsum.photos/seed/boat/800/600",
    "Transports": "https://picsum.photos/seed/transport/800/600",
    "Nekustamais īpašums": "https://picsum.photos/seed/realestate/800/600",
    "Darbs": "https://picsum.photos/seed/jobs/800/600",
    "Pakalpojumi": "https://picsum.photos/seed/services/800/600",
    "Elektronika": "https://picsum.photos/seed/electronics/800/600",
    "Mājai un dārzam": "https://picsum.photos/seed/home/800/600",
    "Bērniem": "https://picsum.photos/seed/kids/800/600",
    "Dzīvnieki": "https://picsum.photos/seed/animals/800/600",
    "Atpūta un vaļasprieki": "https://picsum.photos/seed/hobby/800/600",
    "Būvniecība": "https://picsum.photos/seed/construction/800/600",
    "Bizness": "https://picsum.photos/seed/business/800/600",
    "Lauksaimniecība": "https://picsum.photos/seed/agriculture/800/600",
    "Cits": "https://picsum.photos/seed/other/800/600",
    "Telefona numuri": "https://picsum.photos/seed/phone/800/600",
    "Auto numurzīmes": "https://picsum.photos/seed/plates/800/600",
}


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'widget_settings', 'display_order']
        read_only_fields = ['id']


class AuctionImageSerializer(serializers.Serializer):
    """Serializer for auction images."""
    id = serializers.IntegerField()
    image = serializers.ImageField()
    alt_text = serializers.CharField()
    is_primary = serializers.BooleanField()


class AuctionSerializer(serializers.ModelSerializer):
    """Serializer for Auction model."""
    
    seller = UserSerializer(read_only=True)
    winner = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        source='category'
    )
    
    # Computed fields for frontend compatibility
    current_bid = serializers.DecimalField(
        source='current_highest_bid',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    numberOfBids = serializers.IntegerField(source='bid_count', read_only=True)
    last_bidder = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    images = AuctionImageSerializer(many=True, read_only=True)
    timeRemaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Auction
        fields = [
            'id', 'title', 'description', 'category', 'category_id',
            'seller', 'starting_price', 'reserve_price', 'buy_now_price',
            'current_highest_bid', 'current_bid', 'minimum_increment', 
            'winner', 'final_price', 'start_time', 'end_time', 'status', 
            'anti_snipe_seconds', 'view_count', 'bid_count', 'numberOfBids',
            'last_bidder', 'image', 'images', 'timeRemaining', 'location'
        ]
        read_only_fields = [
            'id', 'seller', 'winner', 'current_highest_bid', 'final_price',
            'view_count', 'bid_count'
        ]

    def _build_media_url(self, request, media_field):
        if request:
            return request.build_absolute_uri(media_field.url)
        return media_field.url
    
    def get_last_bidder(self, obj):
        """Get the username of the last bidder."""
        last_bid = obj.bids.order_by('-created_at').first()
        if last_bid and last_bid.bidder:
            avatar_url = None
            if last_bid.bidder.avatar:
                request = self.context.get('request')
                avatar_url = self._build_media_url(request, last_bid.bidder.avatar)
            
            return {
                'username': last_bid.bidder.username,
                'avatar': avatar_url
            }
        return None
    
    def get_image(self, obj):
        """Get primary image or first image."""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            request = self.context.get('request')
            return self._build_media_url(request, primary_image.image)
        
        first_image = obj.images.first()
        if first_image and first_image.image:
            request = self.context.get('request')
            return self._build_media_url(request, first_image.image)
        
        # Fallback to placeholder images based on category
        if obj.category:
            return CATEGORY_PLACEHOLDER_IMAGES.get(
                obj.category.name,
                "https://picsum.photos/seed/auction/800/600",
            )
        
        return "https://picsum.photos/seed/auction/800/600"
    
    def get_timeRemaining(self, obj):
        """Calculate time remaining in human readable format."""
        now = timezone.now()
        if obj.end_time <= now:
            return "Beigusies"
        
        delta = obj.end_time - now
        days = delta.days
        hours = delta.seconds // 3600
        minutes = (delta.seconds % 3600) // 60
        
        if days > 0:
            return f"{days}d {hours}h"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"


class WatchlistSerializer(serializers.ModelSerializer):
    """Serializer for Watchlist model."""
    
    auction = AuctionSerializer(read_only=True)
    auction_id = serializers.PrimaryKeyRelatedField(
        queryset=Auction.objects.all(),
        write_only=True,
        source='auction'
    )
    
    class Meta:
        model = Watchlist
        fields = ['id', 'auction', 'auction_id', 'added_at']
        read_only_fields = ['id', 'added_at']
