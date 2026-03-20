export const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'organization', label: 'Organization' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'university_supervisor', label: 'University Supervisor' },
  { value: 'industrial_supervisor', label: 'Industrial Supervisor' },
];

export const roleSummaryById = {
  student:
    'Capture your academic details, project interests, locations, and skills so matching can start from a complete profile.',
  organization:
    'Register your hosting organization and define the student skill sets, technologies, and project types you want to support.',
  coordinator:
    'Create a coordinator account to monitor registrations, profile completion, and the overall readiness of the cohort.',
  university_supervisor:
    'Set up a supervisor account so Sprint 1 access control covers all planned user roles, even before assessments are built.',
  industrial_supervisor:
    'Set up an industrial supervisor account so organization-side oversight can be represented from the first sprint onward.',
};

export const skillOptions = [
  'React',
  'Django',
  'Python',
  'Java',
  'SQL',
  'UI/UX',
  'Testing',
  'Data Analysis',
  'Networking',
  'Cybersecurity',
];

export const technologyOptions = [
  'PostgreSQL',
  'Docker',
  'Figma',
  'GitHub',
  'Power BI',
  'Node.js',
  'AWS',
  'Linux',
];

export const projectTypeOptions = [
  'Web Development',
  'Mobile App',
  'Data & Analytics',
  'QA Automation',
  'IT Support',
  'Cybersecurity',
  'Business Systems',
];

export const locationOptions = [
  'Gaborone',
  'Francistown',
  'Palapye',
  'Maun',
  'Remote',
  'Hybrid',
];

export const workModeOptions = ['On-site', 'Hybrid', 'Remote'];

export const industryOptions = [
  'Software',
  'Fintech',
  'Telecoms',
  'Government',
  'Healthcare',
  'Education',
  'Logistics',
];

export function createEmptyLoginForm() {
  return {
    username: '',
    password: '',
  };
}

export function createEmptyRegisterForm(role = 'student') {
  return {
    username: '',
    email: '',
    password: '',
    phone_number: '',
    role,
    profile: createBaseProfile(role),
    preferences: createBasePreferences(),
  };
}

export function createProfileDraft(user) {
  if (!user) {
    return null;
  }

  return cloneValue({
    email: user.email || '',
    phone_number: user.phone_number || '',
    role: user.role,
    profile: user.profile || createBaseProfile(user.role),
    preferences: user.preferences || createBasePreferences(),
  });
}

