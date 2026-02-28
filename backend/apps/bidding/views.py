"""Bidding app views."""
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Bid, AutoBidRule, BidHistory
from .serializers import BidSerializer, AutoBidRuleSerializer


def _track_activity(user):
    if user and user.is_authenticated:
        user.update_activity()


def _apply_anti_snipe(auction):
    if auction.anti_snipe_seconds and auction.anti_snipe_seconds > 0:
        now = timezone.now()
        remaining = (auction.end_time - now).total_seconds()
        if remaining < auction.anti_snipe_seconds:
            auction.end_time = now + timezone.timedelta(
                seconds=auction.anti_snipe_seconds
            )


class BidViewSet(viewsets.ModelViewSet):
    """ViewSet for Bid model."""
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter bids by user."""
        return Bid.objects.filter(bidder=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a bid and return updated auction data."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Get the created bid and its auction
        bid = serializer.instance
        auction = bid.auction
        
        # Return bid data along with updated auction info
        return Response({
            'bid': serializer.data,
            'auction': {
                'id': auction.id,
                'current_highest_bid': auction.current_highest_bid,
                'bid_count': auction.bid_count,
                'end_time': auction.end_time,
            }
        }, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        """Set bidder to current user and update auction's current_highest_bid."""
        _track_activity(self.request.user)
        
        bid = serializer.save(bidder=self.request.user)
        
        # Update auction's current highest bid and bid count
        auction = bid.auction
        if auction.current_highest_bid is None or bid.amount > auction.current_highest_bid:
            auction.current_highest_bid = bid.amount
        auction.bid_count += 1
        _apply_anti_snipe(auction)
        auction.save(update_fields=['current_highest_bid', 'bid_count', 'end_time'])
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"auction_{auction.id}",
                {
                    "type": "auction.message",
                    "message": {
                        "type": "bid_placed",
                        "data": {
                            "amount": float(bid.amount),
                            "bidder": bid.bidder.username,
                            "bidderAvatar": bid.bidder.avatar.url if bid.bidder.avatar else None,
                            "end_time": auction.end_time.isoformat(),
                            "bid_count": auction.bid_count,
                            "current_highest_bid": float(auction.current_highest_bid),
                            "anti_snipe_seconds": auction.anti_snipe_seconds,
                        },
                    },
                },
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticatedOrReadOnly])
    def auction_bids(self, request):
        """Get bids for specific auction."""
        auction_id = request.query_params.get('auction_id')
        if not auction_id:
            return Response(
                {'error': 'auction_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bids = Bid.objects.filter(auction_id=auction_id).select_related('bidder')
        serializer = self.get_serializer(bids, many=True)
        return Response(serializer.data)


class AutoBidRuleView(views.APIView):
    """View for auto-bid rules."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's auto-bid rules."""
        rules = AutoBidRule.objects.filter(bidder=request.user).select_related('auction')
        serializer = AutoBidRuleSerializer(rules, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create auto-bid rule."""
        serializer = AutoBidRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(bidder=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        """Update auto-bid rule."""
        rule_id = request.data.get('id')
        try:
            rule = AutoBidRule.objects.get(id=rule_id, bidder=request.user)
        except AutoBidRule.DoesNotExist:
            return Response(
                {'error': 'Rule not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AutoBidRuleSerializer(rule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
