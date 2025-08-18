import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  id,
  error,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className={containerClassName}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        className={`appearance-none relative block w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:z-10 sm:text-sm placeholder:text-neutral-500 text-neutral-900 focus:ring-primary-500 focus:border-primary-500 ${className} ${
          error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
