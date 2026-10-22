export type Chapter3DecisionKey =
  | 'continue_demo_as_ready'
  | 'stop_all_development'
  | 'contain_and_validate_affected';

export type Chapter3ActionKey =
  | 'isolate_affected_records'
  | 'verify_source_mappings'
  | 'assign_owner_continue_unaffected_work';

export type Chapter3OutcomeType = 'strong' | 'partial' | 'poor';

export interface DataMismatchRecord {
  id: string;
  module: 'Appraisal Cycle' | 'Leave & Attendance';
  employeeId: string;
  employeeName: string;
  field: string;
  prototypeValue: string;
  authoritativeSourceValue: string;
  severity: 'Critical' | 'High';
  status: 'Flagged' | 'Contained' | 'Validated';
}

export interface Chapter3Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: Chapter3OutcomeType;
  outcomeText: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
}

export interface Chapter3State {
  entered: boolean;
  activeBeat: 'warning' | 'decision' | 'plan' | 'scorecard' | 'completed';
  decision: Chapter3DecisionKey | null;
  decisionFeedback: string | null;
  selectedActions: Chapter3ActionKey[];
  planSubmitted: boolean;
  scorecard: Chapter3Scorecard;
  completed: boolean;
}
