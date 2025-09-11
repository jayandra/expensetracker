import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Icon, ICONS } from '../ui/Icon';

// Simple button component
const Button = ({ 
  className, 
  size = 'default', 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  size?: 'default' | 'icon';
}) => {
  const baseClasses = 'appearance-none relative block w-full min-w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:z-10 text-sm text-neutral-900 focus:ring-primary-500 focus:border-primary-500';
  const sizeClasses = {
    default: 'h-10',
    icon: 'h-10',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

export const IconSelector = ({ value, onChange, className, id }: IconSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  // Load Material Icons stylesheet
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full text-left ${className || ''}`}
            id={id}
          >
            <div className="flex items-center justify-between w-full">
              {value ? (
                <div className="flex items-center gap-2">
                  <Icon name={value} className="text-lg text-neutral-900" />
                </div>
              ) : (
                <span className="text-neutral-500">Select an icon...</span>
              )}
              <svg 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'transform rotate-180' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </Button>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Content className="z-50 min-w-[220px] rounded-md border bg-white p-2 shadow-md" align="start">
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                className={`flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 ${
                  value === icon ? 'bg-blue-100' : ''
                }`}
                onClick={() => {
                  onChange(icon);
                  setOpen(false);
                }}
                title={icon}
              >
                <Icon name={icon} className="text-lg" />
                <span className="sr-only">{icon}</span>
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default IconSelector;
