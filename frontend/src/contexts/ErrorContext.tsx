import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { onError, offError } from '../services/errorBus';

export interface AppError {
  status?: number;
  message?: string;
  data?: any;
  raw?: any;
}

interface ErrorContextValue {
  error: AppError | null;
  setError: (err: AppError | null) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    const handler = (err: any) => {
      console.log(err)
      const normalized: AppError = {
        status: err?.status ?? err?.response?.status,
        message:
          err?.data?.errors.join(', ') ||
          err?.data?.message ||
          err?.message ||
          err?.response?.data?.errors.join(', ') ||
          err?.response?.statusText ||
          'An unexpected error occurred',
        data: err?.data ?? err?.response?.data,
        raw: err,
      };
      setError(normalized);
    };

    onError(handler);
    return () => offError(handler);
  }, []);

  const value = useMemo<ErrorContextValue>(
    () => ({ error, setError, clearError: () => setError(null) }),
    [error]
  );

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used within ErrorProvider');
  return ctx;
};
