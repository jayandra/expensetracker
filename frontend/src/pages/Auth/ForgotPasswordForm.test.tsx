import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ForgotPasswordForm from './ForgotPasswordForm';
import * as authSvc from '../../services/auth.service';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/auth.service', () => ({
  requestPasswordReset: vi.fn().mockResolvedValue({}),
}));

describe('ForgotPasswordForm', () => {
  it('submits email and shows success message', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset instructions/i }));

    expect(await screen.findByText(/you will receive password reset instructions/i)).toBeInTheDocument();
    expect(authSvc.requestPasswordReset).toHaveBeenCalledWith('a@b.com');
  });
});
