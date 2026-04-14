from rest_framework import serializers
from .models import OrganizationProfile


class OrganizationProfileSerializer(serializers.ModelSerializer):
    current_assignments_count = serializers.SerializerMethodField()
    remaining_slots = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()

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
            'notifications',
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

    def get_notifications(self, obj):
        notifications = []

        if obj.is_approved:
            notifications.append(
                {
                    'id': f'organization-approved-{obj.id}',
                    'status': 'approved',
                    'status_label': 'Approved',
                    'level': 'success',
                    'title': 'Organization approved',
                    'message': (
                        'Your organization profile has been approved and is now '
                        'available for student matching.'
                    ),
                    'detail': (
                        f'You can host up to {obj.max_students} student(s). '
                        f'{self.get_remaining_slots(obj)} slot(s) are currently open.'
                    ),
                    'timestamp': obj.updated_at.isoformat(),
                }
            )

            if obj.match_assignments.exists():
                notifications.append(
                    {
                        'id': f'organization-assignments-{obj.id}',
                        'status': 'active',
                        'status_label': 'Assignments',
                        'level': 'info',
                        'title': 'Students assigned',
                        'message': (
                            f'{self.get_current_assignments_count(obj)} student(s) '
                            'have been assigned to your organization.'
                        ),
                        'detail': (
                            f'{self.get_remaining_slots(obj)} slot(s) remain available '
                            'for future placements.'
                        ),
                        'timestamp': obj.updated_at.isoformat(),
                    }
                )
        else:
            notifications.append(
                {
                    'id': f'organization-pending-{obj.id}',
                    'status': 'pending',
                    'status_label': 'Pending',
                    'level': 'warning',
                    'title': 'Approval pending',
                    'message': (
                        'Your organization profile is waiting for coordinator approval.'
                    ),
                    'detail': (
                        'You will see an approval update here before student matching '
                        'starts for your organization.'
                    ),
                    'timestamp': obj.updated_at.isoformat(),
                }
            )

        return notifications
