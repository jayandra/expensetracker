import { type ReactNode, useEffect, useCallback } from 'react';
import { DBProvider } from '@tanstack/react-db';
import { db } from '../db';

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  // Initialize the database when the app starts
  const initializeDB = useCallback(async () => {
    try {
      await db.initialize();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }, []);

  useEffect(() => {
    initializeDB();
    
    // Set up error boundary for unhandled database errors
    const handleError = (event: ErrorEvent) => {
      console.error('Database error:', event.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [initializeDB]);

  return <DBProvider db={db}>{children}</DBProvider>;
}
