import { 
  INITIAL_TIMELINE_STEPS, 
  INITIAL_PROJECT_FILES, 
  type VirtualFile, 
  type BuildTimelineStep 
} from './ceraSimulationData';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface InteractiveOption {
  id: string;
  label: string;
  description: string;
  marks?: number;
}

export interface InteractivePrompt {
  triggerIndex: number;
  stepId: string;
  title: string;
  subtitle: string;
  options: InteractiveOption[];
  selectedId: string;
}

export interface CeraState {
  projectName: string | null;
  generatedFiles: VirtualFile[];
  openFiles: VirtualFile[];
  activeFileId: string | null;
  isAiBuilding: boolean;
  isBuildFinished: boolean;
  isDevServerRunning: boolean;
  currentStatus: string;
  speedMultiplier: number;
  timelineSteps: BuildTimelineStep[];
  chatMessages: ChatMessage[];
  terminalLogs: string[];
  currentInteractivePrompt: InteractivePrompt | null;
  pendingInputMessage: string | null;
  wizardQuestionIdx: number;
}

const INITIAL_STATE: CeraState = {
  projectName: null,
  generatedFiles: [],
  openFiles: [],
  activeFileId: null,
  isAiBuilding: false,
  isBuildFinished: false,
  isDevServerRunning: false,
  currentStatus: '',
  speedMultiplier: 1,
  timelineSteps: INITIAL_TIMELINE_STEPS.map((s) => ({ ...s, status: 'pending' })),
  chatMessages: [],
  terminalLogs: [],
  currentInteractivePrompt: null,
  pendingInputMessage: null,
  wizardQuestionIdx: 0,
};

let ceraState: CeraState = { ...INITIAL_STATE };

type Listener = (state: CeraState) => void;
const listeners = new Set<Listener>();

export const getCeraState = (): CeraState => ceraState;

// Accepts either a partial updater function OR a partial update object
// The function form MUST spread prev to avoid state field corruption
export const updateCeraState = (updater: Partial<CeraState> | ((prev: CeraState) => Partial<CeraState>)) => {
  if (typeof updater === 'function') {
    const partial = updater(ceraState);
    ceraState = { ...ceraState, ...partial };
  } else {
    ceraState = { ...ceraState, ...updater };
  }
  listeners.forEach((listener) => listener(ceraState));
};

export const subscribeCeraState = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const resetCeraSimulationState = () => {
  if (globalBuildTimerRef) {
    clearTimeout(globalBuildTimerRef);
    globalBuildTimerRef = null;
  }
  currentWorkStepIndex = 0;
  ceraState = {
    ...INITIAL_STATE,
    timelineSteps: INITIAL_TIMELINE_STEPS.map((s) => ({ ...s, status: 'pending' })),
  };
  listeners.forEach((listener) => listener(ceraState));
};

// ── Background Simulation State ────────────────────────────────────────────────

let globalBuildTimerRef: ReturnType<typeof setTimeout> | null = null;
let currentWorkStepIndex = 0;
let externalNotifCallback: ((notif: any) => void) | null = null;
let externalOpenBrowserCallback: ((url: string) => void) | null = null;

export const setExternalNotifCallback = (cb: (notif: any) => void) => {
  externalNotifCallback = cb;
};

export const setExternalOpenBrowserCallback = (cb: (url: string) => void) => {
  externalOpenBrowserCallback = cb;
};

export const setActiveAppChecker = (_cb: () => string | null) => {};

// ── 4 Feature Framing Questions (Back-to-Back Wizard BEFORE Build) ────────────

