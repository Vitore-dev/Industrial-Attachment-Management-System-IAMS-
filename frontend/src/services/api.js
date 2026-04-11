const BASE_URL = 'http://127.0.0.1:8000/api';

const getToken = () => localStorage.getItem('access_token');

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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ refresh }),
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${BASE_URL}/accounts/me/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  // Organizations
  createOrganization: async (data) => {
    const res = await fetch(`${BASE_URL}/organizations/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getOrganization: async () => {
    const res = await fetch(`${BASE_URL}/organizations/profile/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  updateOrganization: async (data) => {
    const res = await fetch(`${BASE_URL}/organizations/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  listOrganizations: async () => {
    const res = await fetch(`${BASE_URL}/organizations/list/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  approveOrganization: async (id) => {
    const res = await fetch(`${BASE_URL}/organizations/approve/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  // Students
  createStudent: async (data) => {
    const res = await fetch(`${BASE_URL}/students/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getStudent: async () => {
    const res = await fetch(`${BASE_URL}/students/profile/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  updateStudent: async (data) => {
    const res = await fetch(`${BASE_URL}/students/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  listStudents: async () => {
    const res = await fetch(`${BASE_URL}/students/list/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  // Matching
  runMatching: async () => {
    const res = await fetch(`${BASE_URL}/matching/run/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.json();
  },

  getMatchSuggestions: async () => {
    const res = await fetch(`${BASE_URL}/matching/suggestions/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  getMatchAssignments: async () => {
    const res = await fetch(`${BASE_URL}/matching/assignments/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  confirmMatch: async (suggestionId) => {
    const res = await fetch(`${BASE_URL}/matching/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ suggestion_id: suggestionId }),
    });
    return res.json();
  },

  overrideMatch: async (data) => {
    const res = await fetch(`${BASE_URL}/matching/override/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/coordinator/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },
};

export default api;
