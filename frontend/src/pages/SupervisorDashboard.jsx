import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const EMPTY_INDUSTRIAL_FORM = {
  student: '',
  overall_score: '',
  strengths: '',
  improvement_areas: '',
  attendance_comment: '',
  recommendation: '',
  file: null,
};

const EMPTY_ASSESSMENT_FORM = {
  student: '',
  assessment_number: '1',
  score: '',
  comments: '',
  visit_date: '',
};

const buildMessage = (payload, fallback) => {
  if (!payload || typeof payload !== 'object') return fallback;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.detail === 'string' && payload.detail.trim()) return payload.detail;

  const text = Object.values(payload)
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();

  return text || fallback;
};

const formatRole = (role) => {
  if (!role) return 'Supervisor';
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatStatus = (value) => {
  if (!value) return 'Pending';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatGrade = (value) => {
  if (value === null || value === undefined || value === '') return 'Pending';
  return Number(value).toFixed(2);
};

export default function SupervisorDashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const roleLabel = formatRole(user?.role);
  const [workflow, setWorkflow] = useState({
    placed_students: [],
    industrial_reports: [],
    university_assessments: [],
  });
  const [industrialForm, setIndustrialForm] = useState(EMPTY_INDUSTRIAL_FORM);
  const [assessmentForm, setAssessmentForm] = useState(EMPTY_ASSESSMENT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');

  const initials = user?.username
    ? user.username
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    : 'SU';

  const loadWorkflow = async () => {
    const data = await api.getSupervisorWorkflowOverview();
    setWorkflow(data);
  };

  useEffect(() => {
    if (!loading && user) {
      loadWorkflow().catch(() => {
        setBanner({
          type: 'error',
          text: 'Unable to load the supervisor workspace right now.',
        });
      });
    }
  }, [loading, user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleIndustrialSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('student', industrialForm.student);
    formData.append('overall_score', industrialForm.overall_score);
    formData.append('strengths', industrialForm.strengths);
    formData.append('improvement_areas', industrialForm.improvement_areas);
    formData.append('attendance_comment', industrialForm.attendance_comment);
    formData.append('recommendation', industrialForm.recommendation);
    if (industrialForm.file) {
      formData.append('supporting_document', industrialForm.file);
    }

    const response = await api.saveIndustrialSupervisorReport(formData);
    if (response?.report) {
      setBanner({
        type: 'success',
        text: 'Industrial supervisor report saved successfully.',
      });
      setIndustrialForm(EMPTY_INDUSTRIAL_FORM);
      await loadWorkflow();
    } else {
      setBanner({
        type: 'error',
        text: buildMessage(response, 'Unable to save the industrial supervisor report.'),
      });
    }

    setSubmitting(false);
  };

  const handleAssessmentSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const response = await api.saveUniversitySupervisorAssessment({
      ...assessmentForm,
      student: Number(assessmentForm.student),
      assessment_number: Number(assessmentForm.assessment_number),
      score: Number(assessmentForm.score),
    });

    if (response?.assessment) {
      setBanner({
        type: 'success',
        text: `Assessment ${response.assessment.assessment_number} saved successfully.`,
      });
      setAssessmentForm(EMPTY_ASSESSMENT_FORM);
      await loadWorkflow();
    } else {
      setBanner({
        type: 'error',
        text: buildMessage(response, 'Unable to save the university supervisor assessment.'),
      });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner"></div>
        <p>Loading supervisor portal...</p>
      </div>
    );
  }

  const placedStudents = workflow.placed_students || [];
  const industrialReports = workflow.industrial_reports || [];
  const universityAssessments = workflow.university_assessments || [];
  const isIndustrialSupervisor = user?.role === 'industrial_supervisor';
  const normalizedStudentSearch = studentSearch.trim().toLowerCase();
  const filteredStudents = placedStudents.filter((student) => {
    const matchesSearch = !normalizedStudentSearch || [
      student.name,
      student.student_id,
      student.organization_name,
    ].some((value) => (value || '').toLowerCase().includes(normalizedStudentSearch));
    const matchesStatus = studentStatusFilter === 'all'
      || (studentStatusFilter === 'ready' && student.grade_status === 'complete')
      || (studentStatusFilter === 'action_needed' && student.grade_status !== 'complete');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="sidebar-brand">
          <span>I</span> IAMS
        </div>
        <div className="profile-avatar-section">
          <div className="profile-avatar">{initials}</div>
          <h3>{user?.username}</h3>
          <span className="role-badge">{roleLabel}</span>
        </div>
        <div className="profile-meta">
          <div className="meta-item">
            <span>Email</span>
            <p>{user?.email || 'Not provided'}</p>
          </div>
          <div className="meta-item">
            <span>Phone</span>
            <p>{user?.phone_number || 'Not provided'}</p>
          </div>
          <div className="meta-item">
            <span>Students In View</span>
            <p>{placedStudents.length}</p>
          </div>
          <div className="meta-item">
            <span>Status</span>
            <p className="placed">Active</p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      <main className="profile-main">
        <div className="profile-main-header">
          <h1>{roleLabel} Workspace</h1>
        </div>

        {banner && <div className={`profile-banner ${banner.type}`}>{banner.text}</div>}

        <div className="profile-view workflow-stack">
          <div className="view-section">
            <h3>Account Overview</h3>
            <div className="view-grid">
              <div className="view-item">
                <label>Role</label>
                <p>{roleLabel}</p>
              </div>
              <div className="view-item">
                <label>Active Students</label>
                <p>{placedStudents.length}</p>
              </div>
              <div className="view-item">
                <label>Submitted Items</label>
                <p>{isIndustrialSupervisor ? industrialReports.length : universityAssessments.length}</p>
              </div>
            </div>
          </div>

          <div className="view-section">
            <div className="section-heading">
              <h3>Placed Students</h3>
              <div className="filter-toolbar">
                <input
                  type="search"
                  className="filter-input"
                  placeholder="Search student or organization"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                />
                <select
                  className="filter-select"
                  value={studentStatusFilter}
                  onChange={(event) => setStudentStatusFilter(event.target.value)}
                >
                  <option value="all">All students</option>
                  <option value="action_needed">Action needed</option>
                  <option value="ready">Grade ready</option>
                </select>
              </div>
            </div>
            <div className="workflow-entry-list">
              {filteredStudents.length ? filteredStudents.map((student) => (
                <article key={student.id} className="workflow-entry">
                  <div className="workflow-entry-header">
                    <div>
                      <h4>{student.name}</h4>
                      <p>{student.student_id} - {student.organization_name}</p>
                    </div>
                    <span className="role-badge">{formatStatus(student.grade_status)}</span>
                  </div>
                  <div className="workflow-entry-body workflow-metrics">
                    <p><strong>Weekly Logs:</strong> {student.weekly_logs_submitted}</p>
                    <p><strong>Final Report:</strong> {student.final_report_submitted ? 'Submitted' : 'Pending'}</p>
                    <p><strong>Industrial Report:</strong> {student.industrial_report_submitted ? 'Submitted' : 'Pending'}</p>
                    <p><strong>University Assessments:</strong> {student.university_assessment_count} of 2</p>
                    <p><strong>Current Final Grade:</strong> {formatGrade(student.final_score)}</p>
                  </div>
                </article>
              )) : (
                <p className="workflow-note">No placed students match the current filter.</p>
              )}
            </div>
          </div>

          {isIndustrialSupervisor ? (
            <div className="view-section">
              <h3>Industrial Supervisor Report</h3>
              <form onSubmit={handleIndustrialSubmit} className="profile-edit-form compact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Student</label>
                    <select
                      value={industrialForm.student}
                      onChange={(event) => setIndustrialForm({
                        ...industrialForm,
                        student: event.target.value,
                      })}
                      required
                    >
                      <option value="">Select placed student</option>
                      {placedStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.organization_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Overall Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={industrialForm.overall_score}
                      onChange={(event) => setIndustrialForm({
                        ...industrialForm,
                        overall_score: event.target.value,
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Strengths</label>
                  <textarea
                    rows="3"
                    value={industrialForm.strengths}
                    onChange={(event) => setIndustrialForm({
                      ...industrialForm,
                      strengths: event.target.value,
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Improvement Areas</label>
                  <textarea
                    rows="3"
                    value={industrialForm.improvement_areas}
                    onChange={(event) => setIndustrialForm({
                      ...industrialForm,
                      improvement_areas: event.target.value,
                    })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Attendance Comment</label>
                    <textarea
                      rows="3"
                      value={industrialForm.attendance_comment}
                      onChange={(event) => setIndustrialForm({
                        ...industrialForm,
                        attendance_comment: event.target.value,
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Recommendation</label>
                    <textarea
                      rows="3"
                      value={industrialForm.recommendation}
                      onChange={(event) => setIndustrialForm({
                        ...industrialForm,
                        recommendation: event.target.value,
                      })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Supporting Document</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(event) => setIndustrialForm({
                      ...industrialForm,
                      file: event.target.files?.[0] || null,
                    })}
                  />
                </div>
                <button type="submit" className="profile-btn" disabled={submitting}>
                  {submitting ? 'Saving Report...' : 'Save Industrial Report'}
                </button>
              </form>

              <div className="workflow-entry-list">
                {industrialReports.length ? industrialReports.map((report) => (
                  <article key={report.id} className="workflow-entry">
                    <div className="workflow-entry-header">
                      <div>
                        <h4>{report.student_name}</h4>
                        <p>{report.organization_name} - Score {formatGrade(report.overall_score)}</p>
                      </div>
                      <span className="role-badge">Submitted</span>
                    </div>
                    <div className="workflow-entry-body">
                      <p><strong>Strengths:</strong> {report.strengths}</p>
                      <p><strong>Improvement Areas:</strong> {report.improvement_areas}</p>
                      {report.recommendation && <p><strong>Recommendation:</strong> {report.recommendation}</p>}
                      {report.supporting_document && (
                        <p>
                          <a
                            className="workflow-link"
                            href={api.resolveMediaUrl(report.supporting_document)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open supporting document: {report.supporting_document_name}
                          </a>
                        </p>
                      )}
                    </div>
                  </article>
                )) : (
                  <p className="workflow-note">No industrial supervisor reports have been submitted yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="view-section">
              <h3>University Supervisor Assessment</h3>
              <form onSubmit={handleAssessmentSubmit} className="profile-edit-form compact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Student</label>
                    <select
                      value={assessmentForm.student}
                      onChange={(event) => setAssessmentForm({
                        ...assessmentForm,
                        student: event.target.value,
                      })}
                      required
                    >
                      <option value="">Select placed student</option>
                      {placedStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.organization_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assessment Number</label>
                    <select
                      value={assessmentForm.assessment_number}
                      onChange={(event) => setAssessmentForm({
                        ...assessmentForm,
                        assessment_number: event.target.value,
                      })}
                      required
                    >
                      <option value="1">Assessment 1</option>
                      <option value="2">Assessment 2</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={assessmentForm.score}
                      onChange={(event) => setAssessmentForm({
                        ...assessmentForm,
                        score: event.target.value,
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Visit Date</label>
                    <input
                      type="date"
                      value={assessmentForm.visit_date}
                      onChange={(event) => setAssessmentForm({
                        ...assessmentForm,
                        visit_date: event.target.value,
                      })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Comments</label>
                  <textarea
                    rows="4"
                    value={assessmentForm.comments}
                    onChange={(event) => setAssessmentForm({
                      ...assessmentForm,
                      comments: event.target.value,
                    })}
                  />
                </div>
                <button type="submit" className="profile-btn" disabled={submitting}>
                  {submitting ? 'Saving Assessment...' : 'Save Assessment'}
                </button>
              </form>

              <div className="workflow-entry-list">
                {universityAssessments.length ? universityAssessments.map((assessment) => (
                  <article key={assessment.id} className="workflow-entry">
                    <div className="workflow-entry-header">
                      <div>
                        <h4>{assessment.student_name}</h4>
                        <p>
                          Assessment {assessment.assessment_number} - Score {formatGrade(assessment.score)}
                        </p>
                      </div>
                      <span className="role-badge">
                        {assessment.visit_date || 'Visit date optional'}
                      </span>
                    </div>
                    {assessment.comments && (
                      <div className="workflow-entry-body">
                        <p>{assessment.comments}</p>
                      </div>
                    )}
                  </article>
                )) : (
                  <p className="workflow-note">No university supervisor assessments have been submitted yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
