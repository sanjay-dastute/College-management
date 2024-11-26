from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Student
import os

@receiver(pre_delete, sender=Student)
def delete_profile_pic(sender, instance, **kwargs):
    """
    Signal handler to delete profile picture file when Student instance is deleted
    """
    if instance.profile_pic:
        try:
            if os.path.isfile(instance.profile_pic.path):
                os.remove(instance.profile_pic.path)
        except (ValueError, FileNotFoundError):
            pass  # Handle case where file is already deleted or missing
