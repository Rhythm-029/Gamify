import React, { useState } from 'react';
import { 
  Flame, Award, Sparkles, Settings, LogOut, ShieldAlert, CheckCircle2, Trophy
} from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';

interface MacDesktopShellProps {
  children: React.ReactNode;
  activeApp: string;
  onSelectApp: (appId: string) => void;
  playerState: typeof INITIAL_PLAYER_STATE;
  onOpenAIDirector: () => void;
  onOpenEventModal: () => void;
  unreadEmailCount: number;
  unreadSlackCount: number;
}

export const MacDesktopShell: React.FC<MacDesktopShellProps> = ({
  children,
  activeApp,
  onSelectApp,
  playerState,
  onOpenAIDirector,
  onOpenEventModal,
  unreadEmailCount,
  unreadSlackCount,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP MAC OS MENU BAR */}
      <header className="h-9 px-4 glass-header flex items-center justify-between z-40 text-xs select-none border-b border-white/10">
        {/* Left: Mac Traffic Lights & App Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/90 inline-block shadow-sm cursor-pointer hover:bg-red-400 transition-colors" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-sm cursor-pointer hover:bg-amber-400 transition-colors" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-sm cursor-pointer hover:bg-emerald-400 transition-colors" />
          </div>

          <span className="font-semibold text-white/90 tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Brained Quest OS
          </span>

          <span className="text-white/30">|</span>

          <nav className="hidden md:flex items-center space-x-3 text-slate-400">
            <button onClick={() => onSelectApp('dashboard')} className={`hover:text-white transition-colors cursor-pointer ${activeApp === 'dashboard' ? 'text-white font-medium' : ''}`}>Dashboard</button>
            <button onClick={() => onSelectApp('inbox')} className={`hover:text-white transition-colors cursor-pointer ${activeApp === 'inbox' ? 'text-white font-medium' : ''}`}>
              Inbox {unreadEmailCount > 0 && <span className="ml-1 text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full">{unreadEmailCount}</span>}
            </button>
            <button onClick={() => onSelectApp('slack')} className={`hover:text-white transition-colors cursor-pointer ${activeApp === 'slack' ? 'text-white font-medium' : ''}`}>
              Slack {unreadSlackCount > 0 && <span className="ml-1 text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full">{unreadSlackCount}</span>}
            </button>
            <button onClick={() => onSelectApp('documents')} className={`hover:text-white transition-colors cursor-pointer ${activeApp === 'documents' ? 'text-white font-medium' : ''}`}>Docs</button>
            <button onClick={() => onSelectApp('tasks')} className={`hover:text-white transition-colors cursor-pointer ${activeApp === 'tasks' ? 'text-white font-medium' : ''}`}>Kanban</button>
            <button onClick={() => onSelectApp('stakeholders')} className={`hover:text-white transition-colors cursor-pointer ${activeApp === 'stakeholders' ? 'text-white font-medium' : ''}`}>Stakeholders</button>
          </nav>
        </div>

        {/* Center: Game Stats (Streak, XP, Trust) */}
        <div className="flex items-center space-x-3">
          {/* Day & Act */}
          <div className="hidden lg:flex items-center bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[11px] text-slate-300">
            <span className="font-semibold text-blue-400 mr-1.5">DAY {playerState.currentDay} OF {playerState.totalDays}</span>
            <span className="text-slate-500">•</span>
            <span className="ml-1.5 text-slate-400">{playerState.currentAct}</span>
          </div>

          {/* DUOLINGO-STYLE STREAK COUNTER */}
          <div 
            onClick={() => onSelectApp('dashboard')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-500/40 px-2.5 py-1 rounded-full text-orange-400 cursor-pointer hover:scale-105 transition-transform"
            title="Duolingo-Inspired Daily Streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-bounce" />
            <span className="font-bold tracking-tight text-[11px]">{playerState.streakDays} Day Streak</span>
          </div>

          {/* XP & Trust Metrics */}
          <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-full text-[11px] text-blue-300">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{playerState.transformationXP} XP</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{playerState.trustScore}% Trust</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Simulation Crisis Event Trigger Button */}
          <button 
            onClick={onOpenEventModal}
            className="flex items-center space-x-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 px-2 py-0.5 rounded text-[10px] text-red-300 font-medium transition-all cursor-pointer"
            title="Trigger Business Event Modal"
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span className="hidden sm:inline">Trigger Event</span>
          </button>

          {/* AI Director floating button */}
          <button
            onClick={onOpenAIDirector}
            className="flex items-center space-x-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] text-purple-300 font-medium transition-all accent-glow-purple cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>AI Director</span>
          </button>

          {/* User Profile avatar dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-6 h-6 rounded-full border border-white/20 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              <img src={playerState.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl p-2 z-50 text-xs border border-white/10">
                <div className="p-2 border-b border-white/10 mb-1">
                  <div className="font-semibold text-white">{playerState.name}</div>
                  <div className="text-slate-400 text-[10px]">{playerState.role}</div>
                </div>
                <button 
                  onClick={() => { onSelectApp('certificate'); setShowProfileMenu(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Certificate</span>
                </button>
                <button 
                  onClick={() => { onSelectApp('settings'); setShowProfileMenu(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>OS Settings</span>
                </button>
                <div className="border-t border-white/10 my-1" />
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-500/10 text-red-400 flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Simulation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* INNER MAC OS WINDOW CANVAS */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {children}
      </main>
    </div>
  );
};
