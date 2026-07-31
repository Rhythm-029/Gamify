import React from 'react';
import { Users, AlertCircle, MessageSquare } from 'lucide-react';
import { STAKEHOLDERS } from '../../data/simulationData';

interface StakeholdersAppProps {
  onSelectApp: (appId: string) => void;
}

export const StakeholdersApp: React.FC<StakeholdersAppProps> = ({ onSelectApp }) => {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white">Boardroom Stakeholders & Trust Index</span>
        </div>
        <span className="text-slate-400">Global Alignment: <strong className="text-emerald-400">84% Trust</strong></span>
      </div>

      {/* Grid of Stakeholder Cards */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STAKEHOLDERS.map((person) => (
          <div key={person.id} className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between border border-white/10">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img src={person.avatar} alt={person.name} className="w-14 h-14 rounded-2xl object-cover border border-white/20" />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-white/20">
                      {person.badgeCode}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{person.name}</h3>
                    <p className="text-xs text-slate-400">{person.role}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-300 font-mono">
                      {person.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mood & Influence */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="p-2 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Current Mood</span>
                  <span className="font-bold text-amber-300">{person.mood}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Influence level</span>
                  <span className={`font-bold ${person.influence === 'Critical' ? 'text-red-400' : 'text-blue-400'}`}>
                    {person.influence}
                  </span>
                </div>
              </div>

              {/* Quote & Pending Request */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 mb-4 text-xs italic text-slate-300">
                "{person.recentQuote}"
              </div>

              {person.pendingRequest && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start space-x-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Pending Request:</strong> {person.pendingRequest}</span>
                </div>
              )}
            </div>

            {/* Trust Meter & Direct Chat Action */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Trust Score</span>
                  <span className="font-bold text-emerald-400">{person.trustLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                    style={{ width: `${person.trustLevel}%` }}
                  />
                </div>
              </div>

              <button 
                onClick={() => onSelectApp('slack')}
                className="w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message on Slack</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