export function createSeedUsers() {
  return [
    normalizeUserRecord({
      id: 'coord-1',
      username: 'coord_demo',
      email: 'coordinator@iams.local',
      password: 'demo1234',
      phone_number: '+267 71 000 001',
      role: 'coordinator',
      created_at: isoDaysAgo(14),
      updated_at: isoDaysAgo(1),
      profile: {
        full_name: 'Dr. Kabelo Moeti',
        title: 'Industrial Attachment Coordinator',
        department: 'Computer Science',
        location: 'Gaborone',
        bio: 'Coordinates Sprint 1 onboarding and monitors registration readiness across the cohort.',
      },
    }),
    normalizeUserRecord({
      id: 'student-1',
      username: 'student_demo',
      email: 'student@iams.local',
      password: 'demo1234',
      phone_number: '+267 71 000 002',
      role: 'student',
      created_at: isoDaysAgo(10),
      updated_at: isoDaysAgo(2),
      profile: {
        full_name: 'Onkemetse Dube',
        student_number: '202301115',
        degree_program: 'BSc Computer Science',
        year_of_study: '3',
        location: 'Gaborone',
        portfolio_url: 'https://portfolio.local/onkemetse',
        bio: 'Interested in frontend engineering, QA automation, and product delivery.',
        placement_status: 'placed',
      },
      preferences: {
        skills: ['React', 'Testing', 'UI/UX'],
        preferred_project_types: ['Web Development', 'QA Automation'],
        preferred_locations: ['Gaborone', 'Hybrid'],
      },
    }),
    normalizeUserRecord({
      id: 'student-2',
      username: 'phenyo_student',
      email: 'phenyo@iams.local',
      password: 'demo1234',
      phone_number: '+267 71 000 003',
      role: 'student',
      created_at: isoDaysAgo(7),
      updated_at: isoDaysAgo(1),
      profile: {
        full_name: 'Phenyo Moreri',
        student_number: '202302165',
        degree_program: 'BSc Computer Science',
        year_of_study: '3',
        location: 'Francistown',
        portfolio_url: '',
        bio: 'Leaning toward data work and business systems projects.',
        placement_status: 'searching',
      },
      preferences: {
        skills: ['Python', 'SQL', 'Data Analysis'],
        preferred_project_types: ['Data & Analytics', 'Business Systems'],
        preferred_locations: ['Francistown', 'Remote'],
      },
    }),
    normalizeUserRecord({
      id: 'organization-1',
      username: 'org_demo',
      email: 'contact@kalaharitech.local',
      password: 'demo1234',
      phone_number: '+267 71 000 004',
      role: 'organization',
      created_at: isoDaysAgo(9),
      updated_at: isoDaysAgo(3),
      profile: {
        organization_name: 'Kalahari Tech Lab',
        contact_person: 'Neo Sebego',
        industry: 'Fintech',
        location: 'Gaborone',
        website: 'https://kalahari.local',
        intake_capacity: '3',
        bio: 'Hosts attachment students across product delivery, fintech integrations, and internal systems.',
        hosting_status: 'accepting',
      },
      preferences: {
        preferred_skills: ['Python', 'React', 'SQL'],
        preferred_technologies: ['PostgreSQL', 'Docker', 'GitHub'],
        offered_project_types: ['Web Development', 'Data & Analytics'],
        work_modes: ['Hybrid', 'On-site'],
      },
    }),
    normalizeUserRecord({
      id: 'organization-2',
      username: 'btl_support',
      email: 'placements@btl.local',
      password: 'demo1234',
      phone_number: '+267 71 000 005',
      role: 'organization',
      created_at: isoDaysAgo(6),
      updated_at: isoDaysAgo(1),
      profile: {
        organization_name: 'Botswana Telecom Labs',
        contact_person: 'Lorato M.',
        industry: 'Telecoms',
        location: 'Francistown',
        website: 'https://btl.local',
        intake_capacity: '2',
        bio: 'Runs infrastructure, support, and cyber-readiness projects for student attachments.',
        hosting_status: 'accepting',
      },
      preferences: {
        preferred_skills: ['Networking', 'Cybersecurity', 'Testing'],
        preferred_technologies: ['Linux', 'GitHub'],
        offered_project_types: ['IT Support', 'Cybersecurity'],
        work_modes: ['On-site'],
      },
    }),
    normalizeUserRecord({
      id: 'university-supervisor-1',
      username: 'uni_supervisor',
      email: 'lecturer@iams.local',
      password: 'demo1234',
      phone_number: '+267 71 000 006',
      role: 'university_supervisor',
      created_at: isoDaysAgo(4),
      updated_at: isoDaysAgo(2),
      profile: {
        full_name: 'Ms. Naledi Phiri',
        title: 'University Supervisor',
        department: 'Computer Science',
        location: 'Gaborone',
        bio: 'Participates in Sprint 1 access control and account setup.',
      },
    }),
    normalizeUserRecord({
      id: 'industrial-supervisor-1',
      username: 'industry_supervisor',
      email: 'mentor@iams.local',
      password: 'demo1234',
      phone_number: '+267 71 000 007',
      role: 'industrial_supervisor',
      created_at: isoDaysAgo(3),
      updated_at: isoDaysAgo(2),
      profile: {
        full_name: 'Thato Kgosi',
        title: 'Industrial Supervisor',
        department: 'Placement Hosts',
        location: 'Gaborone',
        bio: 'Represents organization-side oversight until the reporting workflow lands in later sprints.',
      },
    }),
  ];
}

export function createUserFromRegistration(form) {
  const now = new Date().toISOString();

  return normalizeUserRecord({
    id: createId(form.role),
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password,
    phone_number: form.phone_number.trim(),
    role: form.role,
    created_at: now,
    updated_at: now,
    profile: form.profile,
    preferences: form.preferences,
  });
}

export function createUpdatedUser(user, draft) {
  return normalizeUserRecord({
    ...user,
    email: draft.email.trim(),
    phone_number: draft.phone_number.trim(),
    updated_at: new Date().toISOString(),
    profile: draft.profile,
    preferences: draft.preferences,
  });
}

export function normalizeUserRecord(user) {
  const role = user.role || 'student';

  return {
    id: user.id || createId(role),
    username: user.username || '',
    email: user.email || '',
    password: user.password || '',
    phone_number: user.phone_number || '',
    role,
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || user.created_at || new Date().toISOString(),
    profile: sanitizeProfile(role, user.profile || {}),
    preferences: sanitizePreferences(user.preferences || {}),
  };
}

export function setByPath(target, path, nextValue) {
  const keys = path.split('.');
  const nextTarget = cloneValue(target);
  let current = nextTarget;

  keys.slice(0, -1).forEach((key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  });

  current[keys[keys.length - 1]] = nextValue;
  return nextTarget;
}

