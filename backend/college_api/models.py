from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from .utils import handle_profile_pic_update, get_profile_pic_path

def validate_file_size(value):
    filesize = value.size
    if filesize > 5 * 1024 * 1024:  # 5MB
        raise ValidationError("Maximum file size is 5MB")

class Faculty(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.subject}"

class Student(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_pic = models.ImageField(
        upload_to=get_profile_pic_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif']),
            validate_file_size
        ],
        help_text="Upload a profile picture (max 5MB, formats: jpg, jpeg, png, gif)"
    )
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=5)
    contact_number = models.CharField(max_length=15)
    address = models.TextField()
    faculties = models.ManyToManyField(Faculty, related_name='students')

    class Meta:
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return self.user.get_full_name()

    def clean(self):
        super().clean()
        if self.profile_pic:
            validate_file_size(self.profile_pic)

    def save(self, *args, **kwargs):
        if self.pk:
            old_instance = Student.objects.get(pk=self.pk)
            if old_instance.profile_pic != self.profile_pic:
                handle_profile_pic_update(old_instance, self.profile_pic)
        super().save(*args, **kwargs)
