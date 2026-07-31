import React from 'react';
import { BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';

interface DailySummaryAppProps {
  playerState: typeof INITIAL_PLAYER_STATE;
  onNextDay: () => void;
}

export const DailySummaryApp: React.FC<DailySummaryAppProps> = ({ playerState, onNextDay }) => {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">Daily Performance Analytics — Day {playerState.currentDay} Summary</span>
        </div>
        <span className="text-slate-400 font-mono">Streak Maintained: 🔥 {playerState.streakDays} Days</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Day {playerState.currentDay} Complete • All Key Deliverables Met</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Transformative Progress Recorded</h1>
          <p className="text-xs text-slate-400 mt-1">Here is your daily corporate performance recap for executive review.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Emails Handled</span>
            <div className="text-2xl font-mono font-bold text-blue-400 mt-1">12</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Meetings Led</span>
            <div className="text-2xl font-mono font-bold text-purple-400 mt-1">3</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Trust Delta</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">+8%</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">XP Gained</span>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">+350 XP</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 text-center">
          <button
            onClick={onNextDay}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-blue-600/30 inline-flex items-center space-x-2 cursor-pointer"
          >
            <span>Advance to Day {playerState.currentDay + 1} Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
