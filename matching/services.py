from collections import defaultdict

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count

from organizations.models import OrganizationProfile
from students.models import StudentProfile

from .models import MatchAssignment, MatchSuggestion


SKILL_MATCH_POINTS = 10
PROJECT_TYPE_MATCH_POINTS = 15
LOCATION_MATCH_POINTS = 10
MAX_SUGGESTIONS_PER_STUDENT = 3


def normalize_skills(skills):
    if not isinstance(skills, list):
        return {}

    normalized = {}
    for skill in skills:
        if not isinstance(skill, str):
            continue
        cleaned = skill.strip()
        if cleaned:
            normalized[cleaned.lower()] = cleaned
    return normalized


def calculate_match_breakdown(student, organization):
    student_skill_map = normalize_skills(student.skills)
    organization_skill_map = normalize_skills(organization.preferred_skills)

    matched_skill_keys = sorted(
        set(student_skill_map.keys()) & set(organization_skill_map.keys())
    )
    matched_skills = [student_skill_map[key] for key in matched_skill_keys]

    skill_match_points = len(matched_skills) * SKILL_MATCH_POINTS
    project_type_points = (
        PROJECT_TYPE_MATCH_POINTS
        if student.preferred_project_type == organization.preferred_project_type
        else 0
    )
    location_points = (
        LOCATION_MATCH_POINTS
        if student.preferred_location == organization.location
        else 0
    )
    score = skill_match_points + project_type_points + location_points

    return {
        'score': score,
        'matched_skills': matched_skills,
        'skill_match_points': skill_match_points,
        'project_type_points': project_type_points,
        'location_points': location_points,
    }


def get_available_organizations():
    return list(
        OrganizationProfile.objects.filter(is_approved=True)
        .annotate(current_assignments=Count('match_assignments'))
        .select_related('user')
        .order_by('company_name')
    )


@transaction.atomic
def run_matching_engine():
    students = list(
        StudentProfile.objects.filter(is_placed=False)
        .select_related('user')
        .order_by('created_at', 'id')
    )
    organizations = get_available_organizations()

    MatchSuggestion.objects.all().delete()

    if not students or not organizations:
        return {
            'students_processed': len(students),
            'approved_organizations': len(organizations),
            'suggestions_created': 0,
            'recommended_matches': 0,
            'students_with_suggestions': 0,
        }

    remaining_slots = {
        organization.id: max(
            organization.max_students - getattr(organization, 'current_assignments', 0),
            0,
        )
        for organization in organizations
    }

    candidates_by_student = defaultdict(list)
    all_candidates = []

    for student in students:
        for organization in organizations:
            if remaining_slots[organization.id] <= 0:
                continue

            breakdown = calculate_match_breakdown(student, organization)
            if breakdown['score'] <= 0:
                continue

            candidate = {
                'student': student,
                'organization': organization,
                'breakdown': breakdown,
            }
            candidates_by_student[student.id].append(candidate)
            all_candidates.append(candidate)

    if not all_candidates:
        return {
            'students_processed': len(students),
            'approved_organizations': len(organizations),
            'suggestions_created': 0,
            'recommended_matches': 0,
            'students_with_suggestions': 0,
        }

    recommended_pairs = set()
    recommended_students = set()
    candidate_order = sorted(
        all_candidates,
        key=lambda item: (
            -item['breakdown']['score'],
            item['student'].created_at,
            item['organization'].company_name.lower(),
        ),
    )

    for candidate in candidate_order:
        student = candidate['student']
        organization = candidate['organization']
        if student.id in recommended_students:
            continue
        if remaining_slots[organization.id] <= 0:
            continue

        recommended_pairs.add((student.id, organization.id))
        recommended_students.add(student.id)
        remaining_slots[organization.id] -= 1

    suggestions_to_create = []
    students_with_suggestions = 0

    for student in students:
        ranked_candidates = sorted(
            candidates_by_student.get(student.id, []),
            key=lambda item: (
                -item['breakdown']['score'],
                item['organization'].company_name.lower(),
            ),
        )[:MAX_SUGGESTIONS_PER_STUDENT]

        if ranked_candidates:
            students_with_suggestions += 1

        for rank, candidate in enumerate(ranked_candidates, start=1):
            breakdown = candidate['breakdown']
            suggestions_to_create.append(
                MatchSuggestion(
                    student=student,
                    organization=candidate['organization'],
                    score=breakdown['score'],
                    matched_skills=breakdown['matched_skills'],
                    skill_match_points=breakdown['skill_match_points'],
                    project_type_points=breakdown['project_type_points'],
                    location_points=breakdown['location_points'],
                    rank=rank,
                    is_recommended=(
                        student.id,
                        candidate['organization'].id,
                    )
                    in recommended_pairs,
                )
            )

    MatchSuggestion.objects.bulk_create(suggestions_to_create)

    return {
        'students_processed': len(students),
        'approved_organizations': len(organizations),
        'suggestions_created': len(suggestions_to_create),
        'recommended_matches': len(recommended_pairs),
        'students_with_suggestions': students_with_suggestions,
    }


def get_remaining_slots(organization, excluding_student=None):
    assignments = MatchAssignment.objects.filter(organization=organization)
    if excluding_student is not None:
        assignments = assignments.exclude(student=excluding_student)
    return max(organization.max_students - assignments.count(), 0)


def send_match_notification(student, organization, source):
    recipients = [
        email
        for email in [student.user.email, organization.user.email]
        if email
    ]

    if not recipients:
        return {
            'status': 'skipped',
            'message': 'No recipient email addresses were available.',
        }

    source_label = 'manual override' if source == 'manual' else 'automatic match'
    subject = 'IAMS Match Confirmation'
    message = (
        f'Industrial Attachment Management System match confirmation.\n\n'
        f'Student: {student.first_name} {student.last_name}\n'
        f'Student ID: {student.student_id}\n'
        f'Organization: {organization.company_name}\n'
        f'Match Source: {source_label}\n'
        f'Location: {organization.location}\n'
    )

    try:
        sent = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=False,
        )
        if sent:
            return {
                'status': 'sent',
                'message': f'Notification sent to {sent} recipient(s).',
            }
        return {
            'status': 'skipped',
            'message': 'The email backend did not send any notifications.',
        }
    except Exception as exc:
        return {
            'status': 'failed',
            'message': str(exc),
        }


@transaction.atomic
def create_or_update_assignment(student, organization, confirmed_by, source, notes=''):
    remaining_slots = get_remaining_slots(organization, excluding_student=student)
    if remaining_slots <= 0:
        raise ValueError(
            f'{organization.company_name} has no remaining placement slots.'
        )

    breakdown = calculate_match_breakdown(student, organization)
    notification = send_match_notification(student, organization, source)

    assignment, _ = MatchAssignment.objects.update_or_create(
        student=student,
        defaults={
            'organization': organization,
            'source': source,
            'score': breakdown['score'],
            'matched_skills': breakdown['matched_skills'],
            'skill_match_points': breakdown['skill_match_points'],
            'project_type_points': breakdown['project_type_points'],
            'location_points': breakdown['location_points'],
            'notes': notes,
            'confirmed_by': confirmed_by,
            'notification_status': notification['status'],
            'notification_message': notification['message'],
        },
    )

    if not student.is_placed:
        student.is_placed = True
        student.save(update_fields=['is_placed'])

    return assignment, notification
