import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, CheckCircle2, Lock, ArrowRight,
  Server, MessageSquare, FileText, Send, Sparkles
} from 'lucide-react';

interface SprintReadinessDashboardProps {
  infrastructureVerified: boolean;
  communicationConfigured: boolean;
  uiuxApproved: boolean;
  greenlightIssued: boolean;
  onTriggerGreenlightEmail: () => void;
  onProceedToScorecard: () => void;
}

export const SprintReadinessDashboard: React.FC<SprintReadinessDashboardProps> = ({
  infrastructureVerified,
  communicationConfigured,
  uiuxApproved,
  greenlightIssued,
  onTriggerGreenlightEmail,
  onProceedToScorecard,
}) => {
  const allGatesPassed = infrastructureVerified && communicationConfigured && uiuxApproved;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1d] text-slate-100 font-sans p-4 sm:p-6 text-xs select-none">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SPRINT 1 READINESS DASHBOARD
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Governance Gate
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
            Confirm That the Required Gates Have Been Satisfied
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Verify all prerequisite evidence before authorizing development teams to begin sprint work on Project Amigo.
          </p>
        </div>

        {/* 3 Gates */}
        {/* 3 Gates */}
        <div className="space-y-4">
          {/* Gate 1 */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 space-y-3.5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-inner ${
                  infrastructureVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Prerequisite Gate 01
                  </div>
                  <h3 className="font-bold text-white text-sm">
                    Secure Infrastructure Access & Whitelisting
                  </h3>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                infrastructureVerified
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}>
                {infrastructureVerified && <CheckCircle2 className="w-3 h-3" />}
                {infrastructureVerified ? 'GATE PASSED' : 'ACTION REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${infrastructureVerified ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>IT Prerequisites Checklist Transmitted</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${infrastructureVerified ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Port 443 & Proxy Rules Approved</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${infrastructureVerified ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Staging LDAP Sandbox Connected</span>
              </div>
            </div>
          </div>

          {/* Gate 2 */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 space-y-3.5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-inner ${
                  communicationConfigured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Prerequisite Gate 02
                  </div>
                  <h3 className="font-bold text-white text-sm">
                    Dual-Track Communication Architecture
                  </h3>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                communicationConfigured
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}>
                {communicationConfigured && <CheckCircle2 className="w-3 h-3" />}
                {communicationConfigured ? 'GATE PASSED' : 'ACTION REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${communicationConfigured ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span><strong className="text-white">#amigo-dev-ops</strong> active for dev sync & blockers</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${communicationConfigured ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Executive email thread & weekly digest mapped</span>
              </div>
            </div>
          </div>

          {/* Gate 3 */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 space-y-3.5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-inner ${
                  uiuxApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Prerequisite Gate 03
                  </div>
                  <h3 className="font-bold text-white text-sm">
                    UI/UX Design Baseline Signoff
                  </h3>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                uiuxApproved
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}>
                {uiuxApproved && <CheckCircle2 className="w-3 h-3" />}
                {uiuxApproved ? 'GATE PASSED' : 'ACTION REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${uiuxApproved ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Formal Baseline v1.0 email submitted to Marcus</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start space-x-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${uiuxApproved ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Appraisal, Leave & Form 16 prototypes approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Development Greenlight Action */}
        {!greenlightIssued ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
            <div>
              <div className="font-bold text-white text-xs">Authorize Sprint 1 Development</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {allGatesPassed
                  ? 'All 3 prerequisite gates satisfied. Issue official greenlight email to engineering.'
                  : 'Resolve remaining prerequisite gates before issuing the greenlight.'}
              </p>
            </div>

            <button
              onClick={onTriggerGreenlightEmail}
              disabled={!allGatesPassed}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Issue Development Greenlight</span>
            </button>
          </div>
        ) : (
          /* Greenlight Confirmation Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/50 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  SPRINT 1 — GREENLIGHT ISSUED
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Required prerequisites verified. Approved development work can begin.
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                ACTIVE SPRINT
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1">
              <div>
                <strong className="text-white">Official Greenlight Transmitted:</strong> Sent Artifact #4 to <span className="font-mono text-sky-400">amigo-dev-ops@brained.io</span>.
              </div>
              <div className="text-slate-400 text-[10px]">
                Note: Authorizes development work covered by approved sprint scope and design baseline. Full 90-day scope validation remains ongoing.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onProceedToScorecard}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>View Chapter 2 Scorecard & Feedback</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
