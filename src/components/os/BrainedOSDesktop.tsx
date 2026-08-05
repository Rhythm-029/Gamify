import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrainedMenuBar } from './BrainedMenuBar';
import { BrainedDock } from './BrainedDock';
import { BrainedWindow } from './BrainedWindow';
import { OSNotificationCenter } from './OSNotificationCenter';
import { SpotlightSearch } from './SpotlightSearch';
import { DesktopWidgets } from './DesktopWidgets';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';

import { INITIAL_OS_STATE, INITIAL_NOTIFICATIONS } from '../../data/brainedOSData';
import type { OSNotification } from '../../data/brainedOSData';

// App Clones
import { DashboardHome } from '../workspace/DashboardHome';
import { AppleMailApp } from '../apps/AppleMailApp';
import { AppleNotesApp } from '../apps/AppleNotesApp';
import { AppleCalendarApp } from '../apps/AppleCalendarApp';
import { MSTeamsApp } from '../apps/MSTeamsApp';
import { SlackApp as SlackOSApp } from '../workspace/SlackApp';
import { JiraKanbanApp } from '../apps/JiraKanbanApp';
import { FinderApp } from '../apps/FinderApp';
import { FakeBrowserApp } from '../apps/FakeBrowserApp';
import { TerminalApp } from '../apps/TerminalApp';
import { DocumentsApp } from '../workspace/DocumentsApp';
import { StakeholdersApp } from '../workspace/StakeholdersApp';
import { CertificateApp } from '../workspace/CertificateApp';
import { LeaderboardApp } from '../workspace/LeaderboardApp';
import { AchievementsApp } from '../workspace/AchievementsApp';
import { SettingsApp } from '../workspace/SettingsApp';
import { CeraIDEApp } from '../apps/CeraIDEApp';

import { AIDirectorWidget } from '../overlays/AIDirectorWidget';
import { SimulationEventModal } from '../overlays/SimulationEventModal';

interface BrainedOSDesktopProps {
  onOpenEventModal?: () => void;
}

export const BrainedOSDesktop: React.FC<BrainedOSDesktopProps> = () => {
  const [osState, setOsState] = useState(INITIAL_OS_STATE);
  const [activeAppId, setActiveAppId] = useState<string | null>(null); // Starts NULL on desktop wallpaper!
  const [openAppIds, setOpenAppIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<OSNotification[]>([]);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAIDirectorOpen, setIsAIDirectorOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Clean OS boot state without automatic initial call modal
  useEffect(() => {
    // Notifications start clear for clean executive onboarding
    setNotifications([]);
  }, []);

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
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const handleActionNotification = (notif: OSNotification) => {
    handleDismissNotification(notif.id);
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
    cera: { title: 'Cera IDE — Autonomous AI Software Engineer', icon: <BrainedLogoIcon className="w-4 h-4" /> },
    dashboard: { title: 'Brained OS — Executive Dashboard', icon: <BrainedLogoIcon className="w-4 h-4" /> },
    inbox: { title: 'Apple Mail — Priority Inbox', icon: <span>✉️</span> },
    teams: { title: 'Microsoft Teams — Live Video & Meetings', icon: <span>📹</span> },
    slack: { title: 'Slack HQ — Workspace Messenger', icon: <span>💬</span> },
    notes: { title: 'Apple Notes — MOM & Executive Notes', icon: <span>📝</span> },
    calendar: { title: 'Calendar — Schedule & Milestones', icon: <span>📅</span> },
    documents: { title: 'Project Documents & RACI Logs', icon: <span>📁</span> },
    tasks: { title: 'Jira / Linear — Sprint 1 Kanban', icon: <span>📋</span> },
    browser: { title: 'Arc Browser — Enterprise Cloud Console', icon: <span>🌐</span> },
    finder: { title: 'Finder — File Explorer', icon: <span>📂</span> },
    terminal: { title: 'Terminal — Brained OS CLI', icon: <span>💻</span> },
    stakeholders: { title: 'Boardroom Alignment & Stakeholder Index', icon: <span>👥</span> },
    certificate: { title: 'Verified Executive Certificate of Mastery', icon: <span>🏆</span> },
    leaderboard: { title: 'Global Leaderboard', icon: <span>🥇</span> },
    achievements: { title: 'Achievements & Badges', icon: <span>✨</span> },
    settings: { title: 'System Settings', icon: <span>⚙️</span> },
  };

  const currentAppMeta = activeAppId ? appMetaMap[activeAppId] || { title: 'Finder', icon: null } : { title: 'Finder', icon: null };

  return (
    <div className="w-full h-screen bg-[#0B0E18] text-white flex flex-col font-sans selection:bg-[#0A84FF] selection:text-white relative overflow-hidden select-none">
      {/* REAL MACOS SCENERY WALLPAPER */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700"
        style={{ backgroundImage: "url('/assets/wallpaper.png')" }}
      >
        {/* Subtle dark vignette overlay for legibility */}
        <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px]" />
      </div>

      {/* TOP BRAINED OS MENU BAR */}
      <BrainedMenuBar
        activeAppName={activeAppId ? currentAppMeta.title.split(' — ')[0] : 'Finder'}
        osState={osState}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onOpenAIDirector={() => setIsAIDirectorOpen(true)}
        onOpenEventModal={() => setIsEventModalOpen(true)}
        onSelectApp={handleOpenApp}
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
              {activeAppId === 'cera' && <CeraIDEApp />}
              {activeAppId === 'dashboard' && (
                <DashboardHome
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
                  onSelectApp={handleOpenApp}
                  onOpenEventModal={() => setIsEventModalOpen(true)}
                />
              )}
              {activeAppId === 'inbox' && <AppleMailApp />}
              {activeAppId === 'teams' && <MSTeamsApp />}
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
              {activeAppId === 'leaderboard' && <LeaderboardApp />}
              {activeAppId === 'achievements' && <AchievementsApp />}
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
        badges={osState.dockBadges}
      />

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
