import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage from "./pages/LandingPage";
import Signin from "./pages/Signin";
import Login from "./pages/Login";
import Layout from "./Components/Layout";
import Dashboards from "./pages/Dashboards";
import TaskHistory from "./pages/TaskHistory";
import ChatPage from "./pages/ChatPage";
import Sidebar from "./Components/Sidebar";



// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Task History Layout Wrapper
const TaskHistoryLayout = () => (
  <div className="flex min-h-screen">
    <div className="w-[260px] h-screen sticky top-0 left-0">
      <Sidebar />
    </div>
    <div className="flex-1">
      <TaskHistory />
    </div>
  </div>
);


// Dashboards Layout Wrapper
const DashboardsLayout = () => (
  <div className="flex min-h-screen">
    <div className="w-[260px] h-screen sticky top-0 left-0">
      <Sidebar />
    </div>
    <div className="flex-1">
      <Dashboards />
    </div>
  </div>
);

// Chat Layout Wrapper
const ChatLayout = () => (
  <div className="flex min-h-screen">
    <div className="w-[260px] h-screen sticky top-0 left-0">
      <Sidebar />
    </div>
    <div className="flex-1 overflow-hidden">
      <ChatPage />
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Layout Route */}
        <Route
          path="/layout"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboards Route */}
        <Route
          path="/dashboards"
          element={
            <ProtectedRoute>
              <DashboardsLayout />
            </ProtectedRoute>
          }
        />

        {/* Protected Task History Route */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskHistoryLayout />
            </ProtectedRoute>
          }
        />

        {/* Protected Chat Route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}