export const FEATURE_QUESTIONS = [
  {
    index: 1,
    title: 'Question 1 of 4: Authentication & Access Control Framing',
    subtitle: 'Which security feature architecture should I frame into the website?',
    options: [
      {
        id: 'opt_sso',
        label: 'Enterprise SSO & Role-Based Access Control (RBAC)',
        description: "Approved in CTO Marcus Reed's brief. Enforces identity mapping for Employees, Managers & Admins.",
        marks: 15,
      },
      {
        id: 'opt_guest_access',
        label: 'Public Unauthenticated Guest Portal',
        description: 'Allows guest access without passwords to save plant floor time.',
        marks: 0,
      },
    ],
    defaultOptionId: 'opt_sso',
  },
  {
    index: 2,
    title: 'Question 2 of 4: Leave Management & Approval Workflow',
    subtitle: 'Which core workflow feature should I frame into the website?',
    options: [
      {
        id: 'opt_hr_escalate',
        label: '1-Click Leave Requests with Manager Approval & 48h Escalation',
        description: "Matches Daniel's brief. Prevents leave bottlenecks for shift supervisors.",
        marks: 15,
      },
      {
        id: 'opt_auto_fire',
        label: 'AI Automated Employee Termination Engine',
        description: 'Auto-terminates employees without manager review.',
        marks: 0,
      },
    ],
    defaultOptionId: 'opt_hr_escalate',
  },
  {
    index: 3,
    title: 'Question 3 of 4: Executive Analytics & Payroll Integration',
    subtitle: 'Which reporting feature should I frame for leadership?',
    options: [
      {
        id: 'opt_payroll_dashboard',
        label: 'Executive HR Dashboard + August 2026 Payroll Dispatch',
        description: 'Centralized headcount telemetry and payroll dispatch reporting.',
        marks: 15,
      },
      {
        id: 'opt_crypto_payout',
        label: 'Cryptocurrency Token Payroll Gateway',
        description: 'Dispatches worker salaries via external crypto tokens.',
        marks: 0,
      },
    ],
    defaultOptionId: 'opt_payroll_dashboard',
  },
  {
    index: 4,
    title: 'Question 4 of 4: Employee Document Upload Framing',
    subtitle: 'How should I handle supporting document attachments for leave requests?',
    options: [
      {
        id: 'opt_doc_upload',
        label: 'Employee Document Upload for Leave Certificates',
        description: 'Requested by Emma Carter based on plant floor HR survey feedback.',
        marks: 15,
      },
      {
        id: 'opt_reject_docs',
        label: 'Disable All File Attachments',
        description: 'Rejects all document attachments to minimize database storage space.',
        marks: 0,
      },
    ],
    defaultOptionId: 'opt_doc_upload',
  },
];

// ── 10 Progressive Work Steps (Executed over 2.5 minutes / 150 seconds) ────────

