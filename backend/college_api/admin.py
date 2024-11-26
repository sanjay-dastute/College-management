from django.contrib import admin
from .models import Faculty, Student

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('user', 'subject', 'contact_number')
    search_fields = ('user__username', 'user__first_name', 'subject')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'gender', 'blood_group', 'contact_number')
    search_fields = ('user__username', 'user__first_name', 'blood_group')
    filter_horizontal = ('faculties',)
