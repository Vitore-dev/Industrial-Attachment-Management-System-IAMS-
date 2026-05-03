from django.conf import settings
from django.db import models

from organizations.models import OrganizationProfile
from students.models import StudentProfile


class StudentWeeklyLog(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='weekly_logs',
    )
    week_number = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=150, blank=True, default='')
    highlights = models.TextField()
    tasks_completed = models.TextField()
    challenges = models.TextField(blank=True, default='')
    next_steps = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-week_number', '-updated_at']
        unique_together = ('student', 'week_number')

    def __str__(self):
        return f'Week {self.week_number} log - {self.student.student_id}'


class StudentFinalReport(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='final_attachment_report',
    )
    title = models.CharField(max_length=255)
    summary = models.TextField()
    report_file = models.FileField(
        upload_to='final_reports/',
        blank=True,
        null=True,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'Final report - {self.student.student_id}'


class IndustrialSupervisorReport(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='industrial_supervisor_report',
    )
    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='submitted_industrial_reports',
        null=True,
        blank=True,
    )
    organization = models.ForeignKey(
        OrganizationProfile,
        on_delete=models.SET_NULL,
        related_name='industrial_supervisor_reports',
        null=True,
        blank=True,
    )
    overall_score = models.DecimalField(max_digits=5, decimal_places=2)
    strengths = models.TextField()
    improvement_areas = models.TextField()
    attendance_comment = models.TextField(blank=True, default='')
    recommendation = models.TextField(blank=True, default='')
    supporting_document = models.FileField(
        upload_to='supporting_documents/',
        blank=True,
        null=True,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student__first_name', 'student__last_name']

    def __str__(self):
        return f'Industrial report - {self.student.student_id}'


class UniversitySupervisorAssessment(models.Model):
    ASSESSMENT_CHOICES = [
        (1, 'Assessment 1'),
        (2, 'Assessment 2'),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='university_supervisor_assessments',
    )
    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='submitted_university_assessments',
        null=True,
        blank=True,
    )
    assessment_number = models.PositiveSmallIntegerField(choices=ASSESSMENT_CHOICES)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    comments = models.TextField(blank=True, default='')
    visit_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student__first_name', 'student__last_name', 'assessment_number']
        unique_together = ('student', 'assessment_number')

    def __str__(self):
        return (
            f'Assessment {self.assessment_number} - '
            f'{self.student.student_id}'
        )


class FinalGradeRecord(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('complete', 'Complete'),
    ]

    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='final_grade_record',
    )
    industrial_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
    )
    university_average = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
    )
    assessment_count = models.PositiveSmallIntegerField(default=0)
    industrial_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=30.00,
    )
    university_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=70.00,
    )
    final_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
    )
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student__first_name', 'student__last_name']

    def __str__(self):
        return f'Final grade - {self.student.student_id}'

