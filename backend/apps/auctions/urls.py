"""Auctions app URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'auctions'

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'auctions', views.AuctionViewSet, basename='auction')

urlpatterns = [
    path('categories/reorder/', views.CategoryReorderView.as_view(), name='category-reorder'),
    path('', include(router.urls)),
    path('categories/<int:pk>/update/', views.UpdateCategoryView.as_view(), name='category-update'),
    path('watchlist/', views.WatchlistView.as_view(), name='watchlist'),
    path('auctions/live/', views.AuctionViewSet.as_view({'get': 'live'}), name='auction-live'),
]
