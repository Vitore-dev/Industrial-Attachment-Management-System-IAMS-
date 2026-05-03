import shutil
import tempfile
from decimal import Decimal
from pathlib import Path

from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import CustomUser
from matching.models import MatchAssignment
from organizations.models import OrganizationProfile
from students.models import StudentProfile

from .models import (
    FinalGradeRecord,
    IndustrialSupervisorReport,
    StudentFinalReport,
    StudentWeeklyLog,
    UniversitySupervisorAssessment,
)


class WorkflowReleaseTwoTests(TestCase):
    def setUp(self):
        self.media_root = tempfile.mkdtemp(
            dir=Path(__file__).resolve().parent.parent
        )
        self.settings_override = override_settings(
            EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
            MEDIA_ROOT=self.media_root,
        )
        self.settings_override.enable()

        self.client = APIClient()
        self.coordinator = CustomUser.objects.create_user(
            username='coord',
            password='password123',
            role='coordinator',
            email='coord@example.com',
        )
        self.student_user = CustomUser.objects.create_user(
            username='student',
            password='password123',
            role='student',
            email='student@example.com',
        )
        self.organization_user = CustomUser.objects.create_user(
            username='org',
            password='password123',
            role='organization',
            email='org@example.com',
        )
        self.industrial_supervisor = CustomUser.objects.create_user(
            username='industrial',
            password='password123',
            role='industrial_supervisor',
            email='industrial@example.com',
        )
        self.university_supervisor = CustomUser.objects.create_user(
            username='university',
            password='password123',
            role='university_supervisor',
            email='university@example.com',
        )

        self.student = StudentProfile.objects.create(
            user=self.student_user,
            student_id='202200101',
            first_name='Ada',
            last_name='Lovelace',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='web_development',
            preferred_location='gaborone',
            skills=['Python', 'Django'],
            is_placed=True,
        )
        self.unplaced_student_user = CustomUser.objects.create_user(
            username='waiting',
            password='password123',
            role='student',
            email='waiting@example.com',
        )
        self.unplaced_student = StudentProfile.objects.create(
            user=self.unplaced_student_user,
            student_id='202200202',
            first_name='Grace',
            last_name='Hopper',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='data_science',
            preferred_location='maun',
            skills=['SQL'],
            is_placed=False,
        )
        self.organization = OrganizationProfile.objects.create(
            user=self.organization_user,
            company_name='Tech Org',
            address='Main Road',
            industry='information_technology',
            preferred_skills=['Python'],
            preferred_project_type='web_development',
            location='gaborone',
            max_students=3,
            is_approved=True,
        )
        MatchAssignment.objects.create(
            student=self.student,
            organization=self.organization,
            source='automatic',
            score=35,
            notification_status='sent',
            notification_message='Notification sent to 2 recipient(s).',
        )

    def tearDown(self):
        self.settings_override.disable()
        shutil.rmtree(self.media_root, ignore_errors=True)

    def test_student_can_submit_logbook_and_final_report(self):
        self.client.force_authenticate(user=self.student_user)

        logbook_response = self.client.post(
            '/api/workflow/student/logbooks/',
            {
                'week_number': 1,
                'title': 'Week 1',
                'highlights': 'Set up the project environment.',
                'tasks_completed': 'Configured Django and React locally.',
                'challenges': 'Resolving package version conflicts.',
                'next_steps': 'Build the reporting workflow.',
            },
            format='json',
        )
        self.assertEqual(logbook_response.status_code, 201)
        self.assertEqual(StudentWeeklyLog.objects.count(), 1)

        final_report_response = self.client.post(
            '/api/workflow/student/final-report/',
            {
                'title': 'Industrial Attachment Final Report',
                'summary': 'Completed a release workflow implementation.',
            },
            format='multipart',
        )
        self.assertEqual(final_report_response.status_code, 201)
        self.assertEqual(StudentFinalReport.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 2)

    def test_student_submission_requires_confirmed_placement(self):
        self.client.force_authenticate(user=self.unplaced_student_user)

        response = self.client.post(
            '/api/workflow/student/logbooks/',
            {
                'week_number': 1,
                'highlights': 'Trying to submit too early.',
                'tasks_completed': 'N/A',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('placement has been confirmed', response.data['error'])

    def test_supervisor_reports_calculate_weighted_final_grade(self):
        self.client.force_authenticate(user=self.industrial_supervisor)
        industrial_response = self.client.post(
            '/api/workflow/supervisor/industrial-report/',
            {
                'student': self.student.id,
                'overall_score': '70.00',
                'strengths': 'Strong execution and communication.',
                'improvement_areas': 'Needs more test automation.',
                'recommendation': 'Recommended for future projects.',
            },
            format='multipart',
        )
        self.assertEqual(industrial_response.status_code, 201)
        self.assertEqual(IndustrialSupervisorReport.objects.count(), 1)

        self.client.force_authenticate(user=self.university_supervisor)
        assessment_one = self.client.post(
            '/api/workflow/supervisor/university-assessment/',
            {
                'student': self.student.id,
                'assessment_number': 1,
                'score': '80.00',
                'comments': 'Strong first site visit.',
            },
            format='json',
        )
        assessment_two = self.client.post(
            '/api/workflow/supervisor/university-assessment/',
            {
                'student': self.student.id,
                'assessment_number': 2,
                'score': '90.00',
                'comments': 'Excellent final review.',
            },
            format='json',
        )

        self.assertEqual(assessment_one.status_code, 201)
        self.assertEqual(assessment_two.status_code, 201)
        self.assertEqual(UniversitySupervisorAssessment.objects.count(), 2)

        grade_record = FinalGradeRecord.objects.get(student=self.student)
        self.assertEqual(grade_record.status, 'complete')
        self.assertEqual(grade_record.assessment_count, 2)
        self.assertEqual(grade_record.final_score, Decimal('80.50'))
        self.assertEqual(len(mail.outbox), 3)

    def test_coordinator_can_dispatch_reminders_and_export_grades(self):
        self.client.force_authenticate(user=self.coordinator)

        reminder_response = self.client.post('/api/workflow/coordinator/reminders/')
        self.assertEqual(reminder_response.status_code, 200)
        self.assertEqual(
          reminder_response.data['summary']['student_submission_pending'],
          1,
        )
        self.assertEqual(len(mail.outbox), 3)

        csv_response = self.client.get('/api/workflow/coordinator/export/grades.csv')
        self.assertEqual(csv_response.status_code, 200)
        self.assertEqual(csv_response['Content-Type'], 'text/csv')
        self.assertIn('202200101', csv_response.content.decode())

        pdf_response = self.client.get('/api/workflow/coordinator/export/grades.pdf')
        self.assertEqual(pdf_response.status_code, 200)
        self.assertEqual(pdf_response['Content-Type'], 'application/pdf')
        self.assertTrue(pdf_response.content.startswith(b'%PDF-1.4'))
