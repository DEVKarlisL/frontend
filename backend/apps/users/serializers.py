"""Users app serializers."""
from rest_framework import serializers
from .models import User, UserProfile, BusinessAccount


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password2 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_online = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'bio', 'phone', 'location', 'website', 'birth_date',
            'is_verified', 'is_seller', 'is_business', 'is_staff', 'is_superuser', 'is_active',
            'feedback_score', 'total_auctions', 'total_bids', 'is_online',
            'password', 'password2'
        ]
        read_only_fields = ['id', 'feedback_score', 'total_auctions', 'total_bids', 'is_online']
    
    def get_is_online(self, obj):
        """Get online status from user property"""
        return obj.is_online

    def _validate_passwords(self, password, password2):
        if password and password2 and password != password2:
            raise serializers.ValidationError({"password": "Passwords do not match"})
    
    def create(self, validated_data):
        """Create user with password and birth_date."""
        password = validated_data.pop('password', None)
        password2 = validated_data.pop('password2', None)
        
        # Validate birth_date is provided during registration
        birth_date = validated_data.get('birth_date')
        if not birth_date:
            raise serializers.ValidationError({"birth_date": "Birth date is required"})
        
        self._validate_passwords(password, password2)
        if password and password2:
            validated_data['password'] = password
        
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """Update user, handling password separately."""
        password = validated_data.pop('password', None)
        password2 = validated_data.pop('password2', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        self._validate_passwords(password, password2)
        if password and password2:
            instance.set_password(password)
        elif password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'notification_preference', 'receive_marketing',
            'receive_auction_alerts', 'kyc_verified', 'kyc_submitted_at',
            'kyc_verified_at', 'email_verified', 'email_verified_at',
            'phone_verified', 'phone_verified_at'
        ]
        read_only_fields = ['id', 'kyc_submitted_at', 'kyc_verified_at', 'email_verified_at', 'phone_verified_at']


class BusinessAccountSerializer(serializers.ModelSerializer):
    """Serializer for BusinessAccount model."""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = BusinessAccount
        fields = [
            'id', 'user', 'business_name', 'business_registration_number',
            'subscription_tier', 'is_verified', 'tax_id'
        ]
        read_only_fields = ['id']
