import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResetPasswordForm from './ResetPasswordForm';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../services/auth.service', () => ({
  resetPassword: vi.fn().mockResolvedValue({}),
}));

describe('ResetPasswordForm', () => {
  it('validates token then submits new password', async () => {
    render(
      <MemoryRouter initialEntries={["/passwords/abc123/edit"]}>
        <Routes>
          <Route path="/passwords/:token/edit" element={<ResetPasswordForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for token validation spinner to go away by finding fields
    const [pw] = await screen.findAllByPlaceholderText(/new password/i);
    fireEvent.change(pw, { target: { value: 'secret1' } });
    const [pwConfirm] = screen.getAllByPlaceholderText(/confirm new password/i);
    fireEvent.change(pwConfirm, { target: { value: 'secret1' } });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/has been reset successfully/i)).toBeInTheDocument();
  });
});
