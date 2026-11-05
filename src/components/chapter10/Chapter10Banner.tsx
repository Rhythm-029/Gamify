import React from 'react';
import { 
  GitBranch, 
  Terminal, 
  Video, 
  CheckCircle2, 
  Award,
  ChevronRight
} from 'lucide-react';
import type { Chapter10State } from '../../types/chapter10';

interface Chapter10BannerProps {
  state: Chapter10State;
  onOpenMeeting: () => void;
  onOpenPortal: () => void;
  onOpenScorecard: () => void;
}

export const Chapter10Banner: React.FC<Chapter10BannerProps> = ({
  state,
  onOpenMeeting,
  onOpenPortal,
  onOpenScorecard,
}) => {
  const isMeetingDone = state.meetingCompleted;
  const isAuditDone = state.repoAuditCompleted;
  const isSemVerDone = state.versionConfirmed;
  const isCatalogDone = state.catalogPublished;
  const isFinalDone = state.decisionChosen !== null;

  const bonusPoints =
    (state.repoAuditCompleted ? 5 : 0) +
    (state.selectedVersion === 'v1.0.0' ? 5 : 0) +
    (state.catalogPublished ? 5 : 0);

  const completedTasksCount = [
    isAuditDone,
    isSemVerDone,
    isCatalogDone,
    isFinalDone,
  ].filter(Boolean).length;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 text-white px-4 py-2.5 shadow-lg select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Chapter & Scenario Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold shadow-inner">
            <GitBranch className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Chapter 10 • Post-Launch Stabilization
              </span>
              <span className="text-xs text-slate-400 font-mono">
                25:00 – 27:00
              </span>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Versioning & Technical Documentation
              <span className="text-slate-400 text-xs font-normal hidden sm:inline">
                | Locking Down System Architecture Specs
              </span>
            </h1>
          </div>
        </div>

        {/* Middle: Live Progress Indicators */}
        <div className="flex items-center gap-2 text-xs">
          {/* Milestone Step Indicator */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Tasks:</span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isAuditDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isAuditDone ? <CheckCircle2 className="w-3 h-3" /> : '1'} Repo Audit
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isSemVerDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isSemVerDone ? <CheckCircle2 className="w-3 h-3" /> : '2'} SemVer
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isCatalogDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isCatalogDone ? <CheckCircle2 className="w-3 h-3" /> : '3'} Wiki Portal
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isFinalDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isFinalDone ? <CheckCircle2 className="w-3 h-3" /> : '4'} Governance
            </span>
          </div>

          {/* Formative Bonus Points */}
          <div className="bg-indigo-950/70 border border-indigo-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-indigo-200">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-xs font-bold text-indigo-300">
              +{bonusPoints}
            </span>
            <span className="text-[10px] text-indigo-400 font-medium">Release Bonus</span>
          </div>
        </div>

        {/* Right: Quick Action Launchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMeeting}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              !isMeetingDone
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Alex Briefing</span>
            {!isMeetingDone && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={onOpenPortal}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Portal</span>
            {completedTasksCount < 4 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-[10px] font-bold text-indigo-200 border border-indigo-400/40">
                {completedTasksCount}/4
              </span>
            )}
          </button>

          {isFinalDone && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all animate-bounce"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Chapter Scorecard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
