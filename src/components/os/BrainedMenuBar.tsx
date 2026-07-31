import React from 'react';
import { 
  Flame, Award, CheckCircle2, Search, Wifi, Battery, Sparkles, ShieldAlert 
} from 'lucide-react';
import { INITIAL_OS_STATE } from '../../data/brainedOSData';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';

interface BrainedMenuBarProps {
  activeAppName: string;
  osState: typeof INITIAL_OS_STATE;
  onOpenSpotlight: () => void;
  onOpenAIDirector: () => void;
  onOpenEventModal: () => void;
  onSelectApp: (appId: string | null) => void;
}

export const BrainedMenuBar: React.FC<BrainedMenuBarProps> = ({
  activeAppName,
  osState,
  onOpenSpotlight,
  onOpenAIDirector,
  onOpenEventModal,
  onSelectApp,
}) => {
  return (
    <header className="h-11 w-full apple-header-glass fixed top-0 left-0 right-0 z-50 px-5 flex items-center justify-between text-xs select-none border-b border-white/20 text-slate-100 backdrop-blur-2xl bg-slate-900/90 shadow-lg">
      {/* LEFT: Brained OS Logo & System Menus */}
      <div className="flex items-center space-x-5">
        {/* Exact User Uploaded Brained Logo Image */}
        <button 
          onClick={() => onSelectApp(null)}
          className="flex items-center space-x-2 text-white hover:opacity-90 transition-all cursor-pointer hover:scale-105"
          title="Brained OS Desktop Wallpaper"
        >
          <BrainedLogoIcon className="h-7 w-auto object-contain" />
          <span className="text-xs font-mono font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
            BRAINED OS
          </span>
        </button>

        {/* Active Application Name */}
        <span className="font-bold text-white tracking-tight text-xs md:text-sm bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
          {activeAppName}
        </span>

        {/* Standard System Menus */}
        <nav className="hidden lg:flex items-center space-x-4 text-slate-200 text-xs font-semibold">
          <button className="hover:text-white transition-colors cursor-pointer">File</button>
          <button className="hover:text-white transition-colors cursor-pointer">Edit</button>
          <button className="hover:text-white transition-colors cursor-pointer">View</button>
          <button className="hover:text-white transition-colors cursor-pointer">Go</button>
          <button className="hover:text-white transition-colors cursor-pointer">Window</button>
          <button className="hover:text-white transition-colors cursor-pointer">Help</button>
        </nav>
      </div>

      {/* RIGHT: Game Metrics & System Indicators */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Day & Act Badge */}
        <div className="hidden xl:flex items-center bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full text-slate-200">
          <span className="font-bold text-blue-400 mr-1.5">DAY {osState.currentDay} OF {osState.totalDays}</span>
          <span className="text-slate-500">•</span>
          <span className="ml-1.5 text-slate-300 font-medium">Act I: Foundation</span>
        </div>

        {/* DUOLINGO STREAK COUNTER */}
        <div 
          onClick={() => onSelectApp('dashboard')}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-orange-500/50 px-3 py-1 rounded-full text-orange-300 cursor-pointer hover:scale-105 transition-transform shadow-sm"
          title="Daily Transformation Streak"
        >
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
          <span className="font-extrabold text-xs">{osState.streakDays} Day Streak</span>
        </div>

        {/* XP Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-blue-500/20 border border-blue-500/40 px-3 py-1 rounded-full text-blue-200">
          <Award className="w-4 h-4 text-blue-400" />
          <span className="font-extrabold text-xs">{osState.xp} XP</span>
        </div>

        {/* Executive Trust */}
        <div className="flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs">{osState.trustScore}% Trust</span>
        </div>

        {/* Spotlight Search Trigger (⌘K) */}
        <button
          onClick={onOpenSpotlight}
          className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1 rounded-full text-slate-100 text-xs font-mono transition-all cursor-pointer shadow-sm"
          title="Spotlight Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden md:inline font-bold">⌘K Search</span>
        </button>

        {/* Crisis Event Trigger */}
        <button 
          onClick={onOpenEventModal}
          className="flex items-center space-x-1.5 bg-red-500/25 hover:bg-red-500/40 border border-red-500/50 px-2.5 py-1 rounded-lg text-xs text-red-200 font-bold cursor-pointer transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Crisis</span>
        </button>

        {/* AI Director button */}
        <button
          onClick={onOpenAIDirector}
          className="flex items-center space-x-1.5 bg-purple-500/25 hover:bg-purple-500/40 border border-purple-500/50 px-2.5 py-1 rounded-lg text-xs text-purple-200 font-bold apple-glow-purple cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>AI Assistant</span>
        </button>

        {/* Time & Status Icons */}
        <div className="flex items-center space-x-2.5 text-slate-300 pl-1 border-l border-white/15 ml-1">
          <Wifi className="w-3.5 h-3.5 text-slate-200" />
          <Battery className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white font-mono text-xs">10:42 AM</span>
        </div>
      </div>
    </header>
  );
};
