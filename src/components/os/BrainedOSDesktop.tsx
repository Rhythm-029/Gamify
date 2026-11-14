import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Code2, Bell, Sparkles, FileCheck2, Activity, Layers, ArrowLeft } from 'lucide-react';
import { BrainedMenuBar } from './BrainedMenuBar';
import { BrainedDock } from './BrainedDock';
import { BrainedWindow } from './BrainedWindow';
import { OSNotificationCenter } from './OSNotificationCenter';
import { OSNotificationCenterDrawer } from './OSNotificationCenterDrawer';
import { SpotlightSearch } from './SpotlightSearch';
import { DesktopWidgets } from './DesktopWidgets';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';
import { InGameClock } from './InGameClock';
import { PauseExitGate } from './PauseExitGate';
import { sound } from '../onboarding/SoundEngine';
import { useGameSession } from '../../hooks/useGameSession';
import { useGame } from '../../context/GameContext';

import { FullscreenGate } from './FullscreenGate';
import { INITIAL_OS_STATE, INITIAL_NOTIFICATIONS } from '../../data/brainedOSData';
import type { OSNotification } from '../../data/brainedOSData';

// Simulation Apps
import { TitanKickoffMeeting } from '../apps/TitanKickoffMeeting';
import { ReadMeAIApp } from '../apps/ReadMeAIApp';
import { ProjectAmigoScopeAssignment, type ScopeAssignmentResult } from '../apps/ProjectAmigoScopeAssignment';
import { ProjectAmigoInternalBriefViewer } from '../apps/ProjectAmigoInternalBriefViewer';
import { getSessionAssignmentResult, setSessionAssignmentResult, resetChapterSession, updateChapterStatus } from '../../data/chaptersData';
import { Chapter1CompletionModal } from '../apps/Chapter1CompletionModal';
import { CeraIDEApp } from '../apps/CeraIDEApp';
import { IdeateImpactApp } from '../apps/IdeateImpactApp';
import { CeraBottomNotification } from '../apps/cera/CeraBottomNotification';
import { subscribeCeraState, getCeraState, setExternalNotifCallback, setActiveAppChecker, setExternalOpenBrowserCallback } from '../apps/cera/ceraStore';
import { SlackOSApp } from '../apps/SlackOSApp';
import { PrototypeReviewMeeting } from '../apps/PrototypeReviewMeeting';
import { FinalPresentationMeeting } from '../apps/FinalPresentationMeeting';

import { AppleMailApp } from '../apps/AppleMailApp';
import { AppleNotesApp } from '../apps/AppleNotesApp';
import { AppleCalendarApp } from '../apps/AppleCalendarApp';
import { MSTeamsApp } from '../apps/MSTeamsApp';
import { JiraKanbanApp } from '../apps/JiraKanbanApp';
import { FinderApp } from '../apps/FinderApp';
import { FakeBrowserApp } from '../apps/FakeBrowserApp';
import { TerminalApp } from '../apps/TerminalApp';
import { DocumentsApp } from '../workspace/DocumentsApp';
import { StakeholdersApp } from '../workspace/StakeholdersApp';
import { CertificateApp } from '../workspace/CertificateApp';
import { SettingsApp } from '../workspace/SettingsApp';

import { AIDirectorWidget } from '../overlays/AIDirectorWidget';
import { SimulationEventModal } from '../overlays/SimulationEventModal';

// Chapter 2 Components & Data
import type { Chapter2State, InfrastructureOption, CommunicationOption, UiUxOption } from '../../types/chapter2';
import { requestChapterAIEvaluation } from '../../services/aiEvaluationService';
import {
  getChapter2SessionState,
  setChapter2SessionState,
  computeChapter2Score,
  EMAIL_INFRASTRUCTURE_PREREQ,
  EMAIL_UIUX_SIGNOFF,
  EMAIL_SPRINT1_GREENLIGHT,
} from '../../data/chapter2Data';
import { Chapter2Banner } from '../chapter2/Chapter2Banner';
import { InfrastructureIncidentPanel } from '../chapter2/InfrastructureIncidentPanel';
import { CommunicationSetupPanel } from '../chapter2/CommunicationSetupPanel';
import { DesignReviewWorkspace } from '../chapter2/DesignReviewWorkspace';
import { SprintReadinessDashboard } from '../chapter2/SprintReadinessDashboard';
import { Chapter2ScorecardModal } from '../chapter2/Chapter2ScorecardModal';
import { ProjectAmigoWorkspaceApp } from '../chapter2/ProjectAmigoWorkspaceApp';
import { EmailComposerModal } from '../chapter2/EmailComposerModal';

// Chapter 3 Components & Data
import type { Chapter3State } from '../../types/chapter3';
import {
  getChapter3SessionState,
  setChapter3SessionState,
  computeChapter3Score,
} from '../../data/chapter3Data';
import { Chapter3Banner } from '../chapter3/Chapter3Banner';
import { Chapter3MeetingApp } from '../chapter3/Chapter3MeetingApp';
import { IntegrationPortalApp } from '../chapter3/IntegrationPortalApp';
import { Chapter3ScorecardModal } from '../chapter3/Chapter3ScorecardModal';

// Chapter 4 Components & Data
import type { Chapter4State } from '../../types/chapter4';
import {
  getChapter4SessionState,
  setChapter4SessionState,
} from '../../data/chapter4Data';
import { Chapter4Banner } from '../chapter4/Chapter4Banner';
import { Chapter4MeetingApp } from '../chapter4/Chapter4MeetingApp';
import { IdeateImpactStudioApp } from '../chapter4/IdeateImpactStudioApp';
import { Chapter4ScorecardModal } from '../chapter4/Chapter4ScorecardModal';

// Chapter 5 Components & Data
import type { Chapter5State } from '../../types/chapter5';
import {
  getChapter5SessionState,
  setChapter5SessionState,
} from '../../data/chapter5Data';
import { Chapter5Banner } from '../chapter5/Chapter5Banner';
import { Chapter5MeetingApp } from '../chapter5/Chapter5MeetingApp';
import { ReleaseReadinessBoardApp } from '../chapter5/ReleaseReadinessBoardApp';
import { Chapter5ScorecardModal } from '../chapter5/Chapter5ScorecardModal';

// Chapter 6 Components & Data
import type { Chapter6State } from '../../types/chapter6';
import {
  getChapter6SessionState,
  setChapter6SessionState,
} from '../../data/chapter6Data';
import { Chapter6Banner } from '../chapter6/Chapter6Banner';
import { Chapter6MeetingApp } from '../chapter6/Chapter6MeetingApp';
import { PerformanceCommandCentreApp } from '../chapter6/PerformanceCommandCentreApp';
import { Chapter6ScorecardModal } from '../chapter6/Chapter6ScorecardModal';

// Chapter 7 Components & Data
import type { Chapter7State } from '../../types/chapter7';
import {
  getChapter7SessionState,
  setChapter7SessionState,
} from '../../data/chapter7Data';
import { Chapter7Banner } from '../chapter7/Chapter7Banner';
import { Chapter7MeetingApp } from '../chapter7/Chapter7MeetingApp';
import { IncidentResponseStudioApp } from '../chapter7/IncidentResponseStudioApp';
import { Chapter7ScorecardModal } from '../chapter7/Chapter7ScorecardModal';
import { Wrench } from 'lucide-react';

// Chapter 8 Components & Data
import type { Chapter8State } from '../../types/chapter8';
import {
  getChapter8SessionState,
  setChapter8SessionState,
} from '../../data/chapter8Data';
import { Chapter8Banner } from '../chapter8/Chapter8Banner';
import { Chapter8MeetingApp } from '../chapter8/Chapter8MeetingApp';
import { ReleaseHandoverDeskApp } from '../chapter8/ReleaseHandoverDeskApp';
import { Chapter8ScorecardModal } from '../chapter8/Chapter8ScorecardModal';

// Chapter 9 Components & Data
import type { Chapter9State } from '../../types/chapter9';
import {
  getChapter9SessionState,
  setChapter9SessionState,
} from '../../data/chapter9Data';
import { Chapter9Banner } from '../chapter9/Chapter9Banner';
import { Chapter9MeetingApp } from '../chapter9/Chapter9MeetingApp';
import { ExecutiveRoiBoardroomApp } from '../chapter9/ExecutiveRoiBoardroomApp';
import { Chapter9ScorecardModal } from '../chapter9/Chapter9ScorecardModal';

// Chapter 10 Components & Data
import type { Chapter10State } from '../../types/chapter10';
import {
  getChapter10SessionState,
  setChapter10SessionState,
  computeChapter10Score,
} from '../../data/chapter10Data';
import { Chapter10Banner } from '../chapter10/Chapter10Banner';
import { Chapter10MeetingApp } from '../chapter10/Chapter10MeetingApp';
import { EngineeringReleasePortalApp } from '../chapter10/EngineeringReleasePortalApp';
import { Chapter10ScorecardModal } from '../chapter10/Chapter10ScorecardModal';

// Chapter 11 Components & Data
import type { Chapter11State } from '../../types/chapter11';
import {
  getChapter11SessionState,
  setChapter11SessionState,
  computeChapter11Score,
} from '../../data/chapter11Data';
import { Chapter11Banner } from '../chapter11/Chapter11Banner';
import { Chapter11MeetingApp } from '../chapter11/Chapter11MeetingApp';
import { OperationsTransitionConsoleApp } from '../chapter11/OperationsTransitionConsoleApp';
import { Chapter11ScorecardModal } from '../chapter11/Chapter11ScorecardModal';

// Chapter 12 Components & Data (The Next Evolution — Final Chapter)
import type { Chapter12State } from '../../types/chapter12';
import {
  getChapter12SessionState,
  setChapter12SessionState,
  computeChapter12Score,
} from '../../data/chapter12Data';
import { Chapter12StatusUpdateModal } from '../chapter12/Chapter12StatusUpdateModal';
import { Chapter12Banner } from '../chapter12/Chapter12Banner';
import { Chapter12MeetingApp } from '../chapter12/Chapter12MeetingApp';
import { EvolutionControlCenterApp } from '../chapter12/EvolutionControlCenterApp';
import { Chapter12CinematicModal } from '../chapter12/Chapter12CinematicModal';
import { FinalTransformationReportModal } from '../chapter12/FinalTransformationReportModal';

interface BrainedOSDesktopProps {
  onOpenEventModal?: () => void;
  playerConfig?: {
    name: string;
    role: string;
    company: string;
    email: string;
    linkedin: string;
  };
  firstBoot?: boolean;
  activeChapter?: number;
  onStartChapter?: (chapterId: number) => void;
  onReturnToChapterSelect?: () => void;
}

