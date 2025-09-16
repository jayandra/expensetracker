import { forwardRef } from 'react';
import { IconSelector } from './IconSelector';
import type { IconSelectorProps } from './IconSelector';

interface FormIconSelectorProps extends IconSelectorProps {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const FormIconSelector = forwardRef<HTMLDivElement, FormIconSelectorProps>(({ 
  label, 
  error, 
  containerClassName = '',
  ...props 
}, ref) => {
  const inputId = `icon-selector-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className={`w-full min-w-full ${containerClassName}`.trim()} ref={ref}>
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </label>
      
      <div className="relative">
        <IconSelector
          id={inputId}
          className={error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

FormIconSelector.displayName = 'FormIconSelector';

export default FormIconSelector;
