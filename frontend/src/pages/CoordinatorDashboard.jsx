import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

export default function CoordinatorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.getDashboard(),
      api.listStudents(),
      api.listOrganizations(),
    ]).then(([dash, studs, orgs]) => {
      setData(dash);
      setStudents(Array.isArray(studs) ? studs : studs.results || []);
      setOrganizations(Array.isArray(orgs) ? orgs : orgs.results || []);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id) => {
    await api.approveOrganization(id);
    const orgs = await api.listOrganizations();
    setOrganizations(Array.isArray(orgs) ? orgs : orgs.results || []);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="dash-container">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <span className="brand-hex">⬡</span>
          <span>IAMS</span>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <span>◈</span> Overview
          </button>
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
            <span>◉</span> Students
          </button>
          <button className={activeTab === 'organizations' ? 'active' : ''} onClick={() => setActiveTab('organizations')}>
            <span>◎</span> Organizations
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <p>{user?.username}</p>
            <span>Coordinator</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>↪</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'students' ? 'Students' : 'Organizations'}</h1>
            <p>Industrial Attachment Management System</p>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && data && (
          <div className="dash-content">
            <div className="stats-grid">
              <div className="stat-card accent">
                <div className="stat-icon">◉</div>
                <div className="stat-value">{data.student_statistics?.total_student_profiles}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">◎</div>
                <div className="stat-value">{data.organization_statistics?.total_organization_profiles}</div>
                <div className="stat-label">Total Organizations</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-value">{data.student_statistics?.students_placed}</div>
                <div className="stat-label">Students Placed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{data.organization_statistics?.pending_organizations}</div>
                <div className="stat-label">Pending Approvals</div>
              </div>
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
                    {data.recent_students?.map((s, i) => (
                      <tr key={i}>
                        <td>{s.first_name} {s.last_name}</td>
                        <td><span className="badge">{s.student_id}</span></td>
                        <td>{s.department}</td>
                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
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
                    {data.recent_organizations?.map((o, i) => (
                      <tr key={i}>
                        <td>{o.company_name}</td>
                        <td>{o.industry?.replace('_', ' ')}</td>
                        <td>{o.location}</td>
                        <td>
                          <span className={`status ${o.is_approved ? 'approved' : 'pending'}`}>
                            {o.is_approved ? 'Approved' : 'Pending'}
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

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="dash-content">
            <div className="table-section full">
              <div className="table-header">
                <h3>All Students ({students.length})</h3>
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.first_name} {s.last_name}</td>
                      <td><span className="badge">{s.student_id}</span></td>
                      <td>{s.department}</td>
                      <td>Year {s.year_of_study}</td>
                      <td>{s.preferred_project_type?.replace('_', ' ')}</td>
                      <td>{s.preferred_location}</td>
                      <td>
                        <span className={`status ${s.is_placed ? 'approved' : 'pending'}`}>
                          {s.is_placed ? 'Placed' : 'Unplaced'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan="7" className="empty">No students registered yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="dash-content">
            <div className="table-section full">
              <div className="table-header">
                <h3>All Organizations ({organizations.length})</h3>
              </div>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Max Students</th>
                    <th>Project Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((o) => (
                    <tr key={o.id}>
                      <td>{o.company_name}</td>
                      <td>{o.industry?.replace('_', ' ')}</td>
                      <td>{o.location}</td>
                      <td>{o.max_students}</td>
                      <td>{o.preferred_project_type?.replace('_', ' ')}</td>
                      <td>
                        <span className={`status ${o.is_approved ? 'approved' : 'pending'}`}>
                          {o.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {!o.is_approved && (
                          <button className="approve-btn" onClick={() => handleApprove(o.id)}>
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && (
                    <tr><td colSpan="7" className="empty">No organizations registered yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}