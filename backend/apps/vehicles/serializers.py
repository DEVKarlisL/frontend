"""Vehicles app serializers."""
from rest_framework import serializers
from .models import Vehicle, VehicleCondition, VehicleType, Transmission, FuelType


class VehicleConditionSerializer(serializers.ModelSerializer):
    """Serializer for VehicleCondition model."""
    
    class Meta:
        model = VehicleCondition
        fields = ['id', 'name', 'description', 'value_multiplier']
        read_only_fields = ['id']


class VehicleTypeSerializer(serializers.ModelSerializer):
    """Serializer for VehicleType model."""
    
    class Meta:
        model = VehicleType
        fields = ['id', 'name', 'icon', 'description']
        read_only_fields = ['id']


class TransmissionSerializer(serializers.ModelSerializer):
    """Serializer for Transmission model."""
    
    class Meta:
        model = Transmission
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class FuelTypeSerializer(serializers.ModelSerializer):
    """Serializer for FuelType model."""
    
    class Meta:
        model = FuelType
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model."""
    
    condition = VehicleConditionSerializer(read_only=True)
    condition_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleCondition.objects.all(),
        write_only=True,
        source='condition'
    )
    vehicle_type = VehicleTypeSerializer(read_only=True)
    vehicle_type_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleType.objects.all(),
        write_only=True,
        source='vehicle_type'
    )
    transmission = TransmissionSerializer(read_only=True)
    transmission_id = serializers.PrimaryKeyRelatedField(
        queryset=Transmission.objects.all(),
        write_only=True,
        source='transmission'
    )
    fuel_type = FuelTypeSerializer(read_only=True)
    fuel_type_id = serializers.PrimaryKeyRelatedField(
        queryset=FuelType.objects.all(),
        write_only=True,
        source='fuel_type'
    )
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'auction', 'owner', 'vin', 'registration_number',
            'registration_expiry', 'make', 'model', 'year', 'color',
            'vehicle_type', 'vehicle_type_id', 'transmission', 'transmission_id',
            'fuel_type', 'fuel_type_id', 'engine_displacement', 'horsepower',
            'fuel_consumption', 'condition', 'condition_id', 'mileage',
            'service_history', 'features', 'ownership_documents',
            'accident_history', 'insurance_valid', 'insurance_expiry',
            'inspection_report', 'inspection_date', 'inspector_name',
            'description', 'location'
        ]
        read_only_fields = ['id', 'owner']
