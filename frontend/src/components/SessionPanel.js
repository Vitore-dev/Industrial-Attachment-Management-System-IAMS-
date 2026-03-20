import { useAuth } from '../context/AuthContext';
import { formatRole } from '../context/AuthContext';

function SessionPanel({ currentUser, isLoadingUser }) {
  const { formatDateTime, isSubmitting, logout, tokens } = useAuth();

  return (
    <div className="session-panel">
      <div className="session-header">
        <div>
          <p className="session-label">Current session</p>
          <h2>{currentUser ? currentUser.username : 'Not signed in'}</h2>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={logout}
          disabled={!tokens || isSubmitting}
        >
          Logout
        </button>
      </div>

      {isLoadingUser ? (
        <p className="session-copy">Loading user profile...</p>
      ) : currentUser ? (
        <dl className="session-details">
          <div>
            <dt>Email</dt>
            <dd>{currentUser.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{formatRole(currentUser.role)}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{currentUser.phone_number || 'Not provided'}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd>{currentUser.id}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDateTime(currentUser.created_at)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDateTime(currentUser.updated_at)}</dd>
          </div>
        </dl>
      ) : (
        <p className="session-copy">No account data loaded.</p>
      )}
    </div>
  );
}

export default SessionPanel;
