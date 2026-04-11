from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from organizations.models import OrganizationProfile
from students.models import StudentProfile

from .models import MatchAssignment, MatchSuggestion
from .serializers import MatchAssignmentSerializer, MatchSuggestionSerializer
from .services import create_or_update_assignment, run_matching_engine


class CoordinatorOnlyMixin:
    permission_classes = [IsAuthenticated]

    def ensure_coordinator(self, request):
        if request.user.role != 'coordinator':
            return Response(
                {'error': 'Only coordinators can access matching tools'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None


class RunMatchingView(CoordinatorOnlyMixin, APIView):
    def post(self, request):
        denied = self.ensure_coordinator(request)
        if denied:
            return denied

        summary = run_matching_engine()
        return Response(
            {
                'message': 'Matching engine executed successfully',
                'summary': summary,
            },
            status=status.HTTP_200_OK,
        )


class MatchSuggestionsView(CoordinatorOnlyMixin, APIView):
    def get(self, request):
        denied = self.ensure_coordinator(request)
        if denied:
            return denied

        students = (
            StudentProfile.objects.filter(is_placed=False)
            .select_related('user')
            .order_by('first_name', 'last_name')
        )

        grouped = []
        total_suggestions = 0
        students_with_suggestions = 0

        for student in students:
            suggestions = MatchSuggestion.objects.filter(student=student).select_related(
                'organization'
            )
            serialized_suggestions = MatchSuggestionSerializer(suggestions, many=True).data
            if serialized_suggestions:
                students_with_suggestions += 1
                total_suggestions += len(serialized_suggestions)

            grouped.append(
                {
                    'student': {
                        'id': student.id,
                        'student_id': student.student_id,
                        'name': f'{student.first_name} {student.last_name}',
                        'department': student.department,
                        'preferred_project_type': student.preferred_project_type,
                        'preferred_location': student.preferred_location,
                        'skills': student.skills,
                        'is_placed': student.is_placed,
                    },
                    'suggestions': serialized_suggestions,
                }
            )

        return Response(
            {
                'students': grouped,
                'summary': {
                    'students_pending_match': len(grouped),
                    'students_with_suggestions': students_with_suggestions,
                    'total_suggestions': total_suggestions,
                },
            },
            status=status.HTTP_200_OK,
        )


class MatchAssignmentsView(CoordinatorOnlyMixin, APIView):
    def get(self, request):
        denied = self.ensure_coordinator(request)
        if denied:
            return denied

        assignments = MatchAssignment.objects.select_related(
            'student',
            'organization',
            'confirmed_by',
        )
        serializer = MatchAssignmentSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConfirmMatchView(CoordinatorOnlyMixin, APIView):
    def post(self, request):
        denied = self.ensure_coordinator(request)
        if denied:
            return denied

        suggestion_id = request.data.get('suggestion_id')
        if not suggestion_id:
            return Response(
                {'error': 'suggestion_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        suggestion = get_object_or_404(
            MatchSuggestion.objects.select_related('student', 'organization'),
            pk=suggestion_id,
        )

        try:
            assignment, notification = create_or_update_assignment(
                suggestion.student,
                suggestion.organization,
                request.user,
                source='automatic',
                notes='Confirmed from matching suggestion',
            )
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = MatchAssignmentSerializer(assignment)
        return Response(
            {
                'message': 'Match confirmed successfully',
                'assignment': serializer.data,
                'notification': notification,
            },
            status=status.HTTP_200_OK,
        )


class OverrideMatchView(CoordinatorOnlyMixin, APIView):
    def post(self, request):
        denied = self.ensure_coordinator(request)
        if denied:
            return denied

        student_id = request.data.get('student_id')
        organization_id = request.data.get('organization_id')
        notes = request.data.get('notes', '').strip()

        if not student_id or not organization_id:
            return Response(
                {'error': 'student_id and organization_id are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = get_object_or_404(StudentProfile, pk=student_id)
        organization = get_object_or_404(
            OrganizationProfile,
            pk=organization_id,
            is_approved=True,
        )

        try:
            assignment, notification = create_or_update_assignment(
                student,
                organization,
                request.user,
                source='manual',
                notes=notes or 'Manual override by coordinator',
            )
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = MatchAssignmentSerializer(assignment)
        return Response(
            {
                'message': 'Manual override applied successfully',
                'assignment': serializer.data,
                'notification': notification,
            },
            status=status.HTTP_200_OK,
        )
