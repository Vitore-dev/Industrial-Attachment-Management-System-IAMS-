import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import './Profile.css';

export default function OrganizationProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getOrganization().then((data) => {
      if (data.id) { setProfile(data); setForm(data); }
      else navigate('/organization/setup');
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      preferred_skills: typeof form.preferred_skills === 'string'
        ? form.preferred_skills.split(',').map(s => s.trim()).filter(Boolean)
        : form.preferred_skills,
    };
    const data = await api.updateOrganization(payload);
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
          <div className="profile-avatar org">{profile?.company_name?.[0]}</div>
          <h3>{profile?.company_name}</h3>
          <span className="role-badge">Organization</span>
        </div>
        <div className="profile-meta">
          <div className="meta-item"><span>Industry</span><p>{profile?.industry?.replace('_', ' ')}</p></div>
          <div className="meta-item"><span>Location</span><p>{profile?.location}</p></div>
          <div className="meta-item"><span>Max Students</span><p>{profile?.max_students}</p></div>
          <div className="meta-item"><span>Status</span>
            <p className={profile?.is_approved ? 'placed' : 'unplaced'}>
              {profile?.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
            </p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>Sign Out ↪</button>
      </aside>

      <main className="profile-main">
        <div className="profile-main-header">
          <h1>Organization Profile</h1>
          <button className="edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <NotificationPanel
          title="Approval Notifications"
          subtitle="See whether your organization is approved and ready for placement."
          items={profile?.notifications || []}
        />

        {!editing ? (
          <div className="profile-view">
            <div className="view-section">
              <h3>Organization Details</h3>
              <div className="view-grid">
                <div className="view-item"><label>Company Name</label><p>{profile?.company_name}</p></div>
                <div className="view-item"><label>Industry</label><p>{profile?.industry?.replace('_', ' ')}</p></div>
                <div className="view-item"><label>Address</label><p>{profile?.address}</p></div>
                <div className="view-item"><label>Website</label><p>{profile?.website || 'N/A'}</p></div>
                <div className="view-item"><label>Max Students</label><p>{profile?.max_students}</p></div>
              </div>
              {profile?.description && (
                <div className="view-item full"><label>Description</label><p>{profile?.description}</p></div>
              )}
            </div>
            <div className="view-section">
              <h3>Student Preferences</h3>
              <div className="view-grid">
                <div className="view-item"><label>Project Type</label><p>{profile?.preferred_project_type?.replace('_', ' ')}</p></div>
                <div className="view-item"><label>Location</label><p>{profile?.location}</p></div>
              </div>
              <div className="skills-list" style={{marginTop: '16px'}}>
                <label style={{fontSize:'13px',color:'#6b7280',marginBottom:'8px',display:'block'}}>Preferred Skills</label>
                {profile?.preferred_skills?.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <div className="view-section">
              <h3>Organization Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" value={form.company_name || ''}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Max Students</label>
                  <input type="number" min="1" value={form.max_students || 1}
                    onChange={(e) => setForm({ ...form, max_students: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
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
                  <label>Location</label>
                  <select value={form.location || ''}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}>
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
                <input type="text"
                  value={Array.isArray(form.preferred_skills) ? form.preferred_skills.join(', ') : form.preferred_skills || ''}
                  onChange={(e) => setForm({ ...form, preferred_skills: e.target.value })} />
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
