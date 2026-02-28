"""Media app models for handling images and files."""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AuctionImage(models.Model):
    """Multiple images for auction listings."""

    auction = models.ForeignKey(
        "auctions.Auction", on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="auction_images/")
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    # Image metadata
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    file_size = models.IntegerField(null=True, blank=True)  # in bytes

    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "media_auction_image"
        verbose_name = "Auction Image"
        verbose_name_plural = "Auction Images"
        ordering = ["display_order", "-created_at"]
        indexes = [
            models.Index(fields=["auction", "is_primary"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Image for {self.auction.title}"

    def save(self, *args, **kwargs):
        # If this is set as primary, unset others
        if self.is_primary:
            AuctionImage.objects.filter(auction=self.auction, is_primary=True).update(
                is_primary=False
            )
        super().save(*args, **kwargs)


class AuctionVideo(models.Model):
    """Video content for auctions."""

    auction = models.ForeignKey(
        "auctions.Auction", on_delete=models.CASCADE, related_name="videos"
    )
    video_url = models.URLField()  # YouTube, Vimeo, etc.
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text="in seconds")
    display_order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "media_auction_video"
        verbose_name = "Auction Video"
        verbose_name_plural = "Auction Videos"
        ordering = ["display_order", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.auction.title}"


class UserAvatar(models.Model):
    """User profile avatars with versioning."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="avatars")
    image = models.ImageField(upload_to="avatars/")
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media_user_avatar"
        verbose_name = "User Avatar"
        verbose_name_plural = "User Avatars"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.is_current:
            UserAvatar.objects.filter(user=self.user, is_current=True).update(
                is_current=False
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Avatar for {self.user.username}"


class DocumentUpload(models.Model):
    """Generic document uploads for various purposes."""

    DOCUMENT_TYPES = [
        ("inspection", "Inspection Report"),
        ("certificate", "Certificate"),
        ("proof_of_ownership", "Proof of Ownership"),
        ("insurance", "Insurance Document"),
        ("registration", "Vehicle Registration"),
        ("other", "Other"),
    ]

    auction = models.ForeignKey(
        "auctions.Auction", on_delete=models.CASCADE, related_name="documents", null=True, blank=True
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="uploaded_documents"
    )

    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to="documents/")
    original_filename = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    mime_type = models.CharField(max_length=100)

    description = models.TextField(blank=True)
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="verified_documents"
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "media_document_upload"
        verbose_name = "Document Upload"
        verbose_name_plural = "Document Uploads"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["auction", "document_type"]),
            models.Index(fields=["user", "document_type"]),
        ]

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.original_filename}"
