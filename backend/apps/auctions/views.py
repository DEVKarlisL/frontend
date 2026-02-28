"""Auctions app views."""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Auction, Category, Watchlist
from .serializers import AuctionSerializer, CategorySerializer, WatchlistSerializer


def _track_activity(user):
    if user and user.is_authenticated:
        user.update_activity()


class UpdateCategoryView(APIView):
    """Custom view to handle category updates via POST."""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        """Update a category using POST method."""
        try:
            category = Category.objects.get(pk=pk)
            serializer = CategorySerializer(category, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)


class CategoryReorderView(APIView):
    """Reorder categories by admin."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        ordered_ids = request.data.get("ordered_ids")
        items = request.data.get("items")

        if isinstance(ordered_ids, list) and ordered_ids:
            for index, category_id in enumerate(ordered_ids, start=1):
                Category.objects.filter(pk=category_id).update(display_order=index)
            return Response({"detail": "Category order updated"})

        if isinstance(items, list) and items:
            for item in items:
                category_id = item.get("id")
                display_order = item.get("display_order")
                if category_id is None or display_order is None:
                    continue
                Category.objects.filter(pk=category_id).update(display_order=display_order)
            return Response({"detail": "Category order updated"})

        return Response(
            {"detail": "ordered_ids or items payload required"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class AuctionViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def live(self, request):
        """Return all live auctions (status 'active' and end_time in the future)."""
        from django.utils import timezone
        now = timezone.now()
        live_auctions = Auction.objects.filter(status='active', end_time__gt=now)
        serializer = self.get_serializer(live_auctions, many=True)
        return Response(serializer.data)

    """ViewSet for Auction model."""
    queryset = Auction.objects.all()
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'seller']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_time', 'end_time', 'current_highest_bid']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Create auction with current user as seller."""
        _track_activity(self.request.user)
        serializer.save(seller=self.request.user)
    
    def perform_update(self, serializer):
        """Update auction only if user is the seller."""
        _track_activity(self.request.user)
        if serializer.instance.seller != self.request.user:
            raise PermissionError("You can only update your own auctions")
        serializer.save()
    
    def retrieve(self, request, *args, **kwargs):
        """Get auction details and track activity for authenticated user."""
        _track_activity(request.user)
        
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_auctions(self, request):
        """Get current user's auctions."""
        auctions = Auction.objects.filter(seller=request.user)
        serializer = self.get_serializer(auctions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_won_auctions(self, request):
        """Get auctions won by current user."""
        auctions = Auction.objects.filter(winner=request.user)
        serializer = self.get_serializer(auctions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_to_watchlist(self, request, pk=None):
        """Add auction to user watchlist."""
        _track_activity(request.user)
        
        auction = self.get_object()
        watchlist, created = Watchlist.objects.get_or_create(user=request.user, auction=auction)
        if created:
            return Response({'detail': 'Added to watchlist'}, status=status.HTTP_201_CREATED)
        return Response({'detail': 'Already in watchlist'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def remove_from_watchlist(self, request, pk=None):
        """Remove auction from user watchlist."""
        _track_activity(request.user)
        
        auction = self.get_object()
        watchlist = Watchlist.objects.filter(user=request.user, auction=auction)
        if watchlist.exists():
            watchlist.delete()
            return Response({'detail': 'Removed from watchlist'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Not in watchlist'}, status=status.HTTP_404_NOT_FOUND)


class WatchlistViewSet(viewsets.ModelViewSet):
    """ViewSet for Watchlist model."""
    
    queryset = Watchlist.objects.all()
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return watchlist for current user only."""
        return Watchlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Create watchlist entry for current user."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def activate(self, request, pk=None):
        """Activate an auction."""
        auction = self.get_object()
        if auction.seller != request.user:
            return Response(
                {'error': 'Only seller can activate'},
                status=status.HTTP_403_FORBIDDEN
            )
        auction.status = 'active'
        auction.save()
        return Response({'status': 'Auction activated'})


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Category model."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class WatchlistView(APIView):
    """View for auction watchlist."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        """Get user's watchlist. If not authenticated, return empty list."""
        if not request.user.is_authenticated:
            return Response([])
        watchlist = Watchlist.objects.filter(user=request.user).select_related('auction')
        serializer = WatchlistSerializer(watchlist, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Add auction to watchlist."""
        auction_id = request.data.get('auction_id')
        try:
            auction = Auction.objects.get(id=auction_id)
        except Auction.DoesNotExist:
            return Response(
                {'error': 'Auction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        watchlist, created = Watchlist.objects.get_or_create(
            user=request.user,
            auction=auction
        )
        
        if not created:
            return Response(
                {'error': 'Already in watchlist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = WatchlistSerializer(watchlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def delete(self, request):
        """Remove auction from watchlist."""
        auction_id = request.data.get('auction_id')
        Watchlist.objects.filter(
            user=request.user,
            auction_id=auction_id
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
