from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import CustomUser
from matching.models import MatchAssignment, MatchSuggestion
from organizations.models import OrganizationProfile
from students.models import StudentProfile


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class MatchingFlowTests(TestCase):
    def setUp(self):
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

        self.student = StudentProfile.objects.create(
            user=self.student_user,
            student_id='202200001',
            first_name='Ada',
            last_name='Student',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='web_development',
            preferred_location='gaborone',
            skills=['Python', 'Django', 'React'],
        )
        self.organization = OrganizationProfile.objects.create(
            user=self.organization_user,
            company_name='Tech Org',
            address='Main Road',
            industry='information_technology',
            preferred_skills=['Python', 'Django'],
            preferred_project_type='web_development',
            location='gaborone',
            max_students=2,
            is_approved=True,
        )

        self.client.force_authenticate(user=self.coordinator)

    def test_run_matching_creates_ranked_suggestions(self):
        response = self.client.post('/api/matching/run/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(MatchSuggestion.objects.count(), 1)

        suggestion = MatchSuggestion.objects.get()
        self.assertEqual(suggestion.score, 45)
        self.assertTrue(suggestion.is_recommended)
        self.assertEqual(suggestion.rank, 1)

    def test_confirm_match_creates_assignment_and_sends_notification(self):
        self.client.post('/api/matching/run/')
        suggestion = MatchSuggestion.objects.get()

        response = self.client.post(
            '/api/matching/confirm/',
            {'suggestion_id': suggestion.id},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_placed)
        self.assertEqual(MatchAssignment.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_manual_override_rejects_full_organization(self):
        other_student_user = CustomUser.objects.create_user(
            username='student2',
            password='password123',
            role='student',
            email='student2@example.com',
        )
        other_student = StudentProfile.objects.create(
            user=other_student_user,
            student_id='202200002',
            first_name='Bob',
            last_name='Student',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='web_development',
            preferred_location='gaborone',
            skills=['Python'],
            is_placed=True,
        )
        MatchAssignment.objects.create(
            student=other_student,
            organization=self.organization,
            source='manual',
            score=10,
        )
        self.organization.max_students = 1
        self.organization.save(update_fields=['max_students'])

        response = self.client.post(
            '/api/matching/override/',
            {
                'student_id': self.student.id,
                'organization_id': self.organization.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('no remaining placement slots', response.data['error'].lower())
