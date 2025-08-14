import { render, screen, fireEvent } from '@testing-library/react';
import { Example } from './Example';

describe('Example Component', () => {
  it('renders with initial count', () => {
    render(<Example initialCount={5} />);
    expect(screen.getByTestId('count-display')).toHaveTextContent('Count: 5');
  });

  it('increments count when button is clicked', () => {
    render(<Example initialCount={0} />);
    const button = screen.getByTestId('increment-button');
    
    fireEvent.click(button);
    expect(screen.getByTestId('count-display')).toHaveTextContent('Count: 1');
    
    fireEvent.click(button);
    expect(screen.getByTestId('count-display')).toHaveTextContent('Count: 2');
  });
});
