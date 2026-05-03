const BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

const getToken = () => localStorage.getItem('access_token');
const getAuthHeaders = (headers = {}) => ({
  ...headers,
  Authorization: `Bearer ${getToken()}`,
});

const parseJsonResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return {};
};

const downloadFile = async (path, fallbackName) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    return parseJsonResponse(res);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const match = disposition.match(/filename=\"?([^"]+)\"?/i);
  const filename = match?.[1] || fallbackName;
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
  return { success: true };
};

const resolveMediaUrl = (path) => {
  if (!path) return '';
  return new URL(path, `${BASE_URL}/`).toString();
};

const api = {
  // Auth
  register: async (data) => {
    const res = await fetch(`${BASE_URL}/accounts/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  logout: async (refresh) => {
    const res = await fetch(`${BASE_URL}/accounts/logout/`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ refresh }),
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${BASE_URL}/accounts/me/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Organizations
  createOrganization: async (data) => {
    const res = await fetch(`${BASE_URL}/organizations/create/`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getOrganization: async () => {
    const res = await fetch(`${BASE_URL}/organizations/profile/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateOrganization: async (data) => {
    const res = await fetch(`${BASE_URL}/organizations/update/`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  listOrganizations: async () => {
    const res = await fetch(`${BASE_URL}/organizations/list/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  approveOrganization: async (id) => {
    const res = await fetch(`${BASE_URL}/organizations/approve/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Students
  createStudent: async (data) => {
    const res = await fetch(`${BASE_URL}/students/create/`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getStudent: async () => {
    const res = await fetch(`${BASE_URL}/students/profile/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateStudent: async (data) => {
    const res = await fetch(`${BASE_URL}/students/update/`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  listStudents: async () => {
    const res = await fetch(`${BASE_URL}/students/list/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Matching
  runMatching: async () => {
    const res = await fetch(`${BASE_URL}/matching/run/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getMatchSuggestions: async () => {
    const res = await fetch(`${BASE_URL}/matching/suggestions/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getMatchAssignments: async () => {
    const res = await fetch(`${BASE_URL}/matching/assignments/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  confirmMatch: async (suggestionId) => {
    const res = await fetch(`${BASE_URL}/matching/confirm/`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ suggestion_id: suggestionId }),
    });
    return res.json();
  },

  overrideMatch: async (data) => {
    const res = await fetch(`${BASE_URL}/matching/override/`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/coordinator/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Release 2 workflow
  getStudentWorkflowOverview: async () => {
    const res = await fetch(`${BASE_URL}/workflow/student/overview/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  saveStudentLogbook: async (data) => {
    const res = await fetch(`${BASE_URL}/workflow/student/logbooks/`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  saveStudentFinalReport: async (formData) => {
    const res = await fetch(`${BASE_URL}/workflow/student/final-report/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return res.json();
  },

  getSupervisorWorkflowOverview: async () => {
    const res = await fetch(`${BASE_URL}/workflow/supervisor/overview/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  saveIndustrialSupervisorReport: async (formData) => {
    const res = await fetch(`${BASE_URL}/workflow/supervisor/industrial-report/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return res.json();
  },

  saveUniversitySupervisorAssessment: async (data) => {
    const res = await fetch(`${BASE_URL}/workflow/supervisor/university-assessment/`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getCoordinatorWorkflowOverview: async () => {
    const res = await fetch(`${BASE_URL}/workflow/coordinator/overview/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getCoordinatorWorkflowStudents: async () => {
    const res = await fetch(`${BASE_URL}/workflow/coordinator/students/`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  sendWorkflowReminders: async () => {
    const res = await fetch(`${BASE_URL}/workflow/coordinator/reminders/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  downloadGradesCsv: async () => downloadFile('/workflow/coordinator/export/grades.csv', 'iams-grades.csv'),
  downloadGradesPdf: async () => downloadFile('/workflow/coordinator/export/grades.pdf', 'iams-grades.pdf'),
  resolveMediaUrl,
};

export default api;
