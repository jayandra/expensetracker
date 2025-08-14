import { useState } from 'react';

interface ExampleProps {
  initialCount?: number;
}

export const Example = ({ initialCount = 0 }: ExampleProps) => {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="example-component">
      <p data-testid="count-display">Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        data-testid="increment-button"
      >
        Increment
      </button>
    </div>
  );
};

export default Example;
