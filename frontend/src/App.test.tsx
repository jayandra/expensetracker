import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }: any) => <>{children}</>,
}));

vi.mock('./pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

vi.mock('./pages/Auth/LoginForm', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('./pages/Auth/SignupForm', () => ({
  default: () => <div>Signup Page</div>,
}));

vi.mock('./pages/Auth/ForgotPasswordForm', () => ({
  default: () => <div>Forgot Page</div>,
}));

vi.mock('./pages/Auth/ResetPasswordForm', () => ({
  default: () => <div>Reset Page</div>,
}));

describe('App', () => {
  it('renders without crashing and provides routes', () => {
    render(<App />);
    // At least one mocked route should render
    expect(screen.getByText(/login|signup|forgot|dashboard|reset/i)).toBeInTheDocument();
  });
});
