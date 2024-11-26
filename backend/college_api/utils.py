import os

def handle_profile_pic_update(instance, new_profile_pic):
    """
    Utility function to handle profile picture updates.
    Deletes the old profile picture if it exists and is different from the new one.
    """
    if instance.profile_pic:
        old_pic_path = instance.profile_pic.path
        # Check if old file exists and is different from new file
        if os.path.exists(old_pic_path) and instance.profile_pic != new_profile_pic:
            try:
                os.remove(old_pic_path)
            except (OSError, FileNotFoundError):
                # Log error but don't raise exception as this is cleanup
                pass

def get_profile_pic_path(instance, filename):
    """
    Returns the upload path for profile pictures.
    Creates a unique path based on user ID to avoid filename collisions.
    """
    ext = filename.split('.')[-1]
    new_filename = f"profile_pic_{instance.user.id}.{ext}"
    return os.path.join('profile_pics', new_filename)
