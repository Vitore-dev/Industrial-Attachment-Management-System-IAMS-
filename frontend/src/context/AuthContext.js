import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/accounts';

const emptyRegisterForm = {
  username: '',
  email: '',
  password: '',
  role: 'student',
  phone_number: '',
};

const emptyLoginForm = {
  username: '',
  password: '',
};

const AuthContext = createContext(null);

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'organization', label: 'Organization' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'university_supervisor', label: 'University Supervisor' },
  { value: 'industrial_supervisor', label: 'Industrial Supervisor' },
];

export function AuthProvider({ children }) {
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [tokens, setTokens] = useState(() => getStoredTokens());
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState({
    type: 'idle',
    message: 'Connect the app to the accounts backend by logging in or registering.',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const refreshPromiseRef = useRef(null);

  useEffect(() => {
    function handleHashChange() {
      if (!currentUser && isProtectedRoute(window.location.hash.replace('#', ''))) {
        window.location.hash = '#login';
      }
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  useEffect(() => {
    if (!tokens?.access) {
      setCurrentUser(null);
      return;
    }

    loadCurrentUser();
  }, [tokens]);

  async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(getErrorMessage(data));
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async function authRequest(endpoint, options = {}, allowRetry = true) {
    if (!tokens?.access) {
      throw new Error('You need to log in first.');
    }

    try {
      return await request(endpoint, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
          Authorization: `Bearer ${tokens.access}`,
        },
      });
    } catch (error) {
      if (error.status !== 401 || !allowRetry || !tokens?.refresh) {
        throw error;
      }

      const refreshedTokens = await refreshAccessToken();

      return request(endpoint, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
          Authorization: `Bearer ${refreshedTokens.access}`,
        },
      });
    }
  }

  async function refreshAccessToken() {
    if (!tokens?.refresh) {
      throw new Error('No refresh token available.');
    }

    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = request('/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: tokens.refresh }),
      })
        .then((data) => {
          const nextTokens = {
            access: data.access,
            refresh: data.refresh || tokens.refresh,
          };

          saveTokens(nextTokens);
          setStatus({
            type: 'success',
            message: 'Session refreshed automatically.',
          });
          return nextTokens;
        })
        .catch((error) => {
          clearSession();
          setStatus({
            type: 'error',
            message: `Session expired. ${error.message}`,
          });
          throw error;
        })
        .finally(() => {
          refreshPromiseRef.current = null;
        });
    }

    return refreshPromiseRef.current;
  }

  function saveTokens(nextTokens) {
    localStorage.setItem('iams_access_token', nextTokens.access);
    localStorage.setItem('iams_refresh_token', nextTokens.refresh);
    setTokens(nextTokens);
  }

  function clearSession() {
    localStorage.removeItem('iams_access_token');
    localStorage.removeItem('iams_refresh_token');
    setTokens(null);
    setCurrentUser(null);
  }

  async function loadCurrentUser() {
    setIsLoadingUser(true);

    try {
      const user = await authRequest('/me/');

      startTransition(() => {
        setCurrentUser(user);
        setStatus({
          type: 'success',
          message: `Signed in as ${user.username}.`,
        });
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Could not load your account. ${error.message}`,
      });
    } finally {
      setIsLoadingUser(false);
    }
  }

  function updateLoginForm(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function updateRegisterForm(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  }

  async function login(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: 'Signing in...' });

    try {
      const data = await request('/login/', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });

      saveTokens({ access: data.access, refresh: data.refresh });
      setLoginForm(emptyLoginForm);
      window.location.hash = '#account';
      setStatus({
        type: 'success',
        message: `${data.message} Role: ${formatRole(data.role)}.`,
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function register(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: 'Creating account...' });

    try {
      const data = await request('/register/', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });

      saveTokens({ access: data.access, refresh: data.refresh });
      setRegisterForm(emptyRegisterForm);
      window.location.hash = '#account';
      setStatus({
        type: 'success',
        message: `${data.message} Role: ${formatRole(data.role)}.`,
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    if (!tokens?.refresh) {
      clearSession();
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', message: 'Signing out...' });

    try {
      await authRequest('/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      clearSession();
      window.location.hash = '#login';
      setIsSubmitting(false);
      setStatus({
        type: 'idle',
        message: 'You have been signed out locally.',
      });
    }
  }

  const value = {
    apiBaseUrl: API_BASE_URL,
    authRequest,
    currentUser,
    formatDateTime,
    isLoadingUser,
    isSubmitting,
    loadCurrentUser,
    login,
    loginForm,
    logout,
    register,
    registerForm,
    roleOptions,
    status,
    tokens,
    updateLoginForm,
    updateRegisterForm,
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

function getErrorMessage(data) {
  if (typeof data === 'string') {
    return data;
  }

  if (data.error) {
    return data.error;
  }

  if (data.message) {
    return data.message;
  }

  const firstEntry = Object.entries(data)[0];
  if (!firstEntry) {
    return 'Something went wrong while contacting the server.';
  }

  const [, value] = firstEntry;
  if (Array.isArray(value)) {
    return value[0];
  }

  return String(value);
}

function getStoredTokens() {
  const access = localStorage.getItem('iams_access_token');
  const refresh = localStorage.getItem('iams_refresh_token');

  return access && refresh ? { access, refresh } : null;
}

function isProtectedRoute(route) {
  return ['account'].includes(route);
}

export function formatRole(role) {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
