"""Vehicles app configuration."""

from django.apps import AppConfig


class VehiclesConfig(AppConfig):
    """Configuration for Vehicles app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.vehicles"
    verbose_name = "Vehicles"
