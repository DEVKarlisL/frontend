
from django.contrib import admin
from .models import Auction, Category, Watchlist
from adminsortable2.admin import SortableAdminMixin

@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'end_time', 'category', 'seller')
    list_filter = ('status', 'category')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

@admin.register(Category)
class CategoryAdmin(SortableAdminMixin, admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'description')
    search_fields = ('name', 'slug')
    ordering = ('display_order', 'name')

@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'auction', 'added_at')
    search_fields = ('user__username', 'auction__title')
    ordering = ('-added_at',)
