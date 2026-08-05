import React from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, Mail, MessageSquare, Calendar, FileText, 
  Kanban, Globe, Terminal, Award, Trophy, Settings, Trash2, Video
} from 'lucide-react';

import { BrainedLogoIcon } from '../common/BrainedLogoIcon';

interface BrainedDockProps {
  activeAppId: string | null;
  openAppIds: string[];
  onOpenApp: (appId: string | null) => void;
  badges: Record<string, number>;
}

export const BrainedDock: React.FC<BrainedDockProps> = ({
  activeAppId,
  openAppIds,
  onOpenApp,
  badges,
}) => {
  const dockApps = [
    { id: 'cera', name: 'Cera IDE — AI Engineer', icon: () => <BrainedLogoIcon className="w-6 h-6 object-contain drop-shadow-md" />, color: 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600' },
    { id: 'finder', name: 'Finder', icon: Folder, color: 'bg-gradient-to-tr from-[#1D70B8] to-[#428BCA]' },
    { id: 'inbox', name: 'Mail', icon: Mail, color: 'bg-gradient-to-tr from-[#007AFF] to-[#58A6FF]', badge: badges.inbox },
    { id: 'teams', name: 'Microsoft Teams', icon: Video, color: 'bg-gradient-to-tr from-[#464EB8] to-[#6264A7]', badge: badges.teams },
    { id: 'slack', name: 'Slack HQ', icon: MessageSquare, color: 'bg-gradient-to-tr from-[#4A154B] to-[#611B65]', badge: badges.slack },
    { id: 'notes', name: 'Apple Notes', icon: FileText, color: 'bg-gradient-to-tr from-[#FFCC02] to-[#E5B800]', badge: badges.notes },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'bg-gradient-to-tr from-[#FF3B30] to-[#FF453A]', badge: badges.calendar },
    { id: 'documents', name: 'Documents', icon: Folder, color: 'bg-gradient-to-tr from-[#E09B3D] to-[#C88126]' },
    { id: 'tasks', name: 'Jira / Linear', icon: Kanban, color: 'bg-gradient-to-tr from-[#5E6AD2] to-[#4C58C0]' },
    { id: 'browser', name: 'Arc Browser', icon: Globe, color: 'bg-gradient-to-tr from-[#8A2BE2] to-[#4A90E2]' },
    { id: 'terminal', name: 'Terminal', icon: Terminal, color: 'bg-gradient-to-tr from-[#1E1E1E] to-[#2C2C2E]' },
    { id: 'certificate', name: 'Certificate', icon: Award, color: 'bg-gradient-to-tr from-[#FFD700] to-[#D4AF37]' },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy, color: 'bg-gradient-to-tr from-[#FF9F0A] to-[#D48806]' },
    { id: 'settings', name: 'System Settings', icon: Settings, color: 'bg-gradient-to-tr from-[#8E8E93] to-[#636366]' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 select-none">
      {/* Apple Glass Dock Shelf */}
      <div className="px-4 py-2.5 apple-dock-glass rounded-3xl flex items-center space-x-3 shadow-2xl backdrop-blur-3xl bg-slate-900/60 border border-white/25">
        {dockApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeAppId === app.id;
          const isOpen = openAppIds.includes(app.id);

          return (
            <div key={app.id} className="relative group flex flex-col items-center">
              {/* Tooltip on Hover */}
              <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1C1C1E] border border-white/20 px-3 py-1 rounded-xl text-xs font-bold text-white whitespace-nowrap pointer-events-none shadow-2xl">
                {app.name}
              </div>

              {/* App Dock Icon (Enlarged w-12.5 h-12.5) */}
              <motion.button
                whileHover={{ scale: 1.25, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenApp(isActive ? null : app.id)}
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-xl relative border border-white/25 transition-all cursor-pointer`}
              >
                <Icon className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-white drop-shadow-md" />

                {/* Badge Count */}
                {app.badge !== undefined && app.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF3B30] text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-md">
                    {app.badge}
                  </span>
                )}
              </motion.button>

              {/* Active Dot Indicator */}
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-all ${
                isActive ? 'bg-white shadow-sm shadow-white scale-125' : isOpen ? 'bg-white/60' : 'opacity-0'
              }`} />
            </div>
          );
        })}

        {/* Separator */}
        <div className="w-[1.5px] h-9 bg-white/20 mx-1" />

        {/* Trash */}
        <div className="relative group flex flex-col items-center">
          <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1C1C1E] border border-white/20 px-3 py-1 rounded-xl text-xs font-bold text-white whitespace-nowrap pointer-events-none shadow-2xl">
            Trash
          </div>
          <motion.button
            whileHover={{ scale: 1.2, y: -8 }}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white border border-white/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-6 h-6" />
          </motion.button>
          <div className="w-1.5 h-1.5 opacity-0 mt-1.5" />
        </div>
      </div>
    </div>
  );
};
