import ProfileFields from '../components/ProfileFields';
import { roleSummaryById } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const {
    isSubmitting,
    register,
    registerForm,
    roleOptions,
    toggleRegisterSelection,
    updateRegisterField,
    updateRegisterRole,
  } = useAuth();

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="section-kicker">US-02 to US-05</p>
          <h2>Register</h2>
          <p>
            This frontend covers general authentication plus the Sprint 1 student and organization
            preference flows.
          </p>
        </div>
      </div>

      <form className="auth-form" onSubmit={register}>
        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Role Setup</p>
              <h3>Choose the registration path</h3>
            </div>
            <p className="helper-copy">
              Switching roles updates the form so each user type gets the right Sprint 1 mechanics.
            </p>
          </div>

          <div className="choice-grid">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  registerForm.role === option.value ? 'role-card active' : 'role-card'
                }
                onClick={() => updateRegisterRole(option.value)}
              >
                <strong>{option.label}</strong>
                <span>{roleSummaryById[option.value]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Account Basics</p>
              <h3>Shared account details</h3>
            </div>
            <p className="helper-copy">
              These fields mirror the common account information already present in the backend user
              model.
            </p>
          </div>

          <div className="form-grid">
            <label>
              Username
              <input
                name="username"
                value={registerForm.username}
                onChange={(event) => updateRegisterField('username', event.target.value)}
                placeholder="Choose a username"
                required
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={registerForm.email}
                onChange={(event) => updateRegisterField('email', event.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={registerForm.password}
                onChange={(event) => updateRegisterField('password', event.target.value)}
                placeholder="Create a password"
                required
              />
            </label>
            <label>
              Phone number
              <input
                name="phone_number"
                value={registerForm.phone_number}
                onChange={(event) => updateRegisterField('phone_number', event.target.value)}
                placeholder="Optional contact number"
              />
            </label>
          </div>
        </section>

        <ProfileFields
          draft={registerForm}
          onFieldChange={updateRegisterField}
          onToggleOption={toggleRegisterSelection}
          role={registerForm.role}
        />

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.location.hash = '#login';
            }}
          >
            Back to login
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
