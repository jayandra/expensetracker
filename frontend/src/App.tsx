import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ExpensesIndex from './pages/Expenses/ExpensesIndex';
import LoginForm from './pages/Auth/LoginForm';
import SignupForm from './pages/Auth/SignupForm';
import ForgotPasswordForm from './pages/Auth/ForgotPasswordForm';
import ResetPasswordForm from './pages/Auth/ResetPasswordForm';
import './App.css';
import ColorPalette from './pages/ColorPalette';
import ExpenseEdit from './pages/Expenses/ExpenseEdit';
import ExpenseCreate from './pages/Expenses/ExpenseCreate'

// Main App component with routing
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/passwords/:token/edit" element={<ResetPasswordForm />} />
          <Route path="/colors" element={<ColorPalette />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute>
              <ExpensesIndex />
            </ProtectedRoute>
          } />
          <Route path="/expenses/new" element={
            <ProtectedRoute>
              <ExpenseCreate />
            </ProtectedRoute>
          } />
          <Route path="/expenses/:id/edit" element={
            <ProtectedRoute>
              <ExpenseEdit />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;
