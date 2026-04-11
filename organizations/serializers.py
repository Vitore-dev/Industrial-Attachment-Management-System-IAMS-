from rest_framework import serializers
from .models import OrganizationProfile


class OrganizationProfileSerializer(serializers.ModelSerializer):
    current_assignments_count = serializers.SerializerMethodField()
    remaining_slots = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationProfile
        fields = [
            'id',
            'company_name',
            'address',
            'industry',
            'website',
            'description',
            'preferred_skills',
            'preferred_project_type',
            'location',
            'max_students',
            'is_approved',
            'current_assignments_count',
            'remaining_slots',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'is_approved',
            'current_assignments_count',
            'remaining_slots',
            'created_at',
            'updated_at',
        ]

    def get_current_assignments_count(self, obj):
        return obj.match_assignments.count()

    def get_remaining_slots(self, obj):
        return max(obj.max_students - obj.match_assignments.count(), 0)
