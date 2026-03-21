from rest_framework import serializers
from .models import OrganizationProfile


class OrganizationProfileSerializer(serializers.ModelSerializer):
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
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['is_approved', 'created_at', 'updated_at']