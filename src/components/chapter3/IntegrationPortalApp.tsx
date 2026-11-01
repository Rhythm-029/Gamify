import React from 'react';
import type { Chapter3State } from '../../types/chapter3';
import { UatDocumentViewer } from './UatDocumentViewer';

interface IntegrationPortalAppProps {
  chapter3State: Chapter3State;
  onUpdateState: (
    updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)
  ) => void;
  onReturnToMeeting?: () => void;
  onSubmitCompleteTriage?: () => void;
}

export const IntegrationPortalApp: React.FC<IntegrationPortalAppProps> = ({
  chapter3State,
  onUpdateState,
}) => {
  const currentDoc = chapter3State.v2Delivered
    ? chapter3State.v2Document
    : chapter3State.v1Document;

  return (
    <div className="w-full h-full bg-[#070913] text-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h1 className="text-base font-bold text-white">Project Amigo — UAT Environment Portal</h1>
            <p className="text-xs text-slate-400">Technical Prerequisites & Document Repository</p>
          </div>
        </div>

        <UatDocumentViewer
          document={currentDoc}
          showV1Actions={!chapter3State.v2Delivered && chapter3State.v1Delivered}
          showV2Actions={chapter3State.v2Delivered && !chapter3State.v2SentToDaniel}
        />
      </div>
    </div>
  );
};
