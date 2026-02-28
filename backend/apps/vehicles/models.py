"""Vehicles app models for auction platform."""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class VehicleCondition(models.Model):
    """Predefined vehicle conditions."""

    name = models.CharField(max_length=100, unique=True)  # Excellent, Good, Fair, Poor
    description = models.TextField(blank=True)
    value_multiplier = models.FloatField(default=1.0)  # For condition-based pricing

    class Meta:
        db_table = "vehicles_condition"
        verbose_name = "Vehicle Condition"
        verbose_name_plural = "Vehicle Conditions"

    def __str__(self):
        return self.name


class VehicleType(models.Model):
    """Types of vehicles - Sedan, SUV, Truck, etc."""

    name = models.CharField(max_length=100, unique=True)  # Sedan, SUV, Truck, etc.
    icon = models.CharField(max_length=50, blank=True)  # For frontend
    description = models.TextField(blank=True)

    class Meta:
        db_table = "vehicles_type"
        verbose_name = "Vehicle Type"
        verbose_name_plural = "Vehicle Types"

    def __str__(self):
        return self.name


class Transmission(models.Model):
    """Vehicle transmission types."""

    name = models.CharField(max_length=50, unique=True)  # Manual, Automatic, CVT
    description = models.TextField(blank=True)

    class Meta:
        db_table = "vehicles_transmission"
        verbose_name = "Transmission"
        verbose_name_plural = "Transmissions"

    def __str__(self):
        return self.name


class FuelType(models.Model):
    """Fuel types available."""

    name = models.CharField(max_length=50, unique=True)  # Petrol, Diesel, Hybrid, Electric
    description = models.TextField(blank=True)

    class Meta:
        db_table = "vehicles_fuel_type"
        verbose_name = "Fuel Type"
        verbose_name_plural = "Fuel Types"

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    """Detailed vehicle information for auction listings."""

    # Basic Info
    auction = models.OneToOneField(
        "auctions.Auction", on_delete=models.CASCADE, related_name="vehicle"
    )
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="vehicles")

    # Identification
    vin = models.CharField(
        max_length=17, unique=True, verbose_name="VIN"
    )  # Vehicle Identification Number
    registration_number = models.CharField(max_length=100, unique=True)
    registration_expiry = models.DateField(null=True, blank=True)

    # Make & Model
    make = models.CharField(max_length=100)  # Toyota, BMW, etc.
    model = models.CharField(max_length=100)  # Camry, 3 Series, etc.
    year = models.IntegerField()
    color = models.CharField(max_length=50)

    # Type & Specifications
    vehicle_type = models.ForeignKey(VehicleType, on_delete=models.PROTECT)
    transmission = models.ForeignKey(Transmission, on_delete=models.PROTECT)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)

    # Engine & Performance
    engine_displacement = models.IntegerField(
        null=True, blank=True, help_text="in CC"
    )  # 1200, 2000, etc.
    horsepower = models.IntegerField(null=True, blank=True)
    fuel_consumption = models.FloatField(
        null=True, blank=True, help_text="L/100km"
    )

    # Condition & Usage
    condition = models.ForeignKey(VehicleCondition, on_delete=models.PROTECT)
    mileage = models.IntegerField(help_text="in kilometers")  # 45000, 120000, etc.
    service_history = models.BooleanField(default=False)

    # Features
    features = models.JSONField(
        default=list,
        help_text="List of features: ['ABS', 'Airbags', 'Air Conditioning', 'Power Windows', 'Power Steering', etc.]",
    )

    # Documentation
    ownership_documents = models.BooleanField(default=True)
    accident_history = models.TextField(blank=True, help_text="Details of any accidents")
    insurance_valid = models.BooleanField(default=True)
    insurance_expiry = models.DateField(null=True, blank=True)

    # Inspection
    inspection_report = models.FileField(upload_to="inspections/", null=True, blank=True)
    inspection_date = models.DateField(null=True, blank=True)
    inspector_name = models.CharField(max_length=255, blank=True)

    # Additional Info
    description = models.TextField(blank=True)
    location = models.CharField(
        max_length=255
    )  # Where the vehicle is currently located

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "vehicles_vehicle"
        verbose_name = "Vehicle"
        verbose_name_plural = "Vehicles"
        indexes = [
            models.Index(fields=["vin"]),
            models.Index(fields=["make", "model"]),
            models.Index(fields=["year"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

    @property
    def full_name(self):
        """Return full vehicle name."""
        return f"{self.year} {self.make} {self.model}"
