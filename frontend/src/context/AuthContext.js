import { createContext, startTransition, useContext, useEffect, useState } from 'react';
import {
  createEmptyLoginForm,
  createEmptyRegisterForm,
  createUpdatedUser,
  createUserFromRegistration,
  createSeedUsers,
  formatRole,
  getProfileCompletion,
  getUserDisplayName,
  normalizeUserRecord,
  roleOptions,
  setByPath,
  toggleListValue,
} from '../data/mockData';

const USERS_STORAGE_KEY = 'iams_frontend_users_v2';
const SESSION_STORAGE_KEY = 'iams_frontend_session_v2';

const AuthContext = createContext(null);

const defaultStatus = {
  type: 'info',
  message:
    'Sprint 1 frontend demo mode: registration, profiles, and dashboard data are stored locally in this browser until backend APIs are ready.',
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [sessionUserId, setSessionUserId] = useState(loadSessionUserId);
  const [loginForm, setLoginForm] = useState(createEmptyLoginForm);
  const [registerForm, setRegisterForm] = useState(createEmptyRegisterForm);
  const [status, setStatus] = useState(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = users.find((user) => user.id === sessionUserId) || null;
  const demoAccounts = users.slice(0, 5).map((user) => ({
    id: user.id,
    username: user.username,
    password: user.password,
    role: user.role,
    label: getUserDisplayName(user),
  }));

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, currentUser.id);
      return;
    }

    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [currentUser]);

  useEffect(() => {
    if (sessionUserId && !currentUser) {
      setSessionUserId(null);
    }
  }, [currentUser, sessionUserId]);

  function updateLoginField(name, value) {
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function updateRegisterField(path, value) {
    setRegisterForm((current) => setByPath(current, path, value));
  }

  function updateRegisterRole(role) {
    setRegisterForm((current) => ({
      ...createEmptyRegisterForm(role),
      username: current.username,
      email: current.email,
      password: current.password,
      phone_number: current.phone_number,
      role,
    }));
  }

  function toggleRegisterSelection(path, value) {
    setRegisterForm((current) => toggleListValue(current, path, value));
  }

  function fillDemoCredentials(userId) {
    const selectedUser = users.find((user) => user.id === userId);

    if (!selectedUser) {
      return;
    }

    setLoginForm({
      username: selectedUser.username,
      password: selectedUser.password,
    });
    setStatus({
      type: 'info',
      message: `Loaded demo credentials for ${getUserDisplayName(selectedUser)} (${formatRole(selectedUser.role)}).`,
    });
    window.location.hash = '#login';
  }

  function login(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const matchedUser = users.find(
      (user) =>
        user.username.toLowerCase() === loginForm.username.trim().toLowerCase() &&
        user.password === loginForm.password,
    );

    if (!matchedUser) {
      setStatus({
        type: 'error',
        message: 'No local demo account matched that username and password.',
      });
      setIsSubmitting(false);
      return;
    }

    startTransition(() => {
      setSessionUserId(matchedUser.id);
      setLoginForm(createEmptyLoginForm());
      setStatus({
        type: 'success',
        message: `Signed in as ${getUserDisplayName(matchedUser)} (${formatRole(matchedUser.role)}).`,
      });
    });

    window.location.hash = `#${getHomeRouteForRole(matchedUser.role)}`;
    setIsSubmitting(false);
  }

  function register(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const normalizedUsername = registerForm.username.trim().toLowerCase();
    const normalizedEmail = registerForm.email.trim().toLowerCase();

    const duplicateUser = users.find(
      (user) =>
        user.username.toLowerCase() === normalizedUsername ||
        user.email.toLowerCase() === normalizedEmail,
    );

    if (duplicateUser) {
      setStatus({
        type: 'error',
        message: 'That username or email is already stored in the local demo data.',
      });
      setIsSubmitting(false);
      return;
    }

    const nextUser = createUserFromRegistration(registerForm);

    startTransition(() => {
      setUsers((current) => [nextUser, ...current]);
      setSessionUserId(nextUser.id);
      setRegisterForm(createEmptyRegisterForm(nextUser.role));
      setStatus({
        type: 'success',
        message: `${formatRole(nextUser.role)} account created. Finish the profile details before Sprint 2 matching begins.`,
      });
    });

    window.location.hash = `#${getPostRegistrationRoute(nextUser.role)}`;
    setIsSubmitting(false);
  }

  function logout() {
    setSessionUserId(null);
    setStatus({
      type: 'info',
      message: 'Signed out. Your Sprint 1 demo data is still stored locally.',
    });
    window.location.hash = '#login';
  }

  function saveCurrentUserProfile(draft) {
    if (!currentUser) {
      return;
    }

    setIsSubmitting(true);

    startTransition(() => {
      setUsers((current) =>
        current.map((user) =>
          user.id === currentUser.id ? createUpdatedUser(user, draft) : user,
        ),
      );
      setStatus({
        type: 'success',
        message: `${formatRole(currentUser.role)} profile updated successfully.`,
      });
    });

    setIsSubmitting(false);
  }

  const value = {
    currentUser,
    demoAccounts,
    fillDemoCredentials,
    formatDateTime,
    formatRole,
    getProfileCompletion,
    getUserDisplayName,
    isLoadingUser: false,
    isSubmitting,
    login,
    loginForm,
    logout,
    register,
    registerForm,
    roleOptions,
    saveCurrentUserProfile,
    status,
    toggleRegisterSelection,
    updateLoginField,
    updateRegisterField,
    updateRegisterRole,
    users,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

function loadUsers() {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    if (!storedUsers) {
      return createSeedUsers();
    }

    const parsedUsers = JSON.parse(storedUsers);

    if (!Array.isArray(parsedUsers) || !parsedUsers.length) {
      return createSeedUsers();
    }

    return parsedUsers.map(normalizeUserRecord);
  } catch (error) {
    return createSeedUsers();
  }
}

function loadSessionUserId() {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

function getHomeRouteForRole(role) {
  return role === 'coordinator' ? 'dashboard' : 'account';
}

function getPostRegistrationRoute(role) {
  return role === 'student' || role === 'organization'
    ? 'profile'
    : getHomeRouteForRole(role);
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
