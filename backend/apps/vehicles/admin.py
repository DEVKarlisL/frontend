"""Admin configuration for Vehicles app."""

from django.contrib import admin
from .models import Vehicle, VehicleCondition, VehicleType, Transmission, FuelType


@admin.register(VehicleCondition)
class VehicleConditionAdmin(admin.ModelAdmin):
    list_display = ["name", "value_multiplier"]
    search_fields = ["name"]


@admin.register(VehicleType)
class VehicleTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "icon"]
    search_fields = ["name"]


@admin.register(Transmission)
class TransmissionAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


@admin.register(FuelType)
class FuelTypeAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ["full_name", "vin", "year", "condition", "mileage", "created_at"]
    list_filter = ["year", "condition", "vehicle_type", "fuel_type", "created_at"]
    search_fields = ["vin", "registration_number", "make", "model"]
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("auction", "owner", "vin", "registration_number", "registration_expiry")
        }),
        ("Vehicle Details", {
            "fields": ("make", "model", "year", "color", "vehicle_type")
        }),
        ("Specifications", {
            "fields": ("transmission", "fuel_type", "engine_displacement", "horsepower", "fuel_consumption")
        }),
        ("Condition & Usage", {
            "fields": ("condition", "mileage", "service_history")
        }),
        ("Features", {
            "fields": ("features",)
        }),
        ("Documentation", {
            "fields": ("ownership_documents", "insurance_valid", "insurance_expiry", "accident_history")
        }),
        ("Inspection", {
            "fields": ("inspection_report", "inspection_date", "inspector_name")
        }),
        ("Additional", {
            "fields": ("description", "location")
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
