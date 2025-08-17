import { useEffect } from 'react';
import { useError } from '../contexts/ErrorContext';

const GlobalErrorBanner = () => {
  const { error, clearError } = useError();

  useEffect(() => {
    if (!error) return;
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%]">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow rounded">
        <div className="flex items-center justify-center w-full relative">
          <div className="text-center flex-1">
            <p className="text-sm">{error.message}</p>
          </div>
          <span
            role="button"
            tabIndex={0}
            aria-label="Dismiss"
            className="text-red-700 hover:text-red-900 cursor-pointer"
            onClick={clearError}
          >
            ✕
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorBanner;
