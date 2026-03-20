import { formatRole } from '../data/mockData';

function ProtectedRoute({ currentUser, allowedRoles, children }) {
  if (!currentUser) {
    return (
      <div className="empty-state">
        <h2>Login required</h2>
        <p>
          This Sprint 1 area is protected. Sign in first to continue with your registration,
          profile, or dashboard work.
        </p>
        <div className="button-row">
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              window.location.hash = '#login';
            }}
          >
            Go to login
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.location.hash = '#register';
            }}
          >
            Create an account
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="empty-state">
        <h2>Role access restricted</h2>
        <p>
          This page is reserved for {allowedRoles.map(formatRole).join(' / ')} accounts. You are
          signed in as a {formatRole(currentUser.role)}.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            window.location.hash = '#account';
          }}
        >
          Return to account
        </button>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
