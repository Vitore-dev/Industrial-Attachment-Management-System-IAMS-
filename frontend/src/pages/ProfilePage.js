import { useEffect, useState } from 'react';
import ProfileFields from '../components/ProfileFields';
import { createProfileDraft, setByPath, toggleListValue } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const {
    currentUser,
    formatDateTime,
    getProfileCompletion,
    isSubmitting,
    saveCurrentUserProfile,
  } = useAuth();
  const [draft, setDraft] = useState(() => createProfileDraft(currentUser));

  useEffect(() => {
    setDraft(createProfileDraft(currentUser));
  }, [currentUser]);

  if (!currentUser || !draft) {
    return null;
  }

  const previewUser = {
    ...currentUser,
    email: draft.email,
    phone_number: draft.phone_number,
    profile: draft.profile,
    preferences: draft.preferences,
  };
  const completion = getProfileCompletion(previewUser);

  function handleFieldChange(path, value) {
    setDraft((current) => setByPath(current, path, value));
  }

  function handleToggleOption(path, value) {
    setDraft((current) => toggleListValue(current, path, value));
  }

  function handleSubmit(event) {
    event.preventDefault();
    saveCurrentUserProfile(draft);
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="section-kicker">Profile Management</p>
          <h2>Edit profile and preferences</h2>
          <p>
            Update registration details, keep preference data current, and complete the Sprint 1
            profile checklist.
          </p>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Completion Status</p>
              <h3>Profile readiness</h3>
            </div>
            <p className="helper-copy">
              Updated {formatDateTime(currentUser.updated_at)}. Progress updates live as you edit.
            </p>
          </div>

          <div className="session-progress">
            <div className="option-header">
              <strong>Sprint 1 completion</strong>
              <span>{completion.percent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completion.percent}%` }} />
            </div>
          </div>

          <div className="form-grid">
            <label>
              Email
              <input
                type="email"
                value={draft.email}
                onChange={(event) => handleFieldChange('email', event.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>
            <label>
              Phone number
              <input
                value={draft.phone_number}
                onChange={(event) => handleFieldChange('phone_number', event.target.value)}
                placeholder="Optional contact number"
              />
            </label>
          </div>
        </section>

        <ProfileFields
          draft={draft}
          onFieldChange={handleFieldChange}
          onToggleOption={handleToggleOption}
          role={currentUser.role}
        />

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save profile'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setDraft(createProfileDraft(currentUser))}
          >
            Reset changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
