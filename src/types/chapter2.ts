export type InfrastructureOption = 'unsafe' | 'wait' | 'secure';
export type CommunicationOption = 'single-chat' | 'dual-track';
export type UiUxOption = 'verbal' | 'written-signoff';

export interface PrototypePreviewItem {
  id: 'appraisal' | 'leave' | 'form16';
  title: string;
  subtitle: string;
  version: string;
  status: 'In Review' | 'Approved Baseline';
  summary: string;
  features: string[];
}

export interface Chapter2State {
  entered: boolean;
  activeBeat: 'incident' | 'communication' | 'uiux' | 'readiness' | 'scorecard' | 'completed';
  
  infrastructure: {
    initialDecision: InfrastructureOption | null;
    recoveryRequired: boolean;
    recoveryCompleted: boolean;
    requestSent: boolean;
    bankITResolved: boolean;
    stagingVerified: boolean;
  };

  communication: {
    initialDecision: CommunicationOption | null;
    finalStructure: CommunicationOption | null;
    channelCreated: boolean;
    executiveReportingConfigured: boolean;
  };

  uiux: {
    initialDecision: UiUxOption | null;
    recoveryRequired: boolean;
    signoffSent: boolean;
    approvalReceived: boolean;
    approvedVersions: string[];
  };

  sprint: {
    readinessVerified: boolean;
    greenlightIssued: boolean;
  };

  scorecard: {
    shown: boolean;
    scheduleScore: number;
    riskScore: number;
    governanceScore: number;
    efficiencyScore: number;
    totalScore: number;
    explanations: {
      schedule: string;
      risk: string;
      governance: string;
      efficiency: string;
    };
  };

  completed: boolean;
}
