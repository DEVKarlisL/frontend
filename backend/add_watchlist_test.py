import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.auctions.models import Watchlist, Auction
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()
auction = Auction.objects.first()

if user and auction:
    watchlist, created = Watchlist.objects.get_or_create(user=user, auction=auction)
    if created:
        print(f'Created watchlist: {user.username} -> {auction.title}')
    else:
        print(f'Already exists: {user.username} -> {auction.title}')
else:
    print('No user or auction found')

print(f'Total watchlist items: {Watchlist.objects.count()}')
