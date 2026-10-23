import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Terminal,
  Lock,
  ExternalLink,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import type {
  Chapter3State,
  Chapter3BlockerChoice,
  Chapter3ApproachChoice,
  Chapter3ActionId,
} from '../../types/chapter3';
import {
  INTEGRATION_STATUS_EVIDENCE,
  MARCUS_ARCHITECTURE_REQUIREMENT,
  PROJECT_CONSTRAINTS,
  TASK1_BLOCKER_OPTIONS,
  TASK2_APPROACH_OPTIONS,
  TASK3_ACTION_CARDS,
  computeChapter3Score,
} from '../../data/chapter3Data';
import { sound } from '../onboarding/SoundEngine';

interface IntegrationPortalAppProps {
  chapter3State: Chapter3State;
  onUpdateState: (updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)) => void;
  onReturnToMeeting: () => void;
  onSubmitCompleteTriage: () => void;
}

export const IntegrationPortalApp: React.FC<IntegrationPortalAppProps> = ({
  chapter3State,
  onUpdateState,
  onReturnToMeeting,
  onSubmitCompleteTriage,
}) => {
  const [activeTab, setActiveTab] = useState<'triage' | 'evidence'>('triage');
  const [selectedBlocker, setSelectedBlocker] = useState<Chapter3BlockerChoice | null>(
    chapter3State.task1Selected
  );
  const [selectedApproach, setSelectedApproach] = useState<Chapter3ApproachChoice | null>(
    chapter3State.task2Selected
  );
  const [actionOrder, setActionOrder] = useState<Chapter3ActionId[]>(
    chapter3State.task3Order || [
      'action_confirm_interface',
      'action_verify_auth',
      'action_prepare_mock_tests',
      'action_validate_integrate',
    ]
  );
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [showRiskyWarning, setShowRiskyWarning] = useState<boolean>(false);
  const [pendingRiskyChoice, setPendingRiskyChoice] = useState<Chapter3ApproachChoice | null>(null);

  // ── TASK 1: BLOCKER SUBMISSION ──
  const handleSelectBlocker = (choice: Chapter3BlockerChoice) => {
    if (chapter3State.task1Submitted) return;
    sound.playClick();
    setSelectedBlocker(choice);
  };

  const handleSubmitTask1 = () => {
    if (!selectedBlocker || chapter3State.task1Submitted) return;
    sound.playClick();
    const config = TASK1_BLOCKER_OPTIONS.find((b) => b.id === selectedBlocker);
    onUpdateState({
      task1Selected: selectedBlocker,
      task1Submitted: true,
      task1Feedback: config?.explanation || null,
      currentTriageTask: 2,
    });
  };

  // ── TASK 2: APPROACH SELECTION ──
  const handleSelectApproach = (choice: Chapter3ApproachChoice) => {
    if (chapter3State.task2Submitted) return;
    sound.playClick();
    if (choice === 'direct_database' || choice === 'custom_converter') {
      setPendingRiskyChoice(choice);
      setShowRiskyWarning(true);
    } else {
      setSelectedApproach(choice);
      onUpdateState({
        task2Selected: choice,
        task2Submitted: true,
        currentTriageTask: 3,
      });
    }
  };

  const handleConfirmRiskyApproach = () => {
    if (!pendingRiskyChoice) return;
    sound.playClick();
    setSelectedApproach(pendingRiskyChoice);
    setShowRiskyWarning(false);
    onUpdateState({
      task2Selected: pendingRiskyChoice,
      task2Submitted: true,
      task2WarningShown: true,
      currentTriageTask: 3,
    });
    setPendingRiskyChoice(null);
  };

  const handleReconsiderApproach = () => {
    sound.playClick();
    setShowRiskyWarning(false);
    setPendingRiskyChoice(null);
    setSelectedApproach('approved_gateway');
    onUpdateState({
      task2Selected: 'approved_gateway',
      task2Submitted: true,
      task2Recovered: true,
      currentTriageTask: 3,
    });
  };

  // ── TASK 3: REORDERING ACTIONS ──
  const moveAction = (index: number, direction: 'up' | 'down') => {
    if (chapter3State.task3Submitted) return;
    sound.playClick();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= actionOrder.length) return;

    const newOrder = [...actionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setActionOrder(newOrder);
    onUpdateState({ task3Order: newOrder });
  };

  const handleResetOrder = () => {
    if (chapter3State.task3Submitted) return;
    sound.playClick();
    const defaultOrder: Chapter3ActionId[] = [
      'action_confirm_interface',
      'action_verify_auth',
      'action_prepare_mock_tests',
      'action_validate_integrate',
    ];
    setActionOrder(defaultOrder);
    onUpdateState({ task3Order: defaultOrder });
  };

  const handleDragStart = (index: number) => {
    if (chapter3State.task3Submitted) return;
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index || chapter3State.task3Submitted) return;

    const newOrder = [...actionOrder];
    const [dragged] = newOrder.splice(draggedItemIndex, 1);
    newOrder.splice(index, 0, dragged);
    setDraggedItemIndex(index);
    setActionOrder(newOrder);
    onUpdateState({ task3Order: newOrder });
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  // ── SUBMIT COMPLETE TRIAGE PLAN ──
  const handleSubmitPlan = () => {
    if (chapter3State.task3Submitted) return;
    sound.playSystemClearance();

    const updatedState: Chapter3State = {
      ...chapter3State,
      task1Selected: selectedBlocker,
      task1Submitted: true,
      task2Selected: selectedApproach,
      task2Submitted: true,
      task3Order: actionOrder,
      task3Submitted: true,
      meetingStatus: 'reviewing_plan',
    };

    // Deterministic client scoring sync
    const computedScore = computeChapter3Score(updatedState);
    updatedState.scorecard = computedScore;

    onUpdateState(updatedState);

    // Call backend API endpoint to persist and evaluate asynchronously
    const sessionId = localStorage.getItem('brained_session_id') || 'local_session';
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    fetch(`${apiBase}/api/game/chapter3/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        state: {
          escalationChoice: updatedState.escalationChoice,
          escalationRecovered: updatedState.escalationRecovered,
          task1Selected: updatedState.task1Selected,
          task2Selected: updatedState.task2Selected,
          task2Recovered: updatedState.task2Recovered,
          task3Order: updatedState.task3Order,
        },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.scorecard) {
          onUpdateState({
            scorecard: {
              ...data.scorecard,
              shown: true,
            },
          });
        }
      })
      .catch((err) => {
        console.warn('Backend evaluation fallback to local computation:', err);
      });

    onSubmitCompleteTriage();
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0b0e17] text-slate-100 font-sans text-xs select-none overflow-hidden relative">
      {/* ── TOP PORTAL HEADER ── */}
      <div className="h-12 bg-slate-900/90 border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white">INTEGRATION TRIAGE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                PROJECT AMIGO | INTEGRATION BLOCKED
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Diagnose the blocker. Select the approach. Set the order of action.
            </div>
          </div>
        </div>

        {/* Tab & Return to Meeting Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('triage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'triage'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Assignment (Tasks 1–3)
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Evidence & Rules
            </button>
          </div>

          <button
            onClick={onReturnToMeeting}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
          >
            <span>Teams Meeting</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── TAB 1: TRIAGE ASSIGNMENT (TASKS 1, 2, 3) ── */}
        {activeTab === 'triage' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* ── TASK 1: IDENTIFY THE BLOCKER ── */}
            <div className="bg-[#0f1422] rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
                    TASK 1 OF 3 · ROOT CAUSE DIAGNOSIS
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    What is the primary reason the Appraisal and Attendance integrations are failing?
                  </h3>
                </div>
                {chapter3State.task1Submitted && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Submitted</span>
                  </span>
                )}
              </div>

              {/* 4 Selectable Answer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TASK1_BLOCKER_OPTIONS.map((opt) => {
                  const isSelected = selectedBlocker === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectBlocker(opt.id)}
                      disabled={chapter3State.task1Submitted}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer disabled:cursor-default ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-500/40'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-md bg-white/10 font-mono font-bold text-sky-400 text-xs flex items-center justify-center">
                          {opt.badge}
                        </span>
                        <span className="font-bold text-white text-sm sm:text-[15px]">{opt.title}</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed italic">
                        "{opt.quote}"
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Task 1 Action & Feedback */}
              {!chapter3State.task1Submitted ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmitTask1}
                    disabled={!selectedBlocker}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/30 flex items-center space-x-2 cursor-pointer transition-all"
                  >
                    <span>Submit Diagnosis</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`p-3.5 rounded-xl border text-xs sm:text-[13px] leading-relaxed ${
                    selectedBlocker === 'protocol_mismatch'
                      ? 'bg-emerald-950/35 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/35 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="font-bold uppercase tracking-wider text-xs mb-1">
                    {selectedBlocker === 'protocol_mismatch' ? 'DIAGNOSIS CONFIRMED' : 'DIAGNOSIS FEEDBACK'}
                  </div>
                  <p>{chapter3State.task1Feedback}</p>
                </div>
              )}
            </div>

            {/* ── TASK 2: CHOOSE THE INTEGRATION APPROACH ── */}
            <div
              className={`bg-[#0f1422] rounded-2xl border p-5 space-y-4 shadow-xl transition-all ${
                !chapter3State.task1Submitted ? 'opacity-50 pointer-events-none border-white/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-xs font-mono uppercase text-sky-400 font-bold tracking-wider">
                    TASK 2 OF 3 · ARCHITECTURE STRATEGY
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    Select the safest, approved integration approach for Project Amigo
                  </h3>
                </div>
                {chapter3State.task2Submitted && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approach Selected</span>
                  </span>
                )}
              </div>

              {/* 3 Solution Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {TASK2_APPROACH_OPTIONS.map((opt) => {
                  const isSelected = selectedApproach === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectApproach(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-500/40'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-sky-400">{opt.badge}</span>
                          {opt.isRecommended && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Approved Standard
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm sm:text-[15px] leading-snug">{opt.title}</h4>
                        <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal">{opt.description}</p>
                      </div>

                      <div className="space-y-2 text-xs border-t border-white/5 pt-2.5">
                        <div>
                          <span className="text-emerald-400 font-bold">Benefits:</span>
                          <ul className="list-disc list-inside text-slate-200 space-y-0.5 mt-0.5">
                            {opt.benefits.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-rose-400 font-bold">Risks:</span>
                          <ul className="list-disc list-inside text-slate-300 space-y-0.5 mt-0.5">
                            {opt.risks.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        disabled={chapter3State.task2Submitted}
                        className={`w-full py-2 rounded-lg text-xs sm:text-[13px] font-bold transition-all ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-white/10 hover:bg-white/15 text-slate-200'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Approach'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── TASK 3: PUT ACTIONS IN THE RIGHT ORDER ── */}
            <div
              className={`bg-[#0f1422] rounded-2xl border p-5 space-y-4 shadow-xl transition-all ${
                !chapter3State.task2Submitted ? 'opacity-50 pointer-events-none border-white/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
                    TASK 3 OF 3 · DRAG & DROP ACTION PRIORITIZATION
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    Arrange the actions in the order that best unblocks Project Amigo safely
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tip: Drag cards into place or use the up/down controls. Notice which dependencies can run in parallel.
                  </p>
                </div>

                <button
                  onClick={handleResetOrder}
                  disabled={chapter3State.task3Submitted}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Order</span>
                </button>
              </div>

              {/* Draggable/Orderable Action Cards */}
              <div className="space-y-3">
                {actionOrder.map((actionId, index) => {
                  const card = TASK3_ACTION_CARDS[actionId];
                  return (
                    <div
                      key={card.id}
                      draggable={!chapter3State.task3Submitted}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 rounded-xl border bg-slate-900/90 transition-all flex items-center justify-between gap-3.5 ${
                        draggedItemIndex === index
                          ? 'border-sky-400 ring-2 ring-sky-500/50 bg-sky-950/40'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Number Badge */}
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-mono font-bold text-sky-300 text-sm shrink-0">
                          {index + 1}
                        </div>

                        {/* Drag Handle */}
                        {!chapter3State.task3Submitted && (
                          <div className="cursor-grab text-slate-500 hover:text-slate-300 shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        )}

                        {/* Action Details */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-sky-400">{card.code}</span>
                            <span className="text-white font-bold text-sm sm:text-[15px] truncate">{card.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                              {card.category}
                            </span>
                          </div>
                          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal">{card.description}</p>
                        </div>
                      </div>

                      {/* Accessible Up/Down Buttons */}
                      {!chapter3State.task3Submitted && (
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => moveAction(index, 'up')}
                            disabled={index === 0}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveAction(index, 'down')}
                            disabled={index === actionOrder.length - 1}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Complete Plan Button */}
              {!chapter3State.task3Submitted ? (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleSubmitPlan}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/30 flex items-center space-x-2 cursor-pointer transition-all"
                  >
                    <span>SUBMIT PLAN & RETURN TO MEETING</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold text-xs">Plan Submitted to Engineering & Steering Committee</span>
                  </div>
                  <button
                    onClick={onReturnToMeeting}
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Return to Teams Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: EVIDENCE & CONSTRAINTS ── */}
        {activeTab === 'evidence' && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Evidence 1: Integration Status Table */}
            <div className="bg-[#0f1422] rounded-2xl border border-white/10 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-sky-400 font-bold tracking-wider">
                    EVIDENCE 1 · LIVE SYSTEM STATUS
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">Core Banking Service Integration Matrix</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Updated: 09:41 AM</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono text-xs uppercase">
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Protocol / Expected</th>
                      <th className="py-3 px-3">Current Status</th>
                      <th className="py-3 px-3">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {INTEGRATION_STATUS_EVIDENCE.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{item.service}</td>
                        <td className="py-3 px-3 font-mono text-slate-300">{item.protocol}</td>
                        <td className="py-3 px-3 text-slate-200">{item.currentStatus}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              item.state === 'blocked'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {item.state.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evidence 2: Architecture Requirement (Marcus — CTO) */}
            <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 rounded-2xl border border-sky-500/40 p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-400/50 shrink-0">
                  <img src="/character/marcus_reed/MarcusDP.png" alt="Marcus" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-sky-400 font-bold tracking-wider">
                    EVIDENCE 2 · ENTERPRISE ARCHITECTURE MANDATE
                  </span>
                  <div className="font-bold text-white text-sm sm:text-base">{MARCUS_ARCHITECTURE_REQUIREMENT.author}</div>
                  <div className="text-xs text-slate-300 font-mono">{MARCUS_ARCHITECTURE_REQUIREMENT.role}</div>
                </div>
              </div>

              <blockquote className="text-sm sm:text-[14.5px] text-slate-100 leading-relaxed italic border-l-4 border-sky-500 pl-4 py-1 font-normal">
                "{MARCUS_ARCHITECTURE_REQUIREMENT.statement}"
              </blockquote>
            </div>

            {/* Evidence 3: Project Constraints */}
            <div className="bg-[#0f1422] rounded-2xl border border-white/10 p-5 space-y-3.5 shadow-xl">
              <span className="text-xs font-mono uppercase text-sky-400 font-bold tracking-wider">
                EVIDENCE 3 · PROJECT CONSTRAINTS
              </span>
              <h3 className="text-base font-bold text-white">Project Amigo Delivery Parameters</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_CONSTRAINTS.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xs font-mono uppercase text-slate-400 font-semibold">{c.label}</div>
                    <div className="font-bold text-white text-xs sm:text-[13.5px]">{c.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RECONSIDERATION WARNING MODAL (FOR OPTION A OR B IN TASK 2) ── */}
      {showRiskyWarning && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-[#0e1320] border border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-white text-base">Risky Integration Approach Warning</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {pendingRiskyChoice === 'direct_database'
                ? 'Direct database access bypasses the bank ESB boundary and directly violates ICICI Bank security compliance. Marcus will reject this during architectural review.'
                : 'Building a custom SOAP-to-JSON converter without Bank IT schema signoff creates severe rework risk if Bank IT requires a different contract.'}
            </p>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={handleConfirmRiskyApproach}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Risky Path
              </button>
              <button
                onClick={handleReconsiderApproach}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/30 flex items-center space-x-1 cursor-pointer"
              >
                <span>Switch to Approved Gateway (Recommended)</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
