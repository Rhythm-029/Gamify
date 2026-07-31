import React from 'react';
import { Rocket, Award, ThumbsUp, MessageSquare } from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';

interface NinetyDaysLaterAppProps {
  playerState: typeof INITIAL_PLAYER_STATE;
  onViewCertificate: () => void;
}

export const NinetyDaysLaterApp: React.FC<NinetyDaysLaterAppProps> = ({ playerState, onViewCertificate }) => {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Rocket className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white">Cinematic Retrospective: 90 Days Post-Deployment</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
          Outcome: Highly Successful Transformation
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono">
            90 DAYS LATER • APEX GLOBAL ENTERPRISE
          </div>
          <h1 className="text-3xl font-extrabold text-white">The HR Portal Is Now Modernizing 14 Global Offices</h1>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            Your decisions during the 10-day high-stakes mandate survived contact with corporate reality. Here is the press and executive fallout.
          </p>
        </div>

        {/* TechCrunch / News Article Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-blue-400">TechCrunch Enterprise</span>
            <span>2 Hours Ago</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Apex Global Completes Record 6-Week HR Portal Overhaul Under Lead Transformer {playerState.name}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            "In an era where 70% of digital transformations fail to deliver expected ROI, Apex Global defied industry benchmarks by shipping a zero-trust, AI-native HR portal in just 6 weeks..."
          </p>
        </div>

        {/* LinkedIn Post Mockup */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 max-w-xl mx-auto">
          <div className="flex items-center space-x-3">
            <img src={playerState.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/20" />
            <div>
              <div className="text-xs font-bold text-white">{playerState.name}</div>
              <div className="text-[10px] text-slate-400">{playerState.role} • 1st</div>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            🚀 Thrilled to announce that our team officially completed the 6-week Enterprise HR Portal transformation! Passed zero-trust security gates with CISO Knox and delivered 100% on-budget.
          </p>

          <div className="flex items-center space-x-6 text-xs text-slate-400 pt-2 border-t border-white/10">
            <div className="flex items-center space-x-1 hover:text-blue-400 cursor-pointer">
              <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
              <span>428 Likes</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-slate-200 cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>64 Comments</span>
            </div>
          </div>
        </div>

        {/* Claim Certificate Button */}
        <div className="pt-4 text-center">
          <button
            onClick={onViewCertificate}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-sm transition-all shadow-xl shadow-amber-500/30 inline-flex items-center space-x-2 cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <span>View & Share Executive Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
