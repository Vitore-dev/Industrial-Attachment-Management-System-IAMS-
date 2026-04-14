from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser
from matching.models import MatchAssignment
from organizations.models import OrganizationProfile
from students.models import StudentProfile


class StudentProfileRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='registered-student',
            email='registered@student.ub.bw',
            password='password123',
            role='student',
            verified_student_id='202201524',
        )
        self.client.force_authenticate(user=self.user)

    def test_student_profile_rejects_different_student_id_than_registered_id(self):
        response = self.client.post(
            '/api/students/create/',
            {
                'student_id': '202299999',
                'first_name': 'Registered',
                'last_name': 'Student',
                'year_of_study': '3',
                'department': 'Computer Science',
                'preferred_project_type': 'web_development',
                'preferred_location': 'gaborone',
                'skills': ['Python'],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('student_id', response.data)
        self.assertEqual(StudentProfile.objects.count(), 0)

    def test_student_profile_uses_registered_student_id(self):
        response = self.client.post(
            '/api/students/create/',
            {
                'first_name': 'Registered',
                'last_name': 'Student',
                'year_of_study': '3',
                'department': 'Computer Science',
                'preferred_project_type': 'web_development',
                'preferred_location': 'gaborone',
                'skills': ['Python'],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        profile = StudentProfile.objects.get(user=self.user)
        self.assertEqual(profile.student_id, '202201524')

    def test_student_profile_update_keeps_registered_student_id(self):
        profile = StudentProfile.objects.create(
            user=self.user,
            student_id='202201524',
            first_name='Registered',
            last_name='Student',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='web_development',
            preferred_location='gaborone',
            skills=['Python'],
        )

        response = self.client.put(
            '/api/students/update/',
            {
                'student_id': '202299999',
                'department': 'Software Engineering',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('student_id', response.data)

        profile.refresh_from_db()
        self.assertEqual(profile.student_id, '202201524')

    def test_student_profile_includes_pending_notification_when_unplaced(self):
        StudentProfile.objects.create(
            user=self.user,
            student_id='202201524',
            first_name='Registered',
            last_name='Student',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='web_development',
            preferred_location='gaborone',
            skills=['Python'],
        )

        response = self.client.get('/api/students/profile/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['notifications'][0]['status'], 'pending')
        self.assertIn('waiting for coordinator matching', response.data['notifications'][0]['message'])

    def test_student_profile_includes_placement_notification_when_assigned(self):
        profile = StudentProfile.objects.create(
            user=self.user,
            student_id='202201524',
            first_name='Registered',
            last_name='Student',
            year_of_study='3',
            department='Computer Science',
            preferred_project_type='web_development',
            preferred_location='gaborone',
            skills=['Python'],
            is_placed=True,
        )

        organization_user = CustomUser.objects.create_user(
            username='org-user',
            email='org@example.com',
            password='password123',
            role='organization',
        )
        organization = OrganizationProfile.objects.create(
            user=organization_user,
            company_name='Tech Corp',
            address='Plot 123, Gaborone',
            industry='information_technology',
            preferred_skills=['Python'],
            preferred_project_type='web_development',
            location='gaborone',
            max_students=2,
            is_approved=True,
        )

        MatchAssignment.objects.create(
            student=profile,
            organization=organization,
            source='automatic',
            score=35,
            matched_skills=['Python'],
            skill_match_points=10,
            project_type_points=15,
            location_points=10,
            notification_status='sent',
            notification_message='Notification sent to 2 recipient(s).',
        )

        response = self.client.get('/api/students/profile/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['notifications'][0]['status'], 'placed')
        self.assertIn('Tech Corp', response.data['notifications'][0]['message'])
