import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import * as AuthCtx from '../contexts/AuthContext';

describe('Dashboard', () => {
  it('shows expense overview with correct sections', async () => {
    // Mock the auth context
    vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
      user: { id: 1, email: 'a@b.com' },
      logout: vi.fn(),
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
    } as any);

    render(<Dashboard />);

    // Check for the main heading
    expect(screen.getByRole('heading', { name: /expense overview/i })).toBeInTheDocument();
    
    // Check for the period selector buttons
    expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument();
    
    // Check for the main sections
    expect(screen.getByText(/total balance/i)).toBeInTheDocument();
    expect(screen.getByText(/monthly budget/i)).toBeInTheDocument();
    expect(screen.getByText(/expense categories/i)).toBeInTheDocument();
    expect(screen.getByText(/recent transactions/i)).toBeInTheDocument();
  });
});
