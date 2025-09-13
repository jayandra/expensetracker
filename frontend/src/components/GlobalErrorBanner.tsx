import { useEffect } from 'react';
import { useError } from '../contexts/ErrorContext';

const GlobalErrorBanner = () => {
  const { error, clearError } = useError();

  useEffect(() => {
    if (!error) return;
    
    const timer = setTimeout(() => {
      clearError();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%]">
      <div className="bg-error-100 border-l-4 border-error-500 text-error-700 p-4 shadow rounded">
        <div className="flex items-center justify-center w-full relative">
          <div className="text-center flex-1">
            <p className="text-sm">{error.message}</p>
          </div>
          <span
            role="button"
            tabIndex={0}
            aria-label="Dismiss"
            className="text-error-700 hover:text-error-900 cursor-pointer"
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
