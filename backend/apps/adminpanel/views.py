"""Admin panel views."""
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from .models import SystemSettings, AdminLog, Report
from .serializers import SystemSettingsSerializer, ReportSerializer

User = get_user_model()


def _update_user_active(user_id, is_active, admin, action, description):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

    user.is_active = is_active
    user.save()

    AdminLog.objects.create(
        admin=admin,
        action=action,
        target_user=user,
        description=description,
    )

    return user


class SystemSettingsView(views.APIView):
    """View for system settings."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get system settings."""
        settings, _ = SystemSettings.objects.get_or_create()
        serializer = SystemSettingsSerializer(settings)
        return Response(serializer.data)
    
    def put(self, request):
        """Update system settings, including favicon upload."""
        settings, _ = SystemSettings.objects.get_or_create()
        data = request.data.copy()
        # Handle file upload for favicon
        if 'favicon' in request.FILES:
            data['favicon'] = request.FILES['favicon']
        serializer = SystemSettingsSerializer(settings, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Log the change
            AdminLog.objects.create(
                admin=request.user,
                action='settings_change',
                description='System settings updated'
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BanUserView(views.APIView):
    """View to ban users."""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """Ban a user."""
        user_id = request.data.get('user_id')
        reason = request.data.get('reason', '')

        user = _update_user_active(
            user_id=user_id,
            is_active=False,
            admin=request.user,
            action='user_ban',
            description=f'User banned: {reason}',
        )
        if not user:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({'status': 'User banned'})


class UnbanUserView(views.APIView):
    """View to unban users."""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """Unban a user."""
        user_id = request.data.get('user_id')

        user = _update_user_active(
            user_id=user_id,
            is_active=True,
            admin=request.user,
            action='user_unban',
            description='User unbanned',
        )
        if not user:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({'status': 'User unbanned'})


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for Report model."""
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """Get reports."""
        return Report.objects.all()
    
    def perform_create(self, serializer):
        """Create report."""
        serializer.save(reporter=self.request.user)


class DashboardView(views.APIView):
    """View for admin dashboard."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get dashboard data."""
        from apps.auctions.models import Auction
        from apps.payments.models import Payment
        from apps.fraud.models import FraudSignal
        
        total_users = User.objects.count()
        active_auctions = Auction.objects.filter(status='active').count()
        pending_payments = Payment.objects.filter(status='pending').count()
        high_fraud_signals = FraudSignal.objects.filter(risk_level__in=['high', 'critical']).count()
        
        return Response({
            'total_users': total_users,
            'active_auctions': active_auctions,
            'pending_payments': pending_payments,
            'high_fraud_signals': high_fraud_signals,
        })
