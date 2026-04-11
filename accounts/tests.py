from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser, SchoolStudentRecord


class StudentRegistrationVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_student_registration_is_blocked_when_not_in_school_registry(self):
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

        self.assertEqual(response.status_code, 400)
        self.assertIn('student_id', response.data)
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_student_registration_succeeds_for_verified_school_student(self):
        SchoolStudentRecord.objects.create(
            student_id='202201524',
            email='thando@student.ub.bw',
            first_name='Thando',
            last_name='Fino',
            department='Computer Science',
            year_of_study='3',
        )

        response = self.client.post(
            '/api/accounts/register/',
            {
                'username': 'thando',
                'email': 'thando@student.ub.bw',
                'password': 'password123',
                'role': 'student',
                'student_id': '202201524',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        user = CustomUser.objects.get(username='thando')
        self.assertTrue(user.is_school_verified)
        self.assertEqual(user.verified_student_id, '202201524')
        self.assertEqual(user.first_name, 'Thando')
        self.assertEqual(user.last_name, 'Fino')
