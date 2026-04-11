from rest_framework import serializers

from .models import MatchAssignment, MatchSuggestion


class MatchSuggestionSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(source='organization.id', read_only=True)
    organization_name = serializers.CharField(
        source='organization.company_name',
        read_only=True,
    )
    organization_location = serializers.CharField(
        source='organization.location',
        read_only=True,
    )
    organization_project_type = serializers.CharField(
        source='organization.preferred_project_type',
        read_only=True,
    )
    organization_remaining_slots = serializers.SerializerMethodField()

    class Meta:
        model = MatchSuggestion
        fields = [
            'id',
            'organization_id',
            'organization_name',
            'organization_location',
            'organization_project_type',
            'organization_remaining_slots',
            'score',
            'matched_skills',
            'skill_match_points',
            'project_type_points',
            'location_points',
            'rank',
            'is_recommended',
            'updated_at',
        ]

    def get_organization_remaining_slots(self, obj):
        current_assignments = obj.organization.match_assignments.exclude(
            student=obj.student
        ).count()
        return max(obj.organization.max_students - current_assignments, 0)


class MatchAssignmentSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_number = serializers.CharField(source='student.student_id', read_only=True)
    organization_id = serializers.IntegerField(source='organization.id', read_only=True)
    organization_name = serializers.CharField(
        source='organization.company_name',
        read_only=True,
    )
    organization_location = serializers.CharField(
        source='organization.location',
        read_only=True,
    )
    confirmed_by_username = serializers.CharField(
        source='confirmed_by.username',
        read_only=True,
        default='',
    )

    class Meta:
        model = MatchAssignment
        fields = [
            'id',
            'student_id',
            'student_name',
            'student_number',
            'organization_id',
            'organization_name',
            'organization_location',
            'source',
            'score',
            'matched_skills',
            'skill_match_points',
            'project_type_points',
            'location_points',
            'notes',
            'notification_status',
            'notification_message',
            'confirmed_by_username',
            'created_at',
            'updated_at',
        ]

    def get_student_name(self, obj):
        return f'{obj.student.first_name} {obj.student.last_name}'
