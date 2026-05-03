import csv
import io
import textwrap
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail

from accounts.models import CustomUser
from students.models import StudentProfile

from .models import FinalGradeRecord


INDUSTRIAL_WEIGHT = Decimal('30.00')
UNIVERSITY_WEIGHT = Decimal('70.00')
EXPECTED_UNIVERSITY_ASSESSMENTS = 2


def quantize_score(value):
    if value is None:
        return None
    return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def get_related_or_none(instance, attribute_name):
    try:
        return getattr(instance, attribute_name)
    except ObjectDoesNotExist:
        return None


def get_coordinator_emails():
    return list(
        CustomUser.objects.filter(role='coordinator')
        .exclude(email='')
        .values_list('email', flat=True)
    )


def send_notification_email(subject, message, recipients):
    unique_recipients = sorted({email for email in recipients if email})
    if not unique_recipients:
        return {
            'status': 'skipped',
            'message': 'No recipient email addresses were available.',
            'recipient_count': 0,
        }

    try:
        sent = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            unique_recipients,
            fail_silently=False,
        )
        if sent:
            return {
                'status': 'sent',
                'message': f'Notification sent to {sent} recipient(s).',
                'recipient_count': sent,
            }
        return {
            'status': 'skipped',
            'message': 'The email backend did not send any notifications.',
            'recipient_count': 0,
        }
    except Exception as exc:
        return {
            'status': 'failed',
            'message': str(exc),
            'recipient_count': 0,
        }


def send_workflow_event_notification(event_name, student, detail_lines, extra_recipients=None):
    recipients = [student.user.email, *get_coordinator_emails(), *(extra_recipients or [])]
    subject = f'IAMS Update: {event_name}'
    message = '\n'.join(
        [
            'Industrial Attachment Management System workflow update.',
            '',
            f'Student: {student.first_name} {student.last_name}',
            f'Student ID: {student.student_id}',
            *detail_lines,
        ]
    )
    return send_notification_email(subject, message, recipients)


def recalculate_final_grade(student):
    industrial_report = get_related_or_none(student, 'industrial_supervisor_report')
    assessments = list(
        student.university_supervisor_assessments.order_by('assessment_number')
    )

    industrial_score = None
    if industrial_report:
        industrial_score = quantize_score(industrial_report.overall_score)

    university_average = None
    if assessments:
        total = sum(Decimal(str(assessment.score)) for assessment in assessments)
        university_average = quantize_score(total / Decimal(len(assessments)))

    final_score = None
    if industrial_score is not None and university_average is not None:
        final_score = quantize_score(
            (
                (industrial_score * INDUSTRIAL_WEIGHT)
                + (university_average * UNIVERSITY_WEIGHT)
            )
            / Decimal('100')
        )

    if industrial_score is None and not assessments:
        status = 'pending'
    elif (
        industrial_score is not None
        and len(assessments) >= EXPECTED_UNIVERSITY_ASSESSMENTS
        and final_score is not None
    ):
        status = 'complete'
    else:
        status = 'partial'

    grade_record, _ = FinalGradeRecord.objects.update_or_create(
        student=student,
        defaults={
            'industrial_score': industrial_score,
            'university_average': university_average,
            'assessment_count': len(assessments),
            'industrial_weight': INDUSTRIAL_WEIGHT,
            'university_weight': UNIVERSITY_WEIGHT,
            'final_score': final_score,
            'status': status,
        },
    )
    return grade_record


