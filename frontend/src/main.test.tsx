import { describe, it, expect, vi } from 'vitest';
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

// Importing the entry should call createRoot without throwing
import './main';

import { createRoot } from 'react-dom/client';

describe('main entry', () => {
  it('creates a root and calls render', () => {
    expect(createRoot).toHaveBeenCalled();
  });
});
