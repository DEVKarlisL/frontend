"""Media app views."""
from rest_framework import viewsets, permissions
from .models import AuctionImage, AuctionVideo
from .serializers import AuctionImageSerializer, AuctionVideoSerializer


class BaseMediaViewSet(viewsets.ModelViewSet):
    """Shared behavior for media viewsets."""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        """Save uploaded_by as current user."""
        serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        """Only allow update by uploader or admin."""
        if (
            serializer.instance.uploaded_by != self.request.user
            and not self.request.user.is_staff
        ):
            raise PermissionError("You can only update your own uploads")
        serializer.save()


class AuctionImageViewSet(BaseMediaViewSet):
    """ViewSet for AuctionImage model."""
    
    queryset = AuctionImage.objects.all()
    serializer_class = AuctionImageSerializer


class AuctionVideoViewSet(BaseMediaViewSet):
    """ViewSet for AuctionVideo model."""
    
    queryset = AuctionVideo.objects.all()
    serializer_class = AuctionVideoSerializer
