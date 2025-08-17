import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authSvc from '../services/auth.service';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/auth.service', () => ({
  checkSession: vi.fn().mockResolvedValue({}),
  login: vi.fn().mockResolvedValue({ user: { id: 1, email_address: 'a@b.com' } }),
  logout: vi.fn().mockResolvedValue(undefined),
}));

const Probe = () => {
  const { isAuthenticated, loading } = useAuth();
  return <div data-testid="state">{loading ? 'loading' : isAuthenticated ? 'auth' : 'guest'}</div>;
};

describe('AuthContext', () => {
  it('initially checks session and becomes guest when no user', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('guest'));
    expect(authSvc.checkSession).toHaveBeenCalled();
  });
});
