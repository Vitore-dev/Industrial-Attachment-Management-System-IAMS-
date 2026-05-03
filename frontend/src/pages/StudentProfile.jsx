import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NotificationPanel from '../components/NotificationPanel';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const EMPTY_LOGBOOK_FORM = {
  week_number: '',
  title: '',
  highlights: '',
  tasks_completed: '',
  challenges: '',
  next_steps: '',
};

const EMPTY_REPORT_FORM = {
  title: '',
  summary: '',
  file: null,
  clearExistingFile: false,
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

const formatLabel = (value) => (value ? value.replace(/_/g, ' ') : 'N/A');

const formatGrade = (value) => {
  if (value === null || value === undefined || value === '') return 'Pending';
  return Number(value).toFixed(2);
};

const formatStatus = (value) => {
  if (!value) return 'Pending';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function StudentProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [logbookForm, setLogbookForm] = useState(EMPTY_LOGBOOK_FORM);
  const [reportForm, setReportForm] = useState(EMPTY_REPORT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logbookSaving, setLogbookSaving] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [workflowPanel, setWorkflowPanel] = useState('all');

  const loadProfileAndWorkflow = async () => {
    const [profileData, workflowData] = await Promise.all([
      api.getStudent(),
      api.getStudentWorkflowOverview(),
    ]);

    if (!profileData?.id) {
      navigate('/student/setup');
      return;
    }

    setProfile(profileData);
    setForm(profileData);
    setWorkflow(workflowData);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadProfileAndWorkflow();
      } catch (error) {
        setBanner({
          type: 'error',
          text: 'Unable to load your student workspace right now.',
        });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const existingReport = workflow?.final_report;
    if (!existingReport) {
      setReportForm(EMPTY_REPORT_FORM);
      return;
    }

    setReportForm({
      title: existingReport.title || '',
      summary: existingReport.summary || '',
      file: null,
      clearExistingFile: false,
    });
  }, [workflow?.final_report?.updated_at]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      skills: typeof form.skills === 'string'
        ? form.skills.split(',').map((item) => item.trim()).filter(Boolean)
        : form.skills,
    };

    const data = await api.updateStudent(payload);
    if (data?.message) {
      setProfile(data.data);
      setEditing(false);
      setBanner({ type: 'success', text: 'Profile updated successfully.' });
    } else {
      setBanner({
        type: 'error',
        text: buildMessage(data, 'Unable to update your profile.'),
      });
    }
    setSaving(false);
  };

  const handleLogbookSubmit = async (event) => {
    event.preventDefault();
    setLogbookSaving(true);

    const response = await api.saveStudentLogbook({
      ...logbookForm,
      week_number: Number(logbookForm.week_number),
    });

    if (response?.logbook) {
      setBanner({
        type: 'success',
        text: `Week ${response.logbook.week_number} logbook saved successfully.`,
      });
      setLogbookForm(EMPTY_LOGBOOK_FORM);
      const workflowData = await api.getStudentWorkflowOverview();
      setWorkflow(workflowData);
    } else {
      setBanner({
        type: 'error',
        text: buildMessage(response, 'Unable to save the weekly logbook.'),
      });
    }

    setLogbookSaving(false);
  };

  const handleFinalReportSubmit = async (event) => {
    event.preventDefault();
    setReportSaving(true);

    const formData = new FormData();
    formData.append('title', reportForm.title);
    formData.append('summary', reportForm.summary);
    if (reportForm.file) {
      formData.append('report_file', reportForm.file);
    }
    if (reportForm.clearExistingFile) {
      formData.append('clear_file', 'true');
    }

    const response = await api.saveStudentFinalReport(formData);
    if (response?.report) {
      setBanner({
        type: 'success',
        text: 'Final attachment report saved successfully.',
      });
      const workflowData = await api.getStudentWorkflowOverview();
      setWorkflow(workflowData);
    } else {
      setBanner({
        type: 'error',
        text: buildMessage(response, 'Unable to save the final report.'),
      });
    }

    setReportSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const logbooks = workflow?.weekly_logs || [];
  const gradeRecord = workflow?.grade_record;
  const currentReportFile = workflow?.final_report?.report_file;
  const completedWorkflowSteps = [
    Boolean(workflow?.placement?.organization_name),
    logbooks.length > 0,
    Boolean(workflow?.final_report),
    Boolean(workflow?.industrial_report_submitted),
    (workflow?.university_assessments?.length || 0) >= 2,
  ].filter(Boolean).length;
  const workflowProgressPercent = Math.round((completedWorkflowSteps / 5) * 100);

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="sidebar-brand"><span>I</span> IAMS</div>
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {profile?.first_name?.[0]}
            {profile?.last_name?.[0]}
          </div>
          <h3>{profile?.first_name} {profile?.last_name}</h3>
          <span className="role-badge">Student</span>
        </div>
        <div className="profile-meta">
          <div className="meta-item">
            <span>ID</span>
            <p>{profile?.student_id}</p>
          </div>
          <div className="meta-item">
            <span>Department</span>
            <p>{profile?.department}</p>
          </div>
          <div className="meta-item">
            <span>Year</span>
            <p>Year {profile?.year_of_study}</p>
          </div>
          <div className="meta-item">
            <span>Status</span>
            <p className={profile?.is_placed ? 'placed' : 'unplaced'}>
              {profile?.is_placed ? 'Placed' : 'Awaiting Placement'}
            </p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      <main className="profile-main">
        <div className="profile-main-header">
          <h1>My Profile</h1>
          <button className="edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {banner && <div className={`profile-banner ${banner.type}`}>{banner.text}</div>}

        <div className="section-switcher">
          <button
            className={workflowPanel === 'all' ? 'active' : ''}
            onClick={() => setWorkflowPanel('all')}
          >
            Show All
          </button>
          <button
            className={workflowPanel === 'progress' ? 'active' : ''}
            onClick={() => setWorkflowPanel('progress')}
          >
            Progress
          </button>
          <button
            className={workflowPanel === 'logbooks' ? 'active' : ''}
            onClick={() => setWorkflowPanel('logbooks')}
          >
            Logbooks
          </button>
          <button
            className={workflowPanel === 'report' ? 'active' : ''}
            onClick={() => setWorkflowPanel('report')}
          >
            Final Report
          </button>
          <button
            className={workflowPanel === 'grades' ? 'active' : ''}
            onClick={() => setWorkflowPanel('grades')}
          >
            Grades
          </button>
        </div>

        <NotificationPanel
          title="Placement Notifications"
          subtitle="Track whether you have been placed and view the latest placement update."
          items={profile?.notifications || []}
        />

        {!editing ? (
          <div className="profile-view">
            <div className="view-section">
              <h3>Personal Information</h3>
              <div className="view-grid">
                <div className="view-item"><label>First Name</label><p>{profile?.first_name}</p></div>
                <div className="view-item"><label>Last Name</label><p>{profile?.last_name}</p></div>
                <div className="view-item"><label>Student ID</label><p>{profile?.student_id}</p></div>
                <div className="view-item"><label>Department</label><p>{profile?.department}</p></div>
                <div className="view-item"><label>Year of Study</label><p>Year {profile?.year_of_study}</p></div>
                <div className="view-item"><label>Assigned Organization</label><p>{profile?.assigned_organization_name || 'Not assigned yet'}</p></div>
              </div>
            </div>

            <div className="view-section">
              <h3>Attachment Preferences</h3>
              <div className="view-grid">
                <div className="view-item"><label>Project Type</label><p>{formatLabel(profile?.preferred_project_type)}</p></div>
                <div className="view-item"><label>Preferred Location</label><p>{formatLabel(profile?.preferred_location)}</p></div>
                <div className="view-item"><label>Match Source</label><p>{formatLabel(profile?.match_source)}</p></div>
              </div>
            </div>

            <div className="view-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {profile?.skills?.length
                  ? profile.skills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))
                  : <p className="no-skills">No skills added yet.</p>}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <div className="view-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={form.first_name || ''}
                    onChange={(event) => setForm({ ...form, first_name: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={form.last_name || ''}
                    onChange={(event) => setForm({ ...form, last_name: event.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={form.department || ''}
                  onChange={(event) => setForm({ ...form, department: event.target.value })}
                />
              </div>
            </div>

            <div className="view-section">
              <h3>Preferences</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Project Type</label>
                  <select
                    value={form.preferred_project_type || ''}
                    onChange={(event) => setForm({ ...form, preferred_project_type: event.target.value })}
                  >
                    <option value="web_development">Web Development</option>
                    <option value="mobile_development">Mobile Development</option>
                    <option value="data_science">Data Science</option>
                    <option value="networking">Networking</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="software_engineering">Software Engineering</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Preferred Location</label>
                  <select
                    value={form.preferred_location || ''}
                    onChange={(event) => setForm({ ...form, preferred_location: event.target.value })}
                  >
                    <option value="gaborone">Gaborone</option>
                    <option value="francistown">Francistown</option>
                    <option value="maun">Maun</option>
                    <option value="kasane">Kasane</option>
                    <option value="serowe">Serowe</option>
                    <option value="palapye">Palapye</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Skills <span className="label-hint">(comma separated)</span></label>
                <input
                  type="text"
                  value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills || ''}
                  onChange={(event) => setForm({ ...form, skills: event.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="profile-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        <div className="profile-view workflow-stack">
          {(workflowPanel === 'all' || workflowPanel === 'progress') && (
          <div className="view-section">
            <h3>Release 2 Progress</h3>
            <div className="progress-meter">
              <div className="progress-meter-top">
                <strong>{workflowProgressPercent}% complete</strong>
                <span>{completedWorkflowSteps}/5 workflow milestones</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${workflowProgressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="view-grid">
              <div className="view-item">
                <label>Attachment Organization</label>
                <p>{workflow?.placement?.organization_name || 'Awaiting placement'}</p>
              </div>
              <div className="view-item">
                <label>Weekly Logbooks</label>
                <p>{logbooks.length} submitted</p>
              </div>
              <div className="view-item">
                <label>Final Report</label>
                <p>{workflow?.final_report ? 'Submitted' : 'Pending'}</p>
              </div>
              <div className="view-item">
                <label>Industrial Supervisor Report</label>
                <p>{workflow?.industrial_report_submitted ? 'Submitted' : 'Pending'}</p>
              </div>
              <div className="view-item">
                <label>University Assessments</label>
                <p>{workflow?.university_assessments?.length || 0} of 2</p>
              </div>
              <div className="view-item">
                <label>Current Final Grade</label>
                <p>{formatGrade(gradeRecord?.final_score)}</p>
              </div>
            </div>
            <p className="workflow-note">
              Grade weighting uses the Release 2 assumption of 70% university supervisor assessments and 30% industrial supervisor report.
            </p>
          </div>
          )}

          {(workflowPanel === 'all' || workflowPanel === 'logbooks') && (
          <div className="view-section">
            <h3>Weekly Logbook Submission</h3>
            {!workflow?.can_submit && (
              <p className="workflow-note">
                Weekly logbooks unlock after your placement has been confirmed by the coordinator.
              </p>
            )}

            {workflow?.can_submit && (
              <form onSubmit={handleLogbookSubmit} className="profile-edit-form compact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Week Number</label>
                    <input
                      type="number"
                      min="1"
                      value={logbookForm.week_number}
                      onChange={(event) => setLogbookForm({
                        ...logbookForm,
                        week_number: event.target.value,
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Log Title</label>
                    <input
                      type="text"
                      value={logbookForm.title}
                      onChange={(event) => setLogbookForm({
                        ...logbookForm,
                        title: event.target.value,
                      })}
                      placeholder="Example: Week 3 progress summary"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Highlights</label>
                  <textarea
                    rows="3"
                    value={logbookForm.highlights}
                    onChange={(event) => setLogbookForm({
                      ...logbookForm,
                      highlights: event.target.value,
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tasks Completed</label>
                  <textarea
                    rows="3"
                    value={logbookForm.tasks_completed}
                    onChange={(event) => setLogbookForm({
                      ...logbookForm,
                      tasks_completed: event.target.value,
                    })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Challenges</label>
                    <textarea
                      rows="3"
                      value={logbookForm.challenges}
                      onChange={(event) => setLogbookForm({
                        ...logbookForm,
                        challenges: event.target.value,
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Next Steps</label>
                    <textarea
                      rows="3"
                      value={logbookForm.next_steps}
                      onChange={(event) => setLogbookForm({
                        ...logbookForm,
                        next_steps: event.target.value,
                      })}
                    />
                  </div>
                </div>
                <button type="submit" className="profile-btn" disabled={logbookSaving}>
                  {logbookSaving ? 'Saving Logbook...' : 'Save Weekly Logbook'}
                </button>
              </form>
            )}

            <div className="workflow-entry-list">
              {logbooks.length ? logbooks.map((entry) => (
                <article key={entry.id} className="workflow-entry">
                  <div className="workflow-entry-header">
                    <div>
                      <h4>Week {entry.week_number}</h4>
                      <p>{entry.title || 'Weekly Logbook Entry'}</p>
                    </div>
                    <span className="role-badge">Updated {new Date(entry.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="workflow-entry-body">
                    <p><strong>Highlights:</strong> {entry.highlights}</p>
                    <p><strong>Tasks:</strong> {entry.tasks_completed}</p>
                    {entry.challenges && <p><strong>Challenges:</strong> {entry.challenges}</p>}
                    {entry.next_steps && <p><strong>Next Steps:</strong> {entry.next_steps}</p>}
                  </div>
                </article>
              )) : (
                <p className="workflow-note">No weekly logbooks submitted yet.</p>
              )}
            </div>
          </div>
          )}

          {(workflowPanel === 'all' || workflowPanel === 'report') && (
          <div className="view-section">
            <h3>Final Attachment Report</h3>
            {!workflow?.can_submit && (
              <p className="workflow-note">
                Your final attachment report can be uploaded after you receive a confirmed placement.
              </p>
            )}

            {workflow?.can_submit && (
              <form onSubmit={handleFinalReportSubmit} className="profile-edit-form compact-form">
                <div className="form-group">
                  <label>Report Title</label>
                  <input
                    type="text"
                    value={reportForm.title}
                    onChange={(event) => setReportForm({ ...reportForm, title: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Executive Summary</label>
                  <textarea
                    rows="4"
                    value={reportForm.summary}
                    onChange={(event) => setReportForm({ ...reportForm, summary: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Upload Report File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setReportForm({
                      ...reportForm,
                      file: event.target.files?.[0] || null,
                    })}
                  />
                </div>
                {workflow?.final_report?.report_file && (
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={reportForm.clearExistingFile}
                      onChange={(event) => setReportForm({
                        ...reportForm,
                        clearExistingFile: event.target.checked,
                      })}
                    />
                    Remove the currently uploaded file when saving
                  </label>
                )}
                <button type="submit" className="profile-btn" disabled={reportSaving}>
                  {reportSaving ? 'Saving Report...' : 'Save Final Report'}
                </button>
              </form>
            )}

            {workflow?.final_report ? (
              <article className="workflow-entry">
                <div className="workflow-entry-header">
                  <div>
                    <h4>{workflow.final_report.title}</h4>
                    <p>Submitted {new Date(workflow.final_report.updated_at).toLocaleString()}</p>
                  </div>
                  <span className="role-badge">Submitted</span>
                </div>
                <div className="workflow-entry-body">
                  <p>{workflow.final_report.summary}</p>
                  {currentReportFile && (
                    <p>
                      <a
                        className="workflow-link"
                        href={api.resolveMediaUrl(currentReportFile)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open uploaded file: {workflow.final_report.report_file_name}
                      </a>
                    </p>
                  )}
                </div>
              </article>
            ) : (
              <p className="workflow-note">No final attachment report has been submitted yet.</p>
            )}
          </div>
          )}

          {(workflowPanel === 'all' || workflowPanel === 'grades') && (
          <div className="view-section">
            <h3>Assessment and Grade Tracking</h3>
            <div className="view-grid">
              <div className="view-item">
                <label>University Assessment Average</label>
                <p>{formatGrade(gradeRecord?.university_average)}</p>
              </div>
              <div className="view-item">
                <label>Industrial Score</label>
                <p>{formatGrade(gradeRecord?.industrial_score)}</p>
              </div>
              <div className="view-item">
                <label>Grade Status</label>
                <p>{formatStatus(gradeRecord?.status)}</p>
              </div>
            </div>
            <div className="workflow-entry-list">
              {workflow?.university_assessments?.length ? workflow.university_assessments.map((assessment) => (
                <article key={assessment.id} className="workflow-entry">
                  <div className="workflow-entry-header">
                    <div>
                      <h4>Assessment {assessment.assessment_number}</h4>
                      <p>
                        Score {formatGrade(assessment.score)}
                        {assessment.visit_date ? ` on ${assessment.visit_date}` : ''}
                      </p>
                    </div>
                    <span className="role-badge">{assessment.supervisor_name}</span>
                  </div>
                  {assessment.comments && (
                    <div className="workflow-entry-body">
                      <p>{assessment.comments}</p>
                    </div>
                  )}
                </article>
              )) : (
                <p className="workflow-note">No university supervisor assessments have been posted yet.</p>
              )}
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
