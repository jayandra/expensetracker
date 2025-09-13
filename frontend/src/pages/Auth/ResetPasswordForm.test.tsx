import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import ResetPasswordForm from './ResetPasswordForm';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAxiosGet = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('axios', () => ({
  default: {
    get: (url: string) => mockAxiosGet(url),
  },
}));

vi.mock('../../services/auth/auth.service', () => ({
  AuthService: {
    resetPassword: (data: any) => mockResetPassword(data),
  },
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosGet.mockResolvedValue({});
    mockResetPassword.mockResolvedValue({});
  });

  it('validates token then submits new password', async () => {
    render(
      <MemoryRouter initialEntries={["/passwords/abc123/edit"]}>
        <Routes>
          <Route path="/passwords/:token/edit" element={<ResetPasswordForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for token validation to complete and form to render
    const passwordInput = await screen.findByPlaceholderText('New password');
    const confirmInput = await screen.findByPlaceholderText('Confirm new password');
    const submitButton = await screen.findByRole('button', { name: /reset password/i });

    // Fill out the form
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    // Verify the reset password API was called with correct data
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: 'abc123',
        password: 'newpassword123',
        password_confirmation: 'newpassword123'
      });
    });

    // Verify success message is shown
    expect(await screen.findByText(/has been reset successfully/i)).toBeInTheDocument();
  });

  it('shows error for invalid token', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('Invalid token'));
    
    render(
      <MemoryRouter initialEntries={["/passwords/invalid-token/edit"]}>
        <Routes>
          <Route path="/passwords/:token/edit" element={<ResetPasswordForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify error message is shown for invalid token
    expect(await screen.findByText(/This password reset link is invalid or has expired/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter initialEntries={["/passwords/abc123/edit"]}>
        <Routes>
          <Route path="/passwords/:token/edit" element={<ResetPasswordForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for form to load
    const passwordInput = await screen.findByPlaceholderText('New password');
    const confirmInput = screen.getByPlaceholderText('Confirm new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Fill out form with mismatched passwords
    fireEvent.change(passwordInput, { target: { value: 'password1' } });
    fireEvent.change(confirmInput, { target: { value: 'password2' } });
    fireEvent.click(submitButton);

    // Verify error message is shown
    expect(await screen.findByText(/Passwords don't match/i)).toBeInTheDocument();
  });
});
