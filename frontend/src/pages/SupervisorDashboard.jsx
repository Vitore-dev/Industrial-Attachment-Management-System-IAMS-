import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const ROLE_CONTENT = {
  university_supervisor: {
    title: 'University Supervisor',
    summary:
      'Your account is active and separated from coordinator-only areas. This portal gives you a role-specific entry point for the system.',
    responsibilities: [
      'Access the platform under the correct supervisor role.',
      'Review your account information without entering coordinator pages.',
      'Use this portal as the base for supervisor workflows added in later sprints.',
    ],
  },
  industrial_supervisor: {
    title: 'Industrial Supervisor',
    summary:
      'Your account is active and separated from coordinator-only areas. This portal gives you a role-specific entry point for the system.',
    responsibilities: [
      'Access the platform under the correct supervisor role.',
      'Review your account information without entering coordinator pages.',
      'Use this portal as the base for supervisor workflows added in later sprints.',
    ],
  },
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'N/A'
    : parsed.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

export default function SupervisorDashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const content = ROLE_CONTENT[user?.role] || {
    title: 'Supervisor',
    summary: 'Your account is active.',
    responsibilities: [],
  };

  const initials = user?.username
    ? user.username
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    : 'SU';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner"></div>
        <p>Loading supervisor portal...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="sidebar-brand">
          <span>I</span> IAMS
        </div>
        <div className="profile-avatar-section">
          <div className="profile-avatar">{initials}</div>
          <h3>{user?.username}</h3>
          <span className="role-badge">{content.title}</span>
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
            <span>Member Since</span>
            <p>{formatDate(user?.created_at)}</p>
          </div>
          <div className="meta-item">
            <span>Status</span>
            <p className="placed">Role active</p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      <main className="profile-main">
        <div className="profile-main-header">
          <h1>Supervisor Portal</h1>
        </div>

        <div className="profile-view">
          <div className="view-section">
            <h3>Account Overview</h3>
            <div className="view-grid">
              <div className="view-item">
                <label>Role</label>
                <p>{content.title}</p>
              </div>
              <div className="view-item">
                <label>Username</label>
                <p>{user?.username}</p>
              </div>
              <div className="view-item">
                <label>Email</label>
                <p>{user?.email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="view-section">
            <h3>Current Access</h3>
            <p className="no-skills">{content.summary}</p>
            <div className="skills-list" style={{ marginTop: '16px' }}>
              {content.responsibilities.map((item) => (
                <span key={item} className="skill-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="view-section">
            <h3>Role Notes</h3>
            <div className="view-grid">
              <div className="view-item">
                <label>Role Isolation</label>
                <p>Supervisor accounts no longer redirect into coordinator-only pages.</p>
              </div>
              <div className="view-item">
                <label>Authentication</label>
                <p>JWT sign-in and account loading are active for this role.</p>
              </div>
              <div className="view-item">
                <label>Next Sprint Base</label>
                <p>This portal is ready for future supervisor workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
