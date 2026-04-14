import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

export default function StudentSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    year_of_study: '',
    department: '',
    preferred_project_type: '',
    preferred_location: '',
    skills: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hasRegisteredStudentId = Boolean(user?.verified_student_id);

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      student_id: user.verified_student_id || current.student_id,
      first_name: user.first_name || current.first_name,
      last_name: user.last_name || current.last_name,
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...form,
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    };

    const data = await api.createStudent(payload);

    setLoading(false);
    if (data.id || data.message) {
      navigate('/student/profile');
    } else {
      const errMsg = Object.values(data).flat().join(' ');
      setError(errMsg || 'Failed to create profile');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-brand">
          <span>&#9633;</span> IAMS
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Complete Your Profile</h2>
            <p>Finish your student profile so we can match you to the best placement.</p>
          </div>
          {error && <div className="profile-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="section-title">Personal Information</div>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="Your first name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Your last name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  placeholder="e.g. 202201524"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  readOnly={hasRegisteredStudentId}
                  required
                />
                {hasRegisteredStudentId && (
                  <small className="label-hint">
                    Locked to the student ID used during attachment registration.
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Year of Study</label>
                <select
                  value={form.year_of_study}
                  onChange={(e) => setForm({ ...form, year_of_study: e.target.value })}
                  required
                >
                  <option value="">-- Select year --</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
              />
            </div>

            <div className="section-title">Attachment Preferences</div>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Project Type</label>
                <select
                  value={form.preferred_project_type}
                  onChange={(e) => setForm({ ...form, preferred_project_type: e.target.value })}
                  required
                >
                  <option value="">-- Select type --</option>
                  <option value="web_development">Web Development</option>
                  <option value="mobile_development">Mobile Development</option>
                  <option value="data_science">Data Science</option>
                  <option value="networking">Networking</option>
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="software_engineering">Software Engineering</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Location</label>
                <select
                  value={form.preferred_location}
                  onChange={(e) => setForm({ ...form, preferred_location: e.target.value })}
                  required
                >
                  <option value="">-- Select location --</option>
                  <option value="gaborone">Gaborone</option>
                  <option value="francistown">Francistown</option>
                  <option value="maun">Maun</option>
                  <option value="kasane">Kasane</option>
                  <option value="serowe">Serowe</option>
                  <option value="palapye">Palapye</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>
                Skills <span className="label-hint">(comma separated e.g. Python, Django, React)</span>
              </label>
              <input
                type="text"
                placeholder="Python, Django, React, SQL..."
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            <button type="submit" className="profile-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
