from django.db import migrations


def apply_popular_category_backgrounds(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")

    updates = {
        "Transports": {
            "background_image": "https://picsum.photos/seed/transport/800/600",
            "background_color": "#e0f2fe",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Automašīnas": {
            "background_image": "https://picsum.photos/seed/cars/800/600",
            "background_color": "#dbeafe",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Nekustamais īpašums": {
            "background_image": "https://picsum.photos/seed/realestate/800/600",
            "background_color": "#ccfbf1",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Īpašumi": {
            "background_image": "https://picsum.photos/seed/property/800/600",
            "background_color": "#dcfce7",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Elektronika": {
            "background_image": "https://picsum.photos/seed/electronics/800/600",
            "background_color": "#e2e8f0",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Mājai un dārzam": {
            "background_image": "https://picsum.photos/seed/home/800/600",
            "background_color": "#f0fdf4",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
    }

    for name, widget_settings in updates.items():
        try:
            category = Category.objects.get(name=name)
        except Category.DoesNotExist:
            continue
        category.widget_settings = widget_settings
        category.save()


def reverse_popular_category_backgrounds(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")
    for name in [
        "Transports",
        "Automašīnas",
        "Nekustamais īpašums",
        "Īpašumi",
        "Elektronika",
        "Mājai un dārzam",
    ]:
        try:
            category = Category.objects.get(name=name)
        except Category.DoesNotExist:
            continue
        widget_settings = category.widget_settings or {}
        widget_settings.pop("background_image", None)
        category.widget_settings = widget_settings
        category.save()


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0006_simplify_category_widgets"),
    ]

    operations = [
        migrations.RunPython(
            apply_popular_category_backgrounds,
            reverse_popular_category_backgrounds,
        ),
    ]
