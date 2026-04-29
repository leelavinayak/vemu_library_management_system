import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentPortal from './pages/StudentPortal';
import TeacherPortal from './pages/TeacherPortal';
import AdminPortal from './pages/AdminPortal';
import LibrarianPortal from './pages/LibrarianPortal';
import Landing from './pages/Landing';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student/*" element={<PrivateRoute role="student"><StudentPortal /></PrivateRoute>} />
      <Route path="/teacher/*" element={<PrivateRoute role="teacher"><TeacherPortal /></PrivateRoute>} />
      <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminPortal /></PrivateRoute>} />
      <Route path="/librarian/*" element={<PrivateRoute role="librarian"><LibrarianPortal /></PrivateRoute>} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#000000',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 500,
                padding: '12px 20px',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  background: '#000000',
                  color: '#ffffff',
                }
              }
            }}
          />
          <div style={{ flex: 1 }}>
            <AppRoutes />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
