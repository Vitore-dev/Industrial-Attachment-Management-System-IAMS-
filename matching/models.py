from django.conf import settings
from django.db import models

from organizations.models import OrganizationProfile
from students.models import StudentProfile


class MatchSuggestion(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='match_suggestions',
    )
    organization = models.ForeignKey(
        OrganizationProfile,
        on_delete=models.CASCADE,
        related_name='match_suggestions',
    )
    score = models.PositiveIntegerField(default=0)
    matched_skills = models.JSONField(default=list, blank=True)
    skill_match_points = models.PositiveIntegerField(default=0)
    project_type_points = models.PositiveIntegerField(default=0)
    location_points = models.PositiveIntegerField(default=0)
    rank = models.PositiveSmallIntegerField(default=1)
    is_recommended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'organization')
        ordering = ['student', 'rank', '-score']

    def __str__(self):
        return (
            f'{self.student.first_name} {self.student.last_name} -> '
            f'{self.organization.company_name} ({self.score})'
        )


class MatchAssignment(models.Model):
    SOURCE_CHOICES = [
        ('automatic', 'Automatic Confirmation'),
        ('manual', 'Manual Override'),
    ]

    NOTIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('skipped', 'Skipped'),
        ('failed', 'Failed'),
    ]

    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='match_assignment',
    )
    organization = models.ForeignKey(
        OrganizationProfile,
        on_delete=models.CASCADE,
        related_name='match_assignments',
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    score = models.PositiveIntegerField(default=0)
    matched_skills = models.JSONField(default=list, blank=True)
    skill_match_points = models.PositiveIntegerField(default=0)
    project_type_points = models.PositiveIntegerField(default=0)
    location_points = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default='')
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='confirmed_matches',
        null=True,
        blank=True,
    )
    notification_status = models.CharField(
        max_length=20,
        choices=NOTIFICATION_STATUS_CHOICES,
        default='pending',
    )
    notification_message = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student__first_name', 'student__last_name']

    def __str__(self):
        return (
            f'{self.student.first_name} {self.student.last_name} -> '
            f'{self.organization.company_name}'
        )
