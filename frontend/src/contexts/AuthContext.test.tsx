import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthService } from '../services/auth/auth.service';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

vi.mock('../services/auth/auth.service', () => ({
  AuthService: {
    checkSession: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn()
  }
}));

const mockAuthService = vi.mocked(AuthService);

const Probe = () => {
  const { isAuthenticated, loading } = useAuth();
  return <div data-testid="state">{loading ? 'loading' : isAuthenticated ? 'auth' : 'guest'}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('initially checks session and becomes guest when no user', async () => {
    // Mock checkSession to reject with 401 error
    const error = new Error('Not authenticated') as any;
    error.status = 401;
    mockAuthService.checkSession.mockRejectedValueOnce(error);

    render(
      <MemoryRouter>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show loading initially
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
    
    // After checkSession rejects with 401, should be unauthenticated
    await waitFor(() => {
      expect(screen.getByTestId('state')).toHaveTextContent('guest');
    });
  });

  it('logs in successfully', async () => {
    const mockUser = { 
      id: 1, 
      email: 'test@example.com'
    };
    
    mockAuthService.login.mockResolvedValueOnce({ 
      user: {
        ...mockUser,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('logs out successfully', async () => {
    mockAuthService.logout.mockResolvedValueOnce(undefined);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Log in first
    await act(async () => {
      // @ts-ignore - directly set user for test
      result.current.user = { id: 1, email: 'test@example.com' };
    });
    
    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
