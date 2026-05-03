import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegistrationRouteForRole } from '../utils/roleRoutes';
import './Auth.css';

const NON_STUDENT_ROLES = [
  { value: 'organization', label: 'Organization' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'university_supervisor', label: 'University Supervisor' },
  { value: 'industrial_supervisor', label: 'Industrial Supervisor' },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(form);

    setLoading(false);
    if (result.success) {
      navigate(getRegistrationRouteForRole(result.role));
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
          <h2>Set up your IAMS access</h2>
          <p>Organization, coordinator, and supervisor accounts are created directly in IAMS.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-pill">IAMS Portal</div>
          <h2>Create account</h2>
          <p className="auth-subtitle">Register your role-specific account to access the platform.</p>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-notice">
            <strong>Students use the student registration portal.</strong> Student attachment registration happens there first.
            <Link to="/asas/register"> Open student registration</Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 71234567"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="">-- Select your role --</option>
                {NON_STUDENT_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create IAMS Account'}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
