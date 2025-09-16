import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalErrorBanner from './GlobalErrorBanner';
import { ErrorProvider } from '../contexts/ErrorContext';
import { emitError } from '../services/errorBus';

describe('GlobalErrorBanner', () => {
  it('shows and dismisses global error', async () => {
    render(
      <ErrorProvider>
        <GlobalErrorBanner />
      </ErrorProvider>
    );

    emitError({ message: 'Boom!' });

    const alert = await screen.findByText('Boom!');
    expect(alert).toBeInTheDocument();

    const dismiss = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismiss);

    // After dismiss, the banner should be gone
    expect(screen.queryByText('Boom!')).not.toBeInTheDocument();
  });
});
