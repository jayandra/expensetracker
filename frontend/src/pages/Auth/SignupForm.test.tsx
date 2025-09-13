import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import SignupForm from './SignupForm';
import { AuthService } from '../../services/auth/auth.service';
import * as AuthCtx from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/auth/auth.service', () => ({
  AuthService: {
    signup: vi.fn().mockResolvedValue({}),
  },
}));

describe('SignupForm', () => {
  it('signs up then logs in', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
      login,
      loading: false,
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'secret' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => expect(AuthService.signup).toHaveBeenCalled());
    await waitFor(() => expect(login).toHaveBeenCalledWith('a@b.com', 'secret'));
  });
});
