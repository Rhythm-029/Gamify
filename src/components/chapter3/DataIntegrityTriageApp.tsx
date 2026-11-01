import React from 'react';
import type { Chapter3State } from '../../types/chapter3';
import { IntegrationPortalApp } from './IntegrationPortalApp';

interface DataIntegrityTriageAppProps {
  chapter3State: Chapter3State;
  onUpdateState: (
    updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)
  ) => void;
  onReturnToMeeting?: () => void;
  onSubmitCompleteTriage?: () => void;
}

export const DataIntegrityTriageApp: React.FC<DataIntegrityTriageAppProps> = (props) => {
  return <IntegrationPortalApp {...props} />;
};
