from django.db import migrations


def add_top_categories(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")

    categories_payload = [
        {
            "name": "Transports",
            "slug": "transport",
            "description": "Cars, motorcycles, trucks, and transport",
            "icon": "🚘",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/transport/800/600",
                "background_color": "#0f172a",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "large",
            },
        },
        {
            "name": "Automašīnas",
            "slug": "cars",
            "description": "Cars and vehicles",
            "icon": "🚗",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/cars/800/600",
                "background_color": "#1e3a8a",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
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
                "background_color": "#0f766e",
                "text_color": "#ffffff",
                "timer_color": "#fde047",
                "card_size": "large",
            },
        },
        {
            "name": "Īpašumi",
            "slug": "property",
            "description": "Real estate",
            "icon": "🏢",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/property/800/600",
                "background_color": "#115e59",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "medium",
            },
        },
        {
            "name": "Darbs",
            "slug": "jobs",
            "description": "Jobs and vacancies",
            "icon": "💼",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/jobs/800/600",
                "background_color": "#1d4ed8",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "medium",
            },
        },
        {
            "name": "Pakalpojumi",
            "slug": "services",
            "description": "Professional services",
            "icon": "🛠️",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/services/800/600",
                "background_color": "#7c3aed",
                "text_color": "#ffffff",
                "timer_color": "#fde047",
                "card_size": "medium",
            },
        },
        {
            "name": "Elektronika",
            "slug": "electronics",
            "description": "Phones, computers, and electronics",
            "icon": "🖥️",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/electronics/800/600",
                "background_color": "#0f172a",
                "text_color": "#e2e8f0",
                "timer_color": "#fbbf24",
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
                "background_color": "#065f46",
                "text_color": "#ffffff",
                "timer_color": "#fcd34d",
                "card_size": "medium",
            },
        },
        {
            "name": "Bērniem",
            "slug": "for-children",
            "description": "Kids and baby items",
            "icon": "🧸",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/kids/800/600",
                "background_color": "#be185d",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "small",
            },
        },
        {
            "name": "Dzīvnieki",
            "slug": "animals",
            "description": "Pets and animals",
            "icon": "🐾",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/animals/800/600",
                "background_color": "#7c2d12",
                "text_color": "#ffffff",
                "timer_color": "#fde047",
                "card_size": "small",
            },
        },
        {
            "name": "Atpūta un vaļasprieki",
            "slug": "hobbies",
            "description": "Hobbies, leisure, sports",
            "icon": "🎯",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/hobby/800/600",
                "background_color": "#1f2937",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "medium",
            },
        },
        {
            "name": "Būvniecība",
            "slug": "construction",
            "description": "Construction and tools",
            "icon": "🏗️",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/construction/800/600",
                "background_color": "#92400e",
                "text_color": "#ffffff",
                "timer_color": "#fde047",
                "card_size": "medium",
            },
        },
        {
            "name": "Bizness",
            "slug": "business",
            "description": "Business and equipment",
            "icon": "📊",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/business/800/600",
                "background_color": "#111827",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "small",
            },
        },
        {
            "name": "Lauksaimniecība",
            "slug": "agriculture",
            "description": "Agriculture and farming",
            "icon": "🌾",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/agriculture/800/600",
                "background_color": "#365314",
                "text_color": "#ffffff",
                "timer_color": "#fde047",
                "card_size": "small",
            },
        },
        {
            "name": "Pulksteņi",
            "slug": "watches",
            "description": "Watches and timepieces",
            "icon": "⌚",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/watches/800/600",
                "background_color": "#0f172a",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "small",
            },
        },
        {
            "name": "Kuģi",
            "slug": "ships",
            "description": "Boats and ships",
            "icon": "⛵",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/boats/800/600",
                "background_color": "#1e3a8a",
                "text_color": "#ffffff",
                "timer_color": "#fde047",
                "card_size": "small",
            },
        },
        {
            "name": "Cits",
            "slug": "other",
            "description": "Other categories",
            "icon": "🧩",
            "widget_settings": {
                "background_image": "https://picsum.photos/seed/other/800/600",
                "background_color": "#334155",
                "text_color": "#ffffff",
                "timer_color": "#fbbf24",
                "card_size": "small",
            },
        },
    ]

    for payload in categories_payload:
        category, created = Category.objects.get_or_create(
            name=payload["name"],
            defaults={
                "slug": payload["slug"],
                "description": payload["description"],
                "icon": payload["icon"],
                "widget_settings": payload["widget_settings"],
            },
        )
        if not created:
            if not category.slug:
                category.slug = payload["slug"]
            if not category.description:
                category.description = payload["description"]
            if not category.icon:
                category.icon = payload["icon"]
            if not category.widget_settings:
                category.widget_settings = payload["widget_settings"]
            category.save()


def remove_top_categories(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")
    names = [
        "Transports",
        "Automašīnas",
        "Nekustamais īpašums",
        "Īpašumi",
        "Darbs",
        "Pakalpojumi",
        "Elektronika",
        "Mājai un dārzam",
        "Bērniem",
        "Dzīvnieki",
        "Atpūta un vaļasprieki",
        "Būvniecība",
        "Bizness",
        "Lauksaimniecība",
        "Pulksteņi",
        "Kuģi",
        "Cits",
    ]
    Category.objects.filter(name__in=names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0004_auction_location"),
    ]

    operations = [
        migrations.RunPython(add_top_categories, remove_top_categories),
    ]
