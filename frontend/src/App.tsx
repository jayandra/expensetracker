import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import ExpensesIndex from './pages/expenses/ExpensesIndex';
import LoginForm from './pages/Auth/LoginForm';
import SignupForm from './pages/Auth/SignupForm';
import ForgotPasswordForm from './pages/Auth/ForgotPasswordForm';
import ResetPasswordForm from './pages/Auth/ResetPasswordForm';
import './App.css';
import ColorPalette from './pages/ColorPalette';

// Main App component with routing
function App() {
  return (
      <Router>
        <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/colors" element={<ColorPalette/>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/passwords/:token/edit" element={<ResetPasswordForm />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesIndex />
              </ProtectedRoute>
            }
          />
          
          {/* 
          Fallback route to redirect to "/" overriding the non-existing route in histor 
          If user visits "/non-existent-route", they will be redirected to "/" and browser history will show "/" instead of "/non-existent-route"
          */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </Router>
  );
}

export default App;
