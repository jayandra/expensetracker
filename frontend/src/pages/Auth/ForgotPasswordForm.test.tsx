import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordForm from './ForgotPasswordForm';
import { AuthService } from '../../services/auth/auth.service';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/auth/auth.service', () => ({
  AuthService: {
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ForgotPasswordForm', () => {
  it('submits email and shows success message', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset instructions/i }));

    expect(await screen.findByText(/you will receive password reset instructions/i)).toBeInTheDocument();
    await waitFor(() => expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('test@example.com'));
  });
});
