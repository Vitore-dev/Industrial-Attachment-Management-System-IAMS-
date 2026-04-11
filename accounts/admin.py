from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import CustomUser, SchoolStudentRecord


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        'username',
        'email',
        'role',
        'verified_student_id',
        'is_school_verified',
    )
    list_filter = ('role', 'is_school_verified')
    search_fields = ('username', 'email', 'verified_student_id')


@admin.register(SchoolStudentRecord)
class SchoolStudentRecordAdmin(admin.ModelAdmin):
    list_display = (
        'student_id',
        'email',
        'first_name',
        'last_name',
        'department',
        'year_of_study',
        'is_active',
    )
    list_filter = ('is_active', 'department', 'year_of_study')
    search_fields = ('student_id', 'email', 'first_name', 'last_name')
