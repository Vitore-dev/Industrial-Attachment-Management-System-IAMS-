import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import StudentSetup from './pages/StudentSetup';
import StudentProfile from './pages/StudentProfile';
import OrganizationSetup from './pages/OrganizationSetup';
import OrganizationProfile from './pages/OrganizationProfile';
import SupervisorDashboard from './pages/SupervisorDashboard';
import { getHomeRouteForRole } from './utils/roleRoutes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#00c896', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: '#6b7280', fontFamily: 'sans-serif' }}>Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRouteForRole(user.role)} />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          <Navigate to={getHomeRouteForRole(user.role)} />
        ) : <Navigate to="/login" />
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <CoordinatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/setup" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentSetup />
        </ProtectedRoute>
      } />
      <Route path="/student/profile" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProfile />
        </ProtectedRoute>
      } />
      <Route path="/organization/setup" element={
        <ProtectedRoute allowedRoles={['organization']}>
          <OrganizationSetup />
        </ProtectedRoute>
      } />
      <Route path="/organization/profile" element={
        <ProtectedRoute allowedRoles={['organization']}>
          <OrganizationProfile />
        </ProtectedRoute>
      } />
      <Route path="/supervisor" element={
        <ProtectedRoute allowedRoles={['university_supervisor', 'industrial_supervisor']}>
          <SupervisorDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
