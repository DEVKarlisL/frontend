"""Media app configuration."""

from django.apps import AppConfig


class MediaConfig(AppConfig):
    """Configuration for Media app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.media"
    verbose_name = "Media"
