from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import SchoolStudentRecord
from matching.models import MatchAssignment, MatchSuggestion
from organizations.models import OrganizationProfile
from students.models import StudentProfile
from workflow.models import (
    FinalGradeRecord,
    IndustrialSupervisorReport,
    StudentFinalReport,
    StudentWeeklyLog,
    UniversitySupervisorAssessment,
)


class Command(BaseCommand):
    help = (
        'Clears presentation/demo records while preserving coordinator and staff '
        'accounts so the system stays accessible.'
    )

    @transaction.atomic
    def handle(self, *args, **options):
        user_model = get_user_model()

        counts = {
            'weekly_logs': StudentWeeklyLog.objects.count(),
            'final_reports': StudentFinalReport.objects.count(),
            'industrial_reports': IndustrialSupervisorReport.objects.count(),
            'university_assessments': UniversitySupervisorAssessment.objects.count(),
            'final_grades': FinalGradeRecord.objects.count(),
            'match_suggestions': MatchSuggestion.objects.count(),
            'match_assignments': MatchAssignment.objects.count(),
            'student_profiles': StudentProfile.objects.count(),
            'organization_profiles': OrganizationProfile.objects.count(),
            'school_records': SchoolStudentRecord.objects.count(),
        }

        users_to_delete = user_model.objects.exclude(role='coordinator').filter(
            is_staff=False,
            is_superuser=False,
        )
        counts['users_removed'] = users_to_delete.count()

        StudentWeeklyLog.objects.all().delete()
        StudentFinalReport.objects.all().delete()
        IndustrialSupervisorReport.objects.all().delete()
        UniversitySupervisorAssessment.objects.all().delete()
        FinalGradeRecord.objects.all().delete()
        MatchSuggestion.objects.all().delete()
        MatchAssignment.objects.all().delete()
        StudentProfile.objects.all().delete()
        OrganizationProfile.objects.all().delete()
        SchoolStudentRecord.objects.all().delete()
        users_to_delete.delete()

        self.stdout.write(self.style.SUCCESS('Presentation data cleanup complete.'))
        for label, count in counts.items():
            self.stdout.write(f'- {label}: {count}')
