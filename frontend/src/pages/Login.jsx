import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getHomeRouteForRole } from '../utils/roleRoutes';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    username: location.state?.prefillUsername || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.successMessage || '';
  const portalName = location.state?.portalName || '';
  const cameFromAsas = portalName === 'ASAS';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(form.username, form.password);

    setLoading(false);
    if (result.success) {
      navigate(getHomeRouteForRole(result.role));
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">&#9633;</div>
          <h1>IAMS</h1>
          <p>Industrial Attachment<br />Management System</p>
        </div>
        <div className="auth-tagline">
          <h2>{cameFromAsas ? 'ASAS registration complete' : 'Connecting students with opportunities'}</h2>
          <p>
            {cameFromAsas
              ? 'Continue into IAMS to complete your profile and attachment preferences.'
              : 'University of Botswana - Department of Computer Science'}
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-pill">IAMS Portal</div>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            {cameFromAsas
              ? 'Sign in with the account you just created in ASAS.'
              : 'Sign in to your account'}
          </p>
          {successMessage && <div className="auth-success">{successMessage}</div>}
          {cameFromAsas && (
            <div className="auth-notice">
              <strong>Next step:</strong> sign in to IAMS, then complete your student profile to continue.
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to IAMS'}
            </button>
          </form>
          <div className="auth-links-row">
            <p className="auth-link">
              Student without an account? <Link to="/asas/register">Register in ASAS</Link>
            </p>
            <p className="auth-link">
              Need a staff or organization account? <Link to="/register">Register in IAMS</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
