import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ShieldAlert, Clock, CheckCircle2,
  Send, ArrowRight, ShieldCheck, Server, AlertCircle,
  Laptop, PauseCircle, GitPullRequest, Layers, Radio
} from 'lucide-react';
import type { InfrastructureOption } from '../../types/chapter2';

interface InfrastructureIncidentPanelProps {
  initialDecision: InfrastructureOption | null;
  recoveryRequired: boolean;
  recoveryCompleted: boolean;
  requestSent: boolean;
  bankITResolved: boolean;
  stagingVerified: boolean;
  onApplyDecision: (option: InfrastructureOption) => void;
  onProceedToEmail: () => void;
}

export const InfrastructureIncidentPanel: React.FC<InfrastructureIncidentPanelProps> = ({
  initialDecision,
  recoveryRequired,
  recoveryCompleted,
  requestSent,
  bankITResolved,
  stagingVerified,
  onApplyDecision,
  onProceedToEmail,
}) => {
  const [selectedOption, setSelectedOption] = useState<InfrastructureOption | null>(initialDecision ?? null);
  const [hasApplied, setHasApplied] = useState(initialDecision !== null);

  const handleApply = () => {
    if (!selectedOption) return;
    setHasApplied(true);
    onApplyDecision(selectedOption);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1d] text-slate-100 font-sans p-4 sm:p-6 text-xs select-none">
      <div className="max-w-3xl w-full mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                INFRASTRUCTURE BLOCKER
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                P1 High Severity
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
              How will you keep development moving?
            </h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              The engineering team cannot connect to the staging environment. Bank IT has not yet resolved the network and authentication dependencies.
            </p>
          </div>
        </div>

        {/* Technical Status Panel */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-300 flex items-center gap-1.5 uppercase">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              STAGING CONNECTION CHECK
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              stagingVerified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {stagingVerified ? 'ALL CHECKS PASSED' : 'CONNECTION FAILED'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Staging server connectivity</span>
              <span className={`font-mono font-bold ${stagingVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                {stagingVerified ? 'Connected' : 'Failed'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Outbound port 443</span>
              <span className={`font-mono font-bold ${bankITResolved ? 'text-emerald-400' : 'text-red-400'}`}>
                {bankITResolved ? 'Verified' : 'Blocked'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Network proxy routes</span>
              <span className={`font-mono font-bold ${bankITResolved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {bankITResolved ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">LDAP sandbox access</span>
              <span className={`font-mono font-bold ${stagingVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stagingVerified ? 'Verified' : 'Unconfirmed'}
              </span>
            </div>
          </div>
        </div>

        {/* Decisions Section */}
        {!hasApplied ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>CHOOSE AN ACTION PATH</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Select one strategy to execute
              </span>
            </div>

            {/* Option A */}
            <div
              onClick={() => setSelectedOption('unsafe')}
              className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                selectedOption === 'unsafe'
                  ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/20 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.22)] ring-1 ring-sky-400'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                {/* Icon Tile */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  selectedOption === 'unsafe'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
                }`}>
                  <Laptop className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md">
                        OPTION A
                      </span>
                      <h4 className="font-bold text-white text-sm tracking-tight">
                        Proceed locally using an unapproved setup
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md">
                      Local Shortcut · Bypass Controls
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    Let developers use personal laptops over public Wi-Fi and hardcoded mock credentials until access becomes available.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Execution: Immediate offline start
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Security: Unaudited personal devices & credentials
                    </span>
                  </div>
                </div>

                {/* Radio Selector */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                  selectedOption === 'unsafe' ? 'border-sky-400 bg-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'border-slate-600'
                }`}>
                  {selectedOption === 'unsafe' && <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />}
                </div>
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => setSelectedOption('wait')}
              className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                selectedOption === 'wait'
                  ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/20 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.22)] ring-1 ring-sky-400'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                {/* Icon Tile */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  selectedOption === 'wait'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
                }`}>
                  <PauseCircle className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md">
                        OPTION B
                      </span>
                      <h4 className="font-bold text-white text-sm tracking-tight">
                        Pause all development
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md">
                      Total Standstill · Delivery Lag
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    Stop all engineering work completely until every staging infrastructure dependency is resolved.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Execution: Developers fully blocked
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Security: Zero boundary risk
                    </span>
                  </div>
                </div>

                {/* Radio Selector */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                  selectedOption === 'wait' ? 'border-sky-400 bg-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'border-slate-600'
                }`}>
                  {selectedOption === 'wait' && <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />}
                </div>
              </div>
            </div>

            {/* Option C */}
            <div
              onClick={() => setSelectedOption('secure')}
              className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                selectedOption === 'secure'
                  ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/20 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.22)] ring-1 ring-sky-400'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                {/* Icon Tile */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  selectedOption === 'secure'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
                }`}>
                  <GitPullRequest className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md">
                        OPTION C
                      </span>
                      <h4 className="font-bold text-white text-sm tracking-tight">
                        Raise the infrastructure request
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md">
                      Decoupled Local Work · Bank IT Gate
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    Request urgent resolution from Bank IT while developers continue with independent local unit tests and mocks that do not require restricted bank access.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Execution: Independent offline unit tests
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Governance: Formal IT escalation ticket
                    </span>
                  </div>
                </div>

                {/* Radio Selector */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                  selectedOption === 'secure' ? 'border-sky-400 bg-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'border-slate-600'
                }`}>
                  {selectedOption === 'secure' && <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={handleApply}
                disabled={!selectedOption}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Apply Decision</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Consequence & Recovery States */
          <div className="space-y-4">
            {initialDecision === 'unsafe' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-950/30 border border-red-500/50 space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-red-400 uppercase font-bold">
                      Aarav Kapoor — Project Manager Intervention
                    </div>
                    <p className="text-white text-xs font-semibold mt-1 leading-relaxed">
                      “We cannot use personal devices, public networks, or hardcoded credentials to bypass the bank's access controls. Stop that approach and establish an approved path forward.”
                    </p>
                  </div>
                </div>

                {!requestSent && (
                  <div className="pt-2 border-t border-red-500/20 flex justify-end">
                    <button
                      onClick={onProceedToEmail}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-red-500/30"
                    >
                      <span>Draft Urgent IT Infrastructure Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {initialDecision === 'wait' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      Team Feedback — Daniel & Aarav
                    </div>
                    <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                      <strong className="text-white">Daniel:</strong> “Understood. We'll hold staging work. Are there any independent unit tests or local mock tasks we can continue while we wait?”
                    </p>
                    <p className="text-slate-200 text-xs mt-2 leading-relaxed">
                      <strong className="text-white">Aarav:</strong> “We should not bypass the controls, but we also shouldn't leave every developer idle. Identify work that doesn't depend on staging access and get the infrastructure request moving.”
                    </p>
                  </div>
                </div>

                {!requestSent && (
                  <div className="pt-2 border-t border-amber-500/20 flex justify-end">
                    <button
                      onClick={onProceedToEmail}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-amber-500/30"
                    >
                      <span>Draft IT Request & Unblock Offline Mocks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {initialDecision === 'secure' && !requestSent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                      Secure Path Forward
                    </div>
                    <p className="text-white text-xs font-semibold mt-0.5">
                      Ready to transmit Official Email Artifact #2 to Bank IT Support.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onProceedToEmail}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-500/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Send Email</span>
                </button>
              </motion.div>
            )}

            {requestSent && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>INFRASTRUCTURE REQUEST SUBMITTED</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    Pending Bank IT Action
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-white">Daniel:</span> “Understood. We'll keep the team working on isolated unit tests and local mocks while the staging dependencies are being resolved. We won't attempt to bypass the bank's network controls.”
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-white">Martha:</span> “Infrastructure request sent. I've recorded the network and LDAP dependencies in the project workspace so we can track them.”
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
