from .models import SchoolStudentRecord


def find_verified_school_student(student_id, email):
    if not student_id or not email:
        return None

    return SchoolStudentRecord.objects.filter(
        student_id=student_id.strip(),
        email__iexact=email.strip(),
        is_active=True,
    ).first()
