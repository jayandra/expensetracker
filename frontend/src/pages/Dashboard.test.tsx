import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import * as AuthCtx from '../contexts/AuthContext';

describe('Dashboard', () => {
  it('shows user email and can logout', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
      user: { id: 1, email: 'a@b.com' },
      logout,
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
    } as any);

    render(<Dashboard />);

    expect(screen.getByText(/hello, a@b.com/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(logout).toHaveBeenCalled();
  });
});
