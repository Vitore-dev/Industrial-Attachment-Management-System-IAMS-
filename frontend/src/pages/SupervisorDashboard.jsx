import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

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

const formatRole = (role) => {
  if (!role) return 'Supervisor';
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export default function SupervisorDashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const roleLabel = formatRole(user?.role);

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
            <span>Member Since</span>
            <p>{formatDate(user?.created_at)}</p>
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
          <h1>Supervisor Portal</h1>
        </div>

        <div className="profile-view">
          <div className="view-section">
            <h3>Account Overview</h3>
            <div className="view-grid">
              <div className="view-item">
                <label>Role</label>
                <p>{roleLabel}</p>
              </div>
              <div className="view-item">
                <label>Username</label>
                <p>{user?.username || 'N/A'}</p>
              </div>
              <div className="view-item">
                <label>Email</label>
                <p>{user?.email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="view-section">
            <h3>Access Status</h3>
            <div className="view-grid">
              <div className="view-item">
                <label>Authentication</label>
                <p>Signed in with active account access</p>
              </div>
              <div className="view-item">
                <label>Portal Access</label>
                <p>{roleLabel}</p>
              </div>
              <div className="view-item">
                <label>Profile Status</label>
                <p>Available</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
