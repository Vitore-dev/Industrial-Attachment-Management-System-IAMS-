import { useAuth } from '../context/AuthContext';

function SessionPanel({ currentUser }) {
  const {
    formatDateTime,
    getProfileCompletion,
    getUserDisplayName,
    isSubmitting,
    logout,
  } = useAuth();
  const completion = currentUser ? getProfileCompletion(currentUser) : null;

  return (
    <aside className="session-panel">
      <div className="session-header">
        <div>
          <p className="session-label">Current session</p>
          <h2>{currentUser ? getUserDisplayName(currentUser) : 'Local browser storage'}</h2>
        </div>
        {currentUser ? (
          <button
            type="button"
            className="secondary-button"
            onClick={logout}
            disabled={isSubmitting}
          >
            Logout
          </button>
        ) : null}
      </div>

      {currentUser ? (
        <>
          <p className="session-copy">
            This account stays in local storage, so you can keep iterating on Sprint 1 screens
            without a backend.
          </p>

          <div className="session-progress">
            <div className="option-header">
              <strong>Profile completion</strong>
              <span>{completion.percent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completion.percent}%` }} />
            </div>
          </div>

          <dl className="session-details">
            <div>
              <dt>Email</dt>
              <dd>{currentUser.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{currentUser.phone_number || 'Not provided'}</dd>
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
        </>
      ) : (
        <p className="session-copy">
          Use a demo account on the login page or register a fresh account to populate the local
          Sprint 1 workflow.
        </p>
      )}
    </aside>
  );
}

export default SessionPanel;
