"""Fraud app views."""
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from .models import FraudSignal
from .serializers import FraudSignalSerializer


class FraudSignalViewSet(viewsets.ModelViewSet):
    """ViewSet for FraudSignal model."""
    serializer_class = FraudSignalSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """Get fraud signals."""
        return FraudSignal.objects.all()
    
    @action(detail=False, methods=['get'])
    def unreviewed(self, request):
        """Get unreviewed fraud signals."""
        unreviewed = FraudSignal.objects.filter(is_reviewed=False)
        serializer = self.get_serializer(unreviewed, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get high risk signals."""
        high_risk = FraudSignal.objects.filter(risk_level__in=['high', 'critical'])
        serializer = self.get_serializer(high_risk, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Review fraud signal."""
        signal = self.get_object()
        action = request.data.get('action')  # 'confirm' or 'dismiss'
        
        signal.is_reviewed = True
        signal.reviewed_by = request.user
        
        if action == 'confirm':
            signal.is_confirmed = True
            # Potentially ban user
        
        signal.save()
        return Response({'status': 'Signal reviewed'})
