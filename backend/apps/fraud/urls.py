"""Fraud app URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'fraud'

router = DefaultRouter()
router.register(r'signals', views.FraudSignalViewSet, basename='fraud-signal')

urlpatterns = [
    path('', include(router.urls)),
]
