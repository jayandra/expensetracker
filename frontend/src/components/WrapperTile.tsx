import type { ReactNode } from 'react';
import React from 'react';

interface WrapperTileProps {
  children: ReactNode;
  className?: string;
}

export const WrapperTile: React.FC<WrapperTileProps> = ({ children, className = '' }) => {
  const baseClasses = 'bg-neutral-100 rounded-xl p-2 md:p-4 mb-4 w-full min-w-full';
  
  return (
    <div className={`${baseClasses} ${className}`.trim()}>
      {children}
    </div>
  );
};

export default WrapperTile;
