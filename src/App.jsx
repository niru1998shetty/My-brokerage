import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendors from './pages/admin/AdminVendors';
import VendorDashboard from './pages/vendor/VendorDashboard';
import RequestTypes from './pages/shared/RequestTypes';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/vendor'} replace /> : <Login />}
      />

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute role="admin">
            <Layout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/request-types" element={<RequestTypes />} />
      </Route>

      {/* Vendor routes */}
      <Route
        element={
          <ProtectedRoute role="vendor">
            <Layout role="vendor" />
          </ProtectedRoute>
        }
      >
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/request-types" element={<RequestTypes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
