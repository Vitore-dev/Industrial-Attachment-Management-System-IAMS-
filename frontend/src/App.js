import './App.css';
import { useEffect, useState } from 'react';
import PageLayout from './components/PageLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import AccountPage from './pages/AccountPage';
import CoordinatorDashboardPage from './pages/CoordinatorDashboardPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

const routes = [
  { id: 'login', label: 'Login', public: true },
  { id: 'register', label: 'Register', public: true },
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'dashboard', label: 'Dashboard', allowedRoles: ['coordinator'] },
];

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { currentUser, status } = useAuth();
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash());
    }

    if (!window.location.hash) {
      window.location.hash = currentUser ? getDefaultRoute(currentUser.role) : '#login';
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const safeRoute = routes.some((item) => item.id === route)
    ? route
    : currentUser
      ? getDefaultRoute(currentUser.role)
      : 'login';

  const availableRoutes = getVisibleRoutes(currentUser);
  const currentRoute = routes.find((item) => item.id === safeRoute) || routes[0];

  return (
    <PageLayout
      availableRoutes={availableRoutes}
      currentRoute={currentRoute}
      currentUser={currentUser}
      route={safeRoute}
      status={status}
    >
      {renderRoute(safeRoute, currentUser)}
    </PageLayout>
  );
}

function renderRoute(route, currentUser) {
  switch (route) {
    case 'register':
      return <RegisterPage />;
    case 'account':
      return (
        <ProtectedRoute currentUser={currentUser}>
          <AccountPage />
        </ProtectedRoute>
      );
    case 'profile':
      return (
        <ProtectedRoute currentUser={currentUser}>
          <ProfilePage />
        </ProtectedRoute>
      );
    case 'dashboard':
      return (
        <ProtectedRoute currentUser={currentUser} allowedRoles={['coordinator']}>
          <CoordinatorDashboardPage />
        </ProtectedRoute>
      );
    case 'login':
    default:
      return <LoginPage />;
  }
}

function getVisibleRoutes(currentUser) {
  if (!currentUser) {
    return routes.filter((route) => route.public);
  }

  return routes.filter(
    (route) =>
      !route.public && (!route.allowedRoles || route.allowedRoles.includes(currentUser.role)),
  );
}

function getDefaultRoute(role) {
  return role === 'coordinator' ? 'dashboard' : 'account';
}

function getRouteFromHash() {
  return window.location.hash.replace('#', '') || 'login';
}

export default App;