def dispatch_workflow_reminders():
    placed_students = list(
        StudentProfile.objects.filter(is_placed=True).select_related('user', 'match_assignment__organization')
    )

    students_needing_reports = [
        student
        for student in placed_students
        if (
            student.weekly_logs.count() == 0
            or get_related_or_none(student, 'final_attachment_report') is None
        )
    ]
    students_needing_industrial_reports = [
        student
        for student in placed_students
        if get_related_or_none(student, 'industrial_supervisor_report') is None
    ]
    students_needing_assessments = [
        student
        for student in placed_students
        if student.university_supervisor_assessments.count()
        < EXPECTED_UNIVERSITY_ASSESSMENTS
    ]

    student_recipients = [student.user.email for student in students_needing_reports]
    industrial_supervisor_recipients = list(
        CustomUser.objects.filter(role='industrial_supervisor')
        .exclude(email='')
        .values_list('email', flat=True)
    )
    university_supervisor_recipients = list(
        CustomUser.objects.filter(role='university_supervisor')
        .exclude(email='')
        .values_list('email', flat=True)
    )

    student_result = send_notification_email(
        'IAMS Reminder: Logbooks and Final Reports',
        '\n'.join(
            [
                'This is a reminder to keep your weekly logbooks current and upload your final attachment report before the deadline.',
                '',
                f'Placed students awaiting student submissions: {len(students_needing_reports)}',
            ]
        ),
        student_recipients,
    )
    industrial_result = send_notification_email(
        'IAMS Reminder: Industrial Supervisor Reports',
        '\n'.join(
            [
                'Please complete end-of-attachment reports for students who have not yet received an industrial supervisor submission.',
                '',
                f'Students awaiting industrial supervisor reports: {len(students_needing_industrial_reports)}',
            ]
        ),
        industrial_supervisor_recipients if students_needing_industrial_reports else [],
    )
    university_result = send_notification_email(
        'IAMS Reminder: University Supervisor Assessments',
        '\n'.join(
            [
                'Please capture pending university supervisor assessments in IAMS.',
                '',
                f'Students awaiting one or more university assessments: {len(students_needing_assessments)}',
            ]
        ),
        university_supervisor_recipients if students_needing_assessments else [],
    )

    return {
        'student_submission_pending': len(students_needing_reports),
        'industrial_reports_pending': len(students_needing_industrial_reports),
        'university_assessments_pending': len(students_needing_assessments),
        'student_email_result': student_result,
        'industrial_supervisor_email_result': industrial_result,
        'university_supervisor_email_result': university_result,
    }


def build_grade_export_rows():
    students = (
        StudentProfile.objects.filter(is_placed=True)
        .select_related('user', 'match_assignment__organization')
        .prefetch_related('weekly_logs', 'university_supervisor_assessments')
        .order_by('first_name', 'last_name')
    )

    rows = []
    for student in students:
        final_report = get_related_or_none(student, 'final_attachment_report')
        industrial_report = get_related_or_none(student, 'industrial_supervisor_report')
        grade_record = recalculate_final_grade(student)
        assignment = getattr(student, 'match_assignment', None)

        rows.append(
            {
                'student_id': student.student_id,
                'student_name': f'{student.first_name} {student.last_name}',
                'organization': (
                    assignment.organization.company_name if assignment else 'Unassigned'
                ),
                'weekly_logs_submitted': student.weekly_logs.count(),
                'final_report_submitted': 'Yes' if final_report else 'No',
                'industrial_score': (
                    f'{grade_record.industrial_score:.2f}'
                    if grade_record.industrial_score is not None
                    else ''
                ),
                'university_average': (
                    f'{grade_record.university_average:.2f}'
                    if grade_record.university_average is not None
                    else ''
                ),
                'assessment_count': grade_record.assessment_count,
                'final_score': (
                    f'{grade_record.final_score:.2f}'
                    if grade_record.final_score is not None
                    else ''
                ),
                'grade_status': grade_record.status,
                'industrial_report_submitted': 'Yes' if industrial_report else 'No',
            }
        )
    return rows


def build_grade_export_csv():
    rows = build_grade_export_rows()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            'Student ID',
            'Student Name',
            'Organization',
            'Weekly Logs Submitted',
            'Final Report Submitted',
            'Industrial Report Submitted',
            'Industrial Score',
            'University Average',
            'Assessment Count',
            'Final Score',
            'Grade Status',
        ]
    )
    for row in rows:
        writer.writerow(
            [
                row['student_id'],
                row['student_name'],
                row['organization'],
                row['weekly_logs_submitted'],
                row['final_report_submitted'],
                row['industrial_report_submitted'],
                row['industrial_score'],
                row['university_average'],
                row['assessment_count'],
                row['final_score'],
                row['grade_status'],
            ]
        )
    return output.getvalue()


