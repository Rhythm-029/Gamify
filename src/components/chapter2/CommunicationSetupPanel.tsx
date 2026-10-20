import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, Hash, GitBranch, Radio } from 'lucide-react';
import type { CommunicationOption } from '../../types/chapter2';

interface CommunicationSetupPanelProps {
  initialDecision: CommunicationOption | null;
  finalStructure: CommunicationOption | null;
  channelCreated: boolean;
  onSelectStructure: (opt: CommunicationOption) => void;
  onProceedToDesignReview: () => void;
}

export const CommunicationSetupPanel: React.FC<CommunicationSetupPanelProps> = ({
  initialDecision,
  finalStructure,
  channelCreated,
  onSelectStructure,
  onProceedToDesignReview,
}) => {
  const [selected, setSelected] = useState<CommunicationOption | null>(finalStructure ?? null);
  const [hasSubmitted, setHasSubmitted] = useState(channelCreated || initialDecision !== null);

  const handleCreate = () => {
    if (!selected) return;
    setHasSubmitted(true);
    onSelectStructure(selected);
  };

  const handleRevise = () => {
    setSelected('dual-track');
    onSelectStructure('dual-track');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1d] text-slate-100 font-sans p-4 sm:p-6 text-xs select-none">
      <div className="max-w-2xl w-full mx-auto space-y-5">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              PROJECT AMIGO WORKSPACE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/30">
              Scene 2.2
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
            Choose how the team should communicate
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Martha: “While that ticket is moving, I want to organize the Project Amigo workspace. Should I add Marcus, the stakeholders, and all 15 developers to one big group chat so everyone can see every update?”
          </p>
        </div>

        {/* Options */}
        {!hasSubmitted ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>CHOOSE COMMUNICATION TOPOLOGY</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Select team structure
              </span>
            </div>

            {/* Option A */}
            <div
              onClick={() => setSelected('single-chat')}
              className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                selected === 'single-chat'
                  ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/20 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.22)] ring-1 ring-sky-400'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                {/* Icon Tile */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  selected === 'single-chat'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
                }`}>
                  <Users className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md">
                        OPTION A
                      </span>
                      <h4 className="font-bold text-white text-sm tracking-tight">
                        One shared group chat
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md">
                      Flat Stream · Unfiltered Broadcast
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    Put developers, executives, and stakeholders into one conversation for technical discussions, tickets, milestones, and status updates.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Participants: All 15 engineers + CTO + Bank Client
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Impact: High noise & alert fatigue
                    </span>
                  </div>
                </div>

                {/* Radio Selector */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                  selected === 'single-chat' ? 'border-sky-400 bg-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'border-slate-600'
                }`}>
                  {selected === 'single-chat' && <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />}
                </div>
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => setSelected('dual-track')}
              className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                selected === 'dual-track'
                  ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/20 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.22)] ring-1 ring-sky-400'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                {/* Icon Tile */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  selected === 'dual-track'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
                }`}>
                  <GitBranch className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md">
                        OPTION B
                      </span>
                      <h4 className="font-bold text-white text-sm tracking-tight">
                        Dual-track communication
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md">
                      Governed Channels · Signal Separation
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    Use a dedicated engineering channel for technical discussion and formal executive reporting for milestones, risks, and decisions.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Engineering: Dedicated #amigo-dev-ops channel
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Executive: Weekly project dashboard + milestone email
                    </span>
                  </div>
                </div>

                {/* Radio Selector */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                  selected === 'dual-track' ? 'border-sky-400 bg-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'border-slate-600'
                }`}>
                  {selected === 'dual-track' && <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={handleCreate}
                disabled={!selected}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Create Structure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Consequence Card */
          <div className="space-y-4">
            {initialDecision === 'single-chat' && finalStructure !== 'dual-track' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      Martha — Delivery Operations Feedback
                    </div>
                    <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                      “Everyone would see the updates, but routine technical discussions could become difficult to follow. We could also overwhelm stakeholders with information they don't need for day-to-day decisions.”
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex justify-end">
                  <button
                    onClick={handleRevise}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-amber-500/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revise Communication Structure</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ENGINEERING CHANNEL CREATED</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Structure Active
                  </span>
                </div>

                {/* Structure details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Hash className="w-3 h-3 text-sky-400" />
                      Engineering Operations
                    </div>
                    <div className="font-bold text-white text-xs"># amigo-dev-ops</div>
                    <div className="text-[10px] text-slate-300">
                      Daniel, Martha, Engineering Team, Project Manager
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Executive Route
                    </div>
                    <div className="font-bold text-white text-xs">Marcus Reed & Sophia Bennett</div>
                    <div className="text-[10px] text-slate-300">
                      Executive email + weekly project dashboard
                    </div>
                  </div>
                </div>

                {/* Martha feedback */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Martha:</span> “That should work well. Engineering can keep the technical discussion focused, while Marcus and Sophia receive structured updates and escalations through the appropriate channels.”
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onProceedToDesignReview}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>Inspect UI/UX Prototypes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
