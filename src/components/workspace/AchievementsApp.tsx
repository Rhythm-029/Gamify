import React from 'react';
import { Medal, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/simulationData';

export const AchievementsApp: React.FC = () => {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Medal className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Executive Achievements & Badges</span>
        </div>
        <span className="text-slate-400">Unlocked: <strong className="text-amber-400">3 of 5 Badges</strong></span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((ach) => (
          <div
            key={ach.id}
            className={`glass-panel p-6 rounded-2xl border transition-all ${
              ach.unlocked
                ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent'
                : 'border-white/5 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                ach.unlocked ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-500'
              }`}>
                {ach.unlocked ? <Medal className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>
              {ach.unlockedAt && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {ach.unlockedAt}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-1">{ach.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{ach.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
