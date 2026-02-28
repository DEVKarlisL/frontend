from django.db import migrations


def add_category_icon_images(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")

    icon_images = {
        "Darbs": "https://picsum.photos/seed/jobs-icon/120/120",
        "Pakalpojumi": "https://picsum.photos/seed/services-icon/120/120",
        "Bērniem": "https://picsum.photos/seed/kids-icon/120/120",
        "Dzīvnieki": "https://picsum.photos/seed/animals-icon/120/120",
        "Atpūta un vaļasprieki": "https://picsum.photos/seed/hobby-icon/120/120",
        "Būvniecība": "https://picsum.photos/seed/construction-icon/120/120",
        "Bizness": "https://picsum.photos/seed/business-icon/120/120",
        "Lauksaimniecība": "https://picsum.photos/seed/agriculture-icon/120/120",
        "Pulksteņi": "https://picsum.photos/seed/watches-icon/120/120",
        "Kuģi": "https://picsum.photos/seed/boats-icon/120/120",
        "Cits": "https://picsum.photos/seed/other-icon/120/120",
        "Telefona numuri": "https://picsum.photos/seed/phone-icon/120/120",
        "Auto numurzīmes": "https://picsum.photos/seed/plates-icon/120/120",
    }

    for name, icon_image in icon_images.items():
        try:
            category = Category.objects.get(name=name)
        except Category.DoesNotExist:
            continue

        widget_settings = category.widget_settings or {}
        widget_settings["icon_image"] = icon_image
        category.widget_settings = widget_settings
        category.save()


def remove_category_icon_images(apps, schema_editor):
    Category = apps.get_model("auctions", "Category")
    names = [
        "Darbs",
        "Pakalpojumi",
        "Bērniem",
        "Dzīvnieki",
        "Atpūta un vaļasprieki",
        "Būvniecība",
        "Bizness",
        "Lauksaimniecība",
        "Pulksteņi",
        "Kuģi",
        "Cits",
        "Telefona numuri",
        "Auto numurzīmes",
    ]
    for name in names:
        try:
            category = Category.objects.get(name=name)
        except Category.DoesNotExist:
            continue
        widget_settings = category.widget_settings or {}
        widget_settings.pop("icon_image", None)
        category.widget_settings = widget_settings
        category.save()


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0008_add_phone_and_plate_categories"),
    ]

    operations = [
        migrations.RunPython(
            add_category_icon_images,
            remove_category_icon_images,
        ),
    ]
