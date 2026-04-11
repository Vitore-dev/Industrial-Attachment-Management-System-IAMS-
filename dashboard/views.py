from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.models import CustomUser
from students.models import StudentProfile
from organizations.models import OrganizationProfile
from matching.models import MatchAssignment, MatchSuggestion


class CoordinatorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Make sure user is a coordinator
        if request.user.role != 'coordinator':
            return Response(
                {'error': 'Only coordinators can access the dashboard'},
                status=status.HTTP_403_FORBIDDEN
            )

        # User statistics
        total_students = CustomUser.objects.filter(role='student').count()
        total_organizations = CustomUser.objects.filter(role='organization').count()
        total_coordinators = CustomUser.objects.filter(role='coordinator').count()
        total_university_supervisors = CustomUser.objects.filter(
            role='university_supervisor'
        ).count()
        total_industrial_supervisors = CustomUser.objects.filter(
            role='industrial_supervisor'
        ).count()

        # Student statistics
        total_student_profiles = StudentProfile.objects.count()
        students_placed = StudentProfile.objects.filter(is_placed=True).count()
        students_not_placed = StudentProfile.objects.filter(is_placed=False).count()

        # Organization statistics
        total_organization_profiles = OrganizationProfile.objects.count()
        approved_organizations = OrganizationProfile.objects.filter(
            is_approved=True
        ).count()
        pending_organizations = OrganizationProfile.objects.filter(
            is_approved=False
        ).count()

        # Recent registrations
        recent_students = StudentProfile.objects.order_by(
            '-created_at'
        )[:5].values(
            'first_name',
            'last_name',
            'student_id',
            'department',
            'created_at'
        )

        recent_organizations = OrganizationProfile.objects.order_by(
            '-created_at'
        )[:5].values(
            'company_name',
            'industry',
            'location',
            'is_approved',
            'created_at'
        )

        return Response({
            'user_statistics': {
                'total_students': total_students,
                'total_organizations': total_organizations,
                'total_coordinators': total_coordinators,
                'total_university_supervisors': total_university_supervisors,
                'total_industrial_supervisors': total_industrial_supervisors,
            },
            'student_statistics': {
                'total_student_profiles': total_student_profiles,
                'students_placed': students_placed,
                'students_not_placed': students_not_placed,
            },
            'organization_statistics': {
                'total_organization_profiles': total_organization_profiles,
                'approved_organizations': approved_organizations,
                'pending_organizations': pending_organizations,
            },
            'matching_statistics': {
                'confirmed_matches': MatchAssignment.objects.count(),
                'students_pending_match': StudentProfile.objects.filter(
                    is_placed=False
                ).count(),
                'students_with_suggestions': MatchSuggestion.objects.values(
                    'student_id'
                ).distinct().count(),
            },
            'recent_students': list(recent_students),
            'recent_organizations': list(recent_organizations),
        }, status=status.HTTP_200_OK)
