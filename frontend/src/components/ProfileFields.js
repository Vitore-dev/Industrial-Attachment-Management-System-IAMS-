import {
  industryOptions,
  locationOptions,
  projectTypeOptions,
  roleSummaryById,
  skillOptions,
  technologyOptions,
  workModeOptions,
} from '../data/mockData';

function ProfileFields({ role, draft, onFieldChange, onToggleOption }) {
  if (role === 'student') {
    return (
      <>
        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Student Registration</p>
              <h3>Student profile</h3>
            </div>
            <p className="helper-copy">{roleSummaryById.student}</p>
          </div>

          <div className="form-grid">
            <label>
              Full name
              <input
                name="profile.full_name"
                value={draft.profile.full_name}
                onChange={(event) =>
                  onFieldChange('profile.full_name', event.target.value)
                }
                placeholder="Student full name"
                required
              />
            </label>
            <label>
              Student number
              <input
                name="profile.student_number"
                value={draft.profile.student_number}
                onChange={(event) =>
                  onFieldChange('profile.student_number', event.target.value)
                }
                placeholder="2023xxxx"
                required
              />
            </label>
            <label>
              Degree program
              <input
                name="profile.degree_program"
                value={draft.profile.degree_program}
                onChange={(event) =>
                  onFieldChange('profile.degree_program', event.target.value)
                }
                placeholder="BSc Computer Science"
                required
              />
            </label>
            <label>
              Year of study
              <select
                name="profile.year_of_study"
                value={draft.profile.year_of_study}
                onChange={(event) =>
                  onFieldChange('profile.year_of_study', event.target.value)
                }
              >
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </label>
            <label>
              Base location
              <select
                name="profile.location"
                value={draft.profile.location}
                onChange={(event) =>
                  onFieldChange('profile.location', event.target.value)
                }
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Portfolio URL
              <input
                name="profile.portfolio_url"
                value={draft.profile.portfolio_url}
                onChange={(event) =>
                  onFieldChange('profile.portfolio_url', event.target.value)
                }
                placeholder="https://portfolio.example"
              />
            </label>
            <label className="field-span-2">
              Short bio
              <textarea
                name="profile.bio"
                value={draft.profile.bio}
                onChange={(event) => onFieldChange('profile.bio', event.target.value)}
                placeholder="Describe the kind of attachment experience you want."
                rows={4}
                required
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Student Preferences</p>
              <h3>What you want to be matched with</h3>
            </div>
            <p className="helper-copy">
              These preferences model Sprint 1&apos;s project-type and location mechanics.
            </p>
          </div>

          <OptionGroup
            label="Current skills"
            options={skillOptions}
            values={draft.preferences.skills}
            onToggle={(value) => onToggleOption('preferences.skills', value)}
          />
          <OptionGroup
            label="Preferred project types"
            options={projectTypeOptions}
            values={draft.preferences.preferred_project_types}
            onToggle={(value) =>
              onToggleOption('preferences.preferred_project_types', value)
            }
          />
          <OptionGroup
            label="Preferred locations"
            options={locationOptions}
            values={draft.preferences.preferred_locations}
            onToggle={(value) =>
              onToggleOption('preferences.preferred_locations', value)
            }
          />
        </section>
      </>
    );
  }

  if (role === 'organization') {
    return (
      <>
        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Organization Registration</p>
              <h3>Host organization profile</h3>
            </div>
            <p className="helper-copy">{roleSummaryById.organization}</p>
          </div>

          <div className="form-grid">
            <label>
              Organization name
              <input
                name="profile.organization_name"
                value={draft.profile.organization_name}
                onChange={(event) =>
                  onFieldChange('profile.organization_name', event.target.value)
                }
                placeholder="Company or institution name"
                required
              />
            </label>
            <label>
              Contact person
              <input
                name="profile.contact_person"
                value={draft.profile.contact_person}
                onChange={(event) =>
                  onFieldChange('profile.contact_person', event.target.value)
                }
                placeholder="Primary attachment contact"
                required
              />
            </label>
            <label>
              Industry
              <select
                name="profile.industry"
                value={draft.profile.industry}
                onChange={(event) =>
                  onFieldChange('profile.industry', event.target.value)
                }
              >
                {industryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Primary location
              <select
                name="profile.location"
                value={draft.profile.location}
                onChange={(event) =>
                  onFieldChange('profile.location', event.target.value)
                }
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Website
              <input
                name="profile.website"
                value={draft.profile.website}
                onChange={(event) =>
                  onFieldChange('profile.website', event.target.value)
                }
                placeholder="https://example.org"
              />
            </label>
            <label>
              Intake capacity
              <input
                name="profile.intake_capacity"
                type="number"
                min="1"
                value={draft.profile.intake_capacity}
                onChange={(event) =>
                  onFieldChange('profile.intake_capacity', event.target.value)
                }
              />
            </label>
            <label className="field-span-2">
              About the attachment program
              <textarea
                name="profile.bio"
                value={draft.profile.bio}
                onChange={(event) => onFieldChange('profile.bio', event.target.value)}
                placeholder="Describe the kind of work students will be exposed to."
                rows={4}
                required
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Organization Preferences</p>
              <h3>Skill and technology preferences</h3>
            </div>
            <p className="helper-copy">
              These controls cover Sprint 1&apos;s organization preference mechanics.
            </p>
          </div>

          <OptionGroup
            label="Preferred student skills"
            options={skillOptions}
            values={draft.preferences.preferred_skills}
            onToggle={(value) => onToggleOption('preferences.preferred_skills', value)}
          />
          <OptionGroup
            label="Preferred technologies"
            options={technologyOptions}
            values={draft.preferences.preferred_technologies}
            onToggle={(value) =>
              onToggleOption('preferences.preferred_technologies', value)
            }
          />
          <OptionGroup
            label="Project types offered"
            options={projectTypeOptions}
            values={draft.preferences.offered_project_types}
            onToggle={(value) =>
              onToggleOption('preferences.offered_project_types', value)
            }
          />
          <OptionGroup
            label="Work modes"
            options={workModeOptions}
            values={draft.preferences.work_modes}
            onToggle={(value) => onToggleOption('preferences.work_modes', value)}
          />
        </section>
      </>
    );
  }

  return (
    <section className="form-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Role Profile</p>
          <h3>{role === 'coordinator' ? 'Coordinator profile' : 'Supervisor profile'}</h3>
        </div>
        <p className="helper-copy">{roleSummaryById[role]}</p>
      </div>

      <div className="form-grid">
        <label>
          Full name
          <input
            name="profile.full_name"
            value={draft.profile.full_name}
            onChange={(event) => onFieldChange('profile.full_name', event.target.value)}
            placeholder="Full name"
            required
          />
        </label>
        <label>
          Title
          <input
            name="profile.title"
            value={draft.profile.title}
            onChange={(event) => onFieldChange('profile.title', event.target.value)}
            placeholder="Role title"
            required
          />
        </label>
        <label>
          Department
          <input
            name="profile.department"
            value={draft.profile.department}
            onChange={(event) =>
              onFieldChange('profile.department', event.target.value)
            }
            placeholder="Department or division"
            required
          />
        </label>
        <label>
          Office location
          <select
            name="profile.location"
            value={draft.profile.location}
            onChange={(event) => onFieldChange('profile.location', event.target.value)}
          >
            {locationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="field-span-2">
          Short bio
          <textarea
            name="profile.bio"
            value={draft.profile.bio}
            onChange={(event) => onFieldChange('profile.bio', event.target.value)}
            placeholder="Add context about the role this account plays in the attachment process."
            rows={4}
          />
        </label>
      </div>
    </section>
  );
}

function OptionGroup({ label, onToggle, options, values }) {
  return (
    <div className="option-group">
      <div className="option-header">
        <strong>{label}</strong>
        <span>{values.length} selected</span>
      </div>
      <div className="option-grid">
        {options.map((option) => {
          const isActive = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              className={isActive ? 'option-pill active' : 'option-pill'}
              onClick={() => onToggle(option)}
              aria-pressed={isActive}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileFields;
