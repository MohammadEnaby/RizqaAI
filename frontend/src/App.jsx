import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import ChatBot from './pages/ChatBot';
import Admin from './pages/adminPages/Pipeline';
import Dashboard from './pages/adminPages/Dashboard';
import Datasources from './pages/adminPages/Datasources';
import ScheduledPipelines from './pages/adminPages/ScheduledPipelines';
import UsersManagement from './pages/adminPages/UsersManagement';
import Welcome from './pages/adminPages/Welcome';
import Layout from './components/adminPage/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import MainPage from './pages/mainPage';


import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<MainPage />} />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <ChatBot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Welcome />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pipeline"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <UsersManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/datasources"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Datasources />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <ScheduledPipelines />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
