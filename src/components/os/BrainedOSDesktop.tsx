import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainedMenuBar } from './BrainedMenuBar';
import { BrainedDock } from './BrainedDock';
import { BrainedWindow } from './BrainedWindow';
import { OSNotificationCenter } from './OSNotificationCenter';
import { SpotlightSearch } from './SpotlightSearch';
import { DesktopWidgets } from './DesktopWidgets';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';
import { InGameClock } from './InGameClock';
import { PauseExitGate } from './PauseExitGate';
import { sound } from '../onboarding/SoundEngine';
import { useGameSession } from '../../hooks/useGameSession';
import { useGame } from '../../context/GameContext';

import { INITIAL_OS_STATE } from '../../data/brainedOSData';
import type { OSNotification } from '../../data/brainedOSData';

// Simulation Apps
import { TitanKickoffMeeting } from '../apps/TitanKickoffMeeting';
import { TitanIDEApp } from '../apps/TitanIDEApp';
import { SlackOSApp } from '../apps/SlackOSApp';
import { PostMeetingPrompt } from '../apps/PostMeetingPrompt';
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
}

export const BrainedOSDesktop: React.FC<BrainedOSDesktopProps> = ({ playerConfig, firstBoot }) => {
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
  const { state: gameState } = useGame();

  // Live game session WebSocket hook
  const {
    notifications: liveNotifications,
    dockBadges: liveDockBadges,
    dismissNotification: dismissLiveNotification,
  } = useGameSession(sessionId);

  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [openAppIds, setOpenAppIds] = useState<string[]>([]);
  const [localNotifications, setLocalNotifications] = useState<OSNotification[]>([]);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAIDirectorOpen, setIsAIDirectorOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showPostMeetingPrompt, setShowPostMeetingPrompt] = useState(false);

  // Merge local (boot) notifications with live WebSocket notifications
  const notifications = [
    ...localNotifications,
    ...liveNotifications.filter((n) => !localNotifications.some((l) => l.id === n.id)),
  ];

  // OS Boot timer sequence states
  const [bootStep, setBootStep] = useState<'booting' | 'silence' | 'ready'>(firstBoot ? 'booting' : 'ready');

  useEffect(() => {
    if (!firstBoot) {
      setLocalNotifications([]);
      return;
    }

    if (bootStep === 'booting') {
      setLocalNotifications([]);
      const timer = setTimeout(() => {
        setBootStep('silence');
      }, 3500);
      return () => clearTimeout(timer);
    }

    if (bootStep === 'silence') {
      const timer = setTimeout(() => {
        setBootStep('ready');
        // Kickoff call notification — opens TitanKickoffMeeting
        const teamsNotification: OSNotification = {
          id: 'notif-kickoff',
          app: 'Teams',
          title: 'Microsoft Teams • Incoming Video Call',
          subtitle: 'Marcus Reed (CTO) • 4 participants',
          body: 'Project Titan Kickoff — Please join immediately.',
          timestamp: 'Just now',
          actionText: 'Accept Call',
          onActionAppId: 'kickoff',
          isCall: true,
        };
        setLocalNotifications([teamsNotification]);
        sound.startTeamsRingtone();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [bootStep, firstBoot]);

  // Show post-meeting prompt 3s after kickoff finishes
  useEffect(() => {
    if (gameState.meetingState.kickoffDone && !gameState.meetingState.momSubmitted) {
      const timer = setTimeout(() => setShowPostMeetingPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.meetingState.kickoffDone, gameState.meetingState.momSubmitted]);

  // Sync pendingNotifications from GameContext FrontendEventScheduler into local notification list
  // This replaces all manual Day 7 / Day 14 notification useEffects.
  // The scheduler in GameContext fires at exact realElapsedMs offsets — no more clock.day integer checks.
  useEffect(() => {
    const pending = gameState.pendingNotifications;
    if (pending.length === 0) return;

    setLocalNotifications((prev) => {
      let changed = false;
      let next = [...prev];
      for (const pn of pending) {
        if (next.some((n) => n.id === pn.id)) continue;
        changed = true;
        next = [...next, {
          id: pn.id,
          app: (['Teams', 'Slack', 'Mail', 'Calendar', 'Security'].includes(pn.app) ? pn.app : 'Teams') as OSNotification['app'],
          title: pn.title,
          subtitle: pn.subtitle,
          body: pn.body,
          timestamp: pn.timestamp,
          actionText: pn.actionText,
          onActionAppId: pn.onActionAppId,
          isCall: pn.isCall,
        }];
        // Ring tone for calls
        if (pn.isCall) {
          sound.startTeamsRingtone();
        }
      }
      return changed ? next : prev;
    });
  }, [gameState.pendingNotifications]); // eslint-disable-line

  const handleOpenApp = (appId: string | null) => {
    if (appId && !openAppIds.includes(appId)) {
      setOpenAppIds((prev) => [...prev, appId]);
    }
    setActiveAppId(appId);
  };

  const handleCloseApp = (appId: string) => {
    setOpenAppIds((prev) => prev.filter((id) => id !== appId));
    if (activeAppId === appId) {
      setActiveAppId(null);
    }
  };

  const handleDismissNotification = (notifId: string) => {
    setLocalNotifications((prev) => prev.filter((n) => n.id !== notifId));
    dismissLiveNotification(notifId);
    sound.stopTeamsRingtone();
  };

  const handleActionNotification = (notif: OSNotification) => {
    handleDismissNotification(notif.id);
    sound.stopTeamsRingtone();
    if (notif.onActionAppId) {
      handleOpenApp(notif.onActionAppId);
    }
  };

  const handleApplyDecision = (trustDelta: number, xpDelta: number) => {
    setOsState((prev) => ({
      ...prev,
      trustScore: Math.min(100, Math.max(0, prev.trustScore + trustDelta)),
      xp: prev.xp + xpDelta,
    }));
  };

  const appMetaMap: Record<string, { title: string; icon: React.ReactNode }> = {
    kickoff: { title: 'Microsoft Teams — Project Titan Kickoff', icon: <span>📹</span> },
    review: { title: 'Microsoft Teams — Prototype Review · Day 7', icon: <span>📹</span> },
    presentation: { title: 'Microsoft Teams — Final Presentation · Day 14', icon: <span>📹</span> },
    ide: { title: 'Titan HR Portal — Prototype Builder', icon: <BrainedLogoIcon className="w-4 h-4" /> },
    dashboard: { title: 'Brained OS — Executive Dashboard', icon: <BrainedLogoIcon className="w-4 h-4" /> },
    inbox: { title: 'Apple Mail — Priority Inbox', icon: <span>✉️</span> },
    teams: { title: 'Microsoft Teams — Project Titan', icon: <span>📹</span> },
    slack: { title: 'Slack — Brained Workspace', icon: <span>💬</span> },
    notes: { title: 'Notes — MOM & Working Notes', icon: <span>📝</span> },
    calendar: { title: 'Calendar — Schedule & Milestones', icon: <span>📅</span> },
    documents: { title: 'Project Documents', icon: <span>📁</span> },
    tasks: { title: 'Jira — Sprint Kanban', icon: <span>📋</span> },
    browser: { title: 'Browser', icon: <span>🌐</span> },
    finder: { title: 'Finder', icon: <span>📂</span> },
    terminal: { title: 'Terminal', icon: <span>💻</span> },
    stakeholders: { title: 'Stakeholder Map', icon: <span>👥</span> },
    certificate: { title: 'Certificate', icon: <span>🏆</span> },
    settings: { title: 'Settings', icon: <span>⚙️</span> },
  };

  const currentAppMeta = activeAppId ? appMetaMap[activeAppId] || { title: 'Finder', icon: null } : { title: 'Finder', icon: null };

  return (
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
        clockWidget={<InGameClock />}
      />

      {/* DESKTOP CANVAS */}
      <main className="flex-1 relative z-10 pt-16 pb-24 px-8 overflow-hidden flex flex-col justify-between">
        {/* DESKTOP WIDGETS (CLOCK & STREAK) */}
        <DesktopWidgets osState={osState} onOpenApp={handleOpenApp} />

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
              onFocus={() => {}}
            >
              {/* KICKOFF — replaces old Teams during meeting */}
              {activeAppId === 'kickoff' && <TitanKickoffMeeting />}
              {/* PROTOTYPE REVIEW — Day 7 */}
              {activeAppId === 'review' && <PrototypeReviewMeeting />}
              {/* FINAL PRESENTATION — Day 14 */}
              {activeAppId === 'presentation' && <FinalPresentationMeeting />}
              {/* IDE — deterministic prototype builder */}
              {activeAppId === 'ide' && <TitanIDEApp />}
              {activeAppId === 'inbox' && <AppleMailApp />}
              {activeAppId === 'teams' && <MSTeamsApp onPenalty={handleApplyDecision} />}
              {activeAppId === 'slack' && <SlackOSApp />}
              {activeAppId === 'notes' && <AppleNotesApp />}
              {activeAppId === 'calendar' && <AppleCalendarApp />}
              {activeAppId === 'documents' && <DocumentsApp />}
              {activeAppId === 'tasks' && <JiraKanbanApp />}
              {activeAppId === 'browser' && <FakeBrowserApp />}
              {activeAppId === 'finder' && <FinderApp />}
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

      {/* TOP-RIGHT MAC OS SLIDE-IN NOTIFICATIONS */}
      <OSNotificationCenter
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onAction={handleActionNotification}
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

      {/* POST-MEETING PROMPT */}
      <PostMeetingPrompt
        visible={showPostMeetingPrompt && !gameState.meetingState.momSubmitted}
        onOpenNotes={() => { setShowPostMeetingPrompt(false); handleOpenApp('notes'); }}
        onLater={() => setShowPostMeetingPrompt(false)}
      />

      {/* PAUSE / EXIT GATE */}
      <PauseExitGate onConfirmExit={() => setBootStep('booting')} />

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
  );
};
