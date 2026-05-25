import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';

import TruckDetailsPage from './pages/TruckDetailsPage';

import FloorMapPage from './pages/floor/FloorMapPage';

import PickerPage from './pages/picker/PickerPage';

import LoginPage from './pages/LoginPage';

import AdminHomePage from './pages/admin/AdminHomePage';

import UserManagementPage from './pages/admin/UserManagementPage';

import ProtectedRoute from './components/layout/ProtectedRoute';

import { useAuth } from './context/AuthContext';

function App() {
  const { user } =
    useAuth();

  return (
    <Routes>
      {/* =========================
         LOGIN
      ========================= */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* =========================
         ROOT ROLE REDIRECT
      ========================= */}

      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" />
          ) : user.role ===
            'PICKER' ? (
            <Navigate to="/picker" />
          ) : user.role ===
            'SUPERVISOR' ? (
            <Navigate to="/floor" />
          ) : (
            <Navigate to="/admin" />
          )
        }
      />

      {/* =========================
         ADMIN HOME
      ========================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            roles={[
              'ADMIN',
              'MANAGER',
            ]}
          >
            <AdminHomePage />
          </ProtectedRoute>
        }
      />

      {/* =========================
         USER MANAGEMENT
      ========================= */}

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute
            roles={['ADMIN']}
          >
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
         PICKER
      ========================= */}

      <Route
        path="/picker"
        element={
          <ProtectedRoute
            roles={[
              'PICKER',
              'ADMIN',
            ]}
          >
            <PickerPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
         FLOOR / SUPERVISOR
      ========================= */}

      <Route
        path="/floor"
        element={
          <ProtectedRoute
            roles={[
              'SUPERVISOR',
              'MANAGER',
              'ADMIN',
            ]}
          >
            <FloorMapPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
         DASHBOARD
      ========================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            roles={[
              'MANAGER',
              'ADMIN',
            ]}
          >
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
         TRUCK DETAILS
      ========================= */}

      <Route
        path="/truck/:id"
        element={
          <ProtectedRoute
            roles={[
              'SUPERVISOR',
              'MANAGER',
              'ADMIN',
            ]}
          >
            <TruckDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
         FALLBACK
      ========================= */}

      <Route
        path="*"
        element={<Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;