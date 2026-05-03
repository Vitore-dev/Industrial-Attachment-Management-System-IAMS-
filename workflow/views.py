from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from students.models import StudentProfile

from .models import (
    IndustrialSupervisorReport,
    StudentFinalReport,
    StudentWeeklyLog,
    UniversitySupervisorAssessment,
)
from .serializers import (
    FinalGradeRecordSerializer,
    IndustrialSupervisorReportSerializer,
    StudentFinalReportSerializer,
    StudentWeeklyLogSerializer,
    UniversitySupervisorAssessmentSerializer,
)
from .services import (
    build_grade_export_csv,
    build_grade_export_pdf,
    build_grade_export_rows,
    dispatch_workflow_reminders,
    get_related_or_none,
    recalculate_final_grade,
    send_workflow_event_notification,
)


class WorkflowRoleMixin:
    permission_classes = [IsAuthenticated]

    def ensure_role(self, request, allowed_roles):
        if request.user.role not in allowed_roles:
            return Response(
                {'error': 'You do not have permission to access this workflow endpoint.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None


class StudentWorkflowOverviewView(WorkflowRoleMixin, APIView):
    def get(self, request):
        denied = self.ensure_role(request, ['student'])
        if denied:
            return denied

        student = get_object_or_404(StudentProfile.objects.select_related('user'), user=request.user)
        final_report = get_related_or_none(student, 'final_attachment_report')
        industrial_report = get_related_or_none(student, 'industrial_supervisor_report')
        grade_record = recalculate_final_grade(student)
        assessments = student.university_supervisor_assessments.order_by('assessment_number')
        assignment = getattr(student, 'match_assignment', None)

        return Response(
            {
                'can_submit': student.is_placed,
                'placement': {
                    'is_placed': student.is_placed,
                    'organization_name': (
                        assignment.organization.company_name if assignment else ''
                    ),
                },
                'weekly_logs': StudentWeeklyLogSerializer(
                    student.weekly_logs.all(),
                    many=True,
                ).data,
                'final_report': (
                    StudentFinalReportSerializer(final_report).data
                    if final_report
                    else None
                ),
                'industrial_report_submitted': industrial_report is not None,
                'university_assessments': UniversitySupervisorAssessmentSerializer(
                    assessments,
                    many=True,
                ).data,
                'grade_record': FinalGradeRecordSerializer(grade_record).data,
            },
            status=status.HTTP_200_OK,
        )


class StudentWeeklyLogView(WorkflowRoleMixin, APIView):
    def get(self, request):
        denied = self.ensure_role(request, ['student'])
        if denied:
            return denied

        student = get_object_or_404(StudentProfile, user=request.user)
        serializer = StudentWeeklyLogSerializer(student.weekly_logs.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        denied = self.ensure_role(request, ['student'])
        if denied:
            return denied

        student = get_object_or_404(StudentProfile.objects.select_related('user'), user=request.user)
        if not student.is_placed:
            return Response(
                {'error': 'You can submit logbooks after a placement has been confirmed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        week_number = request.data.get('week_number')
        if not week_number:
            return Response(
                {'error': 'week_number is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance = StudentWeeklyLog.objects.filter(
            student=student,
            week_number=week_number,
        ).first()
        serializer = StudentWeeklyLogSerializer(instance, data=request.data, partial=bool(instance))
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        log_entry = serializer.save(student=student)
        notification = send_workflow_event_notification(
            'Weekly Logbook Submitted',
            student,
            [
                f'Week Number: {log_entry.week_number}',
                f'Log Title: {log_entry.title or "Weekly Log"}',
            ],
        )

        return Response(
            {
                'message': 'Weekly logbook saved successfully.',
                'logbook': StudentWeeklyLogSerializer(log_entry).data,
                'notification': notification,
            },
            status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
        )


class StudentFinalReportView(WorkflowRoleMixin, APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        denied = self.ensure_role(request, ['student'])
        if denied:
            return denied

        student = get_object_or_404(StudentProfile, user=request.user)
        report = get_related_or_none(student, 'final_attachment_report')
        if not report:
            return Response({'report': None}, status=status.HTTP_200_OK)
        return Response(
            {'report': StudentFinalReportSerializer(report).data},
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        denied = self.ensure_role(request, ['student'])
        if denied:
            return denied

        student = get_object_or_404(StudentProfile.objects.select_related('user'), user=request.user)
        if not student.is_placed:
            return Response(
                {'error': 'You can submit a final report after a placement has been confirmed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance = get_related_or_none(student, 'final_attachment_report')
        payload = request.data.copy()
        clear_file = str(payload.get('clear_file', '')).lower() == 'true'
        serializer = StudentFinalReportSerializer(
            instance,
            data=payload,
            partial=bool(instance),
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        report = serializer.save(student=student)
        if clear_file and report.report_file:
            report.report_file.delete(save=False)
            report.report_file = None
            report.save(update_fields=['report_file'])

        notification = send_workflow_event_notification(
            'Final Attachment Report Submitted',
            student,
            [
                f'Report Title: {report.title}',
                f'Attachment Included: {"Yes" if report.report_file else "No"}',
            ],
        )

        return Response(
            {
                'message': 'Final attachment report saved successfully.',
                'report': StudentFinalReportSerializer(report).data,
                'notification': notification,
            },
            status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
        )


class SupervisorWorkflowOverviewView(WorkflowRoleMixin, APIView):
    def get(self, request):
        denied = self.ensure_role(
            request,
            ['industrial_supervisor', 'university_supervisor'],
        )
        if denied:
            return denied

        placed_students = (
            StudentProfile.objects.filter(is_placed=True)
            .select_related('match_assignment__organization')
            .prefetch_related('weekly_logs', 'university_supervisor_assessments')
            .order_by('first_name', 'last_name')
        )

        students = []
        for student in placed_students:
            final_report = get_related_or_none(student, 'final_attachment_report')
            industrial_report = get_related_or_none(student, 'industrial_supervisor_report')
            grade_record = recalculate_final_grade(student)
            assignment = getattr(student, 'match_assignment', None)
            students.append(
                {
                    'id': student.id,
                    'student_id': student.student_id,
                    'name': f'{student.first_name} {student.last_name}',
                    'organization_name': (
                        assignment.organization.company_name if assignment else 'Unassigned'
                    ),
                    'weekly_logs_submitted': student.weekly_logs.count(),
                    'final_report_submitted': final_report is not None,
                    'industrial_report_submitted': industrial_report is not None,
                    'university_assessment_count': (
                        student.university_supervisor_assessments.count()
                    ),
                    'grade_status': grade_record.status,
                    'final_score': (
                        f'{grade_record.final_score:.2f}'
                        if grade_record.final_score is not None
                        else ''
                    ),
                }
            )

        industrial_reports = []
        university_assessments = []
        if request.user.role == 'industrial_supervisor':
            industrial_reports = IndustrialSupervisorReportSerializer(
                IndustrialSupervisorReport.objects.filter(supervisor=request.user).select_related(
                    'student',
                    'organization',
                ),
                many=True,
            ).data
        if request.user.role == 'university_supervisor':
            university_assessments = UniversitySupervisorAssessmentSerializer(
                UniversitySupervisorAssessment.objects.filter(supervisor=request.user).select_related(
                    'student',
                ),
                many=True,
            ).data

        return Response(
            {
                'role': request.user.role,
                'placed_students': students,
                'industrial_reports': industrial_reports,
                'university_assessments': university_assessments,
            },
            status=status.HTTP_200_OK,
        )


class IndustrialSupervisorReportView(WorkflowRoleMixin, APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        denied = self.ensure_role(request, ['industrial_supervisor'])
        if denied:
            return denied

        student = get_object_or_404(
            StudentProfile.objects.select_related('user', 'match_assignment__organization'),
            pk=request.data.get('student'),
            is_placed=True,
        )
        assignment = getattr(student, 'match_assignment', None)
        if not assignment:
            return Response(
                {'error': 'The selected student does not have a confirmed organization.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance = get_related_or_none(student, 'industrial_supervisor_report')
        if instance and instance.supervisor_id and instance.supervisor_id != request.user.id:
            return Response(
                {'error': 'Another industrial supervisor has already submitted this report.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = IndustrialSupervisorReportSerializer(
            instance,
            data=request.data,
            partial=bool(instance),
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        report = serializer.save(
            student=student,
            supervisor=request.user,
            organization=assignment.organization,
        )
        grade_record = recalculate_final_grade(student)
        notification = send_workflow_event_notification(
            'Industrial Supervisor Report Submitted',
            student,
            [
                f'Organization: {assignment.organization.company_name}',
                f'Overall Score: {report.overall_score}',
            ],
            extra_recipients=[request.user.email],
        )

        return Response(
            {
                'message': 'Industrial supervisor report saved successfully.',
                'report': IndustrialSupervisorReportSerializer(report).data,
                'grade_record': FinalGradeRecordSerializer(grade_record).data,
                'notification': notification,
            },
            status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
        )


class UniversitySupervisorAssessmentView(WorkflowRoleMixin, APIView):
    def post(self, request):
        denied = self.ensure_role(request, ['university_supervisor'])
        if denied:
            return denied

        student = get_object_or_404(
            StudentProfile.objects.select_related('user'),
            pk=request.data.get('student'),
            is_placed=True,
        )
        assessment_number = request.data.get('assessment_number')
        if not assessment_number:
            return Response(
                {'error': 'assessment_number is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance = UniversitySupervisorAssessment.objects.filter(
            student=student,
            assessment_number=assessment_number,
        ).first()
        if instance and instance.supervisor_id and instance.supervisor_id != request.user.id:
            return Response(
                {'error': 'Another university supervisor has already submitted this assessment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = UniversitySupervisorAssessmentSerializer(
            instance,
            data=request.data,
            partial=bool(instance),
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        assessment = serializer.save(student=student, supervisor=request.user)
        grade_record = recalculate_final_grade(student)
        notification = send_workflow_event_notification(
            'University Supervisor Assessment Submitted',
            student,
            [
                f'Assessment Number: {assessment.assessment_number}',
                f'Score: {assessment.score}',
            ],
            extra_recipients=[request.user.email],
        )

        return Response(
            {
                'message': 'University supervisor assessment saved successfully.',
                'assessment': UniversitySupervisorAssessmentSerializer(assessment).data,
                'grade_record': FinalGradeRecordSerializer(grade_record).data,
                'notification': notification,
            },
            status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
        )


class CoordinatorWorkflowOverviewView(WorkflowRoleMixin, APIView):
    def get(self, request):
        denied = self.ensure_role(request, ['coordinator'])
        if denied:
            return denied

        placed_students = StudentProfile.objects.filter(is_placed=True)
        final_reports_count = StudentFinalReport.objects.count()
        industrial_reports_count = IndustrialSupervisorReport.objects.count()
        university_assessments_count = UniversitySupervisorAssessment.objects.count()

        ready_for_grading = 0
        partial_grades = 0
        for student in placed_students:
            grade_record = recalculate_final_grade(student)
            if grade_record.status == 'complete':
                ready_for_grading += 1
            elif grade_record.status == 'partial':
                partial_grades += 1

        return Response(
            {
                'workflow_statistics': {
                    'placed_students': placed_students.count(),
                    'weekly_logs_submitted': StudentWeeklyLog.objects.count(),
                    'students_with_logs': StudentWeeklyLog.objects.values('student_id').distinct().count(),
                    'final_reports_submitted': final_reports_count,
                    'industrial_reports_submitted': industrial_reports_count,
                    'university_assessments_submitted': university_assessments_count,
                    'students_ready_for_grading': ready_for_grading,
                    'students_with_partial_grades': partial_grades,
                },
                'pending_work': {
                    'students_missing_final_report': (
                        placed_students.count() - final_reports_count
                    ),
                    'students_missing_industrial_report': (
                        placed_students.count() - industrial_reports_count
                    ),
                    'students_missing_university_assessment': placed_students.filter(
                        university_supervisor_assessments__isnull=True
                    ).distinct().count(),
                },
            },
            status=status.HTTP_200_OK,
        )


class CoordinatorWorkflowStudentsView(WorkflowRoleMixin, APIView):
    def get(self, request):
        denied = self.ensure_role(request, ['coordinator'])
        if denied:
            return denied

        rows = build_grade_export_rows()
        return Response(rows, status=status.HTTP_200_OK)


class DispatchWorkflowRemindersView(WorkflowRoleMixin, APIView):
    def post(self, request):
        denied = self.ensure_role(request, ['coordinator'])
        if denied:
            return denied

        summary = dispatch_workflow_reminders()
        return Response(
            {
                'message': 'Workflow reminders processed.',
                'summary': summary,
            },
            status=status.HTTP_200_OK,
        )


class ExportGradesCsvView(WorkflowRoleMixin, APIView):
    def get(self, request):
        denied = self.ensure_role(request, ['coordinator'])
        if denied:
            return denied

        csv_content = build_grade_export_csv()
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="iams-grades.csv"'
        return response


class ExportGradesPdfView(WorkflowRoleMixin, APIView):
    def get(self, request):
        denied = self.ensure_role(request, ['coordinator'])
        if denied:
            return denied

        pdf_content = build_grade_export_pdf()
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="iams-grades.pdf"'
        return response

