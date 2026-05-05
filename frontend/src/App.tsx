import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import { Layout } from './components/Layout';
import OwnerDashboard from './pages/OwnerDashboard';
import UserManagement from './pages/admin/UserManagement';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import MemberDashboard from './pages/MemberDashboard';
import StrengthLog from './pages/StrengthLog';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
          
          {/* Owner Routes */}
          <Route path="/owner" element={<Layout role="owner" />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
          </Route>

          {/* Member Routes */}
          <Route path="/member" element={<Layout role="member" />}>
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="workouts/strength" element={<StrengthLog />} />
            <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
