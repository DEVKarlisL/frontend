"""Payments app views."""
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe
import logging

from .models import Payment, Invoice, Subscription
from .serializers import PaymentSerializer, InvoiceSerializer, SubscriptionSerializer

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for Payment model."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter payments by user."""
        return Payment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set user to current user."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm payment."""
        payment = self.get_object()
        if payment.user != request.user:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Process payment with Stripe
        try:
            stripe.api_key = request.META.get('STRIPE_SECRET_KEY')
            intent = stripe.PaymentIntent.retrieve(payment.stripe_payment_intent)
            
            if intent.status == 'succeeded':
                payment.status = 'completed'
                payment.save()
                return Response({'status': 'Payment confirmed'})
            else:
                return Response(
                    {'error': 'Payment not confirmed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Payment confirmation error: {str(e)}")
            return Response(
                {'error': 'Payment processing failed'},
                status=status.HTTP_400_BAD_REQUEST
            )


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Invoice model."""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter invoices by user."""
        return Invoice.objects.filter(user=self.request.user)


class SubscriptionView(views.APIView):
    """View for subscription management."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user subscription."""
        try:
            subscription = Subscription.objects.get(user=request.user)
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'No subscription'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)
    
    def post(self, request):
        """Update subscription."""
        plan = request.data.get('plan')
        try:
            subscription, _ = Subscription.objects.get_or_create(user=request.user)
            subscription.plan = plan
            subscription.save()
            
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Subscription error: {str(e)}")
            return Response(
                {'error': 'Subscription update failed'},
                status=status.HTTP_400_BAD_REQUEST
            )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(views.APIView):
    """Handle Stripe webhooks."""
    
    def post(self, request):
        """Process webhook."""
        try:
            # Verify webhook signature
            event = stripe.Event.construct_from(
                request.data, stripe.api_key
            )
            
            if event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                # Update payment status
                Payment.objects.filter(
                    stripe_payment_intent=payment_intent['id']
                ).update(status='completed')
            
            return Response({'received': True})
        except Exception as e:
            logger.error(f"Webhook error: {str(e)}")
            return Response(
                {'error': 'Webhook failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