export function toggleListValue(target, path, value) {
  const keys = path.split('.');
  const nextTarget = cloneValue(target);
  let current = nextTarget;

  keys.slice(0, -1).forEach((key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  });

  const finalKey = keys[keys.length - 1];
  const currentValues = Array.isArray(current[finalKey]) ? current[finalKey] : [];
  current[finalKey] = currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];

  return nextTarget;
}

export function getProfileCompletion(user) {
  const checksByRole = {
    student: [
      user.profile.full_name,
      user.profile.student_number,
      user.profile.degree_program,
      user.profile.year_of_study,
      user.profile.bio,
      user.preferences.skills,
      user.preferences.preferred_project_types,
      user.preferences.preferred_locations,
    ],
    organization: [
      user.profile.organization_name,
      user.profile.contact_person,
      user.profile.industry,
      user.profile.location,
      user.profile.intake_capacity,
      user.preferences.preferred_skills,
      user.preferences.preferred_technologies,
      user.preferences.offered_project_types,
    ],
    coordinator: [user.profile.full_name, user.profile.title, user.profile.department],
    university_supervisor: [
      user.profile.full_name,
      user.profile.title,
      user.profile.department,
    ],
    industrial_supervisor: [
      user.profile.full_name,
      user.profile.title,
      user.profile.department,
    ],
  };

  const checks = checksByRole[user.role] || [];
  const completed = checks.filter(hasValue).length;
  const total = checks.length || 1;
  const percent = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
    isComplete: completed === total,
  };
}

export function getUserDisplayName(user) {
  if (user.role === 'organization') {
    return user.profile.organization_name || user.username;
  }

  return user.profile.full_name || user.username;
}

export function formatRole(role) {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createBaseProfile(role) {
  return {
    full_name: '',
    title:
      role === 'coordinator'
        ? 'Industrial Attachment Coordinator'
        : role === 'university_supervisor'
          ? 'University Supervisor'
          : role === 'industrial_supervisor'
            ? 'Industrial Supervisor'
            : '',
    department:
      role === 'student'
        ? 'Computer Science'
        : role === 'organization'
          ? ''
          : 'Computer Science',
    location: 'Gaborone',
    bio: '',
    student_number: '',
    degree_program: 'BSc Computer Science',
    year_of_study: '3',
    portfolio_url: '',
    placement_status: role === 'student' ? 'searching' : '',
    organization_name: '',
    contact_person: '',
    industry: 'Software',
    website: '',
    intake_capacity: '2',
    hosting_status: role === 'organization' ? 'accepting' : '',
  };
}

function createBasePreferences() {
  return {
    skills: [],
    preferred_project_types: [],
    preferred_locations: [],
    preferred_skills: [],
    preferred_technologies: [],
    offered_project_types: [],
    work_modes: [],
  };
}

function sanitizeProfile(role, profile) {
  const base = createBaseProfile(role);

  return {
    ...base,
    ...profile,
    full_name: String(profile.full_name ?? base.full_name).trim(),
    title: String(profile.title ?? base.title).trim(),
    department: String(profile.department ?? base.department).trim(),
    location: String(profile.location ?? base.location).trim(),
    bio: String(profile.bio ?? base.bio).trim(),
    student_number: String(profile.student_number ?? base.student_number).trim(),
    degree_program: String(profile.degree_program ?? base.degree_program).trim(),
    year_of_study: String(profile.year_of_study ?? base.year_of_study).trim(),
    portfolio_url: String(profile.portfolio_url ?? base.portfolio_url).trim(),
    placement_status: String(profile.placement_status ?? base.placement_status).trim(),
    organization_name: String(
      profile.organization_name ?? base.organization_name,
    ).trim(),
    contact_person: String(profile.contact_person ?? base.contact_person).trim(),
    industry: String(profile.industry ?? base.industry).trim(),
    website: String(profile.website ?? base.website).trim(),
    intake_capacity: String(profile.intake_capacity ?? base.intake_capacity).trim(),
    hosting_status: String(profile.hosting_status ?? base.hosting_status).trim(),
  };
}

function sanitizePreferences(preferences) {
  const base = createBasePreferences();

  return {
    ...base,
    skills: uniqueList(preferences.skills),
    preferred_project_types: uniqueList(preferences.preferred_project_types),
    preferred_locations: uniqueList(preferences.preferred_locations),
    preferred_skills: uniqueList(preferences.preferred_skills),
    preferred_technologies: uniqueList(preferences.preferred_technologies),
    offered_project_types: uniqueList(preferences.offered_project_types),
    work_modes: uniqueList(preferences.work_modes),
  };
}

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(String(value ?? '').trim());
}

function uniqueList(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix = 'user') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
