import React from 'react';

interface FullscreenGateProps {
  children: React.ReactNode;
  onApplyPenalty?: (trustDelta: number, xpDelta: number) => void;
}

export const FullscreenGate: React.FC<FullscreenGateProps> = ({ children }) => {
  return <>{children}</>;
};
