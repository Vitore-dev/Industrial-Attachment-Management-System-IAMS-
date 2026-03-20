import { useAuth, formatRole } from '../context/AuthContext';

function AccountPage() {
  const { currentUser, formatDateTime, isLoadingUser, loadCurrentUser } = useAuth();

  return (
    <div className="protected-layout">
      <div className="protected-header">
        <div>
          <p className="session-label">{formatRole(currentUser.role)}</p>
          <h2>Account data</h2>
        </div>
        <div className="protected-actions">
          <button type="button" className="secondary-button" onClick={loadCurrentUser}>
            {isLoadingUser ? 'Refreshing...' : 'Refresh from backend'}
          </button>
        </div>
      </div>

      <div className="protected-grid">
        <article className="protected-card">
          <span className="feature-title">Username</span>
          <strong>{currentUser.username}</strong>
        </article>
        <article className="protected-card">
          <span className="feature-title">Email</span>
          <strong>{currentUser.email}</strong>
        </article>
        <article className="protected-card">
          <span className="feature-title">Role</span>
          <strong>{formatRole(currentUser.role)}</strong>
        </article>
        <article className="protected-card">
          <span className="feature-title">Phone</span>
          <strong>{currentUser.phone_number || 'Not provided'}</strong>
        </article>
        <article className="protected-card">
          <span className="feature-title">Created at</span>
          <strong>{formatDateTime(currentUser.created_at)}</strong>
        </article>
        <article className="protected-card">
          <span className="feature-title">Updated at</span>
          <strong>{formatDateTime(currentUser.updated_at)}</strong>
        </article>
      </div>
    </div>
  );
}

export default AccountPage;