def _escape_pdf_text(value):
    return value.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def build_grade_export_pdf():
    rows = build_grade_export_rows()
    lines = [
        'Industrial Attachment Management System Grade Report',
        '',
    ]

    if not rows:
        lines.append('No placed students are available for grade export yet.')
    else:
        for row in rows:
            lines.extend(
                [
                    f"{row['student_id']} - {row['student_name']}",
                    f"Organization: {row['organization']}",
                    (
                        'Submissions: '
                        f"logs={row['weekly_logs_submitted']}, "
                        f"final_report={row['final_report_submitted']}, "
                        f"industrial_report={row['industrial_report_submitted']}"
                    ),
                    (
                        'Grades: '
                        f"industrial={row['industrial_score'] or 'N/A'}, "
                        f"university={row['university_average'] or 'N/A'}, "
                        f"final={row['final_score'] or 'N/A'} "
                        f"({row['grade_status']})"
                    ),
                    '',
                ]
            )

    wrapped_lines = []
    for line in lines:
        if not line:
            wrapped_lines.append('')
            continue
        wrapped_lines.extend(textwrap.wrap(line, width=90) or [''])

    page_size = 40
    pages = [
        wrapped_lines[index:index + page_size]
        for index in range(0, len(wrapped_lines), page_size)
    ] or [[]]

    objects = {}
    font_id = 1
    objects[font_id] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    page_ids = []
    next_id = 2

    for page_lines in pages:
        content_parts = ['BT', '/F1 11 Tf', '50 780 Td', '14 TL']
        for line_index, line in enumerate(page_lines):
            if line_index:
                content_parts.append('T*')
            content_parts.append(f'({_escape_pdf_text(line[:120])}) Tj')
        content_parts.append('ET')
        content_stream = '\n'.join(content_parts)
        content_id = next_id
        next_id += 1
        objects[content_id] = (
            f'<< /Length {len(content_stream.encode("latin-1"))} >>\n'
            f'stream\n{content_stream}\nendstream'
        )
        page_id = next_id
        next_id += 1
        page_ids.append((page_id, content_id))

    pages_id = next_id
    next_id += 1
    catalog_id = next_id

    for page_id, content_id in page_ids:
        objects[page_id] = (
            '<< /Type /Page '
            f'/Parent {pages_id} 0 R '
            '/MediaBox [0 0 612 792] '
            f'/Resources << /Font << /F1 {font_id} 0 R >> >> '
            f'/Contents {content_id} 0 R >>'
        )

    objects[pages_id] = (
        '<< /Type /Pages '
        f'/Count {len(page_ids)} '
        f"/Kids [{' '.join(f'{page_id} 0 R' for page_id, _ in page_ids)}] >>"
    )
    objects[catalog_id] = f'<< /Type /Catalog /Pages {pages_id} 0 R >>'

    pdf_parts = [b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n']
    offsets = {0: 0}

    for object_id in range(1, len(objects) + 1):
        offsets[object_id] = sum(len(part) for part in pdf_parts)
        pdf_parts.append(
            (
                f'{object_id} 0 obj\n{objects[object_id]}\nendobj\n'
            ).encode('latin-1')
        )

    xref_offset = sum(len(part) for part in pdf_parts)
    pdf_parts.append(f'xref\n0 {len(objects) + 1}\n'.encode('latin-1'))
    pdf_parts.append(b'0000000000 65535 f \n')
    for object_id in range(1, len(objects) + 1):
        pdf_parts.append(f'{offsets[object_id]:010d} 00000 n \n'.encode('latin-1'))
    pdf_parts.append(
        (
            f'trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n'
            f'startxref\n{xref_offset}\n%%EOF'
        ).encode('latin-1')
    )

    return b''.join(pdf_parts)

