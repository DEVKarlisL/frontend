from django.core.management.base import BaseCommand
from apps.auctions.models import Auction, Category
from apps.users.models import User
from apps.media.models import AuctionImage
from datetime import timedelta
from django.utils import timezone
import django.db.utils
import random


class Command(BaseCommand):
    help = "Add test auctions to the database"

    def handle(self, *args, **options):
        # Latvian cities
        latvian_cities = [
            "Rīga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala",
            "Ventspils", "Rēzekne", "Valmiera", "Jēkabpils", "Ogre",
            "Tukums", "Salaspils", "Cēsis", "Kuldīga", "Bauska",
            "Sigulda", "Aizkraukle", "Madona", "Talsi", "Dobele"
        ]
        
        # Get or create a test user for seller
        seller, _ = User.objects.get_or_create(
            username="testseller",
            defaults={
                "email": "seller@test.com",
                "first_name": "Test",
                "last_name": "Seller",
            },
        )

        # Get or create categories (expanded main categories)
        categories_payload = [
            {
                "name": "Transports",
                "slug": "transport",
                "description": "Cars, motorcycles, trucks, and transport",
                "icon": "🚘",
                "widget_settings": {
                    "background_image": "https://picsum.photos/seed/transport/800/600",
                    "background_color": "#e0f2fe",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "medium",
                },
            },
            {
                "name": "Automašīnas",
                "slug": "cars",
                "description": "Cars and vehicles",
                "icon": "🚗",
                "widget_settings": {
                    "background_image": "https://picsum.photos/seed/cars/800/600",
                    "background_color": "#dbeafe",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "medium",
                },
            },
            {
                "name": "Nekustamais īpašums",
                "slug": "real-estate",
                "description": "Apartments, houses, land, and real estate",
                "icon": "🏠",
                "widget_settings": {
                    "background_image": "https://picsum.photos/seed/realestate/800/600",
                    "background_color": "#ccfbf1",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "medium",
                },
            },
            {
                "name": "Īpašumi",
                "slug": "property",
                "description": "Real estate",
                "icon": "🏢",
                "widget_settings": {
                    "background_image": "https://picsum.photos/seed/property/800/600",
                    "background_color": "#dcfce7",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Darbs",
                "slug": "jobs",
                "description": "Jobs and vacancies",
                "icon": "💼",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/jobs-icon/120/120",
                    "background_color": "#e0e7ff",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Pakalpojumi",
                "slug": "services",
                "description": "Professional services",
                "icon": "🛠️",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/services-icon/120/120",
                    "background_color": "#ede9fe",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Elektronika",
                "slug": "electronics",
                "description": "Phones, computers, and electronics",
                "icon": "🖥️",
                "widget_settings": {
                    "background_image": "https://picsum.photos/seed/electronics/800/600",
                    "background_color": "#e2e8f0",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "medium",
                },
            },
            {
                "name": "Mājai un dārzam",
                "slug": "home-garden",
                "description": "Home, garden, and furniture",
                "icon": "🏡",
                "widget_settings": {
                    "background_image": "https://picsum.photos/seed/home/800/600",
                    "background_color": "#f0fdf4",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "medium",
                },
            },
            {
                "name": "Bērniem",
                "slug": "for-children",
                "description": "Kids and baby items",
                "icon": "🧸",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/kids-icon/120/120",
                    "background_color": "#ffe4e6",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Dzīvnieki",
                "slug": "animals",
                "description": "Pets and animals",
                "icon": "🐾",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/animals-icon/120/120",
                    "background_color": "#ffedd5",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Atpūta un vaļasprieki",
                "slug": "hobbies",
                "description": "Hobbies, leisure, sports",
                "icon": "🎯",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/hobby-icon/120/120",
                    "background_color": "#f1f5f9",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Būvniecība",
                "slug": "construction",
                "description": "Construction and tools",
                "icon": "🏗️",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/construction-icon/120/120",
                    "background_color": "#fef3c7",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Bizness",
                "slug": "business",
                "description": "Business and equipment",
                "icon": "📊",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/business-icon/120/120",
                    "background_color": "#e2e8f0",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Lauksaimniecība",
                "slug": "agriculture",
                "description": "Agriculture and farming",
                "icon": "🌾",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/agriculture-icon/120/120",
                    "background_color": "#dcfce7",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Pulksteņi",
                "slug": "watches",
                "description": "Watches and timepieces",
                "icon": "⌚",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/watches-icon/120/120",
                    "background_color": "#f1f5f9",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Kuģi",
                "slug": "ships",
                "description": "Boats and ships",
                "icon": "⛵",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/boats-icon/120/120",
                    "background_color": "#dbeafe",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Cits",
                "slug": "other",
                "description": "Other categories",
                "icon": "🧩",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/other-icon/120/120",
                    "background_color": "#f1f5f9",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Telefona numuri",
                "slug": "phone-numbers",
                "description": "Premium phone numbers",
                "icon": "📞",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/phone-icon/120/120",
                    "background_color": "#f1f5f9",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
            {
                "name": "Auto numurzīmes",
                "slug": "car-plates",
                "description": "Car number plates",
                "icon": "🚘",
                "widget_settings": {
                    "icon_image": "https://picsum.photos/seed/plates-icon/120/120",
                    "background_color": "#f1f5f9",
                    "text_color": "#0f172a",
                    "timer_color": "#f59e0b",
                    "card_size": "small",
                },
            },
        ]

        categories_by_slug = {}
        for category_data in categories_payload:
            category, _ = Category.objects.get_or_create(
                name=category_data["name"],
                defaults={
                    "slug": category_data["slug"],
                    "description": category_data["description"],
                    "icon": category_data["icon"],
                    "widget_settings": category_data["widget_settings"],
                },
            )
            categories_by_slug[category_data["slug"]] = category

        category_cars = categories_by_slug["cars"]
        category_property = categories_by_slug["property"]
        category_watches = categories_by_slug["watches"]
        category_ships = categories_by_slug["ships"]

        # Test auctions data with varied end times
        test_auctions = [
            # Cars - Various times (5 hours, 8 hours, 15 hours, 1 day, 2 days)
            {
                "title": "2022 BMW M3 Competition",
                "description": "High-performance sedan with premium features",
                "starting_price": 8500,
                "minimum_increment": 100,
                "category": category_cars,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=5),
            },
            {
                "title": "Honda Civic 2019",
                "description": "Reliable compact car, low mileage",
                "starting_price": 3500,
                "minimum_increment": 50,
                "category": category_cars,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=8),
            },
            {
                "title": "Mercedes-Benz AMG GT",
                "description": "High-performance luxury sports car",
                "starting_price": 9800,
                "minimum_increment": 200,
                "category": category_cars,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=15),
            },
            {
                "title": "Tesla Model 3 2021",
                "description": "Electric vehicle with autopilot",
                "starting_price": 6200,
                "minimum_increment": 100,
                "category": category_cars,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(days=1),
            },
            {
                "title": "Porsche 911 Carrera",
                "description": "Sports car collector's item",
                "starting_price": 9200,
                "minimum_increment": 150,
                "category": category_cars,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(days=2),
            },
            
            # Properties - Various times (12 hours, 1.5 days)
            {
                "title": "Luxury Apartment - City Center",
                "description": "Modern 3-bedroom apartment with pool and gym",
                "starting_price": 7500,
                "minimum_increment": 250,
                "category": category_property,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=12),
            },
            {
                "title": "Penthouse with Sea View",
                "description": "Luxury penthouse apartment overlooking the sea",
                "starting_price": 9500,
                "minimum_increment": 300,
                "category": category_property,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(days=1, hours=12),
            },
            
            # Watches - Various times (6 hours, 18 hours, 2.5 days)
            {
                "title": "Tag Heuer Carrera",
                "description": "Chronograph automatic, mint condition",
                "starting_price": 1800,
                "minimum_increment": 50,
                "category": category_watches,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=6),
            },
            {
                "title": "Vintage Rolex Submariner 1965",
                "description": "Original dial, fully serviced, excellent condition",
                "starting_price": 4500,
                "minimum_increment": 100,
                "category": category_watches,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=18),
            },
            {
                "title": "Omega Seamaster 300M",
                "description": "Blue dial, stainless steel, recent service",
                "starting_price": 2900,
                "minimum_increment": 75,
                "category": category_watches,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(days=2, hours=12),
            },
            
            # Ships - Various times (20 hours, 1 day, 2 days)
            {
                "title": "Luxury Motor Yacht 50ft",
                "description": "Modern yacht with all amenities",
                "starting_price": 8900,
                "minimum_increment": 200,
                "category": category_ships,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(hours=20),
            },
            {
                "title": "Classic Wooden Sailboat",
                "description": "32ft wooden sailing yacht, recently restored",
                "starting_price": 5200,
                "minimum_increment": 150,
                "category": category_ships,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(days=1, hours=3),
            },
            {
                "title": "Speedboat Racing Edition",
                "description": "High-speed racing boat, competition ready",
                "starting_price": 6800,
                "minimum_increment": 150,
                "category": category_ships,
                "seller": seller,
                "status": "active",
                "start_time": timezone.now(),
                "end_time": timezone.now() + timedelta(days=2),
            },
        ]

        # Create auctions
        created_count = 0
        for auction_data in test_auctions:
            auction, created = Auction.objects.get_or_create(
                title=auction_data["title"],
                seller=auction_data["seller"],
                defaults={
                    "description": auction_data["description"],
                    "starting_price": auction_data["starting_price"],
                    "minimum_increment": auction_data.get("minimum_increment", 100),
                    "category": auction_data["category"],
                    "status": auction_data["status"],
                    "start_time": auction_data["start_time"],
                    "end_time": auction_data["end_time"],
                    "current_highest_bid": auction_data["starting_price"],
                    "location": random.choice(latvian_cities),
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created: {auction.title} in {auction.location}")
            else:
                # Update existing auctions with a random city if they don't have one
                if not auction.location:
                    auction.location = random.choice(latvian_cities)
                    auction.save()
                    self.stdout.write(f"Updated location for: {auction.title} to {auction.location}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully added {created_count} test auctions"
            )
        )
