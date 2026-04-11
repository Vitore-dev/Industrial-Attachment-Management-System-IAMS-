from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('organization', 'Organization'),
        ('coordinator', 'Coordinator'),
        ('university_supervisor', 'University Supervisor'),
        ('industrial_supervisor', 'Industrial Supervisor'),
    ]
    
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    verified_student_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
    )
    is_school_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class SchoolStudentRecord(models.Model):
    student_id = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True, default='')
    year_of_study = models.CharField(max_length=1, blank=True, default='')
    is_active = models.BooleanField(default=True)
    source_system = models.CharField(max_length=100, default='School Registry')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student_id']

    def __str__(self):
        return f"{self.student_id} - {self.email}"
