import type { ReactNode } from 'react';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

const FormContainer = ({
  title,
  subtitle,
  footer,
  children,
  className = '',
}: FormContainerProps) => {
  return (
    <div className="w-full p-4">
      <div className={`w-full sm:w-80 md:w-96 lg:w-[32rem] xl:w-[36rem] space-y-8 ${className}`}>
        <div>
          <h2 className="text-center text-3xl font-extrabold text-neutral-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-neutral-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6 border border-neutral-100">
          {children}
        </div>
        
        {footer && (
          <div className="text-sm text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormContainer;
