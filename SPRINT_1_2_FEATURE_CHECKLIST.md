# Sprint 1 and Sprint 2 Feature Verification Checklist

Generated on: 2026-04-11

Scope:
- Compared the current codebase against the Sprint 1 and Sprint 2 items in the planning document.
- Verified both backend and frontend where applicable.

Status legend:
- `[Implemented]` Feature is available in the current system.
- `[Partial]` Feature exists only in part, or is not fully usable end to end.
- `[Missing]` Feature is not implemented in the current system.

## Overall Verdict

- `[Implemented]` Sprint 1 core user-facing features are available in the current system.
- `[Implemented]` Sprint 2 core matching features are now available in the current system.

## Sprint 1 Checklist

- `[Implemented]` `US01 User Authentication & Role-Based Access`
  - Backend registration, login, logout, JWT token refresh, and current-user endpoints exist.
  - Student, organization, coordinator, university supervisor, and industrial supervisor roles exist in the backend.
  - Frontend routing now supports role-correct access for supervisor accounts as well.

- `[Implemented]` `US02 Organization Registration`
  - Organizations can register an organization profile.

- `[Implemented]` `US03 Organization Preferences`
  - Organization preferences such as preferred skills, preferred project type, location, and max students are stored and editable.

- `[Implemented]` `US04 Student Registration`
  - Students can create a student profile after account registration.

- `[Implemented]` `US05 Student Preferences`
  - Student preferences such as preferred project type, preferred location, and skills are stored and editable.

- `[Implemented]` `US06 Profile Management`
  - Students and organizations can view and update their profiles.

- `[Implemented]` `US10 Coordinator/Admin Dashboard`
  - Coordinator dashboard exists.
  - Dashboard shows user counts, student counts, organization counts, recent registrations, and organization approval actions.

## Sprint 2 Checklist

- `[Implemented]` `US07 Matching Heuristics Engine`
  - Weighted scoring logic is implemented for skill matches, project type matches, and location matches.
  - Coordinators can trigger the matching engine from the dashboard.
  - Recommended matches are generated with organization capacity taken into account.

- `[Implemented]` `US08 Manual Override`
  - Coordinators can manually assign a student to an approved organization from the matching dashboard.
  - Capacity checks are enforced before saving overrides.

- `[Implemented]` `US09 Match Suggestions`
  - Ranked suggestions are generated and stored.
  - Top 3 suggestions per pending student are displayed in the coordinator dashboard.
  - Recommended suggestions are clearly marked and can be confirmed into real assignments.

- `[Implemented]` `US11 Match Notification`
  - Match confirmation and manual override both trigger notification delivery logic.
  - Local development uses Django's console email backend by default, with SMTP settings available through environment variables.

## Additional Gaps Affecting Sprint 1 and 2 Readiness

- `[Partial]` Automated tests for all Sprint 1 and Sprint 2 features
  - Matching flow tests now exist for scoring, confirmation, notification, and capacity enforcement.
  - The older app-level `tests.py` files for accounts, students, organizations, and dashboard still need broader feature coverage.

## Not Yet Developed Features

The following Sprint 1 and Sprint 2 work is still incomplete:

1. Broader automated tests across authentication, registration, profile management, and dashboard flows.
2. Optional production SMTP configuration for real outbound email delivery outside local development.

## Short Summary

Sprint 1 is now available across student, organization, coordinator, and supervisor authentication flows.
Sprint 2 matching, suggestions, manual override, and match notifications are now implemented end to end.
