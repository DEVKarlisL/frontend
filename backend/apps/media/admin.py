"""Admin configuration for Media app."""

from django.contrib import admin
from .models import AuctionImage, AuctionVideo, UserAvatar, DocumentUpload


@admin.register(AuctionImage)
class AuctionImageAdmin(admin.ModelAdmin):
    list_display = ["auction", "is_primary", "display_order", "created_at"]
    list_filter = ["is_primary", "created_at"]
    search_fields = ["auction__title"]
    readonly_fields = ["created_at"]
    
    fieldsets = (
        ("Image", {
            "fields": ("auction", "image", "alt_text")
        }),
        ("Display Settings", {
            "fields": ("is_primary", "display_order")
        }),
        ("Metadata", {
            "fields": ("width", "height", "file_size", "uploaded_by", "created_at")
        }),
    )


@admin.register(AuctionVideo)
class AuctionVideoAdmin(admin.ModelAdmin):
    list_display = ["title", "auction", "duration", "display_order", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["title", "auction__title"]
    readonly_fields = ["created_at"]


@admin.register(UserAvatar)
class UserAvatarAdmin(admin.ModelAdmin):
    list_display = ["user", "is_current", "created_at"]
    list_filter = ["is_current", "created_at"]
    search_fields = ["user__username"]
    readonly_fields = ["created_at"]


@admin.register(DocumentUpload)
class DocumentUploadAdmin(admin.ModelAdmin):
    list_display = ["original_filename", "document_type", "user", "verified", "created_at"]
    list_filter = ["document_type", "verified", "created_at"]
    search_fields = ["original_filename", "user__username"]
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = (
        ("File Information", {
            "fields": ("document_type", "file", "original_filename", "file_size", "mime_type")
        }),
        ("Association", {
            "fields": ("auction", "user")
        }),
        ("Description", {
            "fields": ("description",)
        }),
        ("Verification", {
            "fields": ("verified", "verified_by", "verified_at")
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