const BUILD_WORK_STEPS = [
  {
    statusText: 'Initializing Vite & Tailwind CSS v4 environment...',
    log: '[VITE] Initialized vite.config.ts and tailwind.config.js with strict port 5173.',
    activeStepId: 'requirements',
    fileKey: 'package.json',
    chatMsg: 'SPEC INGESTED: Starting 2.5-minute autonomous full-stack code synthesis...',
  },
  {
    statusText: 'Writing package.json & README configuration...',
    log: '[PKG] Generated package.json with React 19, Lucide Icons, and Recharts dependencies.',
    activeStepId: 'requirements',
    fileKey: 'README.md',
  },
  {
    statusText: 'Generating Vite config & Tailwind design system tokens...',
    log: '[CONFIG] Compiled vite.config.ts and tailwind.config.js.',
    activeStepId: 'architecture',
    fileKey: 'vite.config.ts',
  },
  {
    statusText: 'Synthesizing Node.js Express REST server endpoints...',
    log: '[SERVER] Generated server/index.ts with /api/health, /api/leave, and /api/payroll endpoints.',
    activeStepId: 'backend',
    fileKey: 'server/index.ts',
  },
  {
    statusText: 'Creating API gateway TypeScript interfaces...',
    log: '[API] Compiled Employee, LeaveRequest, and PayrollRun models in src/services/api.ts.',
    activeStepId: 'backend',
    fileKey: 'src/services/api.ts',
  },
  {
    statusText: 'Building React 19 application entry & root layout...',
    log: '[UI] Generated src/main.tsx and src/App.tsx single-page router.',
    activeStepId: 'frontend',
    fileKey: 'src/App.tsx',
    chatMsg: 'Built React 19 application shell with client-side view navigation.',
  },
  {
    statusText: 'Injecting Enterprise AuthContext & RBAC security provider...',
    log: '[AUTH] Generated AuthContext.tsx with SSO identity and role-based permissions.',
    activeStepId: 'frontend',
    fileKey: 'src/contexts/AuthContext.tsx',
  },
  {
    statusText: 'Compiling Executive HR Command Center & Headcount Dashboard...',
    log: '[UI] Synthesized src/pages/Dashboard.tsx with KPI telemetry cards and personnel directory.',
    activeStepId: 'frontend',
    fileKey: 'src/pages/Dashboard.tsx',
    chatMsg: 'Created Executive HR Dashboard with headcount roster and live metrics.',
  },
  {
    statusText: 'Generating Leave Management module & 1-click approval workflow...',
    log: '[UI] Synthesized src/pages/LeaveManagement.tsx with PTO quotas and approval routing.',
    activeStepId: 'frontend',
    fileKey: 'src/pages/LeaveManagement.tsx',
  },
  {
    statusText: 'Integrating Payroll Compensation Engine & Tax Withholdings...',
    log: '[UI] Synthesized src/pages/PayrollPage.tsx with August 2026 direct deposit dispatches.',
    activeStepId: 'frontend',
    fileKey: 'src/pages/PayrollPage.tsx',
    chatMsg: 'Integrated Payroll Compensation Engine with direct deposit dispatch logs.',
  },
];

// ── Public API: Start vibe coding & present Question 1 ────────────────────────

export const startCeraVibeCoding = (promptText: string) => {
  if (globalBuildTimerRef) {
    clearTimeout(globalBuildTimerRef);
    globalBuildTimerRef = null;
  }
  currentWorkStepIndex = 0;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const q1 = FEATURE_QUESTIONS[0];
  const prompt1: InteractivePrompt = {
    triggerIndex: 1,
    stepId: 'q_1',
    title: q1.title,
    subtitle: q1.subtitle,
    options: q1.options,
    selectedId: q1.defaultOptionId,
  };

  ceraState = {
    ...INITIAL_STATE,
    projectName: 'Project Titan',
    isAiBuilding: false,
    timelineSteps: INITIAL_TIMELINE_STEPS.map((s) => ({ ...s, status: 'pending' })),
    chatMessages: [
      {
        id: 'msg-user-initial',
        sender: 'user',
        text: promptText,
        timestamp: timeStr,
      },
      {
        id: 'msg-ai-initial',
        sender: 'ai',
        text: 'Ingested prompt for Project Titan. Before I synthesize the codebase, please answer 4 quick feature framing questions to confirm requirements alignment:',
        timestamp: timeStr,
      },
    ],
    terminalLogs: ['$ cera init --project="Project Titan" --enterprise', 'Initializing 4-Step Feature Framing Wizard...'],
    currentInteractivePrompt: prompt1,
    pendingInputMessage: q1.title,
    wizardQuestionIdx: 0,
  };

  listeners.forEach((listener) => listener(ceraState));
};

// ── Public API: Submit Wizard Choice (Questions 1 -> 2 -> 3 -> 4 -> Start Build)

