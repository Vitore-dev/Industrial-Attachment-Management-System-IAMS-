from django.db import models

# Create your models here.
from django.db import models
from accounts.models import CustomUser


class OrganizationProfile(models.Model):

    INDUSTRY_CHOICES = [
        ('information_technology', 'Information Technology'),
        ('finance', 'Finance'),
        ('healthcare', 'Healthcare'),
        ('education', 'Education'),
        ('engineering', 'Engineering'),
        ('telecommunications', 'Telecommunications'),
        ('government', 'Government'),
        ('other', 'Other'),
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
        related_name='organization_profile'
    )
    company_name = models.CharField(max_length=255)
    address = models.TextField()
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Preferences for matching (US03)
    preferred_skills = models.JSONField(default=list)
    preferred_project_type = models.CharField(
        max_length=50, 
        choices=PROJECT_TYPE_CHOICES
    )
    location = models.CharField(max_length=50, choices=LOCATION_CHOICES)
    max_students = models.IntegerField(default=1)
    
    # Coordinator approval
    is_approved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"
