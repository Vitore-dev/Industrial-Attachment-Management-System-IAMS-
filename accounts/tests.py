from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser


class StudentRegistrationFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_student_registration_succeeds_without_school_registry_verification(self):
        response = self.client.post(
            '/api/accounts/register/',
            {
                'username': 'unknown-student',
                'email': 'unknown@student.ub.bw',
                'password': 'password123',
                'role': 'student',
                'student_id': '202299999',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.data['message'],
            'Industrial attachment registration successful. Sign in to complete your student profile.'
        )
        self.assertTrue(response.data['requires_login'])
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)

        user = CustomUser.objects.get(username='unknown-student')
        self.assertEqual(user.verified_student_id, '202299999')
        self.assertFalse(user.is_school_verified)
        self.assertEqual(user.first_name, '')
        self.assertEqual(user.last_name, '')

    def test_student_registration_rejects_duplicate_student_id(self):
        CustomUser.objects.create_user(
            username='existing-student',
            email='existing@student.ub.bw',
            password='password123',
            role='student',
            verified_student_id='202201524',
        )

        response = self.client.post(
            '/api/accounts/register/',
            {
                'username': 'second-student',
                'email': 'second@student.ub.bw',
                'password': 'password123',
                'role': 'student',
                'student_id': '202201524',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('student_id', response.data)
        self.assertEqual(CustomUser.objects.filter(role='student').count(), 1)

    def test_non_student_registration_still_starts_a_session(self):
        response = self.client.post(
            '/api/accounts/register/',
            {
                'username': 'coordinator',
                'email': 'coord@example.com',
                'password': 'password123',
                'role': 'coordinator',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
