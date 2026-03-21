from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'student_id',
            'first_name',
            'last_name',
            'year_of_study',
            'department',
            'preferred_project_type',
            'preferred_location',
            'skills',
            'cv',
            'is_placed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['is_placed', 'created_at', 'updated_at']