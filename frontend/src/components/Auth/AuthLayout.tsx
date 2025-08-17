import React from 'react';

interface AuthLayoutProps {
  title?: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => {
  return (
    <div className="w-full">
      <div className="w-full sm:w-80 md:w-96 lg:w-[32rem] xl:w-[36rem] space-y-8">
        {(title || subtitle) && (
          <div>
            {title && (
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        {children}

        {footer && (
          <div className="text-sm text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
