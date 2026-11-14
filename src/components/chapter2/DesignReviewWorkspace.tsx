import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, Eye, ShieldCheck, Mail,
  Send, ArrowRight, Award, Calendar, DollarSign, X, Sparkles,
  Maximize2, ZoomIn, Layers, Check
} from 'lucide-react';
import type { UiUxOption, PrototypePreviewItem } from '../../types/chapter2';
import { CHAPTER2_PROTOTYPES } from '../../data/chapter2Data';
import { sound } from '../onboarding/SoundEngine';

interface DesignReviewWorkspaceProps {
  initialDecision: UiUxOption | null;
  signoffSent: boolean;
  approvalReceived: boolean;
  approvedVersions: string[];
  onSelectOption: (opt: UiUxOption) => void;
  onRequestSignoffEmail: () => void;
  onProceedToSprintReadiness: () => void;
}

interface DesignOptionItem {
  id: 'design_1' | 'design_2' | 'design_3';
  number: number;
  title: string;
  tagline: string;
  description: string;
  imageSrc: string;
  keyStrengths: string[];
  tradeoffs: string[];
}

const DESIGN_OPTIONS: DesignOptionItem[] = [
  {
    id: 'design_1',
    number: 1,
    title: 'Modern & Frontend Focused',
    tagline: 'Dark aesthetic · High visual polish · Compact actions',
    description:
      'A sleek, modern design with a high-contrast dark theme and visual hierarchy. Highlights daily greeting and quick glance cards, but groups operational tools into sub-menus.',
    imageSrc: '/chapter3/design_option_1.png',
    keyStrengths: ['Modern visual engagement', 'Focus on personal status', 'Minimalist dashboard layout'],
    tradeoffs: ['Requires extra clicks for enterprise approval flows', 'Lower information density for power users'],
  },
  {
    id: 'design_2',
    number: 2,
    title: 'Application Focused',
    tagline: 'High data density · Enterprise grid · Complete visibility',
    description:
      'A traditional, feature-rich layout presenting comprehensive module statuses, sprint countdowns, and active team counts directly on the primary dashboard screen.',
    imageSrc: '/chapter3/design_option_2.png',
    keyStrengths: ['Immediate visibility of all 12 modules', 'Dense information layout', 'Standard ERP familiarity'],
    tradeoffs: ['Higher cognitive load on first load', 'Conventional visual styling with limited white space'],
  },
  {
    id: 'design_3',
    number: 3,
    title: 'Balanced & Modern',
    tagline: 'Card-based hierarchy · Quick actions · Intuitive navigation',
    description:
      'A clean, modern interface pairing prominent module status cards with direct one-click actions for appraisals, attendance, leave approvals, and tax certificates.',
    imageSrc: '/chapter3/design_option_3.png',
    keyStrengths: ['Direct access to high-frequency employee actions', 'Clean visual hierarchy', 'Seamless navigation between modules'],
    tradeoffs: ['Balances broad overview with depth, requiring tabbed drill-down for deep historical reports'],
  },
];

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
  const [viewMode, setViewMode] = useState<'fit' | 'scroll'>('fit');
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  const [modalImageTitle, setModalImageTitle] = useState<string | null>(null);
  const [activeModalPrototype, setActiveModalPrototype] = useState<PrototypePreviewItem | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<UiUxOption | null>(initialDecision);

  const handleSelectDesign = (id: 'design_1' | 'design_2' | 'design_3') => {
    sound.playClick();
    setSelectedDesignChoice(id);
  };

  const handleApplyDecision = () => {
    if (!selectedDecision) return;
    sound.playSystemClearance();
    onSelectOption(selectedDecision);
    if (selectedDecision === 'written-signoff') {
      onRequestSignoffEmail();
    }
  };

  const handleSendForApproval = () => {
    sound.playSystemClearance();
    onSelectOption('written-signoff');
    onRequestSignoffEmail();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1d] text-slate-100 font-sans p-4 sm:p-6 text-xs select-none">
      <div className="max-w-7xl w-full mx-auto space-y-6">

        {/* ── TOP HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5 shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Review the UI Options
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                    approvalReceived
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {approvalReceived ? 'APPROVED · BASELINE v1' : 'Prototype review · Approval pending'}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-300 mt-1 leading-relaxed max-w-3xl">
                You're reviewing three different design approaches for the Project Amigo HRMS application. Examine the full page layouts, compare their information architecture, and send your chosen baseline for formal approval.
              </p>
            </div>
          </div>

          {/* View Mode Switcher Pill */}
          <div className="flex items-center self-start md:self-center bg-[#070b14] border border-white/10 rounded-xl p-1 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setViewMode('fit');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'fit'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Fit Entire Page</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setViewMode('scroll');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'scroll'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Scrollable Detail</span>
            </button>
          </div>
        </div>

        {/* ── 3 UI DESIGN OPTION CARDS (SPACIOUS 3-COLUMN GRID) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {DESIGN_OPTIONS.map((design) => {
            const isSelected = selectedDesignChoice === design.id;
            return (
              <div
                key={design.id}
                onClick={() => handleSelectDesign(design.id)}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden cursor-pointer group bg-[#0e1424] relative shadow-lg ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-[0_0_35px_rgba(99,102,241,0.3)] bg-[#11182c]'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-[#10172a]'
                }`}
              >
                {/* Browser Frame Chrome */}
                <div className="flex flex-col border-b border-white/10 bg-[#080c16]">
                  <div className="px-3.5 py-2.5 bg-[#0c101d] border-b border-white/5 flex items-center justify-between select-none">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="px-3 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
                      amigo-hrms.internal/{design.id}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        setModalImageSrc(design.imageSrc);
                        setModalImageTitle(design.title);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer text-[10px] font-mono"
                      title="Enlarge and inspect prototype"
                    >
                      <Eye className="w-3 h-3 text-indigo-400" />
                      <span className="hidden sm:inline">Enlarge</span>
                    </button>
                  </div>

                  {/* Prototype Image Viewport */}
                  <div
                    className={`relative w-full bg-[#080d1a] transition-all flex items-center justify-center ${
                      viewMode === 'fit'
                        ? 'p-3 aspect-[852/1250] max-h-[500px] overflow-hidden'
                        : 'h-[460px] overflow-y-auto overflow-x-hidden scroll-smooth'
                    }`}
                    style={
                      viewMode === 'scroll'
                        ? {
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(99, 102, 241, 0.45) rgba(15, 23, 42, 0.5)',
                          }
                        : undefined
                    }
                  >
                    <img
                      src={design.imageSrc}
                      alt={design.title}
                      className={`block select-none transition-all duration-300 ${
                        viewMode === 'fit'
                          ? 'w-full h-full object-contain object-top rounded-xl shadow-2xl border border-white/5'
                          : 'w-full h-auto'
                      }`}
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                      }}
                      loading="eager"
                    />

                    {/* Subtle hover overlay to inspect full size */}
                    <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-400/50 text-indigo-200 text-xs font-mono font-bold shadow-xl backdrop-blur-md flex items-center space-x-1.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Click card to select · Eye to zoom</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Description & Meta Footer */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 border-t border-white/5 bg-[#0b101e] space-y-3">
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-colors mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-md'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {design.number}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {design.title}
                        </h3>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/40 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-indigo-400" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 leading-tight">
                        {design.tagline}
                      </p>
                      <p className="text-[11.5px] text-slate-300 leading-relaxed pt-1">
                        {design.description}
                      </p>
                    </div>
                  </div>

                  {/* Key Strengths Pills */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
                    {design.keyStrengths.map((strength, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-slate-300 font-mono"
                      >
                        ✓ {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SEND FOR APPROVAL ACTION BAR ── */}
        {!approvalReceived && !signoffSent && (
          <div className="pt-2 pb-2 flex flex-col items-center justify-center space-y-2.5">
            <button
              onClick={handleSendForApproval}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/30 flex items-center space-x-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-indigo-400/40"
            >
              <Send className="w-4 h-4" />
              <span>Send Selected Design for Approval</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Currently Selected:{' '}
              <strong className="text-white">
                {selectedDesignChoice === 'design_1'
                  ? 'Option 1 (Modern & Frontend Focused)'
                  : selectedDesignChoice === 'design_2'
                  ? 'Option 2 (Application Focused)'
                  : 'Option 3 (Balanced & Modern)'}
              </strong>
            </span>
          </div>
        )}

        {/* ── WALKTHROUGH FEEDBACK ── */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            Stakeholder Design Alignment Beat
          </div>
          <div className="text-slate-200 text-xs italic leading-relaxed">
            <strong className="text-white not-italic">Marcus Reed (CTO):</strong> “Each approach demonstrates distinct tradeoffs between information density, visual polish, and ease of employee adoption. Make sure the baseline we sign off supports our 80,000 branch officers without operational friction.”
          </div>
          <div className="text-slate-300 text-xs leading-relaxed">
            <strong className="text-white">Martha:</strong> “Once your design option is chosen, select your approval strategy below to lock in the baseline specifications before the engineering sprint begins.”
          </div>
        </div>

        {/* ── APPROVAL DECISION SECTION (NEUTRAL COMPARISON) ── */}
        {!approvalReceived ? (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Select Approval Strategy
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Decide whether to accept verbal meeting consensus or execute a formal written baseline signoff.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/70">
                Governance Decision
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A */}
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedDecision('verbal');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDecision === 'verbal'
                    ? 'bg-indigo-950/30 border-indigo-400 shadow-xl ring-1 ring-indigo-400/50'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/80">
                        OPTION A
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Verbal Consensus</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedDecision === 'verbal'
                          ? 'border-indigo-400 bg-indigo-500/20'
                          : 'border-slate-600'
                      }`}
                    >
                      {selectedDecision === 'verbal' && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-xs mb-1">
                    Proceed on Verbal Meeting Approval
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                    Treat the verbal feedback during the meeting as sufficient approval and begin development breakdown immediately without waiting for formal documentation.
                  </p>

                  <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>Zero turnaround delay before development starts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>No binding audit trail if requirements are contested later</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option B */}
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedDecision('written-signoff');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDecision === 'written-signoff'
                    ? 'bg-indigo-950/30 border-indigo-400 shadow-xl ring-1 ring-indigo-400/50'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/80">
                        OPTION B
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Formal Written Signoff</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedDecision === 'written-signoff'
                          ? 'border-indigo-400 bg-indigo-500/20'
                          : 'border-slate-600'
                      }`}
                    >
                      {selectedDecision === 'written-signoff' && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-xs mb-1">
                    Secure Written Signoff &amp; Lock Baseline
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                    Transmit high-resolution design exports to Marcus, secure formal written confirmation via email, and freeze the Baseline v1.0 specifications.
                  </p>

                  <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span>Freezes binding scope and specifications before coding begins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span>Prevents rework, mid-sprint scope drift, and conflicting feedback</span>
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
                  <strong className="text-white">Martha:</strong> “Before I mark the designs as approved, where should I record the approved versions? I can see the meeting notes, but I don't have a written signoff to attach to the project governance record.”
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={onRequestSignoffEmail}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
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
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
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
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <span>Proceed to Sprint 1 Readiness Checks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── HIGH-RESOLUTION PROTOTYPE FULLSCREEN MODAL ── */}
      <AnimatePresence>
        {modalImageSrc && (
          <div
            className="fixed inset-0 z-[700] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
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
              className="w-full max-w-5xl bg-[#0f1424] border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col relative"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-xs font-mono font-bold uppercase text-indigo-400 tracking-wide">
                    Full Resolution Prototype
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

              {/* Full Image Container */}
              <div
                className="flex-1 min-h-0 bg-[#070b14] border border-white/10 rounded-2xl overflow-y-auto overflow-x-hidden p-4 flex justify-center"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(99, 102, 241, 0.5) rgba(15, 23, 42, 0.5)',
                }}
              >
                <div className="w-full max-w-2xl mx-auto shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-[#0c101d]">
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
                  Scroll vertically to inspect the full page layout and all components.
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const match = DESIGN_OPTIONS.find((d) => d.imageSrc === modalImageSrc);
                      if (match) {
                        handleSelectDesign(match.id);
                      }
                      setModalImageSrc(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Select this Design</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalImageSrc(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
