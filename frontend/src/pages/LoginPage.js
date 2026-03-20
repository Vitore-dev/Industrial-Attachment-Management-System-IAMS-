import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { isSubmitting, login, loginForm, updateLoginForm } = useAuth();

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2>Login</h2>
      </div>

      <form className="auth-form" onSubmit={login}>
        <label>
          Username
          <input
            name="username"
            value={loginForm.username}
            onChange={updateLoginForm}
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
            onChange={updateLoginForm}
            placeholder="Enter your password"
            required
          />
        </label>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
