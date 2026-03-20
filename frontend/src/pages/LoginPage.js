import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const {
    currentUser,
    demoAccounts,
    fillDemoCredentials,
    isSubmitting,
    login,
    loginForm,
    updateLoginField,
  } = useAuth();

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="section-kicker">US-01</p>
          <h2>Login</h2>
          <p>
            Sign in with a demo account or with any role you register in this browser. Role-based
            access control is enforced from the moment you log in.
          </p>
        </div>
      </div>

      {currentUser ? (
        <div className="callout-card">
          <strong>Already signed in.</strong>
          <p>
            You can still load another demo account here, or move back to your account and profile
            pages from the navigation above.
          </p>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={login}>
        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Authentication</p>
              <h3>Secure access flow</h3>
            </div>
            <p className="helper-copy">
              The backend is not connected yet, so this flow validates against local demo data.
            </p>
          </div>

          <div className="form-grid">
            <label>
              Username
              <input
                name="username"
                value={loginForm.username}
                onChange={(event) => updateLoginField('username', event.target.value)}
                placeholder="Enter your username"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={(event) => updateLoginField('password', event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>
          </div>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </section>
      </form>

      <section className="panel-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Demo Access</p>
            <h3>Quick-fill demo accounts</h3>
          </div>
          <p className="helper-copy">
            Every seeded demo account uses the password <strong>demo1234</strong>. Clicking a card
            fills the form automatically.
          </p>
        </div>

        <div className="demo-grid">
          {demoAccounts.map((account) => (
            <button
              key={account.id}
              type="button"
              className="demo-card"
              onClick={() => fillDemoCredentials(account.id)}
            >
              <span className="inline-pill">{account.role.replaceAll('_', ' ')}</span>
              <strong>{account.label}</strong>
              <span>{account.username}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
