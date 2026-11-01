import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, Eye, ShieldCheck, Mail,
  Send, ArrowRight, Award, Calendar, DollarSign, X, Sparkles
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
  const [selectedDesignChoice, setSelectedDesignChoice] = useState<'design_1' | 'design_2' | 'design_3'>('design_3');
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  const [modalImageTitle, setModalImageTitle] = useState<string | null>(null);
  const [activeModalPrototype, setActiveModalPrototype] = useState<PrototypePreviewItem | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<UiUxOption | null>(initialDecision);

  const handleSelectDesign = (id: 'design_1' | 'design_2' | 'design_3') => {
    setSelectedDesignChoice(id);
  };

  const handleApplyDecision = () => {
    if (!selectedDecision) return;
    onSelectOption(selectedDecision);
    if (selectedDecision === 'written-signoff') {
      onRequestSignoffEmail();
    }
  };

  const handleSendForApproval = () => {
    // When the user clicks "Send for Approval" from the UI options screen,
    // lock written-signoff decision and trigger the formal signoff email flow
    onSelectOption('written-signoff');
    onRequestSignoffEmail();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1d] text-slate-100 font-sans p-4 sm:p-6 text-xs select-none">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header matching user attachment */}
        <div className="flex items-start space-x-3.5 pb-2 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Review the UI Options
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono border ${
                approvalReceived
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {approvalReceived ? 'APPROVED · BASELINE v1' : 'Prototype review · Approval pending'}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-300 mt-1 leading-relaxed">
              You're reviewing three different design approaches for the Project Amigo HRMS application. Choose the one you think is best for the end users and send it for approval.
            </p>
          </div>
        </div>

        {/* 3 UI Design Options from user attachment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              id: 'design_1',
              number: 1,
              title: 'Modern & Frontend Focused',
              description:
                'A sleek, modern design with a clean interface and visually appealing layout. Looks amazing, but has limited access to key features and may be harder to navigate for complex tasks.',
              imageSrc: '/chapter3/design_option_1.png',
              isRecommended: false,
              marksNote: 'High aesthetics · Nested workflows (Lower efficiency score)',
            },
            {
              id: 'design_2',
              number: 2,
              title: 'Application Focused',
              description:
                "A traditional, feature-rich layout that includes everything you need. It's functional and easy to use, but looks outdated and lacks visual appeal.",
              imageSrc: '/chapter3/design_option_2.png',
              isRecommended: false,
              marksNote: 'High data density · Visual clutter (Moderate score)',
            },
            {
              id: 'design_3',
              number: 3,
              title: 'Balanced & Modern',
              description:
                'A clean, modern interface with a friendly design and all essential features easily accessible. Combines great looks with functionality, making it simple and efficient to use.',
              imageSrc: '/chapter3/design_option_3.png',
              isRecommended: true,
              marksNote: '★ Full Marks (+25 Score) · Optimal blend of aesthetics & usability',
            },
          ].map((design) => {
            const isSelected = selectedDesignChoice === design.id;
            return (
              <div
                key={design.id}
                onClick={() => handleSelectDesign(design.id as 'design_1' | 'design_2' | 'design_3')}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden cursor-pointer group bg-[#111624] relative ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.35)]'
                    : 'border-slate-800 hover:border-slate-600 hover:bg-[#13192b]'
                }`}
              >
                {/* Interactive Prototype Browser Frame with Vertical Scroll */}
                <div className="flex flex-col border-b border-white/10 bg-[#080c16] overflow-hidden">
                  {/* Browser Mockup Top Chrome Bar */}
                  <div className="px-3 py-2 bg-[#0c101d] border-b border-white/5 flex items-center justify-between select-none">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-slate-400 truncate max-w-[140px]">
                      amigo-hrms.internal/{design.id}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageSrc(design.imageSrc);
                        setModalImageTitle(design.title);
                      }}
                      className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Enlarge Prototype"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Scrollable Viewport with fit width */}
                  <div 
                    className="relative h-64 sm:h-72 w-full overflow-y-auto overflow-x-hidden bg-[#090d18] scroll-smooth group/viewport"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(99, 102, 241, 0.45) rgba(15, 23, 42, 0.5)',
                    }}
                  >
                    <img
                      src={design.imageSrc}
                      alt={design.title}
                      className="w-full h-auto block select-none"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        display: 'block',
                      }}
                      loading="eager"
                    />

                    {/* Floating Scroll Cue at bottom */}
                    <div className="sticky bottom-2 left-0 right-0 flex justify-center pointer-events-none opacity-80 group-hover/viewport:opacity-100 transition-opacity">
                      <span className="px-2.5 py-1 rounded-full bg-black/80 border border-white/20 text-[9px] font-mono font-medium text-slate-200 backdrop-blur-md shadow-lg flex items-center space-x-1">
                        <span>↕ Scroll to inspect</span>
                      </span>
                    </div>

                    {/* Marks badge for Option 3 */}
                    {design.isRecommended && (
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 shadow-lg pointer-events-none">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>Best Choice</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Description Footer */}
                <div className="p-4 sm:p-5 flex items-start space-x-3.5 border-t border-white/5 bg-[#0e1320] flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-md'
                        : 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                    }`}
                  >
                    {design.number}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {design.title}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/40">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-slate-300 leading-relaxed">
                      {design.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered Send for Approval Action Bar matching screenshot */}
        {!approvalReceived && !signoffSent && (
          <div className="pt-2 flex flex-col items-center justify-center space-y-3">
            <button
              onClick={handleSendForApproval}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/30 flex items-center space-x-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send for Approval</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Selected: <strong className="text-white">{selectedDesignChoice === 'design_1' ? 'Option 1 (Modern & Frontend Focused)' : selectedDesignChoice === 'design_2' ? 'Option 2 (Application Focused)' : 'Option 3 (Balanced & Modern — Optimal Choice)'}</strong>
            </span>
          </div>
        )}

        {/* Meeting Quote Beat */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            Live Walkthrough Feedback
          </div>
          <div className="text-slate-200 text-xs italic leading-relaxed">
            <strong className="text-white not-italic">Marcus (Teams meeting):</strong> “The design looks great. The one-click appraisal submission in Option 3 strikes the right balance for our 80,000 employees.”
          </div>
          <div className="text-slate-300 text-xs leading-relaxed">
            <strong className="text-white">Martha:</strong> “Great. Choose the design above and send it for approval so we can freeze Baseline v1.0 specifications before coding begins.”
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

        {/* High-Resolution Design Option Preview Modal */}
        {modalImageSrc && (
          <div
            className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={(e) => {
              e.stopPropagation();
              setModalImageSrc(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#111625] border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col relative"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-xs font-mono font-bold uppercase text-indigo-400 tracking-wide">
                    Prototype Inspection
                  </span>
                  <span className="text-white font-bold text-sm tracking-tight">· {modalImageTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageSrc(null);
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                  title="Close Preview (ESC or Click)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image Container with full-page scroll and ultra HD clarity */}
              <div 
                className="flex-1 min-h-0 bg-[#080b14] border border-white/10 rounded-2xl overflow-y-auto overflow-x-hidden p-4 flex justify-center"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(99, 102, 241, 0.5) rgba(15, 23, 42, 0.5)',
                }}
              >
                <div className="w-full max-w-xl mx-auto shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-[#0c101d]">
                  <img
                    src={modalImageSrc}
                    alt={modalImageTitle || 'Prototype Preview'}
                    className="w-full h-auto block select-none"
                    style={{
                      imageRendering: '-webkit-optimize-contrast',
                    }}
                  />
                </div>
              </div>

              {/* Modal Bottom Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10 shrink-0">
                <span className="text-[11px] text-slate-400">
                  Click 'Close Preview' or press anywhere outside the card to return to the options review.
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageSrc(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