export const submitInteractiveChoice = (selectedOptionId: string) => {
  const currentIdx = ceraState.wizardQuestionIdx;
  const currentQ = FEATURE_QUESTIONS[currentIdx];
  if (!currentQ) return;

  const chosen = currentQ.options.find((o) => o.id === selectedOptionId) || currentQ.options[0];
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const nextIdx = currentIdx + 1;

  if (nextIdx < FEATURE_QUESTIONS.length) {
    // Show next question immediately back-to-back!
    const nextQ = FEATURE_QUESTIONS[nextIdx];
    const nextPrompt: InteractivePrompt = {
      triggerIndex: nextQ.index,
      stepId: `q_${nextQ.index}`,
      title: nextQ.title,
      subtitle: nextQ.subtitle,
      options: nextQ.options,
      selectedId: nextQ.defaultOptionId,
    };

    // CRITICAL FIX: spread prev first to avoid wiping other state fields
    updateCeraState((prev) => ({
      ...prev,
      wizardQuestionIdx: nextIdx,
      currentInteractivePrompt: nextPrompt,
      pendingInputMessage: nextQ.title,
      chatMessages: [
        ...prev.chatMessages,
        {
          id: `msg-user-q${currentIdx}-${Date.now()}`,
          sender: 'user' as const,
          text: `\u2713 ${currentQ.title}: ${chosen.label}`,
          timestamp: timeStr,
        },
        {
          id: `msg-ai-q${currentIdx}-ack-${Date.now()}`,
          sender: 'ai' as const,
          text: `Noted: "${chosen.label}". Please answer Question ${nextIdx + 1} of 4:`,
          timestamp: timeStr,
        },
      ],
      terminalLogs: [...prev.terminalLogs, `[WIZARD] Answered Q${currentIdx + 1}: ${chosen.label}`],
    }));
  } else {
    // All 4 questions answered! START 2.5-MINUTE CONTINUOUS BACKGROUND BUILD
    // CRITICAL FIX: spread prev first to avoid wiping other state fields
    updateCeraState((prev) => ({
      ...prev,
      wizardQuestionIdx: 4,
      currentInteractivePrompt: null,
      pendingInputMessage: null,
      isAiBuilding: true,
      currentStatus: 'Building full-stack prototype (2.5-min background run)...',
      chatMessages: [
        ...prev.chatMessages,
        {
          id: `msg-user-q${currentIdx}-${Date.now()}`,
          sender: 'user' as const,
          text: `\u2713 ${currentQ.title}: ${chosen.label}`,
          timestamp: timeStr,
        },
        {
          id: `msg-ai-wizard-complete-${Date.now()}`,
          sender: 'ai' as const,
          text: 'All 4 feature framing questions completed! Launching 2.5-minute autonomous code generation. Vibe coding will run continuously in the background even if Cera is minimized.',
          timestamp: timeStr,
        },
      ],
      terminalLogs: [
        ...prev.terminalLogs,
        `[WIZARD] All 4 feature framing questions completed.`,
        `[BUILD] Starting continuous 2.5-minute full-stack build...`,
      ],
    }));

    // Launch background build timer (15 seconds per step x 10 steps = 150 seconds total = 2.5 minutes)
    startContinuousBackgroundBuild();
  }
};

let prototypeBuiltCallback: (() => void) | null = null;

export const setPrototypeBuiltCallback = (cb: () => void) => {
  prototypeBuiltCallback = cb;
};

// ── Autonomous Continuous Background Build Loop ────────────────────────────────

function startContinuousBackgroundBuild() {
  if (globalBuildTimerRef) clearTimeout(globalBuildTimerRef);
  currentWorkStepIndex = 0;
  scheduleNextWorkStep();
}

function scheduleNextWorkStep() {
  if (currentWorkStepIndex >= BUILD_WORK_STEPS.length) {
    finishBuildSimulation();
    return;
  }

  executeSingleWorkStep();

  // Dynamic step duration based on speed multiplier (default 15s / speedMultiplier)
  const baseMs = 15000;
  const speed = ceraState.speedMultiplier || 1;
  const durationMs = Math.max(1500, baseMs / speed);

  currentWorkStepIndex++;
  globalBuildTimerRef = setTimeout(scheduleNextWorkStep, durationMs);
}

