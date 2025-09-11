import type { ChangeEvent, ForwardedRef, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'datetime-local' | 'tel' | 'url' | 'search';
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> & {
  type: 'select';
  options: { value: string | number; label: string }[];
  placeholder?: string;
};

type FormInputProps = (InputProps | SelectProps) & {
  label: string;
  error?: string;
  containerClassName?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

const FormInput = forwardRef<HTMLInputElement | HTMLSelectElement, FormInputProps>(({
  label,
  id,
  error,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  const commonClasses = `appearance-none relative block w-full min-w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:z-10 text-sm text-neutral-900 focus:ring-primary-500 focus:border-primary-500 ${type === 'select' ? 'pr-10' : ''} ${className} ${
    error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
  }`;

  return (
    <div className={`w-full min-w-full ${containerClassName}`.trim()}>
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </label>
      
      {type === 'select' && 'options' in props ? (
        <div className="relative">
          <select
            id={inputId}
            ref={ref as ForwardedRef<HTMLSelectElement>}
            className={commonClasses}
            {...props}
            aria-placeholder={props.placeholder}
            value={props.value ?? ''}
            style={!props.value ? { color: '#737373' } : {}}
          >
          <option value="" style={{ color: '#737373' }}>{props.placeholder || `Select ${label.toLowerCase()}`}</option>
          {props.options.map((option) => (
            <option key={option.value} value={option.value} className="text-neutral-900">
              {option.label}
            </option>
          ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      ) : (
        <input
          id={inputId}
          ref={ref as ForwardedRef<HTMLInputElement>}
          type={type}
          className={commonClasses}
          {...props as InputProps}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
