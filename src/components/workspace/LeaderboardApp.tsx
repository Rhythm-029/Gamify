import React from 'react';
import { Trophy, Flame } from 'lucide-react';
import { LEADERBOARD } from '../../data/simulationData';

export const LeaderboardApp: React.FC = () => {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Global Leaderboard — Season 4 Enterprise Transformers</span>
        </div>
        <span className="text-slate-400">Percentile Rank: <strong className="text-amber-400">Top 2%</strong></span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {LEADERBOARD.map((item) => (
          <div
            key={item.rank}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              item.rank === 2
                ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/50'
                : 'bg-slate-900/60 border-white/5'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm ${
                item.rank === 1 ? 'bg-amber-500 text-slate-950' :
                item.rank === 2 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                #{item.rank}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">{item.name}</h4>
                <p className="text-xs text-slate-400">{item.role} • {item.company}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-xs">
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Streak</span>
                <span className="font-bold text-orange-400 flex items-center justify-end space-x-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{item.streak}d</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Trust</span>
                <span className="font-bold text-emerald-400">{item.trustScore}%</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">XP</span>
                <span className="font-bold text-blue-400">{item.xp} XP</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
