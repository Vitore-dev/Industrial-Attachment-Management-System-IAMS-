from django.contrib import admin

from .models import (
    FinalGradeRecord,
    IndustrialSupervisorReport,
    StudentFinalReport,
    StudentWeeklyLog,
    UniversitySupervisorAssessment,
)


@admin.register(StudentWeeklyLog)
class StudentWeeklyLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'week_number', 'submitted_at', 'updated_at')
    list_filter = ('week_number',)
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name')


@admin.register(StudentFinalReport)
class StudentFinalReportAdmin(admin.ModelAdmin):
    list_display = ('student', 'title', 'submitted_at', 'updated_at')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name', 'title')


@admin.register(IndustrialSupervisorReport)
class IndustrialSupervisorReportAdmin(admin.ModelAdmin):
    list_display = ('student', 'organization', 'supervisor', 'overall_score', 'submitted_at')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name')
    list_filter = ('organization',)


@admin.register(UniversitySupervisorAssessment)
class UniversitySupervisorAssessmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'assessment_number', 'score', 'supervisor', 'visit_date')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name')
    list_filter = ('assessment_number',)


@admin.register(FinalGradeRecord)
class FinalGradeRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'final_score', 'status', 'assessment_count', 'calculated_at')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name')
    list_filter = ('status',)
