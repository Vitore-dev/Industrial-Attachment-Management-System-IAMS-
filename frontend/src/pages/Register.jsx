import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegistrationRouteForRole } from '../utils/roleRoutes';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: '', phone_number: '', student_id: '',
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
          <div className="brand-icon">⬡</div>
          <h1>IAMS</h1>
          <p>Industrial Attachment<br />Management System</p>
        </div>
        <div className="auth-tagline">
          <h2>Begin your journey</h2>
          <p>University of Botswana — Department of Computer Science</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="auth-subtitle">Register to get started</p>
          {error && <div className="auth-error">{error}</div>}
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
                <option value="student">Student</option>
                <option value="organization">Organization</option>
                <option value="coordinator">Coordinator</option>
                <option value="university_supervisor">University Supervisor</option>
                <option value="industrial_supervisor">Industrial Supervisor</option>
              </select>
            </div>
            {form.role === 'student' && (
              <div className="form-group">
                <label>School Student ID</label>
                <input
                  type="text"
                  placeholder="Enter the student ID from the school system"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  required
                />
              </div>
            )}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
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
