import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  CheckSquare,
  Square,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import type {
  Chapter3State,
  Chapter3DecisionKey,
  Chapter3ActionKey,
} from '../../types/chapter3';
import {
  CHAPTER3_DECISION_OPTIONS,
  CHAPTER3_VALIDATION_ACTIONS,
  PROTOTYPE_DATA_MISMATCHES,
} from '../../data/chapter3Data';
import { sound } from '../onboarding/SoundEngine';

interface DataIntegrityTriageAppProps {
  chapter3State: Chapter3State;
  onSelectDecision: (key: Chapter3DecisionKey) => void;
  onToggleAction: (key: Chapter3ActionKey) => void;
  onSubmitPlan: () => void;
  onOpenScorecard: () => void;
}

export const DataIntegrityTriageApp: React.FC<DataIntegrityTriageAppProps> = ({
  chapter3State,
  onSelectDecision,
  onToggleAction,
  onSubmitPlan,
  onOpenScorecard,
}) => {
  const [activeTab, setActiveTab] = useState<'triage' | 'inspector'>('triage');

  const selectedDecisionConfig = CHAPTER3_DECISION_OPTIONS.find(
    (opt) => opt.key === chapter3State.decision
  );

  const isActionSelected = (key: Chapter3ActionKey) =>
    chapter3State.selectedActions.includes(key);

  const handleDecisionClick = (key: Chapter3DecisionKey) => {
    sound.playClick();
    onSelectDecision(key);
  };

  const handleActionToggle = (key: Chapter3ActionKey) => {
    if (chapter3State.planSubmitted) return;
    sound.playClick();
    onToggleAction(key);
  };

  const handlePlanSubmit = () => {
    if (chapter3State.planSubmitted) return;
    sound.playSystemClearance();
    onSubmitPlan();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1d] text-slate-100 font-sans text-xs select-none">
      {/* ── TOP HEADER BAR ── */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white">Data Integrity Triage</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 ml-2 font-semibold">
              Project Amigo · Chapter 3
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'triage'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Triage & Decision Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Flagged Test Records ({PROTOTYPE_DATA_MISMATCHES.length})</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#0a0f1d]">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* CHAPTER CONTEXT BANNER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-indigo-950/80 border border-sky-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-sky-400 uppercase">
                  CHAPTER 3 · THE DATA INTEGRITY CRISIS
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  The prototype works. But can the team trust its data?
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl pt-1">
                  During an early validation pass of Project Amigo, Daniel reported two discrepancies:
                  misaligned employee IDs in appraisal cycle records and mismatched leave balances.
                  The defect is isolated to prototype test data. You must contain the risk responsibly
                  without stalling clean development.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end shrink-0 pl-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Scope</span>
                <span className="text-xs font-bold text-white">80,000 Employees</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1">TEST DATA ONLY</span>
              </div>
            </div>
          </div>

          {/* TAB 1: TRIAGE & DECISION PLAN */}
          {activeTab === 'triage' && (
            <div className="space-y-6">

              {/* ── SCENE 3.1: DANIEL'S REPORT & AARAV'S GUIDANCE ── */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Validation Thread · Project Amigo
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Today · 10:15 AM</span>
                </div>

                {/* Daniel's Message */}
                <div className="flex items-start space-x-3">
                  <img
                    src="/character/Daniel_Brooks/DanielDP.png"
                    alt="Daniel Brooks"
                    className="w-8 h-8 rounded-full object-cover border border-sky-500/40 shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">Daniel Brooks</span>
                      <span className="text-[10px] font-mono text-sky-400">Lead Developer · 10:15 AM</span>
                    </div>
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-[#161c33] border border-white/10 text-xs text-slate-200 mt-1 leading-relaxed">
                      “Hey, I found two inconsistencies during validation. A few appraisal records appear to be linked to the wrong employee IDs, and some leave balances don't match our source data. I've only seen this in the prototype test data so far. We should investigate before calling these modules ready.”
                    </div>
                  </div>
                </div>

                {/* Aarav's Response */}
                <div className="flex items-start space-x-3">
                  <img
                    src="/character/AaravDP.png"
                    alt="Aarav Kapoor"
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/40 shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">Aarav Kapoor</span>
                      <span className="text-[10px] font-mono text-amber-400">Project Manager · 10:16 AM</span>
                    </div>
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-[#1a233b] border border-amber-500/20 text-xs text-slate-200 mt-1 leading-relaxed">
                      “Good catch. We have a delivery deadline to protect, but we can't sign off on data we haven't validated. How would you handle this?”
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SCENE 3.2: THE CRITICAL DECISION ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono text-[10px]">
                      1
                    </div>
                    <h2 className="text-sm font-bold text-white">
                      Scene 3.2 — What should the team do first?
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Select one approach</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {CHAPTER3_DECISION_OPTIONS.map((option) => {
                    const isSelected = chapter3State.decision === option.key;
                    return (
                      <motion.button
                        key={option.key}
                        whileHover={{ scale: 1.008 }}
                        whileTap={{ scale: 0.992 }}
                        onClick={() => handleDecisionClick(option.key)}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-sky-950/80 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  isSelected
                                    ? 'bg-sky-500 text-slate-950'
                                    : 'bg-white/10 text-slate-300'
                                }`}
                              >
                                {option.badge}
                              </span>
                              <span className="font-bold text-white text-xs">
                                {option.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed pl-1 pt-0.5">
                              “{option.description}”
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 mt-0.5 ${
                              isSelected
                                ? 'border-sky-400 bg-sky-500 text-slate-950'
                                : 'border-slate-700 bg-slate-950'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Aarav Contextual Feedback on Chosen Decision */}
                <AnimatePresence>
                  {selectedDecisionConfig && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start space-x-3"
                    >
                      <img
                        src="/character/AaravDP.png"
                        alt="Aarav"
                        className="w-7 h-7 rounded-full object-cover border border-amber-400/50 shrink-0 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-amber-300 text-[11px]">Aarav Kapoor</span>
                          <span className="text-[9px] font-mono text-slate-400">Response to {selectedDecisionConfig.badge}</span>
                        </div>
                        <p className="text-xs text-amber-100/90 mt-0.5 leading-relaxed italic">
                          “{selectedDecisionConfig.feedback}”
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── SCENE 3.3: BUILD THE DATA VALIDATION PLAN ── */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono text-[10px]">
                      2
                    </div>
                    <h2 className="text-sm font-bold text-white">
                      Scene 3.3 — Create the Data Validation Plan
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Choose immediate operational actions
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose the immediate actions needed to investigate the issue without blocking unaffected work.
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {CHAPTER3_VALIDATION_ACTIONS.map((action) => {
                    const checked = isActionSelected(action.key);
                    const disabled = chapter3State.planSubmitted;
                    return (
                      <div
                        key={action.key}
                        onClick={() => !disabled && handleActionToggle(action.key)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          checked
                            ? 'bg-sky-950/60 border-sky-500/70 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        } ${disabled ? 'opacity-85 cursor-default' : ''}`}
                      >
                        <div className="mt-0.5 text-sky-400">
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-sky-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>

                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">
                              {action.label}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                              {action.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Plan Submission / Confirmation Controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-400">
                    {chapter3State.selectedActions.length} of {CHAPTER3_VALIDATION_ACTIONS.length} actions selected
                  </div>

                  {!chapter3State.planSubmitted ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!chapter3State.decision}
                      onClick={handlePlanSubmit}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all ${
                        chapter3State.decision
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white cursor-pointer shadow-sky-600/30'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Plan</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Plan Confirmed</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onOpenScorecard}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-pointer"
                      >
                        <span>View Chapter 3 Scorecard</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Brief Feedback After Submission */}
                <AnimatePresence>
                  {chapter3State.planSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-start space-x-3 text-xs"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <span className="font-bold text-white">Validation Plan Recorded</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Your triage decision and operational validation plan have been locked into the project session record.
                          Review the final scorecard to see the impact across Schedule, Risk, Governance, and Efficiency.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* TAB 2: PROTOTYPE TEST RECORDS INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2.5 text-xs text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  These anomalies were detected during Daniel's early validation pass in the prototype staging environment.
                  Authoritative enterprise records at ICICI Bank remain intact. No production event has occurred.
                </p>
              </div>

              <div className="space-y-3">
                {PROTOTYPE_DATA_MISMATCHES.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                          {record.id}
                        </span>
                        <span className="font-bold text-white text-xs">{record.module}</span>
                        <span className="text-slate-400 text-xs">· {record.employeeName} ({record.employeeId})</span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {record.severity} Defect
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Field: <span className="font-mono text-slate-200">{record.field}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-red-500/20">
                        <div className="text-[10px] font-mono text-red-400 uppercase font-bold">
                          Prototype Test View (Flagged)
                        </div>
                        <div className="font-medium text-slate-200 mt-0.5">{record.prototypeValue}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                        <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                          Authoritative Source Record
                        </div>
                        <div className="font-medium text-slate-200 mt-0.5">{record.authoritativeSourceValue}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('triage')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <span>Return to Decision & Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
