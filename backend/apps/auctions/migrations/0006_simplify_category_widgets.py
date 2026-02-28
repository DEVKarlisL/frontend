from django.db import migrations


def simplify_category_widgets(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")

    categories_payload = {
        "Transports": {
            "background_color": "#e0f2fe",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Automašīnas": {
            "background_color": "#dbeafe",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Nekustamais īpašums": {
            "background_color": "#ccfbf1",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Īpašumi": {
            "background_color": "#dcfce7",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Darbs": {
            "background_color": "#e0e7ff",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Pakalpojumi": {
            "background_color": "#ede9fe",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Elektronika": {
            "background_color": "#e2e8f0",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Mājai un dārzam": {
            "background_color": "#f0fdf4",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "medium",
        },
        "Bērniem": {
            "background_color": "#ffe4e6",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Dzīvnieki": {
            "background_color": "#ffedd5",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Atpūta un vaļasprieki": {
            "background_color": "#f1f5f9",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Būvniecība": {
            "background_color": "#fef3c7",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Bizness": {
            "background_color": "#e2e8f0",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Lauksaimniecība": {
            "background_color": "#dcfce7",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Pulksteņi": {
            "background_color": "#f1f5f9",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Kuģi": {
            "background_color": "#dbeafe",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
        "Cits": {
            "background_color": "#f1f5f9",
            "text_color": "#0f172a",
            "timer_color": "#f59e0b",
            "card_size": "small",
        },
    }

    for name, widget_settings in categories_payload.items():
        try:
            category = Category.objects.get(name=name)
        except Category.DoesNotExist:
            continue

        category.widget_settings = widget_settings
        category.save()


def reverse_simplify_category_widgets(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")
    Category.objects.filter(name__in=[
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
    ]).update(widget_settings={})


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0005_add_top_categories"),
    ]

    operations = [
        migrations.RunPython(simplify_category_widgets, reverse_simplify_category_widgets),
    ]
