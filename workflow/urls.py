from django.urls import path

from .views import (
    CoordinatorWorkflowOverviewView,
    CoordinatorWorkflowStudentsView,
    DispatchWorkflowRemindersView,
    ExportGradesCsvView,
    ExportGradesPdfView,
    IndustrialSupervisorReportView,
    StudentFinalReportView,
    StudentWeeklyLogView,
    StudentWorkflowOverviewView,
    SupervisorWorkflowOverviewView,
    UniversitySupervisorAssessmentView,
)


urlpatterns = [
    path('student/overview/', StudentWorkflowOverviewView.as_view()),
    path('student/logbooks/', StudentWeeklyLogView.as_view()),
    path('student/final-report/', StudentFinalReportView.as_view()),
    path('supervisor/overview/', SupervisorWorkflowOverviewView.as_view()),
    path('supervisor/industrial-report/', IndustrialSupervisorReportView.as_view()),
    path('supervisor/university-assessment/', UniversitySupervisorAssessmentView.as_view()),
    path('coordinator/overview/', CoordinatorWorkflowOverviewView.as_view()),
    path('coordinator/students/', CoordinatorWorkflowStudentsView.as_view()),
    path('coordinator/reminders/', DispatchWorkflowRemindersView.as_view()),
    path('coordinator/export/grades.csv', ExportGradesCsvView.as_view()),
    path('coordinator/export/grades.pdf', ExportGradesPdfView.as_view()),
]

