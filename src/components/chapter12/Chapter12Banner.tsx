import React from 'react';
import {
  Layers,
  Video,
  CheckCircle2,
  Award,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import type { Chapter12State } from '../../types/chapter12';

interface Chapter12BannerProps {
  state: Chapter12State;
  onOpenMeeting: () => void;
  onOpenControlCenter: () => void;
  onOpenReport: () => void;
}

export const Chapter12Banner: React.FC<Chapter12BannerProps> = ({
  state,
  onOpenMeeting,
  onOpenControlCenter,
  onOpenReport,
}) => {
  const isScopeDone = state.scopeCompleted;
  const isStrategyDone = state.releaseStrategyCompleted;
  const isDeploymentDone = state.deploymentCompleted;
  const isDecisionDone = state.decisionChosen !== null;

  const bonusPoints =
    (isScopeDone ? 5 : 0) +
    (isStrategyDone ? 5 : 0) +
    (isDeploymentDone ? 5 : 0);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 text-white px-4 py-2.5 shadow-lg select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Chapter Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold shadow-inner">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Chapter 12 • Final Chapter
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {state.timelineTimestamp || '29:03 – 31:00'}
              </span>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              The Next Evolution
              <span className="text-slate-400 text-xs font-normal hidden sm:inline">
                | CR Upgrade & Phase 2 Evolution
              </span>
            </h1>
          </div>
        </div>

        {/* Middle: Live Stages Tracker */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden md:flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Roadmap:</span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isScopeDone
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isScopeDone ? <CheckCircle2 className="w-3 h-3" /> : '1'} Scope
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isStrategyDone
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isStrategyDone ? <CheckCircle2 className="w-3 h-3" /> : '2'} Feature Flags
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isDeploymentDone
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isDeploymentDone ? <CheckCircle2 className="w-3 h-3" /> : '3'} Blue-Green
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isDecisionDone
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isDecisionDone ? <CheckCircle2 className="w-3 h-3" /> : '4'} Authorization
            </span>
          </div>

          <div className="bg-indigo-950/70 border border-indigo-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-indigo-200">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-xs font-bold text-indigo-300">
              +{bonusPoints}
            </span>
            <span className="text-[10px] text-indigo-400 font-medium">Evolution Bonus</span>
          </div>
        </div>

        {/* Right: Quick Action Launchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMeeting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Teams Meeting</span>
          </button>

          {(state.meetingIntroCompleted || state.controlCenterOpened) && (
            <button
              onClick={onOpenControlCenter}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Control Center</span>
            </button>
          )}

          {state.completed && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-slate-950" />
              <span>Final Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

