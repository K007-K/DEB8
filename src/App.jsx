import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import BrowseDebates from './pages/BrowseDebates';
import BrowsePolls from './pages/BrowsePolls';
import CreateRoom from './pages/CreateRoom';
import RoomPage from './pages/RoomPage';
import ProfilePage from './pages/ProfilePage';
import MyRoomsPage from './pages/MyRoomsPage';

import { Toaster } from 'react-hot-toast';

import DashboardNav from './components/layout/DashboardNav';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020202] flex items-center justify-center transition-colors duration-500">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return (
    <>
      <DashboardNav />
      <div className="pt-16 min-h-screen bg-slate-50 dark:bg-[#020202] transition-colors duration-500">
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-background">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/debates"
              element={
                <PrivateRoute>
                  <BrowseDebates />
                </PrivateRoute>
              }
            />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreateRoom />
                </PrivateRoute>
              }
            />

            <Route
              path="/polls"
              element={
                <PrivateRoute>
                  <BrowsePolls />
                </PrivateRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <PrivateRoute>
                  <RoomPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-rooms"
              element={
                <PrivateRoute>
                  <MyRoomsPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;