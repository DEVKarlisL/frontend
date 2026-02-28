"""Media app URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuctionImageViewSet, AuctionVideoViewSet

router = DefaultRouter()
router.register(r'auction-images', AuctionImageViewSet, basename='auction-image')
router.register(r'auction-videos', AuctionVideoViewSet, basename='auction-video')

urlpatterns = [
    path('', include(router.urls)),
]
