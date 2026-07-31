import React from 'react';
import { Settings, Bell, Moon } from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';

interface SettingsAppProps {
  playerState: typeof INITIAL_PLAYER_STATE;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ playerState }) => {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Settings className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-white">System Settings & OS Configuration</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <img src={playerState.avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border border-white/20" />
          <div>
            <h3 className="text-lg font-bold text-white">{playerState.name}</h3>
            <p className="text-xs text-slate-400">{playerState.role} • {playerState.company}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
              Enterprise Simulation ID: EXP-884-91
            </span>
          </div>
        </div>

        {/* System Settings Options */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs">
              <Moon className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-bold text-white">Dark OS Glassmorphism</div>
                <div className="text-slate-400">Default high-contrast corporate aesthetic</div>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold">Enabled</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs">
              <Bell className="w-4 h-4 text-purple-400" />
              <div>
                <div className="font-bold text-white">Teams Call & Slack Push Toasts</div>
                <div className="text-slate-400">Receive instant simulated C-Suite notifications</div>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
