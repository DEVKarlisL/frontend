"""Payments app serializers."""
from rest_framework import serializers
from .models import Payment, Invoice, Subscription, Escrow
from apps.users.serializers import UserSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'auction', 'amount', 'currency',
            'payment_method', 'status', 'stripe_payment_intent',
            'transaction_id', 'description', 'completed_at'
        ]
        read_only_fields = ['id', 'user', 'completed_at']


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model."""
    
    user = UserSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'user', 'auction', 'invoice_number', 'status',
            'item_price', 'shipping_cost', 'tax', 'total',
            'issued_date', 'due_date', 'paid_date', 'payment'
        ]
        read_only_fields = ['id', 'user', 'invoice_number']


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'plan', 'is_active', 'auto_renew',
            'started_at', 'expires_at', 'renewed_at'
        ]
        read_only_fields = ['id', 'user', 'started_at']


class EscrowSerializer(serializers.ModelSerializer):
    """Serializer for Escrow model."""
    
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    
    class Meta:
        model = Escrow
        fields = [
            'id', 'auction', 'buyer', 'seller', 'amount', 'status',
            'held_at', 'released_at'
        ]
        read_only_fields = ['id', 'held_at', 'released_at']
