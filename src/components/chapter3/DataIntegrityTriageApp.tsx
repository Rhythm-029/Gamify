/**
 * DataIntegrityTriageApp.tsx
 * Compatibility alias pointing to IntegrationPortalApp for Chapter 3
 */

import React from 'react';
import { IntegrationPortalApp } from './IntegrationPortalApp';
import type { Chapter3State } from '../../types/chapter3';

interface DataIntegrityTriageAppProps {
  chapter3State: Chapter3State;
  onSelectDecision?: (key: any) => void;
  onToggleAction?: (key: any) => void;
  onSubmitPlan?: () => void;
  onOpenScorecard?: () => void;
  onUpdateState?: (updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)) => void;
}

export const DataIntegrityTriageApp: React.FC<DataIntegrityTriageAppProps> = ({
  chapter3State,
  onUpdateState = () => {},
  onSubmitPlan = () => {},
  onOpenScorecard = () => {},
}) => {
  return (
    <IntegrationPortalApp
      chapter3State={chapter3State}
      onUpdateState={onUpdateState}
      onReturnToMeeting={onOpenScorecard}
      onSubmitCompleteTriage={onSubmitPlan}
    />
  );
};
