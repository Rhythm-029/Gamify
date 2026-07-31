import React from 'react';
import { 
  LayoutDashboard, Mail, MessageSquare, Calendar, FileText, Folder, 
  Users, Kanban, TrendingUp, BarChart3, Rocket, Award, Trophy, Medal, Settings 
} from 'lucide-react';

interface SidebarNavProps {
  activeApp: string;
  onSelectApp: (appId: string) => void;
  unreadEmailCount: number;
  unreadSlackCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeApp,
  onSelectApp,
  unreadEmailCount,
  unreadSlackCount,
}) => {
  const primaryApps = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Outlook Inbox', icon: Mail, badge: unreadEmailCount },
    { id: 'slack', label: 'Slack Workspace', icon: MessageSquare, badge: unreadSlackCount },
    { id: 'calendar', label: 'Calendar & Meetings', icon: Calendar },
    { id: 'notes', label: 'Meeting Notes & MOM', icon: FileText },
    { id: 'documents', label: 'Docs Hub', icon: Folder },
  ];

  const simulationApps = [
    { id: 'stakeholders', label: 'Stakeholders & Trust', icon: Users },
    { id: 'tasks', label: 'Kanban Board', icon: Kanban },
    { id: 'timeline', label: 'Project Roadmap', icon: TrendingUp },
    { id: 'summary', label: 'Daily Analytics', icon: BarChart3 },
    { id: 'cinematic', label: '90 Days Later', icon: Rocket },
  ];

  const rewardApps = [
    { id: 'certificate', label: 'Digital Certificate', icon: Award },
    { id: 'leaderboard', label: 'Global Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Medal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 glass-panel rounded-2xl flex flex-col p-3 border border-white/10 shrink-0 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="px-3 py-2 mb-3 flex items-center space-x-2 border-b border-white/10 pb-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
          BQ
        </div>
        <div>
          <h2 className="font-semibold text-sm text-white leading-tight">Brained Quest</h2>
          <p className="text-[10px] text-slate-400">Enterprise OS v2.4</p>
        </div>
      </div>

      {/* Primary Apps */}
      <div className="space-y-1 mb-4">
        <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Applications</span>
        {primaryApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;
          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                isActive 
                  ? 'bg-blue-600/90 text-white font-semibold shadow-lg shadow-blue-500/20' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{app.label}</span>
              </div>
              {app.badge !== undefined && app.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {app.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Simulation Tools */}
      <div className="space-y-1 mb-4">
        <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Simulation</span>
        {simulationApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;
          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                isActive 
                  ? 'bg-purple-600/90 text-white font-semibold shadow-lg shadow-purple-500/20' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* Gamification & Credentials */}
      <div className="space-y-1 mt-auto pt-3 border-t border-white/10">
        <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Credentials</span>
        {rewardApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;
          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                isActive 
                  ? 'bg-amber-500/90 text-white font-semibold shadow-lg shadow-amber-500/20' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400/70'}`} />
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
