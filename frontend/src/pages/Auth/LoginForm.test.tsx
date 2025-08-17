import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';
import * as AuthCtx from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

describe('LoginForm', () => {
  it('submits credentials via useAuth.login', async () => {
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
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith('a@b.com', 'secret');
  });
});
