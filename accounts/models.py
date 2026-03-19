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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
