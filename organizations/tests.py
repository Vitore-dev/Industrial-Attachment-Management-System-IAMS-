from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser
from matching.models import MatchAssignment
from organizations.models import OrganizationProfile
from students.models import StudentProfile


class OrganizationProfileNotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='organization-user',
            email='organization@example.com',
            password='password123',
            role='organization',
        )
        self.client.force_authenticate(user=self.user)

    def create_organization_profile(self, **overrides):
        payload = {
            'user': self.user,
            'company_name': 'Botswana Tech',
            'address': 'Plot 42, Gaborone',
            'industry': 'information_technology',
            'preferred_skills': ['Python', 'React'],
            'preferred_project_type': 'web_development',
            'location': 'gaborone',
            'max_students': 3,
            'is_approved': False,
        }
        payload.update(overrides)
        return OrganizationProfile.objects.create(**payload)

    def test_organization_profile_includes_pending_notification_when_not_approved(self):
        self.create_organization_profile()

        response = self.client.get('/api/organizations/profile/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['notifications'][0]['status'], 'pending')
        self.assertIn('waiting for coordinator approval', response.data['notifications'][0]['message'])

    def test_organization_profile_includes_approval_and_assignment_notifications(self):
        profile = self.create_organization_profile(is_approved=True)

        student_user = CustomUser.objects.create_user(
            username='student-user',
            email='student@example.com',
            password='password123',
            role='student',
            verified_student_id='202233344',
        )
        student = StudentProfile.objects.create(
            user=student_user,
            student_id='202233344',
            first_name='Tiro',
            last_name='Student',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='web_development',
            preferred_location='gaborone',
            skills=['Python'],
            is_placed=True,
        )

        MatchAssignment.objects.create(
            student=student,
            organization=profile,
            source='manual',
            score=30,
            matched_skills=['Python'],
            skill_match_points=10,
            project_type_points=10,
            location_points=10,
            notification_status='sent',
            notification_message='Notification sent to 2 recipient(s).',
        )

        response = self.client.get('/api/organizations/profile/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['notifications'][0]['status'], 'approved')
        self.assertEqual(len(response.data['notifications']), 2)
        self.assertIn('student(s) have been assigned', response.data['notifications'][1]['message'])
