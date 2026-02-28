from django.core.management.base import BaseCommand
from apps.auctions.models import Auction, Category
from apps.users.models import User
from django.utils import timezone

class Command(BaseCommand):
    help = 'Create a live auction in the first category'

    def handle(self, *args, **options):
        user = User.objects.first()
        if not user:
            user = User.objects.create(username='admin', email='admin@example.com', password='admin123')
            self.stdout.write(self.style.WARNING('Created default user: admin'))
        cat = Category.objects.first()
        if not cat:
            cat = Category.objects.create(name='Default Category', slug='default-category', description='Default category for auctions')
            self.stdout.write(self.style.WARNING('Created default category: Default Category'))
        if not user or not cat:
            self.stdout.write(self.style.ERROR('Still no user or category found.'))
            return
        auction = Auction.objects.create(
            title='Live Auction Automated',
            description='Live auction created by management command.',
            starting_price=1000,
            minimum_increment=100,
            category=cat,
            seller=user,
            status='active',
            start_time=timezone.now(),
            end_time=timezone.now() + timezone.timedelta(days=1),
            current_highest_bid=1000,
            location='Rīga'
        )
        self.stdout.write(self.style.SUCCESS(f'Created auction: {auction.title} (ID: {auction.id})'))