function executeSingleWorkStep() {
  const step = BUILD_WORK_STEPS[currentWorkStepIndex];
  if (!step) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  updateCeraState((prev) => {
    const order = ['requirements', 'architecture', 'backend', 'frontend', 'testing'];
    const currentIdx = order.indexOf(step.activeStepId || '');
    const nextTimeline = prev.timelineSteps.map((s) => {
      if (s.id === step.activeStepId) return { ...s, status: 'in_progress' as const };
      const stepIdx = order.indexOf(s.id);
      if (stepIdx < currentIdx) return { ...s, status: 'completed' as const };
      return s;
    });

    const nextLogs = [...prev.terminalLogs, step.log];
    const nextChat = step.chatMsg
      ? [
          ...prev.chatMessages,
          {
            id: `msg-ai-build-${Date.now()}`,
            sender: 'ai' as const,
            text: step.chatMsg,
            timestamp: timeStr,
          },
        ]
      : prev.chatMessages;

    let nextGen = prev.generatedFiles;
    let nextOpen = prev.openFiles;
    let nextActive = prev.activeFileId;

    if (step.fileKey && INITIAL_PROJECT_FILES[step.fileKey]) {
      const newFile = INITIAL_PROJECT_FILES[step.fileKey];
      if (!nextGen.some((f) => f.id === newFile.id)) nextGen = [...nextGen, newFile];
      if (!nextOpen.some((f) => f.id === newFile.id)) nextOpen = [...nextOpen, newFile];
      nextActive = newFile.id;
    }

    return {
      ...prev,
      currentStatus: step.statusText,
      timelineSteps: nextTimeline,
      terminalLogs: nextLogs,
      chatMessages: nextChat,
      generatedFiles: nextGen,
      openFiles: nextOpen,
      activeFileId: nextActive,
      pendingInputMessage: null,
    };
  });
}

function finishBuildSimulation() {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  updateCeraState((prev) => ({
    ...prev,
    isAiBuilding: false,
    isBuildFinished: true,
    isDevServerRunning: true,
    currentStatus: 'Build complete. Prototype live on http://localhost:5173.',
    terminalLogs: [
      ...prev.terminalLogs,
      '[BUILD] 100% finished in 2.5 minutes (150s).',
      '  Local:   http://localhost:5173/',
      '  Network: use --host to expose',
      '',
      '  Enterprise HR Portal is LIVE:',
      '  http://localhost:5173',
    ],
    chatMessages: [
      ...prev.chatMessages,
      {
        id: `msg-ai-finish-${Date.now()}`,
        sender: 'ai' as const,
        text: 'Enterprise HR Portal prototype is 100% complete and deployed!\n\nClick "Open Live Website" below to launch the running application in your browser at http://localhost:5173',
        timestamp: timeStr,
      },
    ],
    timelineSteps: prev.timelineSteps.map((s) => ({ ...s, status: 'completed' as const })),
    pendingInputMessage: null,
    currentInteractivePrompt: null,
  }));

  // Trigger GameContext prototypeBuilt state
  if (prototypeBuiltCallback) {
    try {
      prototypeBuiltCallback();
    } catch {
      /* non-blocking */
    }
  }

  // Open browser app with prototype URL
  if (externalOpenBrowserCallback) {
    try {
      externalOpenBrowserCallback('http://localhost:5173');
    } catch {
      /* non-blocking */
    }
  }

  // Fire OS notification toast when build finishes
  if (externalNotifCallback) {
    externalNotifCallback({
      id: `notif-cera-finish-${Date.now()}`,
      app: 'Calendar',
      title: 'Cera Build Complete!',
      subtitle: 'Enterprise HR Portal live at http://localhost:5173',
      body: 'Full-stack prototype finished generating. Click to view in browser.',
      actionText: 'Open Live Website',
      onActionAppId: 'browser',
      timestamp: 'Just now',
    });
  }
}
