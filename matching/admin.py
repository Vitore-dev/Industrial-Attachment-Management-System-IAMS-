from django.contrib import admin

from .models import MatchAssignment, MatchSuggestion


@admin.register(MatchSuggestion)
class MatchSuggestionAdmin(admin.ModelAdmin):
    list_display = (
        'student',
        'organization',
        'score',
        'rank',
        'is_recommended',
        'updated_at',
    )
    list_filter = ('is_recommended', 'rank')
    search_fields = (
        'student__student_id',
        'student__first_name',
        'student__last_name',
        'organization__company_name',
    )


@admin.register(MatchAssignment)
class MatchAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        'student',
        'organization',
        'source',
        'score',
        'notification_status',
        'updated_at',
    )
    list_filter = ('source', 'notification_status')
    search_fields = (
        'student__student_id',
        'student__first_name',
        'student__last_name',
        'organization__company_name',
    )
