import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthCtx from '../contexts/AuthContext';

describe('ProtectedRoute', () => {
  it('renders a loader while loading', () => {
    vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    } as any);

    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    // Spinner div uses the `animate-spin` class
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects when unauthenticated', () => {
    vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Secret</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: 1, email: 'a@b.com' },
      login: vi.fn(),
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});
