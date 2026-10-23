import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Code2, Bell, Sparkles } from 'lucide-react';
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
import { getSessionAssignmentResult, setSessionAssignmentResult } from '../../data/chaptersData';
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
          }, 1000);
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

  // ── Chapter 3 Kickoff Incoming Call Notification — auto-fires ~1.5s after desktop is ready ──
  useEffect(() => {
    if (bootStep !== 'ready' || activeChapter !== 3) return;
    if (seenNotifIds.current.has('ch3_daniel_call')) return;

    const timer = setTimeout(() => {
      sound.playMessagePing();
      pushNotification({
        id: 'ch3_daniel_call',
        app: 'Teams',
        title: 'Daniel — Developer',
        subtitle: 'Project Amigo | Integration Blocker',
        body: 'Incoming emergency call from Daniel regarding critical Core Banking API integration failure.',
        timestamp: 'Now',
        actionText: 'Accept Call',
        onActionAppId: 'chapter3_meeting',
        isCall: true,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [bootStep, activeChapter]);

  // ── Chapter 3 Portal Access Granted Notification ──
  useEffect(() => {
    if (activeChapter !== 3 || !chapter3State.portalAccessGranted) return;
    if (seenNotifIds.current.has('ch3_portal_granted_notif')) return;

    const timer = setTimeout(() => {
      sound.playSystemClearance();
      pushNotification({
        id: 'ch3_portal_granted_notif',
        app: 'Teams',
        title: 'Aarav Kapoor',
        subtitle: 'Project Manager · Access Granted',
        body: 'ACCESS GRANTED — PROJECT AMIGO INTEGRATION PORTAL: Review technical evidence and complete the Integration Triage assignment.',
        timestamp: 'Now',
        actionText: 'Open Portal',
        onActionAppId: 'integration_portal',
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [chapter3State.portalAccessGranted, activeChapter]);

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
    if (appId && !openAppIds.includes(appId)) {
      setOpenAppIds((prev) => [...prev, appId]);
      // Score: opening Ideate & Impact Studio for the first time
      if (appId === 'ideate') {
        addSignal('delivery_management', 'Opened Ideate & Impact Studio workspace', 5);
      }
    }
    setActiveAppId(appId);
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
            className="absolute inset-0 bg-[#070913] flex flex-col items-center justify-center z-[100] select-none"
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
      />

      {/* CHAPTER 2 STATUS BANNER */}
      {activeChapter === 2 && (
        <Chapter2Banner onOpenWorkspace={() => handleOpenApp('workspace_amigo')} />
      )}

      {/* CHAPTER 3 STATUS BANNER */}
      {activeChapter === 3 && (
        <Chapter3Banner
          onOpenMeeting={() => handleOpenApp('chapter3_meeting')}
          onOpenWorkspace={() => handleOpenApp('integration_portal')}
          portalUnlocked={chapter3State.portalAccessGranted}
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
                  initialChatId={activeChapter >= 2 ? 'daniel' : 'aarav'}
                  activeChapter={activeChapter}
                  chapter2State={chapter2State}
                  chapter3State={chapter3State}
                  onOpenIncidentPanel={() => handleOpenApp('incident')}
                  onOpenCommunicationSetup={() => handleOpenApp('communication')}
                  onOpenDesignReview={() => handleOpenApp('design_review')}
                  onOpenSprintReadiness={() => handleOpenApp('readiness')}
                  onOpenDataIntegrityTriage={() => handleOpenApp('integration_portal')}
                  onOpenChapter3Meeting={() => handleOpenApp('chapter3_meeting')}
                  onOpenChapter3Portal={() => handleOpenApp('integration_portal')}
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
            if (onReturnToChapterSelect) onReturnToChapterSelect();
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
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
        />
      )}

      {/* CHAPTER 3 SCORECARD MODAL */}
      {isChapter3ScorecardOpen && (
        <Chapter3ScorecardModal
          scorecardData={chapter3State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter3ScorecardOpen(false);
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter3ScorecardOpen(false);
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
        />
      )}

      {/* CHAPTER 4 SCORECARD MODAL */}
      {isChapter4ScorecardOpen && (
        <Chapter4ScorecardModal
          scorecardData={chapter4State.scorecard}
          onProceedToNextChapter={() => {
            setIsChapter4ScorecardOpen(false);
            if (onReturnToChapterSelect) onReturnToChapterSelect();
          }}
          onReturnToChapterSelect={() => {
            setIsChapter4ScorecardOpen(false);
            if (onReturnToChapterSelect) onReturnToChapterSelect();
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
