from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser
from students.models import StudentProfile


class StudentProfileVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='verified-student',
            email='verified@student.ub.bw',
            password='password123',
            role='student',
            verified_student_id='202201524',
            is_school_verified=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_student_profile_rejects_different_student_id_than_verified_id(self):
        response = self.client.post(
            '/api/students/create/',
            {
                'student_id': '202299999',
                'first_name': 'Verified',
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

    def test_student_profile_uses_verified_student_id(self):
        response = self.client.post(
            '/api/students/create/',
            {
                'first_name': 'Verified',
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
