import React from 'react';
import { 
  Files, Search, GitBranch, Blocks, Sparkles, Monitor, Settings, User
} from 'lucide-react';
import { BrainedLogoIcon } from '../../common/BrainedLogoIcon';

export type ActivityTab = 'explorer' | 'search' | 'git' | 'extensions' | 'cera_ai' | 'preview';

interface CeraActivityBarProps {
  activeTab: ActivityTab;
  setActiveTab: (tab: ActivityTab) => void;
  isAiBuilding: boolean;
}

export const CeraActivityBar: React.FC<CeraActivityBarProps> = ({
  activeTab,
  setActiveTab,
  isAiBuilding,
}) => {
  const topNavItems: { id: ActivityTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'explorer', label: 'Explorer (⌘Shift+E)', icon: Files },
    { id: 'search', label: 'Search (⌘Shift+F)', icon: Search },
    { id: 'git', label: 'Source Control (⌘Shift+G)', icon: GitBranch },
    { id: 'extensions', label: 'Extensions (⌘Shift+X)', icon: Blocks },
    { id: 'cera_ai', label: 'Cera AI Assistant', icon: Sparkles },
    { id: 'preview', label: 'Live App Preview', icon: Monitor },
  ];

  return (
    <aside className="w-13 bg-[#11131f] border-r border-white/10 flex flex-col justify-between items-center py-3 select-none z-20 shrink-0">
      {/* Top Section */}
      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Brand Cera Icon */}
        <div className="relative group cursor-pointer mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20 p-1.5 border border-white/20 hover:scale-105 transition-transform">
            <BrainedLogoIcon className="w-full h-full object-contain filter drop-shadow-md" />
          </div>
          {isAiBuilding && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 animate-ping" />
          )}
        </div>

        {/* Top Activity Icons */}
        <nav className="flex flex-col items-center space-y-1.5 w-full">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                {/* Active Left Pill */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-pink-500 rounded-r-full shadow-sm shadow-pink-500" />
                )}

                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-pink-400 font-bold shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 ${item.id === 'cera_ai' && isAiBuilding ? 'text-pink-400 animate-pulse' : ''}`} />
                </button>

                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/20 px-2.5 py-1 rounded-lg text-xs text-white whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-extrabold text-xs flex items-center justify-center border border-white/30 shadow-md cursor-pointer hover:scale-105 transition-transform"
          title="Account: Senior AI Engineer"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
