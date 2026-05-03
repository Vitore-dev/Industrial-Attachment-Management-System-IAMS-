import { useState } from 'react';

const formatGrade = (value) => {
  if (value === null || value === undefined || value === '') return 'Pending';
  return Number(value).toFixed(2);
};

const formatStatus = (value) => {
  if (!value) return 'Pending';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function CoordinatorWorkflowTab({
  workflowOverview,
  workflowStudents,
  remindersBusy,
  exportBusy,
  onSendReminders,
  onDownloadCsv,
  onDownloadPdf,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const workflowStats = workflowOverview?.workflow_statistics || {};
  const pendingWork = workflowOverview?.pending_work || {};

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredStudents = workflowStudents.filter((student) => {
    const matchesSearch = !normalizedSearch || [
      student.student_name,
      student.student_id,
      student.organization,
    ].some((value) => (value || '').toLowerCase().includes(normalizedSearch));

    const matchesStatus = statusFilter === 'all' || student.grade_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dash-content">
      <div className="table-section full">
        <div className="matching-toolbar">
          <div>
            <h3>Release 2 Workflow Control</h3>
            <p className="matching-subtitle">
              Monitor student submissions, supervisor assessments, grade readiness,
              and trigger reminder or export actions from one place.
            </p>
          </div>
          <div className="workflow-actions">
            <button
              className="matching-btn"
              onClick={onSendReminders}
              disabled={remindersBusy}
            >
              {remindersBusy ? 'Sending Reminders...' : 'Send Reminders'}
            </button>
            <button
              className="matching-btn secondary-action"
              onClick={onDownloadCsv}
              disabled={exportBusy}
            >
              {exportBusy ? 'Preparing...' : 'Export CSV'}
            </button>
            <button
              className="matching-btn secondary-action"
              onClick={onDownloadPdf}
              disabled={exportBusy}
            >
              {exportBusy ? 'Preparing...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid matching-stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon">L</div>
          <div className="stat-value">{workflowStats.weekly_logs_submitted || 0}</div>
          <div className="stat-label">Weekly Logbooks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">F</div>
          <div className="stat-value">{workflowStats.final_reports_submitted || 0}</div>
          <div className="stat-label">Final Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">I</div>
          <div className="stat-value">{workflowStats.industrial_reports_submitted || 0}</div>
          <div className="stat-label">Industrial Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">G</div>
          <div className="stat-value">{workflowStats.students_ready_for_grading || 0}</div>
          <div className="stat-label">Grades Ready</div>
        </div>
      </div>

      <div className="dash-tables">
        <div className="table-section">
          <h3>Pending Submission Work</h3>
          <table className="dash-table">
            <tbody>
              <tr>
                <th>Students missing final reports</th>
                <td>{pendingWork.students_missing_final_report || 0}</td>
              </tr>
              <tr>
                <th>Students missing industrial reports</th>
                <td>{pendingWork.students_missing_industrial_report || 0}</td>
              </tr>
              <tr>
                <th>Students missing university assessments</th>
                <td>{pendingWork.students_missing_university_assessment || 0}</td>
              </tr>
              <tr>
                <th>Partial grade records</th>
                <td>{workflowStats.students_with_partial_grades || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-section">
          <h3>Coverage Snapshot</h3>
          <table className="dash-table">
            <tbody>
              <tr>
                <th>Placed students</th>
                <td>{workflowStats.placed_students || 0}</td>
              </tr>
              <tr>
                <th>Students with logbooks</th>
                <td>{workflowStats.students_with_logs || 0}</td>
              </tr>
              <tr>
                <th>University assessments submitted</th>
                <td>{workflowStats.university_assessments_submitted || 0}</td>
              </tr>
              <tr>
                <th>Ready for grading</th>
                <td>{workflowStats.students_ready_for_grading || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section full">
        <div className="table-header">
          <div>
            <h3>Release 2 Student Tracking ({filteredStudents.length})</h3>
            <p className="table-note">
              Final grades use the current Release 2 weighting assumption: 70% university assessments, 30% industrial report.
            </p>
          </div>
          <div className="filter-toolbar">
            <input
              type="search"
              className="filter-input"
              placeholder="Search by student or organization"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All grades</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Organization</th>
              <th>Logs</th>
              <th>Final Report</th>
              <th>Industrial</th>
              <th>University Avg</th>
              <th>Final Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.student_id}>
                <td>
                  {student.student_name}
                  <div className="table-secondary">{student.student_id}</div>
                </td>
                <td>{student.organization}</td>
                <td>{student.weekly_logs_submitted}</td>
                <td>{student.final_report_submitted}</td>
                <td>{student.industrial_score || 'Pending'}</td>
                <td>{student.university_average || 'Pending'}</td>
                <td>{formatGrade(student.final_score)}</td>
                <td>
                  <span className={`status ${student.grade_status}`}>
                    {formatStatus(student.grade_status)}
                  </span>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">
                  No students match the current Release 2 filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
