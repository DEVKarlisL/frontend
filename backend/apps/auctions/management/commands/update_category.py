"""Management command to update category widget settings."""
from django.core.management.base import BaseCommand
from apps.auctions.models import Category
import json


class Command(BaseCommand):
    help = 'Update category widget settings'

    def add_arguments(self, parser):
        parser.add_argument('category_id', type=int, help='Category ID to update')
        parser.add_argument('--name', type=str, help='Category name')
        parser.add_argument('--slug', type=str, help='Category slug')
        parser.add_argument('--description', type=str, help='Category description')
        parser.add_argument('--icon', type=str, help='Category icon (emoji)')
        parser.add_argument('--bg-color', type=str, help='Background color (hex)')
        parser.add_argument('--bg-image', type=str, help='Background image URL')
        parser.add_argument('--card-size', type=str, choices=['small', 'medium', 'large'], help='Card size')

    def handle(self, *args, **options):
        try:
            category = Category.objects.get(id=options['category_id'])
            
            # Update basic fields
            if options.get('name'):
                category.name = options['name']
            if options.get('slug'):
                category.slug = options['slug']
            if options.get('description'):
                category.description = options['description']
            if options.get('icon'):
                category.icon = options['icon']
            
            # Update widget settings
            widget_settings = category.widget_settings or {}
            
            if options.get('bg_color'):
                widget_settings['background_color'] = options['bg_color']
            if options.get('bg_image'):
                widget_settings['background_image'] = options['bg_image']
            if options.get('card_size'):
                widget_settings['card_size'] = options['card_size']
            
            category.widget_settings = widget_settings
            category.save()
            
            self.stdout.write(self.style.SUCCESS(f'Successfully updated category {category.name}'))
            self.stdout.write(f'Widget settings: {json.dumps(widget_settings, indent=2)}')
            
        except Category.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Category with ID {options["category_id"]} not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error updating category: {str(e)}'))