export const BrainedOSDesktop: React.FC<BrainedOSDesktopProps> = ({
  playerConfig,
  firstBoot,
  activeChapter = 1,
  onStartChapter,
  onReturnToChapterSelect,
}) => {
  const [osState, setOsState] = useState(() => {
    const defaultState = { ...INITIAL_OS_STATE };
    if (playerConfig) {
      defaultState.user = {
        name: playerConfig.name,
        role: playerConfig.role,
        company: playerConfig.company,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(playerConfig.name)}&backgroundColor=8b5cf6,3b82f6`,
        workstation: `${playerConfig.name.split(' ')[0]}'s MacBook Pro (Brained OS v3.2)`,
      };
    }
    return defaultState;
  });

  // Read session ID from localStorage
  const sessionId = localStorage.getItem('brained_session_id');

  // Game context (central simulation state)
  const { state: gameState, addSignal } = useGame();

  // Live game session WebSocket hook
  const {
    notifications: liveNotifications,
    dockBadges: liveDockBadges,
    dismissNotification: dismissLiveNotification,
  } = useGameSession(sessionId);

  const cera = useSyncExternalStore(subscribeCeraState, getCeraState);
  const [showCeraBottomNotif, setShowCeraBottomNotif] = useState(false);

  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [openAppIds, setOpenAppIds] = useState<string[]>([]);
  
  // Notification States
  const [bannerNotifications, setBannerNotifications] = useState<OSNotification[]>([]);
  const [historyNotifications, setHistoryNotifications] = useState<OSNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const seenNotifIds = useRef<Set<string>>(new Set());

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAIDirectorOpen, setIsAIDirectorOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // OS Boot timer sequence states
  const [bootStep, setBootStep] = useState<'booting' | 'silence' | 'ready'>(firstBoot ? 'booting' : 'ready');

  // Transition OS Boot loader screen ('booting' -> 'silence' -> 'ready')
  useEffect(() => {
    if (bootStep === 'booting') {
      const timer = setTimeout(() => {
        setBootStep('silence');
      }, 3500);
      return () => clearTimeout(timer);
    }
    if (bootStep === 'silence') {
      const timer = setTimeout(() => {
        setBootStep('ready');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  const [isChapter1CompletionOpen, setIsChapter1CompletionOpen] = useState(false);
  const [hasReadBrief, setHasReadBrief] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<ScopeAssignmentResult | null>(() => {
    return getSessionAssignmentResult();
  });

  const handleKickoffMoMComplete = () => {
    handleCloseApp('kickoff');
    handleCloseApp('readme');

    // Simulate file download chime for Project_Amigo_Internal_Brief.pdf
    sound.playDownloadComplete();

    // Increment Teams badge
    setOsState((prev) => ({
      ...prev,
      dockBadges: {
        ...prev.dockBadges,
        teams: (prev.dockBadges.teams || 0) + 1,
      },
    }));

    // Ensure notification is not blocked by previous playthroughs
    seenNotifIds.current.delete('aarav_brief_notification');

    // Wait exactly 2 seconds after ReadMe AI confirmation, then display desktop notification
    setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'aarav_brief_notification',
        app: 'Teams',
        title: 'Aarav Kapoor',
        subtitle: 'Project Manager',
        body: "Good work getting the meeting documented. I've shared a short project brief for you to review before we decide our priorities.",
        timestamp: 'Now',
        actionText: 'Open in Teams',
        onActionAppId: 'teams',
      });
    }, 1000);
  };

  // ── Chapter 2 Interactive Simulation State ──
  const [chapter2State, setChapter2State] = useState<Chapter2State>(() => getChapter2SessionState());
  const [isChapter2ScorecardOpen, setIsChapter2ScorecardOpen] = useState(false);
  const [emailComposer, setEmailComposer] = useState<{
    isOpen: boolean;
    to: string;
    cc?: string;
    subject: string;
    body: string;
    attachments?: string[];
    buttonText?: string;
    onSend: (body: string) => void;
  } | null>(null);

  const handleChapter2InfrastructureDecision = (opt: InfrastructureOption) => {
    setChapter2State((prev) => {
      const next: Chapter2State = {
        ...prev,
        infrastructure: {
          ...prev.infrastructure,
          initialDecision: opt,
          recoveryRequired: opt !== 'secure',
        },
      };
      setChapter2SessionState(next);
      return next;
    });

    if (opt === 'secure') {
      sound.playClick();
      handleOpenChapter2EmailModal('infra');
    }
  };

  const handleChapter2CommunicationDecision = (opt: CommunicationOption) => {
    setChapter2State((prev) => {
      const next: Chapter2State = {
        ...prev,
        communication: {
          ...prev.communication,
          initialDecision: prev.communication.initialDecision ?? opt,
          finalStructure: opt,
          channelCreated: opt === 'dual-track',
          executiveReportingConfigured: opt === 'dual-track',
        },
      };
      setChapter2SessionState(next);
      return next;
    });

    if (opt === 'dual-track') {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch2_channel_created',
        app: 'Teams',
        title: 'Martha Vance',
        subtitle: 'Delivery Operations · Project Amigo',
        body: 'Engineering channel #amigo-dev-ops created. Executive reporting route mapped to weekly dashboards.',
        timestamp: 'Just now',
        actionText: 'View in Teams',
        onActionAppId: 'teams',
      });
    }
  };

  const handleChapter2UiUxDecision = (opt: UiUxOption) => {
    setChapter2State((prev) => {
      const next: Chapter2State = {
        ...prev,
        uiux: {
          ...prev.uiux,
          initialDecision: prev.uiux.initialDecision ?? opt,
          recoveryRequired: opt === 'verbal',
        },
      };
      setChapter2SessionState(next);
      return next;
    });
  };

  const handleOpenChapter2EmailModal = (type: 'infra' | 'uiux' | 'greenlight') => {
    if (type === 'infra') {
      setEmailComposer({
        isOpen: true,
        to: EMAIL_INFRASTRUCTURE_PREREQ.to,
        cc: EMAIL_INFRASTRUCTURE_PREREQ.cc,
        subject: EMAIL_INFRASTRUCTURE_PREREQ.subject,
        body: EMAIL_INFRASTRUCTURE_PREREQ.body,
        buttonText: 'Send Email',
        onSend: () => {
          setEmailComposer(null);
          setChapter2State((prev) => {
            const next: Chapter2State = {
              ...prev,
              infrastructure: {
                ...prev.infrastructure,
                requestSent: true,
                recoveryCompleted: true,
              },
            };
            setChapter2SessionState(next);
            return next;
          });

          pushNotification({
            id: 'ch2_infra_sent',
            app: 'Teams',
            title: 'Martha Vance',
            subtitle: 'Delivery Operations',
            body: 'Infrastructure request sent. I have recorded the network and LDAP dependencies in the project workspace.',
            timestamp: 'Just now',
            actionText: 'Open Teams',
            onActionAppId: 'teams',
          });

          setTimeout(() => {
            setChapter2State((prev) => {
              const next: Chapter2State = {
                ...prev,
                infrastructure: {
                  ...prev.infrastructure,
                  bankITResolved: true,
                  stagingVerified: true,
                },
              };
              setChapter2SessionState(next);
              return next;
            });
            pushNotification({
              id: 'ch2_it_cleared',
              app: 'Teams',
              title: 'Martha Vance',
              subtitle: 'Delivery Operations',
              body: 'Bank IT has cleared the firewall request. Port 443 is open, the proxy routes are configured, and LDAP sandbox credentials are available.',
              timestamp: 'Just now',
              actionText: 'View in Teams',
              onActionAppId: 'teams',
            });
          }, 4500);
        },
      });
    } else if (type === 'uiux') {
      setEmailComposer({
        isOpen: true,
        to: EMAIL_UIUX_SIGNOFF.to,
        cc: EMAIL_UIUX_SIGNOFF.cc,
        subject: EMAIL_UIUX_SIGNOFF.subject,
        body: EMAIL_UIUX_SIGNOFF.body,
        attachments: EMAIL_UIUX_SIGNOFF.attachments,
        buttonText: 'Send for Approval',
        onSend: () => {
          setEmailComposer(null);
          setChapter2State((prev) => {
            const next: Chapter2State = {
              ...prev,
              uiux: {
                ...prev.uiux,
                signoffSent: true,
              },
            };
            setChapter2SessionState(next);
            return next;
          });

          setTimeout(() => {
            sound.playMessagePing();
            setChapter2State((prev) => {
              const next: Chapter2State = {
                ...prev,
                uiux: {
                  ...prev.uiux,
                  approvalReceived: true,
                },
                infrastructure: {
                  ...prev.infrastructure,
                  bankITResolved: true,
                  stagingVerified: true,
                },
              };
              setChapter2SessionState(next);
              return next;
            });

            pushNotification({
              id: 'ch2_marcus_approval',
              app: 'Mail',
              title: 'Marcus Reed',
              subtitle: 'CTO / Senior Stakeholder',
              body: 'Re: Project Amigo — UI/UX Prototype Review and Formal Signoff: Reviewed. I approve the attached prototype versions for the current design baseline.',
              timestamp: 'Just now',
              actionText: 'Open in Mail',
              onActionAppId: 'inbox',
            });
          }, 2500);
        },
      });
    } else if (type === 'greenlight') {
      setEmailComposer({
        isOpen: true,
        to: EMAIL_SPRINT1_GREENLIGHT.to,
        cc: EMAIL_SPRINT1_GREENLIGHT.cc,
        subject: EMAIL_SPRINT1_GREENLIGHT.subject,
        body: EMAIL_SPRINT1_GREENLIGHT.body,
        buttonText: 'Issue Development Greenlight',
        onSend: () => {
          setEmailComposer(null);
          const computed = computeChapter2Score(chapter2State, assignmentResult);
          
          setChapter2State((prev) => {
            const next: Chapter2State = {
              ...prev,
              sprint: {
                ...prev.sprint,
                greenlightIssued: true,
                readinessVerified: true,
              },
              scorecard: {
                shown: true,
                ...computed,
              },
            };
            setChapter2SessionState(next);
            return next;
          });

          // Trigger asynchronous Grok AI Evaluation
          requestChapterAIEvaluation(2, {
            infrastructure: chapter2State.infrastructure,
            communication: chapter2State.communication,
            uiux: chapter2State.uiux,
            sprint: chapter2State.sprint,
          }, {
            ...computed,
            totalScore: computed.totalScore,
          }).then((aiScorecard) => {
            setChapter2State((curr) => {
              const updated: Chapter2State = {
                ...curr,
                scorecard: {
                  shown: true,
                  scheduleScore: aiScorecard.scheduleScore,
                  riskScore: aiScorecard.riskScore,
                  governanceScore: aiScorecard.governanceScore,
                  efficiencyScore: aiScorecard.efficiencyScore,
                  totalScore: aiScorecard.totalScore,
                  explanations: aiScorecard.explanations,
                  aiEvaluated: aiScorecard.aiEvaluated,
                  outcomeTitle: aiScorecard.outcomeTitle,
                  executiveSummary: aiScorecard.executiveSummary,
                  strengths: aiScorecard.strengths,
                  improvements: aiScorecard.improvements,
                  leadershipCoaching: aiScorecard.leadershipCoaching,
                },
              };
              setChapter2SessionState(updated);
              return updated;
            });
          }).catch(console.warn);

          sound.playSystemClearance();
          pushNotification({
            id: 'ch2_greenlight_sent',
            app: 'Mail',
            title: 'Project Amigo — Sprint 1 Greenlight',
            subtitle: 'Engineering Operations',
            body: 'Official greenlight dispatched to amigo-dev-ops. Approved development work can now proceed.',
            timestamp: 'Just now',
            actionText: 'View Scorecard',
            onActionAppId: 'workspace_amigo',
          });

          setTimeout(() => {
            setIsChapter2ScorecardOpen(true);
          }, 800);
        },
      });
    }
  };

  // ── Chapter 1 Kickoff Call — auto-fires ~5s after desktop is ready ──────────
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 1) return;
    const callTimer = setTimeout(() => {
      pushNotification({
        id: 'ch1_kickoff_call',
        app: 'Teams',
        title: 'Sophia Bennett is calling…',
        subtitle: 'Project Amigo — Executive Kickoff Call',
        body: 'Incoming video call · Project Amigo Kickoff — all hands required',
        timestamp: 'Now',
        actionText: 'Join Call',
        onActionAppId: 'kickoff',
        isCall: true,
      });
    }, 5000);
    return () => clearTimeout(callTimer);
  }, [bootStep, activeChapter]);

  // ── Chapter 2 Kickoff Notification — auto-fires ~2s after desktop is ready ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 2) return;
    if (seenNotifIds.current.has('ch2_daniel_blocker')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch2_daniel_blocker',
        app: 'Teams',
        title: 'Daniel Brooks',
        subtitle: 'Lead Backend Developer · Project Amigo',
        body: "We can't connect to ICICI's staging environment. Port 443 is blocked, the proxy isn't configured, and LDAP access is still unconfirmed.",
        timestamp: 'Now',
        actionText: 'Open in Teams',
        onActionAppId: 'teams',
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 3 Interactive Simulation State ──
  const [chapter3State, setChapter3State] = useState<Chapter3State>(() => getChapter3SessionState());
  const [isChapter3ScorecardOpen, setIsChapter3ScorecardOpen] = useState(false);

  const handleUpdateChapter3State = (
    updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)
  ) => {
    setChapter3State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter3SessionState(next);
      return next;
    });
  };

  // ── Chapter 4 Interactive Simulation State ──
  const [chapter4State, setChapter4State] = useState<Chapter4State>(() => getChapter4SessionState());
  const [isChapter4ScorecardOpen, setIsChapter4ScorecardOpen] = useState(false);

  const handleUpdateChapter4State = (
    updater: Partial<Chapter4State> | ((prev: Chapter4State) => Chapter4State)
  ) => {
    setChapter4State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter4SessionState(next);
      return next;
    });
  };

  // ── Chapter 5 Interactive Simulation State ──
  const [chapter5State, setChapter5State] = useState<Chapter5State>(() => getChapter5SessionState());
  const [isChapter5ScorecardOpen, setIsChapter5ScorecardOpen] = useState(false);

  const handleUpdateChapter5State = (
    updater: Partial<Chapter5State> | ((prev: Chapter5State) => Chapter5State)
  ) => {
    setChapter5State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter5SessionState(next);
      return next;
    });
  };

  // ── Chapter 6 Interactive Simulation State ──
  const [chapter6State, setChapter6State] = useState<Chapter6State>(() => getChapter6SessionState());
  const [isChapter6ScorecardOpen, setIsChapter6ScorecardOpen] = useState(false);

  const handleUpdateChapter6State = (
    updater: Partial<Chapter6State> | ((prev: Chapter6State) => Chapter6State)
  ) => {
    setChapter6State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter6SessionState(next);
      return next;
    });
  };

  // ── Chapter 7 Interactive Simulation State ──
  const [chapter7State, setChapter7State] = useState<Chapter7State>(() => getChapter7SessionState());
  const [isChapter7ScorecardOpen, setIsChapter7ScorecardOpen] = useState(false);

  const handleUpdateChapter7State = (
    updater: Partial<Chapter7State> | ((prev: Chapter7State) => Chapter7State)
  ) => {
    setChapter7State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter7SessionState(next);
      return next;
    });
  };

  // ── Chapter 8 Interactive Simulation State ──
  const [chapter8State, setChapter8State] = useState<Chapter8State>(() => getChapter8SessionState());
  const [isChapter8ScorecardOpen, setIsChapter8ScorecardOpen] = useState(false);

  const handleUpdateChapter8State = (
    updater: Partial<Chapter8State> | ((prev: Chapter8State) => Chapter8State)
  ) => {
    setChapter8State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter8SessionState(next);
      return next;
    });
  };

  // ── Chapter 9 Interactive Simulation State (ROI Validation) ──
  const [chapter9State, setChapter9State] = useState<Chapter9State>(() => getChapter9SessionState());
  const [isChapter9ScorecardOpen, setIsChapter9ScorecardOpen] = useState(false);

  const handleUpdateChapter9State = (
    updater: Partial<Chapter9State> | ((prev: Chapter9State) => Chapter9State)
  ) => {
    setChapter9State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter9SessionState(next);
      return next;
    });
  };

  // ── Chapter 10 Interactive Simulation State (Versioning & Technical Documentation) ──
  const [chapter10State, setChapter10State] = useState<Chapter10State>(() => getChapter10SessionState());
  const [isChapter10ScorecardOpen, setIsChapter10ScorecardOpen] = useState(false);

  const handleUpdateChapter10State = (
    updater: Partial<Chapter10State> | ((prev: Chapter10State) => Chapter10State)
  ) => {
    setChapter10State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter10SessionState(next);
      return next;
    });
  };

  // ── Chapter 11 Interactive Simulation State (Operational Handover) ──
  const [chapter11State, setChapter11State] = useState<Chapter11State>(() => getChapter11SessionState());
  const [isChapter11ScorecardOpen, setIsChapter11ScorecardOpen] = useState(false);

  const handleUpdateChapter11State = (
    updater: Partial<Chapter11State> | ((prev: Chapter11State) => Chapter11State)
  ) => {
    setChapter11State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter11SessionState(next);
      return next;
    });
  };

  // ── Chapter 12 Interactive Simulation State (The Next Evolution — Final Chapter) ──
  const [chapter12State, setChapter12State] = useState<Chapter12State>(() => getChapter12SessionState());
  const [isChapter12StatusModalOpen, setIsChapter12StatusModalOpen] = useState(false);
  const [isChapter12ReportOpen, setIsChapter12ReportOpen] = useState(false);
  const [isChapter12CinematicOpen, setIsChapter12CinematicOpen] = useState(false);

  const handleUpdateChapter12State = (
    updater: Partial<Chapter12State> | ((prev: Chapter12State) => Chapter12State)
  ) => {
    setChapter12State((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setChapter12SessionState(next);
      return next;
    });
  };

  // ── Chapter 3 Kickoff Notification from Daniel (UAT Prerequisites) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 3) return;
    if (seenNotifIds.current.has('ch3_daniel_uat_request')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch3_daniel_uat_request',
        app: 'Teams',
        title: 'Daniel Brooks',
        subtitle: 'Lead Developer · UAT Environment',
        body: "Hey, we're getting ready to set up the UAT environment for Project Amigo. Could you get 5 configuration details confirmed with the bank?",
        timestamp: 'Now',
        actionText: 'Open in Chat',
        onActionAppId: 'teams',
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 3 Sophia Response Sequence after Email Sent ──
  useEffect(() => {
    if (activeChapter !== 3 || !chapter3State.emailSentAt || chapter3State.v1Delivered) return;
    if (seenNotifIds.current.has('ch3_sophia_uat_response')) return;

    // After email is sent, wait 1.8s, then Sophia sends her message and delivers v1
    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch3_sophia_uat_response',
        app: 'Teams',
        title: 'Sophia Bennett',
        subtitle: 'Head of HR · Client Deliverable',
        body: "Hey! Yes, sure. I've got the details our IT team shared. Let me send them over.",
        timestamp: 'Now',
        actionText: 'Open in Chat',
        onActionAppId: 'teams',
      });

      handleUpdateChapter3State({
        sophiaTyping: false,
        v1Delivered: true,
        activeChatRecipient: 'sophia',
        step: 'sophia_v1_delivered',
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [chapter3State.emailSentAt, chapter3State.v1Delivered, activeChapter]);

  // ── Chapter 4 Sophia Incoming Call Notification (Urgent: Additional Appraisal Requirement) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 4) return;
    if (seenNotifIds.current.has('ch4_sophia_call')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch4_sophia_call',
        app: 'Teams',
        title: 'Sophia — Head of HR',
        subtitle: 'Urgent: Additional Appraisal Requirement',
        body: "We've received a request from our regional HR heads. Can we discuss adding a Dynamic Bonus Calculator to Phase 1?",
        timestamp: 'Now',
        actionText: 'Join Call',
        onActionAppId: 'chapter4_meeting',
        isCall: true,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 4 Ideate & Impact Studio Unlocked Notification ──
  useEffect(() => {
    if (activeChapter !== 4 || !chapter4State.studioAccessGranted) return;
    if (seenNotifIds.current.has('ch4_studio_unlocked_notif')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch4_studio_unlocked_notif',
        app: 'Teams',
        title: 'IDEATE & IMPACT STUDIO UNLOCKED',
        subtitle: 'CR-017 Available',
        body: 'New change request available. Review its impact before committing to delivery.',
        timestamp: 'Now',
        actionText: 'Open Studio',
        onActionAppId: 'ideate_studio',
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [chapter4State.studioAccessGranted, activeChapter]);

  // ── Chapter 5 Kickoff Incoming Call Notification (Sprint 1 Release Check) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 5) return;
    if (seenNotifIds.current.has('ch5_release_check')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch5_release_check',
        app: 'Teams',
        title: 'Project Amigo — Sprint 1 Release Check',
        subtitle: 'Daniel Kapoor (Dev Lead) · Production Readiness Review',
        body: 'Good news! The Phase 1 build is deployed to staging. Join the release check call to determine next steps.',
        timestamp: 'Now',
        actionText: 'Join Call',
        onActionAppId: 'chapter5_meeting',
        isCall: true,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 5 Release Readiness Board Active Notification ──
  useEffect(() => {
    if (activeChapter !== 5 || !chapter5State.meetingCompleted) return;
    if (seenNotifIds.current.has('ch5_board_unlocked_notif')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch5_board_unlocked_notif',
        app: 'Teams',
        title: 'RELEASE READINESS BOARD ACTIVE',
        subtitle: 'Review Readiness & Configure Pilot',
        body: 'Evaluate the 5 readiness cards, identify launch blockers, and build the controlled rollout plan.',
        timestamp: 'Now',
        actionText: 'Open Board',
        onActionAppId: 'release_readiness',
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [chapter5State.meetingCompleted, activeChapter]);

  // ── Chapter 6 Kickoff Incoming Call Notification (30,000-User Stress Test Review) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 6) return;
    if (seenNotifIds.current.has('ch6_stress_test_call')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch6_stress_test_call',
        app: 'Teams',
        title: 'Incoming call',
        subtitle: 'Durgaprasad Karri | SRE · Daniel | Lead Developer',
        body: 'Can you join the performance review? We\'ve got an issue with the latest test.',
        timestamp: 'Now',
        actionText: 'Join meeting',
        onActionAppId: 'chapter6_meeting',
        isCall: true,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 6 Command Centre Active Notification ──
  useEffect(() => {
    if (activeChapter !== 6 || !chapter6State.meetingCompleted) return;
    if (seenNotifIds.current.has('ch6_command_centre_unlocked_notif')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch6_command_centre_unlocked_notif',
        app: 'Teams',
        title: 'PERFORMANCE COMMAND CENTRE ACTIVE',
        subtitle: 'Diagnose Bottleneck & Sequence Recovery',
        body: 'Investigate the 4.2s latency spike, optimize Redis caching and connection pool, and secure dual approvals.',
        timestamp: 'Now',
        actionText: 'Open Command Centre',
        onActionAppId: 'performance_command_centre',
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [chapter6State.meetingCompleted, activeChapter]);

  // ── Chapter 7 Kickoff Incoming Call Notification (Attendance Sync Incident) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 7) return;
    if (seenNotifIds.current.has('ch7_martha_production_alert')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch7_martha_production_alert',
        app: 'Teams',
        title: 'Martha Vance',
        subtitle: 'Project Amigo — Production Operations',
        body: "Jane, we've got an issue. The Attendance Sync service has started returning intermittent 504 errors. Twelve branch officers have reported login or attendance synchronisation problems.",
        timestamp: 'Now',
        actionText: 'View Message',
        onActionAppId: 'teams',
      });
      handleUpdateChapter7State({ alertNotificationShown: true });
    }, 1200);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 7 Step 2: Daniel's Technical Call (Shortly after viewing Martha's message) ──
  useEffect(() => {
    if (activeChapter !== 7) return;
    if (!chapter7State.marthaChatViewed && activeAppId !== 'teams') return;
    if (chapter7State.callCompleted || chapter7State.meetingCompleted) return;
    if (seenNotifIds.current.has('ch7_daniel_technical_call')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch7_daniel_technical_call',
        app: 'Teams',
        title: 'Incoming Call',
        subtitle: 'Daniel Brooks · Lead Developer',
        body: 'Attendance Sync 504 Timeout Diagnosis · Daniel is requesting an urgent incident triage bridge.',
        timestamp: 'Now',
        actionText: 'Join Call',
        onActionAppId: 'chapter7_meeting',
        isCall: true,
      });
      handleUpdateChapter7State({ callInitiated: true });
    }, 2200);
    return () => clearTimeout(timer);
  }, [chapter7State.marthaChatViewed, chapter7State.callCompleted, chapter7State.meetingCompleted, activeAppId, activeChapter]);

  // ── Chapter 7 Step 3: Aarav's Assignment & Incident Response Studio Unlock ──
  useEffect(() => {
    if (activeChapter !== 7 || (!chapter7State.callCompleted && !chapter7State.meetingCompleted)) return;
    if (seenNotifIds.current.has('ch7_aarav_assignment_studio')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch7_aarav_assignment_studio',
        app: 'Teams',
        title: 'Aarav Kapoor',
        subtitle: 'Project Manager · Incident Assignment',
        body: "Jane, take ownership of INC-0241. Coordinate the recovery, document the root cause, and put together the preventive actions. I've added Incident Response Studio to your desktop. Complete the incident response there.",
        timestamp: 'Now',
        actionText: 'Open Studio',
        onActionAppId: 'incident_studio',
      });
      handleUpdateChapter7State({ studioUnlocked: true, aaravAssignmentViewed: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [chapter7State.callCompleted, chapter7State.meetingCompleted, activeChapter]);

  // ── Chapter 8 Step 1: Bank CISO Automated Threat Feed Alert Notification ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 8) return;
    if (seenNotifIds.current.has('ch8_ciso_threat_alert')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch8_ciso_threat_alert',
        app: 'Teams',
        title: 'Bank CISO · Threat Alert',
        subtitle: 'Security Operations Center (SOC) Liaison',
        body: 'CRITICAL ALERT: Anomalous bot traffic slamming employee login gateway. Credential-stuffing attack detected. Immediate WAF bot mitigation & MFA rate-limiting required under bank cybersecurity policies and IT acts.',
        timestamp: 'Now',
        actionText: 'Join SOC Liaison',
        onActionAppId: 'chapter8_meeting',
        isCall: true,
      });
      handleUpdateChapter8State({ alertNotificationShown: true });
    }, 1200);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 8 Step 2: Security Response Console Unlock ──
  useEffect(() => {
    if (activeChapter !== 8 || (!chapter8State.callCompleted && !chapter8State.meetingCompleted && !chapter8State.deskUnlocked)) return;
    if (seenNotifIds.current.has('ch8_ciso_console_unlocked')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch8_ciso_console_unlocked',
        app: 'Teams',
        title: 'Security Response Console',
        subtitle: 'Bank SOC Liaison · Project Amigo',
        body: 'Security Response Console is active. Deploy perimeter WAF bot mitigation rules and enforce strict MFA rate-limiting to preserve portal compliance.',
        timestamp: 'Now',
        actionText: 'Open Security Console',
        onActionAppId: 'release_handover_desk',
      });
      handleUpdateChapter8State({ deskUnlocked: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [chapter8State.callCompleted, chapter8State.meetingCompleted, chapter8State.deskUnlocked, activeChapter]);

  // ── Chapter 9 Step 1: Executive Boardroom Presentation Suite Invitation ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 9) return;
    if (seenNotifIds.current.has('ch9_boardroom_invitation')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch9_boardroom_invitation',
        app: 'Teams',
        title: 'Incoming Call · Sophia Bennett',
        subtitle: 'Head of HR Operations · Executive Steering Committee Sponsor',
        body: 'Join the Executive Briefing call. Martha has the verified post-rollout APM telemetry ready for your ROI presentation to CFO Vikram Malhotra and CTO Marcus Reed.',
        timestamp: 'Now',
        actionText: 'Join Call',
        onActionAppId: 'chapter9_meeting',
        isCall: true,
      });
      handleUpdateChapter9State({ callInitiated: true });
    }, 1000);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 9 Step 2: Executive Boardroom ROI Dashboard Unlock Notification ──
  useEffect(() => {
    if (activeChapter !== 9 || (!chapter9State.meetingCompleted && !chapter9State.callCompleted)) return;
    if (seenNotifIds.current.has('ch9_boardroom_unlocked')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch9_boardroom_unlocked',
        app: 'Teams',
        title: 'Sophia Bennett · Head of HR',
        subtitle: 'Executive Boardroom Suite Ready',
        body: 'Executive briefing concluded. Complete and review your full Phase 2 ROI validation dashboard and scorecard.',
        timestamp: 'Now',
        actionText: 'Open ROI Suite',
        onActionAppId: 'executive_roi_boardroom',
      });
      handleUpdateChapter9State({ boardroomRoomOpened: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [chapter9State.meetingCompleted, chapter9State.callCompleted, activeChapter]);

  // ── Chapter 10 Step 1: Alex Pre-Brief Call (Hidden Technical Debt) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 10) return;
    if (seenNotifIds.current.has('ch10_alex_call_incoming')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch10_alex_call_incoming',
        app: 'Teams',
        title: 'Alex · Lead Architect',
        subtitle: 'Post-Launch Technical Debt & Spec Lock',
        body: 'Jane, the ROI is signed off, but our API specs and architecture diagrams are scattered across personal folders and duplicate files. We need release governance before sprint close.',
        timestamp: 'Now',
        actionText: 'Join Call',
        onActionAppId: 'chapter10_meeting',
        isCall: true,
      });
      handleUpdateChapter10State({ callInitiated: true });
    }, 1000);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 10 Step 2: Engineering Developer Portal Challenge Unlock ──
  useEffect(() => {
    if (activeChapter !== 10 || (!chapter10State.meetingCompleted && !chapter10State.callCompleted)) return;
    if (seenNotifIds.current.has('ch10_portal_unlocked')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch10_portal_unlocked',
        app: 'Teams',
        title: 'Alex · Lead Architect',
        subtitle: 'Developer Portal Challenge Ready',
        body: 'Pre-brief concluded. Access the Internal Developer Portal to audit the repository, determine SemVer v1.0.0, and publish the 6-domain architecture catalog.',
        timestamp: 'Now',
        actionText: 'Open Portal',
        onActionAppId: 'engineering_release_portal',
      });
      handleUpdateChapter10State({ portalOpened: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [chapter10State.meetingCompleted, chapter10State.callCompleted, activeChapter]);

  // ── Chapter 11 Step 1: Martha Notification (Marcus Handover Meeting) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 11) return;
    if (seenNotifIds.current.has('ch11_marcus_handover_call')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch11_marcus_handover_call',
        app: 'Teams',
        title: 'Martha · Project Coordination',
        subtitle: 'Formal Handover Meeting Requested',
        body: "The delivery team is preparing to close the project. But Marcus from IT Operations has requested a formal handover meeting before accepting ownership. Join the call now.",
        timestamp: 'Now',
        actionText: 'Join Meeting',
        onActionAppId: 'chapter11_meeting',
        isCall: true,
      });
      handleUpdateChapter11State({ callInitiated: true });
    }, 1000);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 11 Step 2: Operations Transition Console Challenge Unlock ──
  useEffect(() => {
    if (activeChapter !== 11 || (!chapter11State.meetingCompleted && !chapter11State.callCompleted)) return;
    if (seenNotifIds.current.has('ch11_console_unlocked')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch11_console_unlocked',
        app: 'Teams',
        title: 'Marcus · Head of IT Operations',
        subtitle: 'Operations Transition Console Ready',
        body: 'Handover meeting concluded. Open the Operations Transition Console to build the runbook package, test incident triage, and schedule the 14-day hypercare window.',
        timestamp: 'Now',
        actionText: 'Open Console',
        onActionAppId: 'operations_transition_console',
      });
      handleUpdateChapter11State({ consoleOpened: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [chapter11State.meetingCompleted, chapter11State.callCompleted, activeChapter]);

  // ── Chapter 12 Step 1: Project Amigo Status Telemetry Modal & Review Call ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 12) return;
    if (!chapter12State.statusModalSeen) {
      setIsChapter12StatusModalOpen(true);
    }
  }, [bootStep, activeChapter, chapter12State.statusModalSeen]);

  // ── Chapter 12 Step 2: Marcus Urgent Meeting Invitation (Teams) ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 12) return;
    if (!chapter12State.statusModalSeen) return;
    if (seenNotifIds.current.has('ch12_marcus_review_call')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch12_marcus_review_call',
        app: 'Teams',
        title: 'Marcus · Head of IT Operations',
        subtitle: 'Urgent: Phase 2 Upgrade Roadmap Review',
        body: 'Phase 1 is running smoothly. The board wants us to revisit the deferred Phase 2 capabilities and discuss the next upgrade roadmap. Please join the review.',
        timestamp: 'Now',
        actionText: 'Join Meeting',
        onActionAppId: 'chapter12_meeting',
        isCall: true,
      });
      handleUpdateChapter12State({ meetingInitiated: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter, chapter12State.statusModalSeen]);

  // ── Chapter 12 Step 3: Evolution Control Center Unlock Notification ──
  useEffect(() => {
    if (activeChapter !== 12 || !chapter12State.meetingIntroCompleted) return;
    if (seenNotifIds.current.has('ch12_control_center_unlocked')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch12_control_center_unlocked',
        app: 'Teams',
        title: 'Aarav Kapoor · Senior PM',
        subtitle: 'NEW APPLICATION AVAILABLE: EVOLUTION CONTROL CENTER',
        body: 'Take ownership of the release plan. Decide how Phase 2 features should be introduced, validate the new environment, and protect the production system.',
        timestamp: 'Now',
        actionText: 'Open Control Center',
        onActionAppId: 'evolution_control_center',
      });
      handleUpdateChapter12State({ controlCenterOpened: true });
    }, 700);
    return () => clearTimeout(timer);
  }, [chapter12State.meetingIntroCompleted, activeChapter]);



  // Register Cera active app checker, external notification handler, and browser open callback
  useEffect(() => {
    setActiveAppChecker(() => activeAppId);
    setExternalNotifCallback((notif: OSNotification) => {
      pushNotification(notif);
    });
    setExternalOpenBrowserCallback((_url: string) => {
      // Open the Browser app to show the prototype when Cera build completes
      handleOpenApp('browser');
    });
  }, [activeAppId]); // eslint-disable-line

  // Show Cera bottom-left notification ONLY when an interactive input is pending and user is NOT on Cera screen
  useEffect(() => {
    if (cera.pendingInputMessage && activeAppId !== 'cera' && activeAppId !== 'ide') {
      setShowCeraBottomNotif(true);
    } else {
      setShowCeraBottomNotif(false);
    }
  }, [cera.pendingInputMessage, activeAppId]);

  // Helper to push new notification (1 non-call toast rule + co-existing call rule)
  const pushNotification = (notif: OSNotification) => {
    if (seenNotifIds.current.has(notif.id)) return;
    seenNotifIds.current.add(notif.id);

    const formatted: OSNotification = {
      ...notif,
      read: false,
    };

    // Deduplicate by title & body in history
    setHistoryNotifications((prev) => {
      if (prev.some((item) => item.title === notif.title && item.body === notif.body)) {
        return prev;
      }
      return [formatted, ...prev];
    });

    setBannerNotifications((prev) => {
      if (notif.isCall) {
        // Keep active non-call toast, replace existing call
        const nonCalls = prev.filter((item) => !item.isCall);
        return [...nonCalls, formatted];
      } else {
        // Only ONE non-call notification at a time — replace existing non-call toast, keep call
        const calls = prev.filter((item) => item.isCall);
        return [...calls, formatted];
      }
    });

    if (notif.isCall) {
      sound.startTeamsRingtone();
    }
  };

  // Sync liveNotifications from WebSocket into pushNotification
  useEffect(() => {
    if (!liveNotifications || liveNotifications.length === 0) return;
    for (const ln of liveNotifications) {
      if (!seenNotifIds.current.has(ln.id)) {
        pushNotification(ln);
      }
    }
  }, [liveNotifications]);



  // Sync pendingNotifications from GameContext FrontendEventScheduler into local notification list
  useEffect(() => {
    const pending = gameState.pendingNotifications;
    if (pending.length === 0) return;

    for (const pn of pending) {
      if (!seenNotifIds.current.has(pn.id)) {
        pushNotification({
          id: pn.id,
          app: (['Teams', 'Slack', 'Mail', 'Calendar', 'Security'].includes(pn.app) ? pn.app : 'Teams') as OSNotification['app'],
          title: pn.title,
          subtitle: pn.subtitle,
          body: pn.body,
          timestamp: pn.timestamp,
          actionText: pn.actionText,
          onActionAppId: pn.onActionAppId,
          isCall: pn.isCall,
        });
      }
    }
  }, [gameState.pendingNotifications]); // eslint-disable-line

  const handleOpenApp = (appId: string | null) => {
    let resolvedId = appId;
    if (appId === 'teams' && activeChapter === 12) {
      resolvedId = 'chapter12_meeting';
    }
    if (resolvedId === 'chapter12_meeting') {
      sound.stopTeamsRingtone();
      seenNotifIds.current.add('ch12_marcus_review_call');
      setBannerNotifications((prev) => prev.filter((n) => n.id !== 'ch12_marcus_review_call'));
      setHistoryNotifications((prev) =>
        prev.map((n) => (n.id === 'ch12_marcus_review_call' ? { ...n, read: true } : n))
      );
    } else if (resolvedId === 'evolution_control_center') {
      sound.stopTeamsRingtone();
      seenNotifIds.current.add('ch12_control_center_unlocked');
      seenNotifIds.current.add('ch12_marcus_review_call');
      setBannerNotifications((prev) =>
        prev.filter(
          (n) => n.id !== 'ch12_control_center_unlocked' && n.id !== 'ch12_marcus_review_call'
        )
      );
      setHistoryNotifications((prev) =>
        prev.map((n) =>
          n.id === 'ch12_control_center_unlocked' || n.id === 'ch12_marcus_review_call'
            ? { ...n, read: true }
            : n
        )
      );
    }
    if (resolvedId && !openAppIds.includes(resolvedId)) {
      setOpenAppIds((prev) => [...prev, resolvedId]);
      // Score: opening Ideate & Impact Studio for the first time
      if (resolvedId === 'ideate') {
        addSignal('delivery_management', 'Opened Ideate & Impact Studio workspace', 5);
      }
    }
    setActiveAppId(resolvedId);
  };

  const handleCloseApp = (appId: string) => {
    setOpenAppIds((prev) => prev.filter((id) => id !== appId));
    if (activeAppId === appId) {
      setActiveAppId(null);
    }
  };

  // Dismiss banner toast (leaves it in history)
  const handleDismissBanner = (notifId: string) => {
    setBannerNotifications((prev) => prev.filter((n) => n.id !== notifId));
    dismissLiveNotification(notifId);
    sound.stopTeamsRingtone();
  };

  // Click on notification banner or drawer item
  const handleActionNotification = (notif: OSNotification) => {
    handleDismissBanner(notif.id);
    sound.stopTeamsRingtone();

    // Mark as read in history
    setHistoryNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    const targetAppId = notif.onActionAppId || (() => {
      switch (notif.app) {
        case 'Teams': return 'teams';
        case 'Slack': return 'slack';
        case 'Mail': return 'inbox';
        case 'Calendar': return 'calendar';
        case 'Security': return 'settings';
        default: return null;
      }
    })();
    if (targetAppId) {
      handleOpenApp(targetAppId);
    }
  };

  // Timeout handler for Call notifications
  const handleTimeoutCallNotification = (notif: OSNotification) => {
    sound.stopTeamsRingtone();
    setBannerNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  const handleApplyDecision = (trustDelta: number, xpDelta: number) => {
    setOsState((prev) => ({
      ...prev,
      trustScore: Math.min(100, Math.max(0, prev.trustScore + trustDelta)),
      xp: prev.xp + xpDelta,
    }));
  };

  const appMetaMap: Record<string, { title: string; icon: React.ReactNode }> = {
    kickoff: { title: 'Microsoft Teams — Project Amigo Kickoff', icon: <span>📹</span> },
    readme: { title: 'ReadMe AI — Project Amigo Minutes of Meeting', icon: <span>⚡</span> },
    incident: { title: 'Infrastructure Incident — Blocker Investigation', icon: <span>🚨</span> },
    communication: { title: 'Workspace Setup — Communication Configuration', icon: <span>💬</span> },
    design_review: { title: 'Design Review — UI/UX Prototypes Baseline', icon: <span>🎨</span> },
    readiness: { title: 'Sprint 1 Readiness Dashboard — Greenlight Gate', icon: <span>🛡️</span> },
    workspace_amigo: { title: 'Project Amigo — Sprint 1 Workspace', icon: <span>💼</span> },
    data_integrity: { title: 'Project Amigo — Integration Portal & Triage', icon: <span>🔌</span> },
    integration_portal: { title: 'Project Amigo — Integration Portal & Triage', icon: <span>🔌</span> },
    chapter3_meeting: { title: 'Microsoft Teams — Emergency Engineering Call', icon: <span>📹</span> },
    chapter4_meeting: { title: 'Microsoft Teams — Project Amigo Change Request Call', icon: <span>📹</span> },
    ideate_studio: { title: 'Ideate & Impact Studio — Project Amigo', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    chapter5_meeting: { title: 'Microsoft Teams — Project Amigo Sprint 1 Release Check', icon: <span>📹</span> },
    release_readiness: { title: 'Release Readiness Board — Project Amigo', icon: <FileCheck2 className="w-4 h-4 text-emerald-400" /> },
    chapter6_meeting: { title: 'Microsoft Teams — 30,000-User Stress Test Performance Review', icon: <span>📹</span> },
    performance_command_centre: { title: 'Performance Command Centre — Project Amigo Cluster APM', icon: <Activity className="w-4 h-4 text-cyan-400" /> },
    chapter7_meeting: { title: 'Microsoft Teams — Attendance Sync Incident Response', icon: <span>📹</span> },
    incident_studio: { title: 'Incident Response & RCA Studio — Attendance Sync', icon: <Wrench className="w-4 h-4 text-rose-400" /> },
    chapter8_meeting: { title: 'Bank SOC Liaison Channel — Defending Against Credential Stuffing', icon: <span>🛡️</span> },
    release_handover_desk: { title: 'Security Response Console — Project Amigo', icon: <FileCheck2 className="w-4 h-4 text-emerald-400" /> },
    chapter9_meeting: { title: 'Microsoft Teams — Executive Boardroom Presentation Suite', icon: <span>📹</span> },
    executive_roi_boardroom: { title: 'Executive Boardroom — ROI Validation & Impact Suite', icon: <span>📈</span> },
    chapter10_meeting: { title: 'Microsoft Teams — Locking Down System Architecture Specs', icon: <span>📹</span> },
    engineering_release_portal: { title: 'Internal Developer Portal — Release v1.0.0 & Architecture Catalog', icon: <span>📦</span> },
    chapter11_meeting: { title: 'Microsoft Teams — IT Operations Handover Meeting', icon: <span>📹</span> },
    operations_transition_console: { title: 'Operations Transition Console — Project Amigo v1.0.0', icon: <span>🖥️</span> },
    chapter12_meeting: { title: 'Microsoft Teams — Steering Committee Review', icon: <span>📹</span> },
    evolution_control_center: { title: 'Evolution Control Center — Phase 2 Release Management', icon: <Layers className="w-4 h-4 text-sky-400" /> },
    brief: { title: 'Preview — Project_Amigo_Internal_Brief.pdf', icon: <span>📄</span> },
    assignment: { title: 'Project Amigo — Initial Planning · Assignment 01', icon: <span>📋</span> },
    review: { title: 'Microsoft Teams — Prototype Review · Day 7', icon: <span>📹</span> },
    presentation: { title: 'Microsoft Teams — Final Presentation · Day 14', icon: <span>📹</span> },
    ideate: { title: 'Ideate & Impact Studio — Digital Transformer Hub', icon: <Sparkles className="w-4 h-4 text-indigo-400" /> },
    ide: { title: 'Cera IDE — AI Software Engineer Workspace', icon: <Code2 className="w-4 h-4 text-pink-400" /> },
    cera: { title: 'Cera IDE — AI Software Engineer Workspace', icon: <Code2 className="w-4 h-4 text-pink-400" /> },
    dashboard: { title: 'Brained OS — Executive Dashboard', icon: <BrainedLogoIcon className="w-4 h-4" /> },
    inbox: { title: 'Apple Mail — Priority Inbox', icon: <span>✉️</span> },
    teams: { title: 'Microsoft Teams — Project Amigo', icon: <span>💬</span> },
    slack: { title: 'Slack — Brained Workspace', icon: <span>💬</span> },
    notes: { title: 'Notes — MOM & Working Notes', icon: <span>📝</span> },
    calendar: { title: 'Calendar — Schedule & Milestones', icon: <span>📅</span> },
    documents: { title: 'Project Documents', icon: <span>📁</span> },
    tasks: { title: 'Jira — Sprint Kanban', icon: <span>📋</span> },
    browser: { title: 'Browser', icon: <span>🌐</span> },
    finder: { title: 'Finder — Desktop & Files', icon: <span>📂</span> },
    terminal: { title: 'Terminal', icon: <span>💻</span> },
    stakeholders: { title: 'Stakeholder Map', icon: <span>👥</span> },
    certificate: { title: 'Certificate', icon: <span>🏆</span> },
    settings: { title: 'Settings', icon: <span>⚙️</span> },
  };

  const currentAppMeta = activeAppId ? appMetaMap[activeAppId] || { title: 'Finder', icon: null } : { title: 'Finder', icon: null };

  return (
    <FullscreenGate onApplyPenalty={handleApplyDecision}>
      <div className="w-full h-screen bg-[#0B0E18] text-white flex flex-col font-sans selection:bg-[#0A84FF] selection:text-white relative overflow-hidden select-none">
      
      {/* Booting Loader Screen overlay */}
      <AnimatePresence>
        {bootStep === 'booting' && (
          <motion.div
            key="boot-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 bg-[#070913] flex flex-col items-center justify-center z-[100] select-none cursor-pointer"
            onClick={() => setBootStep('ready')}
            title="Click anywhere to skip boot sequence"
          >
            <div className="space-y-6 text-center">
              {/* Brained Logo Centered */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-pink-500 p-3 mx-auto shadow-2xl border border-white/20 animate-pulse flex items-center justify-center">
                <BrainedLogoIcon className="w-full h-full object-contain filter drop-shadow-xl" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-extrabold text-white tracking-widest uppercase">Booting Brained OS...</h2>
                <div className="text-[10px] text-slate-500 font-mono">Brained Workstation Simulator v3.2.0</div>
              </div>
              {/* Loader progress indicator bar */}
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                <motion.div 
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.0, ease: 'easeInOut' }}
                />
              </div>
              <div className="text-[9px] text-slate-500 font-mono tracking-wider pt-1 hover:text-amber-400 transition-colors">
                [ Click anywhere to skip boot ]
              </div>
            </div>
            {/* Tiny debug system console logs in bottom corner */}
            <div className="absolute bottom-6 left-6 text-left font-mono text-[8px] text-slate-650 max-w-sm space-y-0.5">
              <div>[ OK ] Initializing core microservices...</div>
              <div>[ OK ] Mounting virtual volumes...</div>
              <div>[ OK ] Connecting network handoff: brained.network.sso...</div>
              <div>[ OK ] Provisioned session: {osState.user.name}</div>
              <div>[ OK ] System load complete.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REAL MACOS SCENERY WALLPAPER */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700"
        style={{ backgroundImage: "url('/assets/wallpaper.png')" }}
      >
        {/* Subtle dark vignette overlay for legibility */}
        <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px]" />
      </div>

      {/* TOP BRAINED OS MENU BAR with in-game clock */}
      <BrainedMenuBar
        activeAppName={activeAppId ? (appMetaMap[activeAppId]?.title?.split(' — ')[0] ?? 'Finder') : 'Finder'}
        osState={osState}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onOpenAIDirector={() => setIsAIDirectorOpen(true)}
        onOpenEventModal={() => setIsEventModalOpen(true)}
        onSelectApp={handleOpenApp}
        onToggleNotificationDrawer={() => setIsNotificationDrawerOpen((prev) => !prev)}
        unreadNotifCount={historyNotifications.filter((n) => !n.read).length}
        clockWidget={<InGameClock />}
        /* TEMPORARY CHAPTER SKIP FEATURE - CAN BE REMOVED ON REQUEST */
        activeChapter={activeChapter}
        onStartChapter={onStartChapter}
        onReturnToChapterSelect={onReturnToChapterSelect}
      />

      {/* CHAPTER 2 STATUS BANNER */}
      {activeChapter === 2 && (
        <Chapter2Banner onOpenWorkspace={() => handleOpenApp('workspace_amigo')} />
      )}

      {/* CHAPTER 3 STATUS BANNER */}
      {activeChapter === 3 && (
        <Chapter3Banner
          chapter3State={chapter3State}
          onOpenDanielChat={() => {
            handleUpdateChapter3State({ activeChatRecipient: 'daniel' });
            handleOpenApp('teams');
          }}
          onOpenSophiaChat={() => {
            handleUpdateChapter3State({ activeChatRecipient: 'sophia' });
            handleOpenApp('teams');
          }}
          onOpenScorecard={() => setIsChapter3ScorecardOpen(true)}
        />
      )}

      {/* CHAPTER 4 STATUS BANNER */}
      {activeChapter === 4 && (
        <Chapter4Banner
          onOpenMeeting={() => handleOpenApp('chapter4_meeting')}
          onOpenStudio={() => handleOpenApp('ideate_studio')}
          studioUnlocked={chapter4State.studioAccessGranted}
        />
      )}

      {/* CHAPTER 5 STATUS BANNER */}
      {activeChapter === 5 && (
        <Chapter5Banner
          onOpenMeeting={() => handleOpenApp('chapter5_meeting')}
          onOpenBoard={() => handleOpenApp('release_readiness')}
          boardUnlocked={chapter5State.meetingCompleted || chapter5State.boardOpened}
        />
      )}

      {/* CHAPTER 6 STATUS BANNER */}
      {activeChapter === 6 && (
        <Chapter6Banner
          onOpenMeeting={() => handleOpenApp('chapter6_meeting')}
          onOpenCommandCentre={() => handleOpenApp('performance_command_centre')}
          commandCentreUnlocked={chapter6State.meetingCompleted || chapter6State.commandCentreOpened}
        />
      )}

      {/* CHAPTER 7 STATUS BANNER */}
      {activeChapter === 7 && (
        <Chapter7Banner
          onOpenMeeting={() => handleOpenApp('chapter7_meeting')}
          onOpenStudio={() => handleOpenApp('incident_studio')}
          studioUnlocked={chapter7State.meetingCompleted || chapter7State.callCompleted || chapter7State.studioUnlocked || chapter7State.studioOpened}
        />
      )}

      {/* CHAPTER 8 STATUS BANNER */}
      {activeChapter === 8 && (
        <Chapter8Banner
          chapter8State={chapter8State}
          onOpenMeeting={() => handleOpenApp('chapter8_meeting')}
          onOpenHandoverDesk={() => handleOpenApp('release_handover_desk')}
          deskUnlocked={chapter8State.deskUnlocked}
          onOpenScorecard={() => setIsChapter8ScorecardOpen(true)}
        />
      )}

      {/* CHAPTER 9 STATUS BANNER */}
      {activeChapter === 9 && (
        <Chapter9Banner
          chapter9State={chapter9State}
          onOpenMeeting={() => handleOpenApp('chapter9_meeting')}
          onOpenBoardroom={() => handleOpenApp('executive_roi_boardroom')}
          onOpenScorecard={() => setIsChapter9ScorecardOpen(true)}
        />
      )}

      {/* CHAPTER 10 STATUS BANNER */}
      {activeChapter === 10 && (
        <Chapter10Banner
          state={chapter10State}
          onOpenMeeting={() => handleOpenApp('chapter10_meeting')}
          onOpenPortal={() => handleOpenApp('engineering_release_portal')}
          onOpenScorecard={() => setIsChapter10ScorecardOpen(true)}
        />
      )}

      {/* CHAPTER 11 STATUS BANNER */}
      {activeChapter === 11 && (
        <Chapter11Banner
          state={chapter11State}
          onOpenMeeting={() => handleOpenApp('chapter11_meeting')}
          onOpenConsole={() => handleOpenApp('operations_transition_console')}
          onOpenScorecard={() => setIsChapter11ScorecardOpen(true)}
        />
      )}

      {/* CHAPTER 12 STATUS BANNER */}
      {activeChapter === 12 && (
        <Chapter12Banner
          state={chapter12State}
          onOpenMeeting={() => handleOpenApp('chapter12_meeting')}
          onOpenControlCenter={() => handleOpenApp('evolution_control_center')}
          onOpenReport={() => setIsChapter12ReportOpen(true)}
        />
      )}

      {/* DESKTOP CANVAS */}
      <main className="flex-1 relative z-10 pt-16 pb-24 px-8 overflow-hidden flex flex-col justify-between">
        {/* DESKTOP WIDGETS (CLOCK & STREAK) */}
        <DesktopWidgets osState={osState} onOpenApp={handleOpenApp} />

        {/* DESKTOP SHORTCUT ICONS (Project Code Folder shortcut) */}
        {gameState.prototypeBuilt && (
          <div className="absolute top-72 left-8 z-10 flex flex-col space-y-4 pointer-events-auto">
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => handleOpenApp('finder')}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-white/10 group transition-all cursor-pointer w-24"
              title="Open Project Titan Solution Folder"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-sky-600 to-blue-600 p-3 shadow-2xl border border-white/25 group-hover:scale-105 transition-transform flex items-center justify-center relative">
                <Folder className="w-8 h-8 text-white" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <span className="text-[11px] font-bold text-white mt-1 text-center drop-shadow-lg group-hover:text-amber-300">
                Project Solution
              </span>
            </motion.button>
          </div>
        )}

        {/* CHAPTER 12 DESKTOP SHORTCUT: EVOLUTION CONTROL CENTER */}
        {activeChapter === 12 && (chapter12State.controlCenterOpened || chapter12State.meetingIntroCompleted) && (
          <div
            className={`absolute top-72 ${
              gameState.prototypeBuilt ? 'left-36' : 'left-8'
            } z-10 flex items-center gap-2 pointer-events-auto`}
          >
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => handleOpenApp('evolution_control_center')}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-white/10 group transition-all cursor-pointer w-24 relative"
              title="Open Evolution Control Center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 via-indigo-600 to-blue-700 p-3 shadow-2xl border border-sky-400/50 group-hover:scale-105 transition-transform flex items-center justify-center relative shadow-sky-500/20">
                <Layers className="w-8 h-8 text-white" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <span className="text-[11px] font-bold text-white mt-1 text-center drop-shadow-lg group-hover:text-sky-300">
                Evolution Control
              </span>
            </motion.button>

            {!chapter12State.deploymentCompleted && activeAppId !== 'evolution_control_center' && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: [0, -5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-600/90 border border-sky-300/60 text-white text-[10px] font-bold shadow-lg pointer-events-none"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Click to Launch</span>
              </motion.div>
            )}
          </div>
        )}

        {/* FLOATING RIGHT SIDE NOTIFICATION CENTER TOGGLE BUTTON */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="fixed top-20 right-0 z-40 bg-[#121526]/90 hover:bg-pink-600/90 border-l border-t border-b border-white/20 text-white px-2.5 py-2 rounded-l-2xl shadow-2xl backdrop-blur-md flex items-center space-x-2 transition-all cursor-pointer group"
          title="Open Notification Center Drawer"
        >
          <Bell className="w-4 h-4 text-pink-400 group-hover:text-white" />
          {historyNotifications.filter((n) => !n.read).length > 0 && (
            <span className="w-5 h-5 bg-pink-500 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center border border-slate-900">
              {historyNotifications.filter((n) => !n.read).length}
            </span>
          )}
        </button>

        {/* ACTIVE WINDOW CONTAINER (Visible when an app window is open!) */}
        <AnimatePresence>
          {activeAppId && (
            <BrainedWindow
              id={activeAppId}
              title={currentAppMeta.title}
              icon={currentAppMeta.icon}
              isOpen={true}
              isFocused={true}
              onClose={() => handleCloseApp(activeAppId)}
              onMinimize={() => setActiveAppId(null)}
              onFocus={() => {}}
            >
              {/* KICKOFF — replaces old Teams during meeting */}
              {activeAppId === 'kickoff' && (
                <TitanKickoffMeeting
                  onReturnToChapterSelect={() => {
                    handleCloseApp('kickoff');
                    if (onReturnToChapterSelect) onReturnToChapterSelect();
                  }}
                  onMoMComplete={handleKickoffMoMComplete}
                />
              )}
              {/* README AI — Project Amigo Kickoff MoM Document Editor */}
              {activeAppId === 'readme' && (
                <ReadMeAIApp
                  onDone={() => handleCloseApp('readme')}
                  onReturnToChapterSelect={() => {
                    handleCloseApp('readme');
                    if (onReturnToChapterSelect) onReturnToChapterSelect();
                  }}
                  onMoMSubmitted={handleKickoffMoMComplete}
                />
              )}
              {/* PROJECT AMIGO INTERNAL BRIEF PDF VIEWER */}
              {activeAppId === 'brief' && (
                <ProjectAmigoInternalBriefViewer
                  onOpenAssignment={() => {
                    setHasReadBrief(true);
                    handleOpenApp('assignment');
                  }}
                  onOpenTeams={() => {
                    setHasReadBrief(true);
                    handleOpenApp('teams');
                  }}
                  onBriefRead={() => setHasReadBrief(true)}
                />
              )}
              {/* PROJECT AMIGO INITIAL PLANNING & ASSIGNMENT 01 */}
              {activeAppId === 'assignment' && (
                <ProjectAmigoScopeAssignment
                  onSubmitted={(result) => {
                    setSessionAssignmentResult(result);
                    setAssignmentResult(result);
                    seenNotifIds.current.delete('aarav_assignment_response');
                    setTimeout(() => {
                      sound.playMessagePing();
                      pushNotification({
                        id: 'aarav_assignment_response',
                        app: 'Teams',
                        title: 'Aarav Kapoor',
                        subtitle: 'Project Manager',
                        body: result.evaluation.aaravResponse.slice(0, 110) + '...',
                        timestamp: 'Just now',
                        actionText: 'View in Teams',
                        onActionAppId: 'teams',
                      });
                    }, 1000);
                  }}
                  onOpenTeams={() => handleOpenApp('teams')}
                  onClose={() => handleCloseApp('assignment')}
                />
              )}
              {/* PROTOTYPE REVIEW — Day 7 */}
              {activeAppId === 'review' && <PrototypeReviewMeeting />}
              {/* FINAL PRESENTATION — Day 14 */}
              {activeAppId === 'presentation' && <FinalPresentationMeeting />}
              {/* IDEATE & IMPACT — Digital Transformer Hub */}
              {activeAppId === 'ideate' && <IdeateImpactApp onLaunchApp={handleOpenApp} />}
              {/* CERA IDE — AI Software Engineer Workspace */}
              {(activeAppId === 'ide' || activeAppId === 'cera') && <CeraIDEApp />}
              {activeAppId === 'inbox' && <AppleMailApp />}
              {activeAppId === 'teams' && (
                <MSTeamsApp
                  onPenalty={handleApplyDecision}
                  onOpenAssignment={() => handleOpenApp('assignment')}
                  onOpenBrief={() => {
                    setHasReadBrief(true);
                    handleOpenApp('brief');
                  }}
                  hasReadBrief={hasReadBrief}
                  onOpenChapterCompletion={() => setIsChapter1CompletionOpen(true)}
                  initialChatId={activeChapter === 9 ? 'mark' : activeChapter === 8 ? 'marcus' : activeChapter === 7 ? 'martha' : activeChapter === 3 ? (chapter3State.activeChatRecipient || 'daniel') : activeChapter >= 2 ? 'daniel' : 'aarav'}
                  activeChapter={activeChapter}
                  chapter2State={chapter2State}
                  chapter3State={chapter3State}
                  onUpdateChapter3State={handleUpdateChapter3State}
                  chapter7State={chapter7State}
                  onUpdateChapter7State={handleUpdateChapter7State}
                  onOpenChapter7Meeting={() => handleOpenApp('chapter7_meeting')}
                  onOpenIncidentStudio={() => handleOpenApp('incident_studio')}
                  chapter8State={chapter8State}
                  onUpdateChapter8State={handleUpdateChapter8State}
                  onOpenReleaseHandoverDesk={() => handleOpenApp('release_handover_desk')}
                  onOpenChapter8Meeting={() => handleOpenApp('chapter8_meeting')}
                  chapter9State={chapter9State}
                  onUpdateChapter9State={handleUpdateChapter9State}
                  onOpenExecutiveBoardroom={() => handleOpenApp('executive_roi_boardroom')}
                  onOpenChapter9Meeting={() => handleOpenApp('chapter9_meeting')}
                  chapter10State={chapter10State}
                  onUpdateChapter10State={handleUpdateChapter10State}
                  onOpenEngineeringReleasePortal={() => handleOpenApp('engineering_release_portal')}
                  onOpenChapter10Meeting={() => handleOpenApp('chapter10_meeting')}
                  chapter11State={chapter11State}
                  onUpdateChapter11State={handleUpdateChapter11State}
                  onOpenOperationsTransitionConsole={() => handleOpenApp('operations_transition_console')}
                  onOpenChapter11Meeting={() => handleOpenApp('chapter11_meeting')}
                  onOpenMailComposer={(to, email, subject, body) => {
                    setEmailComposer({
                      isOpen: true,
                      to: `${to} <${email}>`,
                      subject,
                      body,
                      buttonText: 'Send',
                      onSend: () => {
                        setEmailComposer(null);
                        sound.playSystemClearance();
                        handleUpdateChapter3State({
                          step: 'email_sent_to_sophia',
                          emailSentAt: new Date().toISOString(),
                          sophiaTyping: true,
                        });
                      },
                    });
                  }}
                  onOpenIncidentPanel={() => handleOpenApp('incident')}
                  onOpenCommunicationSetup={() => handleOpenApp('communication')}
                  onOpenDesignReview={() => handleOpenApp('design_review')}
                  onOpenSprintReadiness={() => handleOpenApp('readiness')}
                  onOpenChapter3Scorecard={() => setIsChapter3ScorecardOpen(true)}
                />
              )}
              {/* CHAPTER 2 SIMULATION APPS */}
              {activeAppId === 'incident' && (
                <InfrastructureIncidentPanel
                  initialDecision={chapter2State.infrastructure.initialDecision}
                  recoveryRequired={chapter2State.infrastructure.recoveryRequired}
                  recoveryCompleted={chapter2State.infrastructure.recoveryCompleted}
                  requestSent={chapter2State.infrastructure.requestSent}
                  bankITResolved={chapter2State.infrastructure.bankITResolved}
                  stagingVerified={chapter2State.infrastructure.stagingVerified}
                  onApplyDecision={(opt) => handleChapter2InfrastructureDecision(opt)}
                  onProceedToEmail={() => handleOpenChapter2EmailModal('infra')}
                />
              )}
              {activeAppId === 'communication' && (
                <CommunicationSetupPanel
                  initialDecision={chapter2State.communication.initialDecision}
                  finalStructure={chapter2State.communication.finalStructure}
                  channelCreated={chapter2State.communication.channelCreated}
                  onSelectStructure={(opt) => handleChapter2CommunicationDecision(opt)}
                  onProceedToDesignReview={() => handleOpenApp('design_review')}
                />
              )}
              {activeAppId === 'design_review' && (
                <DesignReviewWorkspace
                  initialDecision={chapter2State.uiux.initialDecision}
                  signoffSent={chapter2State.uiux.signoffSent}
                  approvalReceived={chapter2State.uiux.approvalReceived}
                  approvedVersions={chapter2State.uiux.approvedVersions}
                  onSelectOption={(opt) => handleChapter2UiUxDecision(opt)}
                  onRequestSignoffEmail={() => handleOpenChapter2EmailModal('uiux')}
                  onProceedToSprintReadiness={() => handleOpenApp('readiness')}
                />
              )}
              {activeAppId === 'readiness' && (
                <SprintReadinessDashboard
                  infrastructureVerified={chapter2State.infrastructure.stagingVerified}
                  communicationConfigured={chapter2State.communication.channelCreated}
                  uiuxApproved={chapter2State.uiux.approvalReceived}
                  greenlightIssued={chapter2State.sprint.greenlightIssued}
                  onTriggerGreenlightEmail={() => handleOpenChapter2EmailModal('greenlight')}
                  onProceedToScorecard={() => setIsChapter2ScorecardOpen(true)}
                />
              )}
              {activeAppId === 'workspace_amigo' && (
                <ProjectAmigoWorkspaceApp
                  chapter2State={chapter2State}
                  onOpenApp={handleOpenApp}
                />
              )}
              {/* CHAPTER 3 SIMULATION APPS */}
              {activeAppId === 'chapter3_meeting' && (
                <Chapter3MeetingApp
                  chapter3State={chapter3State}
                  onUpdateState={handleUpdateChapter3State}
                  onOpenPortal={() => handleOpenApp('integration_portal')}
                  onOpenScorecard={() => setIsChapter3ScorecardOpen(true)}
                />
              )}
              {(activeAppId === 'integration_portal' || activeAppId === 'data_integrity') && (
                <IntegrationPortalApp
                  chapter3State={chapter3State}
                  onUpdateState={handleUpdateChapter3State}
                  onReturnToMeeting={() => handleOpenApp('chapter3_meeting')}
                  onSubmitCompleteTriage={() => handleOpenApp('chapter3_meeting')}
                />
              )}
              {/* CHAPTER 4 SIMULATION APPS */}
              {activeAppId === 'chapter4_meeting' && (
                <Chapter4MeetingApp
                  chapter4State={chapter4State}
                  onUpdateState={handleUpdateChapter4State}
                  onOpenStudio={() => handleOpenApp('ideate_studio')}
                  onOpenScorecard={() => setIsChapter4ScorecardOpen(true)}
                />
              )}
              {(activeAppId === 'ideate_studio' || (activeAppId === 'ideate' && activeChapter === 4)) && (
                <IdeateImpactStudioApp
                  chapter4State={chapter4State}
                  onUpdateState={handleUpdateChapter4State}
                  onReturnToMeeting={() => handleOpenApp('chapter4_meeting')}
                  onSubmitCompleteAnalysis={() => handleOpenApp('chapter4_meeting')}
                />
              )}
              {/* CHAPTER 5 SIMULATION APPS */}
              {activeAppId === 'chapter5_meeting' && (
                <Chapter5MeetingApp
                  chapter5State={chapter5State}
                  onUpdateState={handleUpdateChapter5State}
                  onOpenBoard={() => handleOpenApp('release_readiness')}
                  onOpenScorecard={() => setIsChapter5ScorecardOpen(true)}
                />
              )}
              {activeAppId === 'release_readiness' && (
                <ReleaseReadinessBoardApp
                  chapter5State={chapter5State}
                  onUpdateState={handleUpdateChapter5State}
                  onReturnToMeeting={() => handleOpenApp('chapter5_meeting')}
                  onSubmitCompletePlan={() => handleOpenApp('chapter5_meeting')}
                />
              )}
              {/* CHAPTER 6 SIMULATION APPS */}
              {activeAppId === 'chapter6_meeting' && (
                <Chapter6MeetingApp
                  chapter6State={chapter6State}
                  onUpdateState={handleUpdateChapter6State}
                  onOpenCommandCentre={() => handleOpenApp('performance_command_centre')}
                  onOpenScorecard={() => setIsChapter6ScorecardOpen(true)}
                />
              )}
              {activeAppId === 'performance_command_centre' && (
                <PerformanceCommandCentreApp
                  chapter6State={chapter6State}
                  onUpdateState={handleUpdateChapter6State}
                  onReturnToMeeting={() => handleOpenApp('chapter6_meeting')}
                  onOpenScorecard={() => setIsChapter6ScorecardOpen(true)}
                  onNotifyDesktop={(title, body) => {
                    pushNotification({
                      id: `ch6_desktop_notif_${Date.now()}`,
                      app: 'Teams',
                      title,
                      body,
                      timestamp: 'Now',
                    });
                  }}
                />
              )}
              {/* CHAPTER 7 SIMULATION APPS */}
              {activeAppId === 'chapter7_meeting' && (
                <Chapter7MeetingApp
                  chapter7State={chapter7State}
                  onUpdateState={handleUpdateChapter7State}
                  onOpenStudio={() => handleOpenApp('incident_studio')}
                  onOpenScorecard={() => setIsChapter7ScorecardOpen(true)}
                />
              )}
              {activeAppId === 'incident_studio' && (
                <IncidentResponseStudioApp
                  chapter7State={chapter7State}
                  onUpdateState={handleUpdateChapter7State}
                  onReturnToMeeting={() => handleOpenApp('chapter7_meeting')}
                  onOpenScorecard={() => setIsChapter7ScorecardOpen(true)}
                  onNotifyDesktop={(title, body) => {
                    pushNotification({
                      id: `ch7_desktop_notif_${Date.now()}`,
                      app: 'Teams',
                      title,
                      body,
                      timestamp: 'Now',
                    });
                  }}
                />
              )}
              {/* CHAPTER 8 SIMULATION APPS */}
              {activeAppId === 'chapter8_meeting' && (
                <Chapter8MeetingApp
                  chapter8State={chapter8State}
                  onUpdateState={handleUpdateChapter8State}
                  onCompleteMeeting={() => handleOpenApp('release_handover_desk')}
                  onOpenHandoverDesk={() => handleOpenApp('release_handover_desk')}
                />
              )}
              {activeAppId === 'release_handover_desk' && (
                <ReleaseHandoverDeskApp
                  chapter8State={chapter8State}
                  onUpdateState={handleUpdateChapter8State}
                  onOpenScorecard={() => setIsChapter8ScorecardOpen(true)}
                  onNotifyDesktop={(title, body) => {
                    pushNotification({
                      id: `ch8_desktop_notif_${Date.now()}`,
                      app: 'Teams',
                      title,
                      body,
                      timestamp: 'Now',
                    });
                  }}
                />
              )}
              {/* CHAPTER 9 SIMULATION APPS (ROI VALIDATION) */}
              {activeAppId === 'chapter9_meeting' && (
                <Chapter9MeetingApp
                  chapter9State={chapter9State}
                  onUpdateState={handleUpdateChapter9State}
                  onCompleteMeeting={() => handleOpenApp('executive_roi_boardroom')}
                  onOpenBoardroom={() => handleOpenApp('executive_roi_boardroom')}
                  onOpenScorecard={() => setIsChapter9ScorecardOpen(true)}
                />
              )}
              {activeAppId === 'executive_roi_boardroom' && (
                <ExecutiveRoiBoardroomApp
                  chapter9State={chapter9State}
                  onUpdateState={handleUpdateChapter9State}
                  onOpenScorecard={() => setIsChapter9ScorecardOpen(true)}
                  onNotifyDesktop={(title, body) => {
                    pushNotification({
                      id: `ch9_desktop_notif_${Date.now()}`,
                      app: 'Teams',
                      title,
                      body,
                      timestamp: 'Now',
                    });
                  }}
                />
              )}
              {/* CHAPTER 10 SIMULATION APPS (RELEASE & DOCUMENTATION CHALLENGE) */}
              {activeAppId === 'chapter10_meeting' && (
                <Chapter10MeetingApp
                  chapter10State={chapter10State}
                  onUpdateState={handleUpdateChapter10State}
                  onOpenPortal={() => handleOpenApp('engineering_release_portal')}
                  onOpenScorecard={() => setIsChapter10ScorecardOpen(true)}
                />
              )}
              {activeAppId === 'engineering_release_portal' && (
                <EngineeringReleasePortalApp
                  chapter10State={chapter10State}
                  onUpdateState={handleUpdateChapter10State}
                  onOpenScorecard={() => setIsChapter10ScorecardOpen(true)}
                  onNotifyDesktop={(title, body) => {
                    pushNotification({
                      id: `ch10_desktop_notif_${Date.now()}`,
                      app: 'Teams',
                      title,
                      body,
                      timestamp: 'Now',
                    });
                  }}
                />
              )}
              {/* CHAPTER 11 SIMULATION APPS (OPERATIONAL HANDOVER) */}
              {activeAppId === 'chapter11_meeting' && (
                <Chapter11MeetingApp
                  chapter11State={chapter11State}
                  onUpdateState={handleUpdateChapter11State}
                  onOpenConsole={() => handleOpenApp('operations_transition_console')}
                  onOpenScorecard={() => setIsChapter11ScorecardOpen(true)}
                />
              )}
              {activeAppId === 'operations_transition_console' && (
                <OperationsTransitionConsoleApp
                  chapter11State={chapter11State}
                  onUpdateState={handleUpdateChapter11State}
                  onOpenScorecard={() => setIsChapter11ScorecardOpen(true)}
                  onNotifyDesktop={(title, body) => {
                    pushNotification({
                      id: `ch11_desktop_notif_${Date.now()}`,
                      app: 'Teams',
                      title,
                      body,
                      timestamp: 'Now',
                    });
                  }}
                />
              )}
              {/* CHAPTER 12 SIMULATION APPS (THE NEXT EVOLUTION — FINAL CHAPTER) */}
              {activeAppId === 'chapter12_meeting' && (
                <Chapter12MeetingApp
                  chapter12State={chapter12State}
                  onUpdateState={handleUpdateChapter12State}
                  onOpenControlCenter={() => handleOpenApp('evolution_control_center')}
                  onWatchCinematic={() => {
                    sound.stopTeamsRingtone();
                    setBannerNotifications((prev) =>
                      prev.filter(
                        (n) =>
                          n.id !== 'ch12_control_center_unlocked' &&
                          n.id !== 'ch12_marcus_review_call'
                      )
                    );
                    setIsChapter12CinematicOpen(true);
                  }}
                  onOpenReport={() => {
                    sound.stopTeamsRingtone();
                    setBannerNotifications((prev) =>
                      prev.filter(
                        (n) =>
                          n.id !== 'ch12_control_center_unlocked' &&
                          n.id !== 'ch12_marcus_review_call'
                      )
                    );
                    setIsChapter12ReportOpen(true);
                  }}
                />
              )}
              {activeAppId === 'evolution_control_center' && (
                <EvolutionControlCenterApp
                  chapter12State={chapter12State}
                  onUpdateState={handleUpdateChapter12State}
                  onReturnToMeeting={() => handleOpenApp('chapter12_meeting')}
                  onNotifyDesktop={(title, body) => {
                    pushNotification({
                      id: `ch12_desktop_notif_${Date.now()}`,
                      app: 'Teams',
                      title,
                      body,
                      timestamp: 'Now',
                    });
                  }}
                />
              )}
              {activeAppId === 'slack' && <SlackOSApp />}
              {activeAppId === 'notes' && <AppleNotesApp />}
              {activeAppId === 'calendar' && <AppleCalendarApp />}
              {activeAppId === 'documents' && <DocumentsApp />}
              {activeAppId === 'tasks' && <JiraKanbanApp />}
              {activeAppId === 'browser' && <FakeBrowserApp />}
              {activeAppId === 'finder' && (
                <FinderApp
                  onOpenAssignment={() => handleOpenApp('assignment')}
                  onOpenBrief={() => {
                    setHasReadBrief(true);
                    handleOpenApp('brief');
                  }}
                  onOpenDesignReview={() => handleOpenApp('design_review')}
                />
              )}
              {activeAppId === 'terminal' && <TerminalApp />}
              {activeAppId === 'stakeholders' && <StakeholdersApp onSelectApp={handleOpenApp} />}
              {activeAppId === 'certificate' && (
                <CertificateApp
                  playerState={{
                    name: osState.user.name,
                    role: osState.user.role,
                    company: osState.user.company,
                    industry: "FinTech",
                    avatar: osState.user.avatar,
                    streakDays: osState.streakDays,
                    transformationXP: osState.xp,
                    trustScore: osState.trustScore,
                    attendanceScore: 98,
                    currentDay: osState.currentDay,
                    totalDays: osState.totalDays,
                    currentAct: "Act I: Foundation",
                    rank: "Principal Transformer",
                    consistencyMeter: 92,
                  }}
                />
              )}
              {/* Leaderboard/achievements hidden during simulation — per spec */}
              {activeAppId === 'settings' && (
                <SettingsApp
                  playerState={{
                    name: osState.user.name,
                    role: osState.user.role,
                    company: osState.user.company,
                    industry: "FinTech",
                    avatar: osState.user.avatar,
                    streakDays: osState.streakDays,
                    transformationXP: osState.xp,
                    trustScore: osState.trustScore,
                    attendanceScore: 98,
                    currentDay: osState.currentDay,
                    totalDays: osState.totalDays,
                    currentAct: "Act I: Foundation",
                    rank: "Principal Transformer",
                    consistencyMeter: 92,
                  }}
                />
              )}
            </BrainedWindow>
          )}
        </AnimatePresence>
      </main>

      {/* CERA BOTTOM-LEFT ANTIGRAVITY NOTIFICATION TOAST — only shown when input is required */}
      <CeraBottomNotification
        visible={showCeraBottomNotif}
        inputTitle={cera.pendingInputMessage || ''}
        onOpenCera={() => handleOpenApp('cera')}
        onDismiss={() => setShowCeraBottomNotif(false)}
      />

      {/* TOP-RIGHT MAC OS TOAST BANNER NOTIFICATIONS */}
      {(() => {
        const meetingAppIds = ['kickoff', 'prototype_review', 'presentation', 'review'];
        const isMeetingFocused = activeAppId !== null && meetingAppIds.includes(activeAppId);

        // When a video meeting call window is actively focused on screen, hide non-call toasts so they don't distract.
        // Incoming video calls (isCall) and all normal toasts outside focused meetings are ALWAYS shown!
        const visibleNotifications = isMeetingFocused
          ? bannerNotifications.filter((n) => n.isCall)
          : bannerNotifications;

        return (
          <OSNotificationCenter
            notifications={visibleNotifications}
            onDismiss={handleDismissBanner}
            onAction={handleActionNotification}
            onTimeoutCall={handleTimeoutCallNotification}
          />
        );
      })()}

      {/* RIGHT SIDE SLIDING NOTIFICATION CENTER DRAWER PANEL */}
      <OSNotificationCenterDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        historyNotifications={historyNotifications}
        onOpenAppFromNotif={(item) => {
          setIsNotificationDrawerOpen(false);
          handleActionNotification(item);
        }}
        onClearAll={() => setHistoryNotifications([])}
        onMarkAllRead={() => {
          setHistoryNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />

      {/* SPOTLIGHT SEARCH ⌘K OVERLAY */}
      <SpotlightSearch
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectApp={handleOpenApp}
      />

      {/* BOTTOM BRAINED OS DOCK */}
      <BrainedDock
        activeChapter={activeChapter}
        activeAppId={activeAppId}
        openAppIds={openAppIds}
        onOpenApp={handleOpenApp}
        badges={{
          inbox: liveDockBadges.inbox || osState.dockBadges.inbox,
          slack: liveDockBadges.slack || osState.dockBadges.slack,
          notes: osState.dockBadges.notes,
          calendar: osState.dockBadges.calendar,
          teams: liveDockBadges.teams || osState.dockBadges.teams,
        }}
      />



      {/* PAUSE / EXIT GATE */}
      <PauseExitGate onConfirmExit={() => setBootStep('booting')} />

      {/* CHAPTER REPLAY HANDLER */}
      {(() => {
        // Defined inline or above
        return null;
      })()}

      {/* CHAPTER 1 COMPLETION MODAL */}
      {isChapter1CompletionOpen && (
        <Chapter1CompletionModal
          assignmentResult={assignmentResult}
          onContinueToChapter2={() => {
            setIsChapter1CompletionOpen(false);
            handleCloseApp('teams');
            handleCloseApp('assignment');
            localStorage.setItem('brained_just_unlocked_chapter', '2');
            if (onReturnToChapterSelect) {
              onReturnToChapterSelect();
            } else if (onStartChapter) {
              onStartChapter(2);
            }
          }}
          onReturnToJourney={() => {
            setIsChapter1CompletionOpen(false);
            handleCloseApp('teams');
            handleCloseApp('assignment');
            localStorage.setItem('brained_just_unlocked_chapter', '2');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter1CompletionOpen(false);
            handleCloseApp('teams');
            handleCloseApp('assignment');
            resetChapterSession(1);
            if (onStartChapter) onStartChapter(1);
          }}
        />
      )}

      {/* CHAPTER 2 EMAIL COMPOSER MODAL */}
      {emailComposer && (
        <EmailComposerModal
          to={emailComposer.to}
          cc={emailComposer.cc}
          subject={emailComposer.subject}
          body={emailComposer.body}
          attachments={emailComposer.attachments}
          buttonText={emailComposer.buttonText}
          onSend={emailComposer.onSend}
          onClose={() => setEmailComposer(null)}
        />
      )}

      {/* CHAPTER 2 SCORECARD MODAL */}
      {isChapter2ScorecardOpen && (
        <Chapter2ScorecardModal
          scorecardData={chapter2State.scorecard}
          onContinueToChapter3={() => {
            setIsChapter2ScorecardOpen(false);
            handleCloseApp('teams');
            handleCloseApp('read_me_ai');
            localStorage.setItem('brained_just_unlocked_chapter', '3');
            if (onReturnToChapterSelect) {
              onReturnToChapterSelect();
            } else if (onStartChapter) {
              onStartChapter(3);
            }
          }}
          onReturnToChapterSelect={() => {
            setIsChapter2ScorecardOpen(false);
            handleCloseApp('teams');
            handleCloseApp('read_me_ai');
            localStorage.setItem('brained_just_unlocked_chapter', '3');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter2ScorecardOpen(false);
            handleCloseApp('teams');
            handleCloseApp('read_me_ai');
            resetChapterSession(2);
            if (onStartChapter) onStartChapter(2);
          }}
        />
      )}

      {/* CHAPTER 3 SCORECARD MODAL */}
      {isChapter3ScorecardOpen && (
        <Chapter3ScorecardModal
          scorecardData={chapter3State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter3ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '4');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter3ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '4');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter3ScorecardOpen(false);
            resetChapterSession(3);
            if (onStartChapter) onStartChapter(3);
          }}
        />
      )}

      {/* CHAPTER 4 SCORECARD MODAL */}
      {isChapter4ScorecardOpen && (
        <Chapter4ScorecardModal
          scorecardData={chapter4State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter4ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '5');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter4ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '5');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter4ScorecardOpen(false);
            resetChapterSession(4);
            if (onStartChapter) onStartChapter(4);
          }}
        />
      )}

      {/* CHAPTER 5 SCORECARD MODAL */}
      {isChapter5ScorecardOpen && (
        <Chapter5ScorecardModal
          scorecardData={chapter5State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter5ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '6');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter5ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '6');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter5ScorecardOpen(false);
            resetChapterSession(5);
            if (onStartChapter) onStartChapter(5);
          }}
        />
      )}

      {/* CHAPTER 6 SCORECARD MODAL */}
      {isChapter6ScorecardOpen && (
        <Chapter6ScorecardModal
          scorecardData={chapter6State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter6ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '7');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter6ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '7');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter6ScorecardOpen(false);
            resetChapterSession(6);
            if (onStartChapter) onStartChapter(6);
          }}
        />
      )}

      {/* CHAPTER 7 SCORECARD MODAL */}
      {isChapter7ScorecardOpen && (
        <Chapter7ScorecardModal
          scorecardData={chapter7State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter7ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '8');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter7ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '8');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter7ScorecardOpen(false);
            resetChapterSession(7);
            if (onStartChapter) onStartChapter(7);
          }}
        />
      )}

      {/* CHAPTER 8 SCORECARD MODAL */}
      {isChapter8ScorecardOpen && (
        <Chapter8ScorecardModal
          scorecardData={chapter8State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter8ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '9');
            if (onStartChapter) onStartChapter(9);
            else if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter8ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '9');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter8ScorecardOpen(false);
            resetChapterSession(8);
            if (onStartChapter) onStartChapter(8);
          }}
        />
      )}

      {/* CHAPTER 9 SCORECARD MODAL (ROI VALIDATION) */}
      {isChapter9ScorecardOpen && (
        <Chapter9ScorecardModal
          scorecardData={chapter9State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter9ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '10');
            if (onStartChapter) onStartChapter(10);
            else if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter9ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '10');
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReplayChapter={() => {
            setIsChapter9ScorecardOpen(false);
            resetChapterSession(9);
            if (onStartChapter) onStartChapter(9);
          }}
        />
      )}

      {/* CHAPTER 10 SCORECARD MODAL (RELEASE ARCHITECT) */}
      {isChapter10ScorecardOpen && (
        <Chapter10ScorecardModal
          scorecard={chapter10State.scorecard || computeChapter10Score(chapter10State)}
          onClose={() => setIsChapter10ScorecardOpen(false)}
          onReset={() => {
            setIsChapter10ScorecardOpen(false);
            resetChapterSession(10);
            setChapter10State(getChapter10SessionState());
            if (onStartChapter) onStartChapter(10);
          }}
          onProceedToNextChapter={() => {
            setIsChapter10ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '11');
            if (onStartChapter) onStartChapter(11);
            else if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
        />
      )}

      {/* CHAPTER 11 SCORECARD MODAL (THE TRANSITION LEADER) */}
      {isChapter11ScorecardOpen && (
        <Chapter11ScorecardModal
          scorecard={chapter11State.scorecard || computeChapter11Score(chapter11State)}
          onClose={() => setIsChapter11ScorecardOpen(false)}
          onReset={() => {
            setIsChapter11ScorecardOpen(false);
            resetChapterSession(11);
            setChapter11State(getChapter11SessionState());
            if (onStartChapter) onStartChapter(11);
          }}
          onProceedToNextChapter={() => {
            setIsChapter11ScorecardOpen(false);
            localStorage.setItem('brained_just_unlocked_chapter', '12');
            if (onStartChapter) onStartChapter(12);
            else if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
        />
      )}

      {/* CHAPTER 12 STATUS UPDATE MODAL (SCENE 12.1 TELEMETRY BRIEFING) */}
      {isChapter12StatusModalOpen && (
        <Chapter12StatusUpdateModal
          isOpen={isChapter12StatusModalOpen}
          onAcknowledge={() => {
            setIsChapter12StatusModalOpen(false);
            handleUpdateChapter12State({ statusModalSeen: true });
          }}
        />
      )}

      {/* CHAPTER 12 CINEMATIC MONTAGE MODAL (PART 5) */}
      {isChapter12CinematicOpen && (
        <Chapter12CinematicModal
          scorecard={chapter12State.scorecard || computeChapter12Score(chapter12State)}
          onProceedToReport={() => {
            setIsChapter12CinematicOpen(false);
            setIsChapter12ReportOpen(true);
            handleUpdateChapter12State({
              currentStage: 'transformation_report',
              reportOpened: true,
              completed: true,
            });
            updateChapterStatus(12, 'completed');
          }}
        />
      )}

      {/* CHAPTER 12 FINAL TRANSFORMATION REPORT (PART 6 — S+ SUMMARY) */}
      {isChapter12ReportOpen && (
        <FinalTransformationReportModal
          scorecard={chapter12State.scorecard || computeChapter12Score(chapter12State)}
          onReturnToDesktop={() => {
            setIsChapter12ReportOpen(false);
            handleUpdateChapter12State({
              currentStage: 'complete',
              completed: true,
            });
            updateChapterStatus(12, 'completed');
          }}
        />
      )}

      {/* OVERLAYS */}
      <AIDirectorWidget
        isOpen={isAIDirectorOpen}
        onClose={() => setIsAIDirectorOpen(false)}
        onSelectApp={handleOpenApp}
      />

      <SimulationEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onApplyDecision={handleApplyDecision}
      />
    </div>
    </FullscreenGate>
  );
};
