"""Media app serializers."""
from rest_framework import serializers
from .models import AuctionImage, AuctionVideo, UserAvatar, DocumentUpload
from apps.users.serializers import UserSerializer


class AuctionImageSerializer(serializers.ModelSerializer):
    """Serializer for AuctionImage model."""
    
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = AuctionImage
        fields = [
            'id', 'auction', 'image', 'alt_text', 'is_primary',
            'display_order', 'width', 'height', 'file_size', 'uploaded_by'
        ]
        read_only_fields = ['id', 'uploaded_by']


class AuctionVideoSerializer(serializers.ModelSerializer):
    """Serializer for AuctionVideo model."""
    
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = AuctionVideo
        fields = [
            'id', 'auction', 'video_url', 'title', 'description',
            'duration', 'display_order', 'uploaded_by'
        ]
        read_only_fields = ['id', 'uploaded_by']


class UserAvatarSerializer(serializers.ModelSerializer):
    """Serializer for UserAvatar model."""
    
    class Meta:
        model = UserAvatar
        fields = ['id', 'user', 'image', 'is_current']
        read_only_fields = ['id']


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for DocumentUpload model."""
    
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = DocumentUpload
        fields = [
            'id', 'user', 'document_type', 'file', 'file_name',
            'file_size', 'is_verified', 'uploaded_by'
        ]
        read_only_fields = ['id', 'uploaded_by']
