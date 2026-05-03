import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function AsasRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
    student_id: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register({
      ...form,
      role: 'student',
    });

    setLoading(false);
    if (result.success) {
      navigate('/login', {
        state: {
          successMessage: result.message || 'Student registration successful. Continue in IAMS.',
          prefillUsername: form.username,
          portalName: 'student_portal',
        },
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="portal-shell">
      <section className="portal-panel portal-panel-accent">
        <div className="portal-header">
          <div className="portal-mark">UB</div>
          <p className="portal-label">Student Registration Portal</p>
        </div>
        <div className="portal-copy">
          <h1>Student attachment registration starts here.</h1>
          <p>
            Register your attachment record here first. Once your account is created, we will
            transition you to IAMS to sign in and complete your profile.
          </p>
        </div>
        <div className="portal-steps">
          <div className="portal-step">
            <span>1</span>
            <div>
              <strong>Create your student access</strong>
              <p>Create your student attachment account with your student ID and university email.</p>
            </div>
          </div>
          <div className="portal-step">
            <span>2</span>
            <div>
              <strong>Transition to IAMS</strong>
              <p>Sign in to IAMS using the same account details after registration succeeds.</p>
            </div>
          </div>
          <div className="portal-step">
            <span>3</span>
            <div>
              <strong>Complete your profile</strong>
              <p>Finish your preferences and placement profile inside the IAMS portal.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="portal-panel portal-panel-form">
        <div className="portal-form-header">
          <div>
            <div className="auth-pill auth-pill-alt">Student Registration</div>
            <h2>Register for industrial attachment</h2>
          </div>
          <Link to="/login" className="portal-link">I already have an account</Link>
        </div>
        <p className="auth-subtitle portal-subtitle">
          After this step, you will move into IAMS to sign in and complete your profile.
        </p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                placeholder="e.g. 202201524"
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
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
              <label>University Email</label>
              <input
                type="email"
                placeholder="student@ub.ac.bw"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
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
            <small className="auth-hint">
              You will use this same username and password to sign in to IAMS after registration.
            </small>
          </div>
          <button type="submit" className="auth-btn auth-btn-alt" disabled={loading}>
            {loading ? 'Submitting registration...' : 'Complete student registration'}
          </button>
        </form>
        <div className="portal-footnote">
          <p>
            Need a non-student account instead? <Link to="/register">Create it directly in IAMS</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
