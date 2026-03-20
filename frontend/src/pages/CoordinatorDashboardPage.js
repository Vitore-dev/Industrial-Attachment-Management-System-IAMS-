import { useDeferredValue, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function CoordinatorDashboardPage() {
  const { formatDateTime, getProfileCompletion, getUserDisplayName, users } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const students = users.filter((user) => user.role === 'student');
  const organizations = users.filter((user) => user.role === 'organization');
  const completeProfiles = users.filter((user) => getProfileCompletion(user).isComplete);
  const studentsPlaced = students.filter(
    (user) => user.profile.placement_status === 'placed',
  ).length;
  const activeHosts = organizations.filter(
    (user) => Number(user.profile.intake_capacity || 0) > 0,
  ).length;

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const searchableText = [
      getUserDisplayName(user),
      user.username,
      user.email,
      user.role,
      user.profile.location,
    ]
      .join(' ')
      .toLowerCase();
    const matchesSearch = searchableText.includes(deferredSearchTerm.trim().toLowerCase());

    return matchesRole && matchesSearch;
  });

  const topSkills = getTopValues(
    users.flatMap((user) => [
      ...(user.preferences.skills || []),
      ...(user.preferences.preferred_skills || []),
    ]),
  );
  const topLocations = getTopValues([
    ...students.flatMap((user) => user.preferences.preferred_locations),
    ...organizations.map((user) => user.profile.location),
  ]);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="section-kicker">US-10</p>
          <h2>Coordinator dashboard</h2>
          <p>
            Monitor registrations, track profile completion, and inspect the preference mix before
            the matching engine arrives in Sprint 2.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Registered users</span>
          <strong className="stat-value">{users.length}</strong>
          <p className="stat-copy">All locally stored Sprint 1 accounts.</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Profiles complete</span>
          <strong className="stat-value">{completeProfiles.length}</strong>
          <p className="stat-copy">Accounts with all required Sprint 1 profile details.</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Students placed</span>
          <strong className="stat-value">{studentsPlaced}</strong>
          <p className="stat-copy">Seeded demo signal for placement tracking readiness.</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Organizations hosting</span>
          <strong className="stat-value">{activeHosts}</strong>
          <p className="stat-copy">Organizations with intake capacity configured.</p>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel-card wide">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Registration Directory</p>
              <h3>Registered users and readiness</h3>
            </div>
            <p className="helper-copy">
              Search by name, username, role, or location to spot who still needs profile work.
            </p>
          </div>

          <div className="table-toolbar">
            <label>
              Search
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search registrations"
              />
            </label>
            <label>
              Role
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="all">All roles</option>
                <option value="student">Students</option>
                <option value="organization">Organizations</option>
                <option value="coordinator">Coordinators</option>
                <option value="university_supervisor">University Supervisors</option>
                <option value="industrial_supervisor">Industrial Supervisors</option>
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Readiness</th>
                  <th>Key preference</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const completion = getProfileCompletion(user);

                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{getUserDisplayName(user)}</strong>
                        <span className="muted-copy">{user.email}</span>
                      </td>
                      <td>{user.role.replaceAll('_', ' ')}</td>
                      <td>{user.profile.location || 'Not set'}</td>
                      <td>
                        <span
                          className={
                            completion.isComplete
                              ? 'readiness-badge ready'
                              : 'readiness-badge pending'
                          }
                        >
                          {completion.percent}% ready
                        </span>
                      </td>
                      <td>{getPrimaryPreference(user)}</td>
                      <td>{formatDateTime(user.updated_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Preference Insight</p>
              <h3>Top skill signals</h3>
            </div>
          </div>
          <div className="tag-row">
            {topSkills.map((entry) => (
              <span key={entry.label} className="tag">
                {entry.label} ({entry.count})
              </span>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Location Insight</p>
              <h3>Most requested locations</h3>
            </div>
          </div>
          <div className="tag-row">
            {topLocations.map((entry) => (
              <span key={entry.label} className="tag">
                {entry.label} ({entry.count})
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function getPrimaryPreference(user) {
  if (user.role === 'student') {
    return user.preferences.preferred_project_types[0] || 'Awaiting project preferences';
  }

  if (user.role === 'organization') {
    return user.preferences.preferred_skills[0] || 'Awaiting skill preferences';
  }

  return user.profile.department || 'General account setup';
}

function getTopValues(values) {
  const counts = new Map();

  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
}

export default CoordinatorDashboardPage;
