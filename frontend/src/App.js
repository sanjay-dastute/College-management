import React from 'react';
import { ChakraProvider, CSSReset, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentForm from './pages/StudentForm';
import Navigation from './components/Navigation';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import theme from './theme';
import { ROUTES } from './constants';

function App() {
  return (
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <ErrorBoundary>
          <AuthProvider>
            <Router>
              <Box minH="100vh">
                <Navigation />
                <Box p={4}>
                  <Routes>
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.FACULTY_DASHBOARD} element={
                      <PrivateRoute requiredRole="faculty">
                        <FacultyDashboard />
                      </PrivateRoute>
                    } />
                    <Route path={ROUTES.STUDENT_DASHBOARD} element={
                      <PrivateRoute requiredRole="student">
                        <StudentDashboard />
                      </PrivateRoute>
                    } />
                    <Route path={ROUTES.STUDENT_NEW} element={
                      <PrivateRoute requiredRole="faculty">
                        <StudentForm />
                      </PrivateRoute>
                    } />
                    <Route path={ROUTES.STUDENT_EDIT} element={
                      <PrivateRoute requiredRole="faculty">
                        <StudentForm />
                      </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
                  </Routes>
                </Box>
              </Box>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </Router>
          </AuthProvider>
        </ErrorBoundary>
      </ChakraProvider>
    </React.StrictMode>
  );
}

export default App;
