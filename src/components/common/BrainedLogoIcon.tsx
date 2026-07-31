import React from 'react';

interface BrainedLogoIconProps {
  className?: string;
  size?: number;
}

export const BrainedLogoIcon: React.FC<BrainedLogoIconProps> = ({ 
  className = "w-6 h-6",
}) => {
  return (
    <img 
      src="/assets/brained_logo.png" 
      alt="Brained OS Logo" 
      className={`object-contain ${className}`}
    />
  );
};
