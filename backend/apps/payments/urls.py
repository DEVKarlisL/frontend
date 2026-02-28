"""Payments app URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'payments'

router = DefaultRouter()
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
    path('subscription/', views.SubscriptionView.as_view(), name='subscription'),
    path('stripe-webhook/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
]
