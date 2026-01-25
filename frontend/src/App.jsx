import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import Home from './pages/Home';
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


function App() {
  return (
    <Router>
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
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatBot />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes with Persistent Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<Welcome />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/pipeline" element={<Admin />} />
            <Route path="/admin/datasources" element={<Datasources />} />
            <Route path="/admin/schedules" element={<ScheduledPipelines />} />
            <Route path="/admin/users" element={<UsersManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
