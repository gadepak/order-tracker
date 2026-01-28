import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import API from './api';

import TrackPage from './pages/TrackPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ServiceExpired from './pages/ServiceExpired';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/maintenance/status")
      .then(res => {
        if (res.data.expired) {
          navigate("/service-expired", { replace: true });
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<TrackPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/service-expired" element={<ServiceExpired />} />

      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
