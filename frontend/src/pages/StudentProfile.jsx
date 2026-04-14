import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import './Profile.css';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStudent().then((data) => {
      if (data.id) { setProfile(data); setForm(data); }
      else navigate('/student/setup');
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      skills: typeof form.skills === 'string'
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
        : form.skills,
    };
    const data = await api.updateStudent(payload);
    if (data.message) { setProfile(data.data); setEditing(false); }
    setSaving(false);
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="sidebar-brand"><span>⬡</span> IAMS</div>
        <div className="profile-avatar-section">
          <div className="profile-avatar">{profile?.first_name?.[0]}{profile?.last_name?.[0]}</div>
          <h3>{profile?.first_name} {profile?.last_name}</h3>
          <span className="role-badge">Student</span>
        </div>
        <div className="profile-meta">
          <div className="meta-item"><span>ID</span><p>{profile?.student_id}</p></div>
          <div className="meta-item"><span>Department</span><p>{profile?.department}</p></div>
          <div className="meta-item"><span>Year</span><p>Year {profile?.year_of_study}</p></div>
          <div className="meta-item"><span>Status</span>
            <p className={profile?.is_placed ? 'placed' : 'unplaced'}>
              {profile?.is_placed ? '✓ Placed' : '⏳ Awaiting Placement'}
            </p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>Sign Out ↪</button>
      </aside>

      <main className="profile-main">
        <div className="profile-main-header">
          <h1>My Profile</h1>
          <button className="edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && <div className="profile-error">{error}</div>}
        <NotificationPanel
          title="Placement Notifications"
          subtitle="Track whether you have been placed and view the latest placement update."
          items={profile?.notifications || []}
        />

        {!editing ? (
          <div className="profile-view">
            <div className="view-section">
              <h3>Personal Information</h3>
              <div className="view-grid">
                <div className="view-item"><label>First Name</label><p>{profile?.first_name}</p></div>
                <div className="view-item"><label>Last Name</label><p>{profile?.last_name}</p></div>
                <div className="view-item"><label>Student ID</label><p>{profile?.student_id}</p></div>
                <div className="view-item"><label>Department</label><p>{profile?.department}</p></div>
                <div className="view-item"><label>Year of Study</label><p>Year {profile?.year_of_study}</p></div>
              </div>
            </div>
            <div className="view-section">
              <h3>Attachment Preferences</h3>
              <div className="view-grid">
                <div className="view-item"><label>Project Type</label><p>{profile?.preferred_project_type?.replace('_', ' ')}</p></div>
                <div className="view-item"><label>Preferred Location</label><p>{profile?.preferred_location}</p></div>
              </div>
            </div>
            <div className="view-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {profile?.skills?.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                {profile?.skills?.length === 0 && <p className="no-skills">No skills added yet</p>}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <div className="view-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={form.first_name || ''}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={form.last_name || ''}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={form.department || ''}
                  onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>
            <div className="view-section">
              <h3>Preferences</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Project Type</label>
                  <select value={form.preferred_project_type || ''}
                    onChange={(e) => setForm({ ...form, preferred_project_type: e.target.value })}>
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
                  <select value={form.preferred_location || ''}
                    onChange={(e) => setForm({ ...form, preferred_location: e.target.value })}>
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
                <label>Skills <span className="label-hint">(comma separated)</span></label>
                <input type="text"
                  value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills || ''}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="profile-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
