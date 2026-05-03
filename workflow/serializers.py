from rest_framework import serializers

from .models import (
    FinalGradeRecord,
    IndustrialSupervisorReport,
    StudentFinalReport,
    StudentWeeklyLog,
    UniversitySupervisorAssessment,
)


class StudentWeeklyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentWeeklyLog
        fields = [
            'id',
            'week_number',
            'title',
            'highlights',
            'tasks_completed',
            'challenges',
            'next_steps',
            'submitted_at',
            'updated_at',
        ]
        read_only_fields = ['submitted_at', 'updated_at']


class StudentFinalReportSerializer(serializers.ModelSerializer):
    report_file_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentFinalReport
        fields = [
            'id',
            'title',
            'summary',
            'report_file',
            'report_file_name',
            'submitted_at',
            'updated_at',
        ]
        read_only_fields = ['submitted_at', 'updated_at', 'report_file_name']

    def get_report_file_name(self, obj):
        if obj.report_file:
            return obj.report_file.name.split('/')[-1]
        return ''


class IndustrialSupervisorReportSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    supporting_document_name = serializers.SerializerMethodField()

    class Meta:
        model = IndustrialSupervisorReport
        fields = [
            'id',
            'student',
            'student_name',
            'student_id',
            'organization',
            'organization_name',
            'supervisor',
            'supervisor_name',
            'overall_score',
            'strengths',
            'improvement_areas',
            'attendance_comment',
            'recommendation',
            'supporting_document',
            'supporting_document_name',
            'submitted_at',
            'updated_at',
        ]
        read_only_fields = [
            'organization',
            'organization_name',
            'supervisor',
            'supervisor_name',
            'student_name',
            'student_id',
            'supporting_document_name',
            'submitted_at',
            'updated_at',
        ]

    def get_student_name(self, obj):
        return f'{obj.student.first_name} {obj.student.last_name}'

    def get_student_id(self, obj):
        return obj.student.student_id

    def get_organization_name(self, obj):
        return obj.organization.company_name if obj.organization else 'Not assigned'

    def get_supervisor_name(self, obj):
        return obj.supervisor.username if obj.supervisor else 'Not assigned'

    def get_supporting_document_name(self, obj):
        if obj.supporting_document:
            return obj.supporting_document.name.split('/')[-1]
        return ''


class UniversitySupervisorAssessmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()

    class Meta:
        model = UniversitySupervisorAssessment
        fields = [
            'id',
            'student',
            'student_name',
            'student_id',
            'supervisor',
            'supervisor_name',
            'assessment_number',
            'score',
            'comments',
            'visit_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'student_name',
            'student_id',
            'supervisor',
            'supervisor_name',
            'created_at',
            'updated_at',
        ]

    def get_student_name(self, obj):
        return f'{obj.student.first_name} {obj.student.last_name}'

    def get_student_id(self, obj):
        return obj.student.student_id

    def get_supervisor_name(self, obj):
        return obj.supervisor.username if obj.supervisor else 'Not assigned'


class FinalGradeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()

    class Meta:
        model = FinalGradeRecord
        fields = [
            'id',
            'student',
            'student_name',
            'student_id',
            'organization_name',
            'industrial_score',
            'university_average',
            'assessment_count',
            'industrial_weight',
            'university_weight',
            'final_score',
            'status',
            'calculated_at',
        ]
        read_only_fields = fields

    def get_student_name(self, obj):
        return f'{obj.student.first_name} {obj.student.last_name}'

    def get_student_id(self, obj):
        return obj.student.student_id

    def get_organization_name(self, obj):
        assignment = getattr(obj.student, 'match_assignment', None)
        return assignment.organization.company_name if assignment else 'Unassigned'

