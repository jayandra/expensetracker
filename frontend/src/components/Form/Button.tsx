import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  disabled = false,
  isLoading = false,
  variant = 'primary',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'relative w-full flex justify-center py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'border-transparent text-primary-700 bg-primary-100 hover:bg-primary-200 focus:ring-primary-500',
    danger: 'border-transparent text-white bg-error-600 hover:bg-error-700 focus:ring-error-500',
    outline: 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-primary-500',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';
  const buttonClassName = [
    baseStyles,
    variantStyles[variant],
    (disabled || isLoading) ? disabledStyles : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type as 'button' | 'submit' | 'reset' | undefined}
      disabled={disabled || isLoading}
      className={buttonClassName}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
