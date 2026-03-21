from django.db import models

# Create your models here.
from django.db import models
from accounts.models import CustomUser


class StudentProfile(models.Model):

    YEAR_OF_STUDY_CHOICES = [
        ('1', 'Year 1'),
        ('2', 'Year 2'),
        ('3', 'Year 3'),
        ('4', 'Year 4'),
    ]

    PROJECT_TYPE_CHOICES = [
        ('web_development', 'Web Development'),
        ('mobile_development', 'Mobile Development'),
        ('data_science', 'Data Science'),
        ('networking', 'Networking'),
        ('cybersecurity', 'Cybersecurity'),
        ('software_engineering', 'Software Engineering'),
        ('other', 'Other'),
    ]

    LOCATION_CHOICES = [
        ('gaborone', 'Gaborone'),
        ('francistown', 'Francistown'),
        ('maun', 'Maun'),
        ('kasane', 'Kasane'),
        ('serowe', 'Serowe'),
        ('palapye', 'Palapye'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    student_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    year_of_study = models.CharField(max_length=1, choices=YEAR_OF_STUDY_CHOICES)
    department = models.CharField(max_length=100)
    
    # Preferences for matching (US05)
    preferred_project_type = models.CharField(
        max_length=50,
        choices=PROJECT_TYPE_CHOICES
    )
    preferred_location = models.CharField(
        max_length=50,
        choices=LOCATION_CHOICES
    )
    skills = models.JSONField(default=list)
    
    # CV upload
    cv = models.FileField(upload_to='cvs/', blank=True, null=True)
    
    # Status
    is_placed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"
