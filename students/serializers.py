from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    assigned_organization_id = serializers.SerializerMethodField()
    assigned_organization_name = serializers.SerializerMethodField()
    match_source = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()

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
            'notifications',
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

    def get_notifications(self, obj):
        assignment = getattr(obj, 'match_assignment', None)

        if assignment:
            detail = (
                assignment.notification_message
                or 'Your placement has been confirmed in the system.'
            )
            return [
                {
                    'id': f'placement-{obj.id}',
                    'status': 'placed',
                    'status_label': 'Placed',
                    'level': 'success',
                    'title': 'Placement confirmed',
                    'message': (
                        f'You have been placed at '
                        f'{assignment.organization.company_name}.'
                    ),
                    'detail': (
                        f'Match source: {assignment.get_source_display()}. '
                        f'{detail}'
                    ),
                    'timestamp': assignment.updated_at.isoformat(),
                }
            ]

        return [
            {
                'id': f'placement-pending-{obj.id}',
                'status': 'pending',
                'status_label': 'Pending',
                'level': 'warning',
                'title': 'Placement pending',
                'message': (
                    'Your profile is active and waiting for coordinator matching.'
                ),
                'detail': (
                    'You will see your confirmed placement here once the system '
                    'assigns you to an organization.'
                ),
                'timestamp': obj.updated_at.isoformat(),
            }
        ]
