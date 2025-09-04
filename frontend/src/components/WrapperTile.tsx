import React, { ReactNode } from 'react';

interface WrapperTileProps {
  children: ReactNode;
  className?: string;
}

export const WrapperTile: React.FC<WrapperTileProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-neutral-100 rounded-xl p-2 md:p-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

export default WrapperTile;
