import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ErrorProvider, useError } from './ErrorContext';
import { emitError } from '../services/errorBus';

const Probe = () => {
  const { error } = useError();
  return <div data-testid="err">{error?.message ?? ''}</div>;
};

describe('ErrorContext', () => {
  it('provides error values when emitted', async () => {
    render(
      <ErrorProvider>
        <Probe />
      </ErrorProvider>
    );

    await act(async () => {
      emitError({ message: 'Oops' });
    });

    expect(await screen.findByTestId('err')).toHaveTextContent('Oops');
  });
});
