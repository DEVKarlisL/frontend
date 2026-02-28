"""Bidding app URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'bidding'

router = DefaultRouter()
router.register(r'bids', views.BidViewSet, basename='bid')

urlpatterns = [
    path('', include(router.urls)),
    path('auto-bid/', views.AutoBidRuleView.as_view(), name='auto-bid'),
]
