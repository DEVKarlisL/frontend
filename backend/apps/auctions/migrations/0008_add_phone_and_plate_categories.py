from django.db import migrations


def add_phone_and_plate_categories(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")

    categories_payload = [
        {
            "name": "Telefona numuri",
            "slug": "phone-numbers",
            "description": "Premium phone numbers",
            "icon": "📞",
            "widget_settings": {
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
                "background_color": "#f1f5f9",
                "text_color": "#0f172a",
                "timer_color": "#f59e0b",
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


def remove_phone_and_plate_categories(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")
    Category.objects.filter(
        name__in=["Telefona numuri", "Auto numurzīmes"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0007_popular_category_backgrounds"),
    ]

    operations = [
        migrations.RunPython(
            add_phone_and_plate_categories,
            remove_phone_and_plate_categories,
        ),
    ]
