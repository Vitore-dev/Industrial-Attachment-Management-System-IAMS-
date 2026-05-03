import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CoordinatorWorkflowTab from '../components/CoordinatorWorkflowTab';
import api from '../services/api';
import './Dashboard.css';

const EMPTY_MATCHING_DATA = { students: [], summary: {} };

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const formatLabel = (value) => (value ? value.replace(/_/g, ' ') : 'N/A');

const buildMessage = (payload, fallback) => {
  if (!payload || typeof payload !== 'object') return fallback;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.detail === 'string' && payload.detail.trim()) return payload.detail;
  return fallback;
};

export default function CoordinatorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [matchingData, setMatchingData] = useState(EMPTY_MATCHING_DATA);
  const [workflowOverview, setWorkflowOverview] = useState(null);
  const [workflowStudents, setWorkflowStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [busyKey, setBusyKey] = useState('');
  const [runningMatch, setRunningMatch] = useState(false);
  const [remindersBusy, setRemindersBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [pageError, setPageError] = useState('');
  const [overrideForm, setOverrideForm] = useState({});
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [organizationStatusFilter, setOrganizationStatusFilter] = useState('all');
  const [matchingSearch, setMatchingSearch] = useState('');

  const approvedOrganizations = organizations.filter((org) => org.is_approved);
  const openOrganizations = approvedOrganizations.filter(
    (org) => (org.remaining_slots ?? 0) > 0
  );

  const loadCoreData = async () => {
    const [dash, studs, orgs] = await Promise.all([
      api.getDashboard(),
      api.listStudents(),
      api.listOrganizations(),
    ]);

    setData(dash);
    setStudents(extractList(studs));
    setOrganizations(extractList(orgs));
  };

  const loadMatchingData = async () => {
    const [assignmentPayload, suggestionPayload] = await Promise.all([
      api.getMatchAssignments(),
      api.getMatchSuggestions(),
    ]);

    setAssignments(extractList(assignmentPayload));
    setMatchingData(
      suggestionPayload?.students
        ? suggestionPayload
        : EMPTY_MATCHING_DATA
    );
  };

  const loadWorkflowData = async () => {
    const [overviewPayload, studentsPayload] = await Promise.all([
      api.getCoordinatorWorkflowOverview(),
      api.getCoordinatorWorkflowStudents(),
    ]);

    setWorkflowOverview(overviewPayload);
    setWorkflowStudents(extractList(studentsPayload));
  };

  const refreshAllData = async () => {
    await Promise.all([loadCoreData(), loadMatchingData(), loadWorkflowData()]);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setPageError('');
        await refreshAllData();
      } catch (error) {
        setPageError('Unable to load coordinator data right now.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const updateOverrideForm = (studentId, key, value) => {
    setOverrideForm((current) => ({
      ...current,
      [studentId]: {
        organizationId: current[studentId]?.organizationId || '',
        notes: current[studentId]?.notes || '',
        [key]: value,
      },
    }));
  };

  const handleApprove = async (id) => {
    setBusyKey(`approve-${id}`);
    const response = await api.approveOrganization(id);
    if (response.message) {
      await loadCoreData();
      setNotice({ type: 'success', text: 'Organization approved successfully.' });
    } else {
      setNotice({
        type: 'error',
        text: buildMessage(response, 'Unable to approve organization.'),
      });
    }
    setBusyKey('');
  };

  const handleRunMatching = async () => {
    setRunningMatch(true);
    const response = await api.runMatching();
    if (response.summary) {
      const summary = response.summary;
      setNotice({
        type: 'success',
        text:
          `Matching engine ran for ${summary.students_processed} student(s). ` +
          `Created ${summary.suggestions_created} suggestion(s) with ` +
          `${summary.recommended_matches} recommended match(es).`,
      });
      await refreshAllData();
    } else {
      setNotice({
        type: 'error',
        text: buildMessage(response, 'Unable to run the matching engine.'),
      });
    }
    setRunningMatch(false);
  };

  const handleConfirmSuggestion = async (suggestionId) => {
    setBusyKey(`confirm-${suggestionId}`);
    const response = await api.confirmMatch(suggestionId);
    if (response.assignment) {
      const notification = response.notification?.message
        ? ` ${response.notification.message}`
        : '';
      setNotice({
        type: 'success',
        text: `Match confirmed for ${response.assignment.student_name}.${notification}`,
      });
      await refreshAllData();
    } else {
      setNotice({
        type: 'error',
        text: buildMessage(response, 'Unable to confirm match.'),
      });
    }
    setBusyKey('');
  };

  const handleOverride = async (studentId) => {
    const form = overrideForm[studentId] || {};
    if (!form.organizationId) {
      setNotice({
        type: 'error',
        text: 'Select an approved organization before applying a manual override.',
      });
      return;
    }

    setBusyKey(`override-${studentId}`);
    const response = await api.overrideMatch({
      student_id: studentId,
      organization_id: Number(form.organizationId),
      notes: form.notes || '',
    });

    if (response.assignment) {
      const notification = response.notification?.message
        ? ` ${response.notification.message}`
        : '';
      setNotice({
        type: 'success',
        text: `Manual override saved for ${response.assignment.student_name}.${notification}`,
      });
      setOverrideForm((current) => ({
        ...current,
        [studentId]: { organizationId: '', notes: '' },
      }));
      await refreshAllData();
    } else {
      setNotice({
        type: 'error',
        text: buildMessage(response, 'Unable to apply manual override.'),
      });
    }
    setBusyKey('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSendReminders = async () => {
    setRemindersBusy(true);
    const response = await api.sendWorkflowReminders();
    if (response.summary) {
      const summary = response.summary;
      setNotice({
        type: 'success',
        text:
          `Workflow reminders processed. Students pending submissions: ${summary.student_submission_pending}. ` +
          `Industrial reports pending: ${summary.industrial_reports_pending}. ` +
          `University assessments pending: ${summary.university_assessments_pending}.`,
      });
      await loadWorkflowData();
    } else {
      setNotice({
        type: 'error',
        text: buildMessage(response, 'Unable to send workflow reminders.'),
      });
    }
    setRemindersBusy(false);
  };

  const handleDownloadCsv = async () => {
    setExportBusy(true);
    const response = await api.downloadGradesCsv();
    if (!response?.success) {
      setNotice({
        type: 'error',
        text: buildMessage(response, 'Unable to export grades as CSV.'),
      });
    }
    setExportBusy(false);
  };

  const handleDownloadPdf = async () => {
    setExportBusy(true);
    const response = await api.downloadGradesPdf();
    if (!response?.success) {
      setNotice({
        type: 'error',
        text: buildMessage(response, 'Unable to export grades as PDF.'),
      });
    }
    setExportBusy(false);
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const matchingStats = data?.matching_statistics || {};
  const normalizedStudentSearch = studentSearch.trim().toLowerCase();
  const normalizedOrganizationSearch = organizationSearch.trim().toLowerCase();
  const normalizedMatchingSearch = matchingSearch.trim().toLowerCase();

  const filteredStudents = students.filter((student) => {
    const matchesSearch = !normalizedStudentSearch || [
      `${student.first_name} ${student.last_name}`,
      student.student_id,
      student.department,
      student.assigned_organization_name,
    ].some((value) => (value || '').toLowerCase().includes(normalizedStudentSearch));
    const matchesStatus = studentStatusFilter === 'all'
      || (studentStatusFilter === 'placed' && student.is_placed)
      || (studentStatusFilter === 'unplaced' && !student.is_placed);
    return matchesSearch && matchesStatus;
  });

  const filteredOrganizations = organizations.filter((organization) => {
    const matchesSearch = !normalizedOrganizationSearch || [
      organization.company_name,
      organization.industry,
      organization.location,
      organization.preferred_project_type,
    ].some((value) => (value || '').toLowerCase().includes(normalizedOrganizationSearch));
    const matchesStatus = organizationStatusFilter === 'all'
      || (organizationStatusFilter === 'approved' && organization.is_approved)
      || (organizationStatusFilter === 'pending' && !organization.is_approved);
    return matchesSearch && matchesStatus;
  });

  const filteredAssignments = assignments.filter((assignment) => {
    if (!normalizedMatchingSearch) return true;
    return [
      assignment.student_name,
      assignment.organization_name,
      assignment.source,
    ].some((value) => (value || '').toLowerCase().includes(normalizedMatchingSearch));
  });

  const filteredMatchingStudents = matchingData.students?.filter((entry) => {
    if (!normalizedMatchingSearch) return true;
    return [
      entry.student.name,
      entry.student.student_id,
      entry.student.department,
      ...(entry.suggestions || []).map((suggestion) => suggestion.organization_name),
    ].some((value) => (value || '').toLowerCase().includes(normalizedMatchingSearch));
  }) || [];

  return (
    <div className="dash-container">
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <span className="brand-hex">I</span>
          <span>IAMS</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <span>O</span> Overview
          </button>
          <button
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            <span>S</span> Students
          </button>
          <button
            className={activeTab === 'organizations' ? 'active' : ''}
            onClick={() => setActiveTab('organizations')}
          >
            <span>R</span> Organizations
          </button>
          <button
            className={activeTab === 'matching' ? 'active' : ''}
            onClick={() => setActiveTab('matching')}
          >
            <span>M</span> Matching
          </button>
          <button
            className={activeTab === 'release2' ? 'active' : ''}
            onClick={() => setActiveTab('release2')}
          >
            <span>R</span> Release 2
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <p>{user?.username}</p>
            <span>Coordinator</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Out</button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>
              {activeTab === 'overview'
                ? 'Dashboard Overview'
                : activeTab === 'students'
                  ? 'Students'
                  : activeTab === 'organizations'
                    ? 'Organizations'
                    : activeTab === 'matching'
                      ? 'Matching Engine'
                      : 'Release 2 Workflow'}
            </h1>
            <p>Industrial Attachment Management System</p>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {pageError && <div className="matching-banner error">{pageError}</div>}
        {notice && <div className={`matching-banner ${notice.type}`}>{notice.text}</div>}

        {activeTab === 'overview' && data && (
          <div className="dash-content">
            <div className="stats-grid">
              <button className="stat-card accent stat-card-button" onClick={() => setActiveTab('students')}>
                <div className="stat-icon">S</div>
                <div className="stat-value">{data.student_statistics?.total_student_profiles}</div>
                <div className="stat-label">Total Students</div>
              </button>
              <button className="stat-card stat-card-button" onClick={() => setActiveTab('organizations')}>
                <div className="stat-icon">O</div>
                <div className="stat-value">{data.organization_statistics?.total_organization_profiles}</div>
                <div className="stat-label">Total Organizations</div>
              </button>
              <button className="stat-card stat-card-button" onClick={() => setActiveTab('matching')}>
                <div className="stat-icon">M</div>
                <div className="stat-value">{matchingStats.confirmed_matches || 0}</div>
                <div className="stat-label">Confirmed Matches</div>
              </button>
              <button className="stat-card stat-card-button" onClick={() => setActiveTab('release2')}>
                <div className="stat-icon">P</div>
                <div className="stat-value">{workflowOverview?.workflow_statistics?.students_ready_for_grading || 0}</div>
                <div className="stat-label">Grades Ready</div>
              </button>
            </div>

            <div className="dash-tables">
              <div className="table-section">
                <h3>Recent Students</h3>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Department</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_students?.map((student, index) => (
                      <tr key={index}>
                        <td>{student.first_name} {student.last_name}</td>
                        <td><span className="badge">{student.student_id}</span></td>
                        <td>{student.department}</td>
                        <td>{new Date(student.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {data.recent_students?.length === 0 && (
                      <tr><td colSpan="4" className="empty">No students registered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-section">
                <h3>Recent Organizations</h3>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Industry</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_organizations?.map((organization, index) => (
                      <tr key={index}>
                        <td>{organization.company_name}</td>
                        <td>{formatLabel(organization.industry)}</td>
                        <td>{formatLabel(organization.location)}</td>
                        <td>
                          <span className={`status ${organization.is_approved ? 'approved' : 'pending'}`}>
                            {organization.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.recent_organizations?.length === 0 && (
                      <tr><td colSpan="4" className="empty">No organizations registered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="dash-content">
            <div className="table-section full">
              <div className="table-header">
                <h3>All Students ({filteredStudents.length})</h3>
                <div className="filter-toolbar">
                  <input
                    type="search"
                    className="filter-input"
                    placeholder="Search students, IDs, departments, or placements"
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                  />
                  <select
                    className="filter-select"
                    value={studentStatusFilter}
                    onChange={(event) => setStudentStatusFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="placed">Placed</option>
                    <option value="unplaced">Unplaced</option>
                  </select>
                </div>
              </div>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Project Preference</th>
                    <th>Location</th>
                    <th>Assigned Organization</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.first_name} {student.last_name}</td>
                      <td><span className="badge">{student.student_id}</span></td>
                      <td>{student.department}</td>
                      <td>Year {student.year_of_study}</td>
                      <td>{formatLabel(student.preferred_project_type)}</td>
                      <td>{formatLabel(student.preferred_location)}</td>
                      <td>{student.assigned_organization_name || 'Not assigned'}</td>
                      <td>
                        <span className={`status ${student.is_placed ? 'approved' : 'pending'}`}>
                          {student.is_placed ? 'Placed' : 'Unplaced'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan="8" className="empty">No students match the current filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'organizations' && (
          <div className="dash-content">
            <div className="table-section full">
              <div className="table-header">
                <h3>All Organizations ({filteredOrganizations.length})</h3>
                <div className="filter-toolbar">
                  <input
                    type="search"
                    className="filter-input"
                    placeholder="Search organizations, sectors, or locations"
                    value={organizationSearch}
                    onChange={(event) => setOrganizationSearch(event.target.value)}
                  />
                  <select
                    className="filter-select"
                    value={organizationStatusFilter}
                    onChange={(event) => setOrganizationStatusFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Max Students</th>
                    <th>Slots Left</th>
                    <th>Project Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((organization) => (
                    <tr key={organization.id}>
                      <td>{organization.company_name}</td>
                      <td>{formatLabel(organization.industry)}</td>
                      <td>{formatLabel(organization.location)}</td>
                      <td>{organization.max_students}</td>
                      <td>{organization.remaining_slots ?? organization.max_students}</td>
                      <td>{formatLabel(organization.preferred_project_type)}</td>
                      <td>
                        <span className={`status ${organization.is_approved ? 'approved' : 'pending'}`}>
                          {organization.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {!organization.is_approved && (
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(organization.id)}
                            disabled={busyKey === `approve-${organization.id}`}
                          >
                            {busyKey === `approve-${organization.id}` ? 'Saving...' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredOrganizations.length === 0 && (
                    <tr><td colSpan="8" className="empty">No organizations match the current filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'matching' && (
          <div className="dash-content">
            <div className="table-section full">
              <div className="matching-toolbar">
                <div>
                  <h3>Sprint 2 Matching Workflow</h3>
                  <p className="matching-subtitle">
                    Run the weighted scoring engine, review the top 3 suggestions per student,
                    confirm recommended matches, or apply a manual override.
                  </p>
                </div>
                <button
                  className="matching-btn"
                  onClick={handleRunMatching}
                  disabled={runningMatch}
                >
                  {runningMatch ? 'Running Engine...' : 'Run Matching Engine'}
                </button>
              </div>
              <div className="filter-toolbar top-gap">
                <input
                  type="search"
                  className="filter-input"
                  placeholder="Search students, suggestions, or confirmed matches"
                  value={matchingSearch}
                  onChange={(event) => setMatchingSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="stats-grid matching-stats-grid">
              <div className="stat-card accent">
                <div className="stat-icon">C</div>
                <div className="stat-value">{assignments.length}</div>
                <div className="stat-label">Confirmed Matches</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">T</div>
                <div className="stat-value">{matchingData.summary?.students_with_suggestions || 0}</div>
                <div className="stat-label">Students With Suggestions</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">P</div>
                <div className="stat-value">{matchingData.summary?.students_pending_match || 0}</div>
                <div className="stat-label">Students Pending Match</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">O</div>
                <div className="stat-value">{openOrganizations.length}</div>
                <div className="stat-label">Approved Orgs With Slots</div>
              </div>
            </div>

            <div className="table-section full">
              <div className="table-header">
                <h3>Confirmed Matches ({filteredAssignments.length})</h3>
              </div>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Organization</th>
                    <th>Source</th>
                    <th>Score</th>
                    <th>Matched Skills</th>
                    <th>Notification</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{assignment.student_name}</td>
                      <td>{assignment.organization_name}</td>
                      <td>{formatLabel(assignment.source)}</td>
                      <td>{assignment.score}</td>
                      <td>{assignment.matched_skills?.length ? assignment.matched_skills.join(', ') : 'No direct skill match'}</td>
                      <td>{assignment.notification_status}</td>
                    </tr>
                  ))}
                  {filteredAssignments.length === 0 && (
                    <tr><td colSpan="6" className="empty">No confirmed matches match the current search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="matching-grid">
              {filteredMatchingStudents.map((entry) => (
                <div className="matching-card" key={entry.student.id}>
                  <div className="matching-card-header">
                    <div>
                      <h3>{entry.student.name}</h3>
                      <p>
                        {entry.student.student_id} - {entry.student.department} -{' '}
                        {formatLabel(entry.student.preferred_project_type)} -{' '}
                        {formatLabel(entry.student.preferred_location)}
                      </p>
                    </div>
                    <span className="status pending">Pending</span>
                  </div>

                  <div className="matching-skills">
                    {entry.student.skills?.length
                      ? entry.student.skills.map((skill) => (
                          <span key={skill} className="skill-chip">{skill}</span>
                        ))
                      : <span className="matching-muted">No skills captured</span>}
                  </div>

                  {entry.suggestions?.length ? (
                    <div className="suggestion-list">
                      {entry.suggestions.map((suggestion) => (
                        <div className="suggestion-item" key={suggestion.id}>
                          <div className="suggestion-top">
                            <div>
                              <strong>{suggestion.organization_name}</strong>
                              <p>
                                {formatLabel(suggestion.organization_project_type)} -{' '}
                                {formatLabel(suggestion.organization_location)} -{' '}
                                {suggestion.organization_remaining_slots} slot(s) left
                              </p>
                            </div>
                            <div className="suggestion-actions">
                              {suggestion.is_recommended && (
                                <span className="recommended-pill">Recommended</span>
                              )}
                              <button
                                className="approve-btn"
                                onClick={() => handleConfirmSuggestion(suggestion.id)}
                                disabled={busyKey === `confirm-${suggestion.id}`}
                              >
                                {busyKey === `confirm-${suggestion.id}` ? 'Saving...' : 'Confirm'}
                              </button>
                            </div>
                          </div>

                          <div className="suggestion-meta">
                            <span className="badge">Rank #{suggestion.rank}</span>
                            <span className="badge">Score {suggestion.score}</span>
                            <span className="badge">
                              Skills +{suggestion.skill_match_points}
                            </span>
                            <span className="badge">
                              Project +{suggestion.project_type_points}
                            </span>
                            <span className="badge">
                              Location +{suggestion.location_points}
                            </span>
                          </div>

                          <p className="matching-muted">
                            {suggestion.matched_skills?.length
                              ? `Matched skills: ${suggestion.matched_skills.join(', ')}`
                              : 'No direct skill overlap on this suggestion.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="matching-muted">
                      No matching suggestions are available for this student yet.
                    </p>
                  )}

                  <div className="override-panel">
                    <h4>Manual Override</h4>
                    <select
                      value={overrideForm[entry.student.id]?.organizationId || ''}
                      onChange={(event) =>
                        updateOverrideForm(
                          entry.student.id,
                          'organizationId',
                          event.target.value
                        )
                      }
                    >
                      <option value="">Select approved organization</option>
                      {approvedOrganizations.map((organization) => (
                        <option key={organization.id} value={organization.id}>
                          {organization.company_name} ({organization.remaining_slots} slots left)
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Optional note for the override"
                      value={overrideForm[entry.student.id]?.notes || ''}
                      onChange={(event) =>
                        updateOverrideForm(entry.student.id, 'notes', event.target.value)
                      }
                    />
                    <button
                      className="matching-btn secondary"
                      onClick={() => handleOverride(entry.student.id)}
                      disabled={busyKey === `override-${entry.student.id}`}
                    >
                      {busyKey === `override-${entry.student.id}` ? 'Applying...' : 'Apply Override'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMatchingStudents.length === 0 && (
              <div className="table-section full">
                <p className="empty">
                  No matching cards match the current search.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'release2' && (
          <CoordinatorWorkflowTab
            workflowOverview={workflowOverview}
            workflowStudents={workflowStudents}
            remindersBusy={remindersBusy}
            exportBusy={exportBusy}
            onSendReminders={handleSendReminders}
            onDownloadCsv={handleDownloadCsv}
            onDownloadPdf={handleDownloadPdf}
          />
        )}
      </main>
    </div>
  );
}
