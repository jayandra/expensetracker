import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Plugins used by Vitest
  plugins: [react()],  // Enables React support in tests
  
  test: {
    // Enable global variables in test files
    globals: true,
    
    // Use jsdom as the test environment (simulates browser environment)
    environment: 'jsdom',
    
    // Path to the test setup file that runs before tests
    setupFiles: ['./src/test/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',  // Uses V8's built-in coverage
      reporter: ['text', 'json', 'html'],  // Report formats
      exclude: [  // Files to exclude from coverage
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
      ],
    },
  },
});