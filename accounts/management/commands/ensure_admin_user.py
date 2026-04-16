import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Creates or updates a superuser from environment variables when present.'

    def handle(self, *args, **options):
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', '').strip()
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', '').strip()
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', '').strip()
        role = os.getenv('DJANGO_SUPERUSER_ROLE', 'coordinator').strip() or 'coordinator'

        if not username or not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    'Skipping admin bootstrap because DJANGO_SUPERUSER_USERNAME, '
                    'DJANGO_SUPERUSER_EMAIL, or DJANGO_SUPERUSER_PASSWORD is missing.'
                )
            )
            return

        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'role': role,
                'is_staff': True,
                'is_superuser': True,
            },
        )

        user.email = email
        user.role = role
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'{action} admin user "{username}".'))
