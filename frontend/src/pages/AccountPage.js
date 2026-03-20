import { useAuth } from '../context/AuthContext';

function AccountPage() {
  const { currentUser, formatDateTime, getProfileCompletion, getUserDisplayName } = useAuth();
  const completion = getProfileCompletion(currentUser);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="section-kicker">US-06</p>
          <h2>Account overview</h2>
          <p>
            Review the account snapshot, see how complete the profile is, and jump to the right
            Sprint 1 workflow.
          </p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.location.hash = '#profile';
            }}
          >
            Edit profile
          </button>
          {currentUser.role === 'coordinator' ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                window.location.hash = '#dashboard';
              }}
            >
              Open dashboard
            </button>
          ) : null}
        </div>
      </div>

      <div className="protected-grid">
        <article className="protected-card">
          <span className="feature-title">Display name</span>
          <strong>{getUserDisplayName(currentUser)}</strong>
          <p>{currentUser.username}</p>
        </article>
        <article className="protected-card">
          <span className="feature-title">Role</span>
          <strong>{currentUser.role.replaceAll('_', ' ')}</strong>
          <p>Role-based access is applied to available pages.</p>
        </article>
        <article className="protected-card">
          <span className="feature-title">Profile completion</span>
          <strong>{completion.percent}%</strong>
          <p>
            {completion.completed} of {completion.total} key Sprint 1 profile steps complete.
          </p>
        </article>
        <article className="protected-card">
          <span className="feature-title">Last updated</span>
          <strong>{formatDateTime(currentUser.updated_at)}</strong>
          <p>{currentUser.email}</p>
        </article>
      </div>

      <section className="panel-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Preference Snapshot</p>
            <h3>What this account has configured</h3>
          </div>
          <p className="helper-copy">
            These summaries stay in sync with the editable profile screen.
          </p>
        </div>

        {renderPreferences(currentUser)}
      </section>
    </div>
  );
}

function renderPreferences(user) {
  if (user.role === 'student') {
    return (
      <div className="info-list">
        <div>
          <strong>Skills</strong>
          <div className="tag-row">
            {renderTags(user.preferences.skills, 'Add your skills in the profile editor.')}
          </div>
        </div>
        <div>
          <strong>Preferred project types</strong>
          <div className="tag-row">
            {renderTags(
              user.preferences.preferred_project_types,
              'Select project types you want to work on.',
            )}
          </div>
        </div>
        <div>
          <strong>Preferred locations</strong>
          <div className="tag-row">
            {renderTags(
              user.preferences.preferred_locations,
              'Choose your preferred attachment locations.',
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'organization') {
    return (
      <div className="info-list">
        <div>
          <strong>Preferred student skills</strong>
          <div className="tag-row">
            {renderTags(
              user.preferences.preferred_skills,
              'Define the skills you want to prioritize for matching.',
            )}
          </div>
        </div>
        <div>
          <strong>Preferred technologies</strong>
          <div className="tag-row">
            {renderTags(
              user.preferences.preferred_technologies,
              'Add the technologies your team works with.',
            )}
          </div>
        </div>
        <div>
          <strong>Project types offered</strong>
          <div className="tag-row">
            {renderTags(
              user.preferences.offered_project_types,
              'Add the project types students will be exposed to.',
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="info-list">
      <div>
        <strong>Title</strong>
        <p>{user.profile.title || 'Not set yet'}</p>
      </div>
      <div>
        <strong>Department</strong>
        <p>{user.profile.department || 'Not set yet'}</p>
      </div>
      <div>
        <strong>Bio</strong>
        <p>{user.profile.bio || 'Add role context from the profile page.'}</p>
      </div>
    </div>
  );
}

function renderTags(values, fallback) {
  if (!values.length) {
    return <span className="tag muted">{fallback}</span>;
  }

  return values.map((value) => (
    <span key={value} className="tag">
      {value}
    </span>
  ));
}

export default AccountPage;
