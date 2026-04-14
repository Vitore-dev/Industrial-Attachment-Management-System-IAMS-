from django.contrib import admin
from .models import CustomUser, SchoolStudentRecord


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        'username',
        'email',
        'role',
        'registered_student_id',
    )
    list_filter = ('role',)
    search_fields = ('username', 'email', 'verified_student_id')

    @admin.display(description='Student ID')
    def registered_student_id(self, obj):
        return obj.verified_student_id or '-'


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
