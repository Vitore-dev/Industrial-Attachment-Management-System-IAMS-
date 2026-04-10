import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Profile.css';

export default function OrganizationSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '', address: '', industry: '',
    website: '', description: '', preferred_skills: '',
    preferred_project_type: '', location: '', max_students: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      preferred_skills: form.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
      max_students: parseInt(form.max_students),
    };
    const data = await api.createOrganization(payload);
    setLoading(false);
    if (data.message) navigate('/organization/profile');
    else {
      const errMsg = Object.values(data).flat().join(' ');
      setError(errMsg || 'Failed to create profile');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-brand"><span>⬡</span> IAMS</div>
      </div>
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Register Your Organization</h2>
            <p>Tell us about your organization and the kind of students you are looking for</p>
          </div>
          {error && <div className="profile-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="section-title">Organization Details</div>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" placeholder="Your company name" value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <select value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })} required>
                  <option value="">-- Select industry --</option>
                  <option value="information_technology">Information Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="engineering">Engineering</option>
                  <option value="telecommunications">Telecommunications</option>
                  <option value="government">Government</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" placeholder="Physical address" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Website <span className="label-hint">(optional)</span></label>
                <input type="url" placeholder="https://yourcompany.com" value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Max Students</label>
                <input type="number" min="1" value={form.max_students}
                  onChange={(e) => setForm({ ...form, max_students: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Brief description of your organization..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="section-title">Student Preferences</div>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Project Type</label>
                <select value={form.preferred_project_type}
                  onChange={(e) => setForm({ ...form, preferred_project_type: e.target.value })} required>
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
                <label>Location</label>
                <select value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} required>
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
              <label>Preferred Skills <span className="label-hint">(comma separated)</span></label>
              <input type="text" placeholder="Python, Django, React, SQL..." value={form.preferred_skills}
                onChange={(e) => setForm({ ...form, preferred_skills: e.target.value })} />
            </div>
            <button type="submit" className="profile-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register Organization'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}