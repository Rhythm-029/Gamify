import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, Eye, ShieldCheck, Mail,
  Send, ArrowRight, Award, Calendar, DollarSign, X
} from 'lucide-react';
import type { UiUxOption, PrototypePreviewItem } from '../../types/chapter2';
import { CHAPTER2_PROTOTYPES } from '../../data/chapter2Data';

interface DesignReviewWorkspaceProps {
  initialDecision: UiUxOption | null;
  signoffSent: boolean;
  approvalReceived: boolean;
  approvedVersions: string[];
  onSelectOption: (opt: UiUxOption) => void;
  onRequestSignoffEmail: () => void;
  onProceedToSprintReadiness: () => void;
}

export const DesignReviewWorkspace: React.FC<DesignReviewWorkspaceProps> = ({
  initialDecision,
  signoffSent,
  approvalReceived,
  approvedVersions,
  onSelectOption,
  onRequestSignoffEmail,
  onProceedToSprintReadiness,
}) => {
  const [activeModalPrototype, setActiveModalPrototype] = useState<PrototypePreviewItem | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<UiUxOption | null>(initialDecision);

  const handleApplyDecision = () => {
    if (!selectedDecision) return;
    onSelectOption(selectedDecision);
    if (selectedDecision === 'written-signoff') {
      onRequestSignoffEmail();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1d] text-slate-100 font-sans p-4 sm:p-6 text-xs select-none">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              PROJECT AMIGO — DESIGN REVIEW
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
              approvalReceived
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {approvalReceived ? 'APPROVED · BASELINE v1' : 'Prototype review · Approval pending'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
            Review High-Fidelity UI/UX Prototypes
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Martha: “There's good news on the design side. The designer has finished the high-fidelity prototypes for the Appraisal Dashboard, Leave Request Screen, and Form 16 Downloader.”
          </p>
        </div>

        {/* 3 Prototype Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHAPTER2_PROTOTYPES.map((proto) => {
            const isApproved = approvalReceived;
            return (
              <div
                key={proto.id}
                className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 hover:border-slate-700/80 p-4 flex flex-col justify-between transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-xl group relative overflow-hidden"
              >
                {/* Subtle top accent highlight */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isApproved ? 'bg-emerald-500' : 'bg-sky-500/70'}`} />

                <div>
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="font-mono text-[9px] px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60 font-semibold tracking-wide">
                      {proto.version}
                    </span>
                    <span className={`text-[10px] font-mono font-bold flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
                      isApproved 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                    }`}>
                      {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {isApproved ? 'Locked Baseline' : 'Ready to Review'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors tracking-tight">
                    {proto.title}
                  </h3>
                  <div className="text-[10px] text-slate-400 mb-2.5 font-medium">
                    {proto.subtitle}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3.5 line-clamp-2">
                    {proto.summary}
                  </p>

                  <div className="space-y-1.5 mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                      Key Capabilities:
                    </div>
                    {proto.features.slice(0, 2).map((feat, fidx) => (
                      <div key={fidx} className="flex items-center text-[10px] text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalPrototype(proto)}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white font-bold text-[11px] flex items-center justify-center space-x-2 transition-all cursor-pointer border border-slate-700/60 hover:border-slate-600 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Inspect High-Fi Prototype</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Meeting Quote Beat */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            Live Walkthrough Feedback
          </div>
          <div className="text-slate-200 text-xs italic leading-relaxed">
            <strong className="text-white not-italic">Marcus (Teams meeting):</strong> “The design looks great. The one-click appraisal submission should save managers a lot of time.”
          </div>
          <div className="text-slate-300 text-xs leading-relaxed">
            <strong className="text-white">Martha:</strong> “Great. The team is ready to move forward once the designs are approved. Should we tell the developers to start building, or do we need something more formal?”
          </div>
        </div>

        {/* Approval Decision Section */}
        {!approvalReceived ? (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Select Approval Strategy
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Decide whether to accept verbal consensus or execute a formal written baseline signoff.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/70">
                Decision Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A */}
              <div
                onClick={() => setSelectedDecision('verbal')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDecision === 'verbal'
                    ? 'bg-sky-950/30 border-sky-400 shadow-xl ring-1 ring-sky-400/50'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/80">
                        OPTION A
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Informal Transition</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedDecision === 'verbal' ? 'border-sky-400 bg-sky-500/20' : 'border-slate-600'
                    }`}>
                      {selectedDecision === 'verbal' && <div className="w-2 h-2 rounded-full bg-sky-400" />}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-xs mb-1">
                    Proceed on Verbal Meeting Approval
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                    Treat Marcus's positive verbal feedback in the call as authorization and initiate sprint task breakdown immediately.
                  </p>

                  <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>Zero turnaround delay before team starts work</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>Leaves no formal version trail if client questions screens later</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option B */}
              <div
                onClick={() => setSelectedDecision('written-signoff')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDecision === 'written-signoff'
                    ? 'bg-sky-950/30 border-sky-400 shadow-xl ring-1 ring-sky-400/50'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/80">
                        OPTION B
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Formal Baseline Gate</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedDecision === 'written-signoff' ? 'border-sky-400 bg-sky-500/20' : 'border-slate-600'
                    }`}>
                      {selectedDecision === 'written-signoff' && <div className="w-2 h-2 rounded-full bg-sky-400" />}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-xs mb-1">
                    Secure Written Signoff & Lock Baseline
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                    Transmit high-res exports to Marcus, obtain unambiguous written approval via email, and freeze Baseline v1.0 specifications.
                  </p>

                  <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span>Locks binding baseline specs before code is committed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span>Prevents rework, scope drift, and conflicting feedback</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* If player chose verbal: recovery action */}
            {initialDecision === 'verbal' && !signoffSent && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-slate-950/90 border border-slate-700 space-y-2 shadow-lg"
              >
                <p className="text-slate-200 text-xs">
                  <strong className="text-white">Martha:</strong> “Before I mark the designs as approved, where should I record the approved versions? I can see the positive meeting feedback, but I don't have a written approval to attach to the project record.”
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={onRequestSignoffEmail}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Request Written Signoff</span>
                  </button>
                </div>
              </motion.div>
            )}

            {initialDecision !== 'verbal' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleApplyDecision}
                  disabled={!selectedDecision}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  Apply Decision
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Approved Baseline Notification */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/50 space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>FORMAL WRITTEN SIGNOFF RECORDED</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                Baseline v1 Locked
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Marcus Reed (Email Reply):</span> “Reviewed. I approve the attached prototype versions for the current design baseline. Please use these versions for implementation and route any subsequent changes through the agreed review process.”
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onProceedToSprintReadiness}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Proceed to Sprint 1 Readiness Checks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Prototype Inspection Modal */}
      <AnimatePresence>
        {activeModalPrototype && (
          <div className="fixed inset-0 z-[600] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    PROTOTYPE INSPECTION · {activeModalPrototype.version}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {activeModalPrototype.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalPrototype(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Realistic Mock UI Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-slate-300 text-xs">ICICI Bank HRMS · Amigo Design System</span>
                  <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                    Figma High-Fidelity
                  </span>
                </div>

                {activeModalPrototype.id === 'appraisal' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Total Reviewees</div>
                        <div className="text-lg font-bold text-white">42 Team Members</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Cycle Deadline</div>
                        <div className="text-lg font-bold text-amber-400">Day 90 Firm</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Target Efficiency</div>
                        <div className="text-lg font-bold text-emerald-400">+65% Speed</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Manager One-Click Rating</div>
                        <div className="text-[10px] text-slate-400">Batch review competency matrix with instant confirmation</div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                        Submit Ratings (1-Click)
                      </span>
                    </div>
                  </div>
                )}

                {activeModalPrototype.id === 'leave' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Privilege Leave</div>
                        <div className="text-lg font-bold text-white">18.5 Days</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Casual Leave</div>
                        <div className="text-lg font-bold text-sky-400">7.0 Days</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Sick Leave</div>
                        <div className="text-lg font-bold text-purple-400">12.0 Days</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Holiday Calendar Synchronization</div>
                        <div className="text-[10px] text-slate-400">Automatic exclusion of national & bank branch holidays</div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px]">
                        Apply Leave
                      </span>
                    </div>
                  </div>
                )}

                {activeModalPrototype.id === 'form16' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Assessment Year</div>
                        <div className="text-lg font-bold text-white">AY 2025-26</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Tax Deducted (TDS)</div>
                        <div className="text-lg font-bold text-emerald-400">₹3,42,800</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">e-Signature</div>
                        <div className="text-lg font-bold text-sky-400">Verified ✓</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Part A & Part B Encrypted Package</div>
                        <div className="text-[10px] text-slate-400">Digitally signed by ICICI Bank Authorized Signatory</div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]">
                        Download Signed PDF
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveModalPrototype(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
