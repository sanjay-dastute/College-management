from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from college_api.models import Faculty

class Command(BaseCommand):
    help = 'Creates a test faculty user'

    def handle(self, *args, **kwargs):
        try:
            # Create user
            user = User.objects.create_user(
                username='faculty1',
                password='Faculty@123',
                email='faculty1@example.com',
                first_name='John',
                last_name='Doe'
            )

            # Create faculty profile
            faculty = Faculty.objects.create(
                user=user,
                subject='Computer Science',
                contact_number='1234567890',
                address='123 Faculty Building'
            )

            self.stdout.write(self.style.SUCCESS(f'Successfully created faculty user: {user.username}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating faculty user: {str(e)}'))
