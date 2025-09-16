// Import testing library's DOM extensions for better assertions
import '@testing-library/jest-dom';
// Import Vitest's mocking utilities
import { vi } from 'vitest';

// Mock the window.matchMedia API which is commonly used for responsive design
// This is needed because JSDOM (the DOM implementation used in tests) doesn't implement this API
Object.defineProperty(window, 'matchMedia', {
  writable: true,  // Makes the property configurable
  value: vi.fn().mockImplementation(query => ({
    matches: false,  // Default to no matches
    media: query,    // The media query string being tested
    onchange: null,  // Event handler for changes
    // Mock methods that components might call
    addListener: vi.fn(),           // Legacy event listener
    removeListener: vi.fn(),        // Legacy event remover
    addEventListener: vi.fn(),      // Modern event listener
    removeEventListener: vi.fn(),   // Modern event remover
    dispatchEvent: vi.fn(),         // For triggering events
  })),
});