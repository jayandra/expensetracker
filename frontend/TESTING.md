# Frontend Testing Guide

This guide provides instructions for running and writing tests for the frontend application.

## Available Scripts

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with the Vitest UI
- `npm run test:coverage` - Run tests and generate coverage report

## Writing Tests

### Test File Naming
- Test files should be named with the pattern `*.test.tsx` or `*.spec.tsx`
- Place test files next to the component they test or in a `__tests__` directory

### Example Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Example } from './Example';

describe('Example Component', () => {
  it('renders with initial count', () => {
    render(<Example initialCount={5} />);
    expect(screen.getByTestId('count-display')).toHaveTextContent('Count: 5');
  });
});
```

## Testing Best Practices

- Use `screen` from `@testing-library/react` for queries
- Prefer `getByRole` and other semantic queries over test IDs
- Keep tests focused on behavior, not implementation details
- Mock external dependencies when necessary

## Debugging Tests

- Use `screen.debug()` to log the rendered component
- Use the `--ui` flag for interactive debugging: `npm run test:ui`
- Check the coverage report to identify untested code: `npm run test:coverage`

## Common Patterns

### Mocking API Calls

```typescript
import { vi } from 'vitest';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: 'mocked data' }),
    })
  ) as jest.Mock;
});
```

### Testing User Interactions

```typescript
it('handles button click', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```
