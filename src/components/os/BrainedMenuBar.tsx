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
        {/* Spotlight Search Trigger (⌘K) */}
        <button
          onClick={onOpenSpotlight}
          className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1 rounded-full text-slate-100 text-xs font-mono transition-all cursor-pointer shadow-sm"
          title="Spotlight Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden md:inline font-bold">⌘K Search</span>
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
