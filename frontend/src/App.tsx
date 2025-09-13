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
import ExpenseCreate from './pages/Expenses/ExpenseCreate';
import CategoriesIndex from './pages/Categories/CategoriesIndex';
import CategoryCreate from './pages/Categories/CategoryCreate';
import CategoryEdit from './pages/Categories/CategoryEdit';

// Main App component with routing
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/react/login" element={<LoginForm />} />
          <Route path="/react/signup" element={<SignupForm />} />
          <Route path="/react/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/react/passwords/:token/edit" element={<ResetPasswordForm />} />
          <Route path="/react/colors" element={<ColorPalette />} />
          
          {/* Protected routes */}
          <Route path="/react" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/react/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/react/expenses" element={
            <ProtectedRoute>
              <ExpensesIndex />
            </ProtectedRoute>
          } />
          <Route path="/react/expenses/new" element={
            <ProtectedRoute>
              <ExpenseCreate />
            </ProtectedRoute>
          } />
          <Route path="/react/expenses/:id/edit" element={
            <ProtectedRoute>
              <ExpenseEdit />
            </ProtectedRoute>
          } />
          <Route path="/react/categories" element={
            <ProtectedRoute>
              <CategoriesIndex />
            </ProtectedRoute>
          } />
          <Route path="/react/categories/new" element={
            <ProtectedRoute>
              <CategoryCreate />
            </ProtectedRoute>
          } />
          <Route path="/react/categories/:id/edit" element={
            <ProtectedRoute>
              <CategoryEdit />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/react" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;
