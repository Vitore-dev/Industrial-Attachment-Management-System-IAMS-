from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    assigned_organization_id = serializers.SerializerMethodField()
    assigned_organization_name = serializers.SerializerMethodField()
    match_source = serializers.SerializerMethodField()

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
            'assigned_organization_id',
            'assigned_organization_name',
            'match_source',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'is_placed',
            'assigned_organization_id',
            'assigned_organization_name',
            'match_source',
            'created_at',
            'updated_at',
        ]

    def get_assigned_organization_id(self, obj):
        assignment = getattr(obj, 'match_assignment', None)
        return assignment.organization_id if assignment else None

    def get_assigned_organization_name(self, obj):
        assignment = getattr(obj, 'match_assignment', None)
        return assignment.organization.company_name if assignment else None

    def get_match_source(self, obj):
        assignment = getattr(obj, 'match_assignment', None)
        return assignment.source if assignment else None
