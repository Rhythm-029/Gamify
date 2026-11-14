import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  GitBranch,
  ShieldAlert,
  GraduationCap,
  Contact2,
  Bot,
  ArrowRight,
  Server,
  Check,
  ShieldCheck,
  Zap,
  Activity,
  ArrowLeftRight,
} from 'lucide-react';
import type {
  Chapter12State,
  EvolutionControlCenterTab,
  UpgradeCategory,
  FeatureFlagRollout,
} from '../../types/chapter12';
import {
  UPGRADE_MODULES,
  FEATURE_FLAG_DEFINITIONS,
  ROLLOUT_PERCENTAGES,
  FRAMEWORK_UPGRADE_NOTE,
  DEPLOYMENT_ACTIONS,
  CHAPTER12_CHARACTERS,
} from '../../data/chapter12Data';
import { sound } from '../onboarding/SoundEngine';

interface EvolutionControlCenterAppProps {
  chapter12State: Chapter12State;
  onUpdateState: (
    updater: Partial<Chapter12State> | ((prev: Chapter12State) => Chapter12State)
  ) => void;
  onReturnToMeeting: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

// ── MODULE ICON HELPER ──
function ModuleIcon({ moduleId, className }: { moduleId: string; className?: string }) {
  const cls = className ?? 'w-4 h-4';
  if (moduleId === 'lms') return <GraduationCap className={cls} />;
  if (moduleId === 'visiting_cards') return <Contact2 className={cls} />;
  if (moduleId === 'ai_chatbot') return <Bot className={cls} />;
  if (moduleId === 'framework_upgrade') return <ShieldCheck className={cls} />;
  return null;
}

// ── ENV BADGE COLOR HELPERS ──
function getRolloutBadgeStyle(value: FeatureFlagRollout) {
  if (value === 0) return 'bg-slate-700/80 text-slate-400 border border-slate-600';
  if (value === 5) return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  if (value === 25) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
  if (value === 50) return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
  return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
}
function getRolloutLabel(value: FeatureFlagRollout) {
  if (value === 0) return 'Disabled';
  if (value === 5) return 'Pilot';
  if (value === 25) return 'Limited';
  if (value === 50) return 'Expanded';
  return 'Full';
}

export const EvolutionControlCenterApp: React.FC<EvolutionControlCenterAppProps> = ({
  chapter12State,
  onUpdateState,
  onReturnToMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<EvolutionControlCenterTab>(
    chapter12State.selectedTab || 'upgrade_scope'
  );

  // ── STAGE 1: UPGRADE SCOPE STATE ──
  const [scopeAssignments, setScopeAssignments] = useState<Record<string, UpgradeCategory>>(
    chapter12State.scopeAssignments || {}
  );
  const [scopeCompleted, setScopeCompleted] = useState<boolean>(
    Boolean(chapter12State.scopeCompleted)
  );
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);

  // ── STAGE 2: FEATURE FLAGS & FRAMEWORK STATE ──
  const [featureFlags, setFeatureFlags] = useState<Record<string, FeatureFlagRollout>>({
    lms: chapter12State.featureFlags?.lms ?? 0,
    visiting_cards: chapter12State.featureFlags?.visiting_cards ?? 0,
    ai_chatbot: chapter12State.featureFlags?.ai_chatbot ?? 0,
  });
  const [frameworkConfigured, setFrameworkConfigured] = useState<boolean>(
    Boolean(chapter12State.frameworkConfigured)
  );
  const [isFrameworkModalOpen, setIsFrameworkModalOpen] = useState(false);
  const [strategyCompleted, setStrategyCompleted] = useState<boolean>(
    Boolean(chapter12State.releaseStrategyCompleted)
  );

  // ── STAGE 3: BLUE-GREEN DEPLOYMENT SIMULATOR STATE ──
  const [deploymentSlots, setDeploymentSlots] = useState<(string | null)[]>(
    chapter12State.deploymentSlots || [null, null, null, null]
  );
  const [draggedActionId, setDraggedActionId] = useState<string | null>(null);
  const [isSimulatingTests, setIsSimulatingTests] = useState(false);
  const [deploymentCompleted, setDeploymentCompleted] = useState<boolean>(
    Boolean(chapter12State.deploymentCompleted)
  );

  // Derive Blue-Green live state from slots
  const hasStep1 = deploymentSlots[0] === 'action_a';
  const hasStep2 = hasStep1 && deploymentSlots[1] === 'action_b';
  const hasStep3 = hasStep2 && deploymentSlots[2] === 'action_c';
  const hasStep4 = hasStep3 && deploymentSlots[3] === 'action_d';

  // Scramble available deployment actions pool so they are not presented sequentially
  const SCRAMBLED_ACTIONS = useMemo(
    () => [DEPLOYMENT_ACTIONS[1], DEPLOYMENT_ACTIONS[3], DEPLOYMENT_ACTIONS[0], DEPLOYMENT_ACTIONS[2]],
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // STAGE 1: DRAG & DROP HANDLERS (UPGRADE SCOPE)
  // ───────────────────────────────────────────────────────────────────────────
  const handleAssignModule = (moduleId: string, category: UpgradeCategory) => {
    sound.playClick();
    const mod = UPGRADE_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;

    const updated = { ...scopeAssignments, [moduleId]: category };
    sound.playSystemClearance();
    setScopeAssignments(updated);

    const allPlaced = Object.keys(updated).length === 4;
    const correctCount = UPGRADE_MODULES.filter(
      (m) => updated[m.id] === m.category
    ).length;
    const allCorrect = correctCount === 4;

    setScopeCompleted(allPlaced);
    onUpdateState({
      scopeAssignments: updated,
      scopeCompleted: allCorrect,
    });
  };

  const handleRemoveScopeAssignment = (moduleId: string) => {
    sound.playClick();
    const updated = { ...scopeAssignments };
    delete updated[moduleId];
    setScopeAssignments(updated);
    setScopeCompleted(false);
    onUpdateState({
      scopeAssignments: updated,
      scopeCompleted: false,
    });
  };

  const handleContinueToStrategy = () => {
    sound.playClick();
    const correctCount = UPGRADE_MODULES.filter(
      (m) => scopeAssignments[m.id] === m.category
    ).length;
    onUpdateState({
      scopeCompleted: correctCount === 4,
      selectedTab: 'release_strategy',
    });
    setActiveTab('release_strategy');
  };

  // ───────────────────────────────────────────────────────────────────────────
  // STAGE 2: FEATURE FLAGS HANDLERS
  // ───────────────────────────────────────────────────────────────────────────
  const handleSetRollout = (moduleId: string, value: FeatureFlagRollout) => {
    sound.playClick();
    const updated = { ...featureFlags, [moduleId]: value };
    setFeatureFlags(updated);

    if (frameworkConfigured) {
      setStrategyCompleted(true);
      onUpdateState({
        featureFlags: updated,
        frameworkConfigured: true,
        releaseStrategyCompleted: true,
      });
    } else {
      onUpdateState({
        featureFlags: updated,
      });
    }
  };

  const handleAcknowledgeFramework = () => {
    sound.playSystemClearance();
    setFrameworkConfigured(true);
    setIsFrameworkModalOpen(false);
    setStrategyCompleted(true);
    onUpdateState({
      featureFlags,
      frameworkConfigured: true,
      releaseStrategyCompleted: true,
    });
  };

  const handleContinueToDeployment = () => {
    sound.playClick();
    onUpdateState({
      featureFlags,
      frameworkConfigured: true,
      releaseStrategyCompleted: true,
      selectedTab: 'deployment_validation',
    });
    setActiveTab('deployment_validation');
  };

  // ───────────────────────────────────────────────────────────────────────────
  // STAGE 3: BLUE-GREEN DEPLOYMENT SIMULATOR HANDLERS
  // ───────────────────────────────────────────────────────────────────────────
  const handleAssignActionToSlot = (slotIndex: number, actionId: string) => {
    sound.playClick();
    const action = DEPLOYMENT_ACTIONS.find((a) => a.id === actionId);
    if (!action) return;

    // Place into slotIndex and remove from any previous slot if already placed
    const updatedSlots = deploymentSlots.map((id, idx) =>
      idx === slotIndex ? actionId : id === actionId ? null : id
    );
    setDeploymentSlots(updatedSlots);
    sound.playSystemClearance();

    const s1 = updatedSlots[0] === 'action_a';
    const s2 = s1 && updatedSlots[1] === 'action_b';
    const s3 = s2 && updatedSlots[2] === 'action_c';
    const s4 = s3 && updatedSlots[3] === 'action_d';

    const allSlotsFilled = updatedSlots.every((s) => s !== null);
    setDeploymentCompleted(allSlotsFilled);

    onUpdateState({
      deploymentSlots: updatedSlots,
      greenPrepared: s1,
      testsPassed: s2,
      releaseValidated: s3,
      trafficSwitchedToGreen: s4,
      deploymentCompleted: allSlotsFilled,
    });
  };

  const handleClearSlot = (slotIndex: number) => {
    sound.playClick();
    const updatedSlots = [...deploymentSlots];
    updatedSlots[slotIndex] = null;
    setDeploymentSlots(updatedSlots);
    setDeploymentCompleted(false);

    const s1 = updatedSlots[0] === 'action_a';
    const s2 = s1 && updatedSlots[1] === 'action_b';
    const s3 = s2 && updatedSlots[2] === 'action_c';

    onUpdateState({
      deploymentSlots: updatedSlots,
      greenPrepared: s1,
      testsPassed: s2,
      releaseValidated: s3,
      trafficSwitchedToGreen: false,
      deploymentCompleted: false,
    });
  };

  const handleFinishDeployment = () => {
    sound.playSystemClearance();
    const s1 = deploymentSlots[0] === 'action_a';
    const s2 = s1 && deploymentSlots[1] === 'action_b';
    const s3 = s2 && deploymentSlots[2] === 'action_c';
    const s4 = s3 && deploymentSlots[3] === 'action_d';

    onUpdateState({
      greenPrepared: s1,
      testsPassed: s2,
      releaseValidated: s3,
      trafficSwitchedToGreen: s4,
      deploymentCompleted: true,
      currentStage: 'steering_final_decision',
      timelineTimestamp: '30:42',
    });
    onReturnToMeeting();
  };

  const correctCategorizedCount = UPGRADE_MODULES.filter(
    (m) => scopeAssignments[m.id] === m.category
  ).length;

  // ── STEPPER STEPS CONFIG ──
  const isScopeDone = Object.keys(scopeAssignments).length === 4;
  const isStrategyDone = strategyCompleted || frameworkConfigured;
  const isDeploymentDone = deploymentCompleted;

  const steps = [
    { key: 'upgrade_scope' as EvolutionControlCenterTab, label: 'Upgrade Scope', done: isScopeDone, num: 1 },
    { key: 'release_strategy' as EvolutionControlCenterTab, label: 'Release Strategy', done: isStrategyDone, num: 2 },
    { key: 'deployment_validation' as EvolutionControlCenterTab, label: 'Deployment Validation', done: isDeploymentDone, num: 3 },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0f1e] text-slate-100 select-none overflow-hidden font-sans">

      {/* ══════════════════════════════════════════════════════════════════
          TOP HEADER + ENTERPRISE WIZARD STEPPER
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#0d1428] via-[#0f1835] to-[#0d1428] border-b border-indigo-500/20 px-5 py-3 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-900/40 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Evolution Control Center
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  v2.0.0 Candidate
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Phase 2 Release Management · ICICI Bank / Project Amigo
              </p>
            </div>
          </div>

          {/* Enterprise Wizard Stepper */}
          <div className="flex items-center gap-0 bg-[#060c1a] rounded-2xl border border-white/8 px-4 py-2.5 shadow-inner self-start lg:self-auto">
            {steps.map((step, i) => {
              const isActive = activeTab === step.key;
              const isLocked =
                (step.key === 'release_strategy' && !isScopeDone) ||
                (step.key === 'deployment_validation' && !isStrategyDone);
              return (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => {
                      if (!isLocked) {
                        setActiveTab(step.key);
                        onUpdateState({ selectedTab: step.key });
                      }
                    }}
                    disabled={isLocked}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-sky-600/90 shadow-md shadow-sky-900/60 text-white'
                        : isLocked
                        ? 'opacity-40 cursor-not-allowed text-slate-500'
                        : 'hover:bg-slate-800/60 cursor-pointer text-slate-300 hover:text-white'
                    }`}
                  >
                    {/* Circle indicator */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black text-[11px] border-2 transition-all ${
                        step.done
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-900'
                          : isActive
                          ? 'bg-sky-500 border-sky-300 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-400'
                      }`}
                    >
                      {step.done ? <Check className="w-3 h-3" /> : step.num}
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${
                        step.done
                          ? 'text-emerald-300'
                          : isActive
                          ? 'text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className="flex items-center px-1">
                      <div
                        className={`h-px w-6 transition-colors ${
                          steps[i].done ? 'bg-emerald-500/70' : 'bg-slate-700'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STAGE 1: UPGRADE SCOPE / CR-024
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'upgrade_scope' && (
        <div className="flex-1 flex flex-col px-5 py-3 overflow-y-auto min-h-0">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/8 gap-2 shrink-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white">CR-024 | Phase 2 Evolution</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35">
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                Steering Committee has requested reactivation of deferred Phase 2 modules along with a core framework security upgrade.
              </p>
            </div>
            <div className="text-xs font-mono font-bold shrink-0 flex items-center gap-2 bg-[#060c1a] border border-sky-500/25 px-3 py-1.5 rounded-xl">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-sky-400">{Object.keys(scopeAssignments).length} / 4</span>
              <span className="text-slate-500">categorized</span>
            </div>
          </div>

          {/* Main 2-column layout */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 min-h-0">
            {/* LEFT: Requirement cards */}
            <div className="flex flex-col bg-[#0d1428]/80 rounded-2xl border border-slate-700/50 p-3 min-h-0 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                    Available Components
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Drag a card or use assign buttons</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                  {UPGRADE_MODULES.length} items
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {UPGRADE_MODULES.map((mod) => {
                  const isAssigned = Boolean(scopeAssignments[mod.id]);
                  return (
                    <div
                      key={mod.id}
                      draggable={!isAssigned}
                      onDragStart={(e) => {
                        e.dataTransfer?.setData('text/plain', mod.id);
                        setDraggedModuleId(mod.id);
                      }}
                      className={`rounded-xl border transition-all ${
                        isAssigned
                          ? 'opacity-30 border-slate-800 bg-slate-900/50 pointer-events-none'
                          : 'bg-[#0d1428] border-slate-700/60 hover:border-indigo-400/50 cursor-grab active:cursor-grabbing shadow-sm'
                      }`}
                    >
                      <div className="px-3 py-2.5">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-indigo-600/15 border border-indigo-500/30 text-indigo-300">
                            <ModuleIcon moduleId={mod.id} className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <h4 className="text-[13px] font-bold text-white leading-tight">{mod.name}</h4>
                              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {mod.id === 'lms'
                                  ? 'Training & Cert'
                                  : mod.id === 'visiting_cards'
                                  ? 'Corporate Identity'
                                  : mod.id === 'ai_chatbot'
                                  ? 'Employee Support'
                                  : 'Core Runtime'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">{mod.description}</p>
                          </div>
                        </div>

                        {!isAssigned && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => handleAssignModule(mod.id, 'new_functionality')}
                              className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/40 transition-all cursor-pointer"
                            >
                              → New Functionality
                            </button>
                            <button
                              onClick={() => handleAssignModule(mod.id, 'core_platform_upgrade')}
                              className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/40 transition-all cursor-pointer"
                            >
                              → Core Platform Upgrade
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Two drop zones */}
            <div className="flex flex-col gap-3 min-h-0">
              {/* DROP ZONE 1: NEW FUNCTIONALITY */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const moduleId = e.dataTransfer?.getData('text/plain') || draggedModuleId;
                  if (moduleId) {
                    handleAssignModule(moduleId, 'new_functionality');
                    setDraggedModuleId(null);
                  }
                }}
                className="flex-[1.7] flex flex-col rounded-2xl border-2 border-dashed border-sky-500/40 hover:border-sky-400/70 bg-sky-950/10 hover:bg-sky-950/20 p-3 transition-all min-h-0"
              >
                <div className="flex items-center gap-2 mb-2 shrink-0">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-sky-400">
                    New Functionality
                  </h3>
                  <span className="ml-auto text-[10px] text-slate-500 italic">
                    {Object.values(scopeAssignments).filter((c) => c === 'new_functionality').length} placed
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                  {Object.entries(scopeAssignments)
                    .filter(([_, cat]) => cat === 'new_functionality')
                    .map(([modId]) => {
                      const mod = UPGRADE_MODULES.find((m) => m.id === modId);
                      if (!mod) return null;
                      return (
                        <div
                          key={modId}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer?.setData('text/plain', modId);
                            setDraggedModuleId(modId);
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-3 py-2 rounded-xl border border-indigo-500/30 bg-[#101935] text-slate-200 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing shadow-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ModuleIcon moduleId={modId} className="w-3.5 h-3.5 text-indigo-400 opacity-80 shrink-0" />
                              <span className="text-xs font-bold truncate">{mod.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveScopeAssignment(modId)}
                              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 cursor-pointer shrink-0 transition-colors"
                            >
                              ✕
                            </button>
                          </motion.div>
                        </div>
                      );
                    })}

                  {Object.values(scopeAssignments).filter((c) => c === 'new_functionality').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 italic py-6 gap-1.5">
                      <div className="flex gap-2 opacity-40 text-slate-400">
                        <GraduationCap className="w-4 h-4" />
                        <Contact2 className="w-4 h-4" />
                        <Bot className="w-4 h-4" />
                      </div>
                      <span>Assign employee-facing & business functionality modules here</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DROP ZONE 2: CORE PLATFORM UPGRADE */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const moduleId = e.dataTransfer?.getData('text/plain') || draggedModuleId;
                  if (moduleId) {
                    handleAssignModule(moduleId, 'core_platform_upgrade');
                    setDraggedModuleId(null);
                  }
                }}
                className="flex-1 flex flex-col rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400/70 bg-amber-950/10 hover:bg-amber-950/20 p-3 transition-all min-h-0"
              >
                <div className="flex items-center gap-2 mb-2 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">
                    Core Platform Upgrade
                  </h3>
                  <span className="ml-auto text-[10px] text-slate-500 italic">
                    {Object.values(scopeAssignments).filter((c) => c === 'core_platform_upgrade').length} placed
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                  {Object.entries(scopeAssignments)
                    .filter(([_, cat]) => cat === 'core_platform_upgrade')
                    .map(([modId]) => {
                      const mod = UPGRADE_MODULES.find((m) => m.id === modId);
                      if (!mod) return null;
                      return (
                        <div
                          key={modId}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer?.setData('text/plain', modId);
                            setDraggedModuleId(modId);
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-3 py-2 rounded-xl border border-indigo-500/30 bg-[#101935] text-slate-200 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing shadow-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ModuleIcon moduleId={modId} className="w-3.5 h-3.5 text-indigo-400 opacity-80 shrink-0" />
                              <span className="text-xs font-bold truncate">{mod.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveScopeAssignment(modId)}
                              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 cursor-pointer shrink-0 transition-colors"
                            >
                              ✕
                            </button>
                          </motion.div>
                        </div>
                      );
                    })}

                  {Object.values(scopeAssignments).filter((c) => c === 'core_platform_upgrade').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 italic py-4 gap-1.5">
                      <ShieldCheck className="w-4 h-4 opacity-40 text-slate-400" />
                      <span>Assign foundational infrastructure & architectural framework upgrades here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between shrink-0 gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">
                {Object.keys(scopeAssignments).length === 4
                  ? 'All 4 components categorized. Ready to proceed.'
                  : `Categorize all 4 components into the appropriate buckets (${Object.keys(scopeAssignments).length}/4).`}
              </span>
            </div>

            <button
              onClick={handleContinueToStrategy}
              disabled={Object.keys(scopeAssignments).length !== 4}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                Object.keys(scopeAssignments).length === 4
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Release Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STAGE 2: FEATURE FLAG RELEASE PLANNER
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'release_strategy' && (
        <div className="flex-1 flex flex-col px-5 py-3 overflow-y-auto min-h-0">
          {/* Header */}
          <div className="pb-2.5 border-b border-white/8 shrink-0 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-white leading-tight">Feature Flag Planner</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Control progressive feature exposure via release flags before full deployment.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Release Gate: Configuration Active
            </span>
          </div>

          {/* Character quote bar */}
          <div className="mt-2 px-3 py-2 rounded-xl bg-[#0d1428]/80 border border-indigo-500/25 grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0 text-[11px]">
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              <span className="font-black text-sky-400 shrink-0">DANIEL:</span>
              <p className="truncate italic">"We can deploy functionality without exposing it to everyone via feature flags."</p>
            </div>
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              <span className="font-black text-indigo-400 shrink-0">AARAV:</span>
              <p className="truncate italic">"I want a controlled rollout, not a single switch exposing everything to the bank."</p>
            </div>
          </div>

          {/* Feature Flag Rows */}
          <div className="mt-3 space-y-2.5 shrink-0">
            {FEATURE_FLAG_DEFINITIONS.map((def) => {
              const currentRollout = featureFlags[def.moduleId] ?? 0;
              return (
                <div
                  key={def.id}
                  className="rounded-2xl bg-[#0d1428]/90 border border-slate-700/50 hover:border-slate-600/70 transition-colors shadow-sm overflow-hidden"
                >
                  {/* Flag header row */}
                  <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sky-600/15 border border-sky-500/25 flex items-center justify-center text-sky-300 shrink-0">
                        <ModuleIcon moduleId={def.moduleId} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h4 className="text-[13px] font-bold text-white">{def.name}</h4>
                          <code className="text-[10px] font-mono text-sky-400 bg-sky-900/30 px-1.5 py-0.5 rounded border border-sky-500/20">
                            {def.flagKey}
                          </code>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug truncate">{def.description}</p>
                      </div>
                    </div>

                    {/* Environment indicators + status badge */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Environment pills */}
                      {(['Dev', 'Staging', 'Production'] as const).map((env) => (
                        <span
                          key={env}
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            env === 'Dev'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : env === 'Staging'
                              ? currentRollout > 0
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                                : 'bg-slate-800/60 text-slate-600 border-slate-700/40'
                              : currentRollout > 0
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                              : 'bg-slate-800/60 text-slate-600 border-slate-700/40'
                          }`}
                        >
                          {env}
                        </span>
                      ))}
                      {/* Status badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${getRolloutBadgeStyle(currentRollout)}`}>
                        {getRolloutLabel(currentRollout)} · {currentRollout}%
                      </span>
                    </div>
                  </div>

                  {/* Rollout chip selector */}
                  <div className="px-4 pb-3 border-t border-white/5 pt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                      Rollout %:
                    </span>
                    {ROLLOUT_PERCENTAGES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSetRollout(def.moduleId, opt.value)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                          currentRollout === opt.value
                            ? opt.value === 0
                              ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                              : opt.value === 5
                              ? 'bg-amber-500/30 text-amber-200 border-amber-400/60 shadow-sm'
                              : opt.value === 25
                              ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 shadow-sm'
                              : opt.value === 50
                              ? 'bg-blue-500/30 text-blue-200 border-blue-400/60 shadow-sm'
                              : 'bg-purple-500/30 text-purple-200 border-purple-400/60 shadow-sm'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700/40 hover:border-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {opt.value}%
                        <span className="ml-1 opacity-60">·</span>
                        <span className="ml-1 opacity-60">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Framework Section */}
          <div className="mt-3 rounded-2xl bg-gradient-to-r from-amber-950/30 to-[#0d1428]/80 border border-amber-500/35 p-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300 shrink-0 shadow-md shadow-amber-950/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-amber-200">Core Framework Security Upgrade</h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border ${
                        frameworkConfigured
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {frameworkConfigured ? 'CONFIGURED' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Requires a controlled deployment pathway with compatibility and integration validation — separate from feature flags.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {frameworkConfigured ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/35 flex items-center gap-1.5">
                    Controlled Pathway Configured
                  </span>
                ) : (
                  <button
                    onClick={() => setIsFrameworkModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-900/40 transition-all cursor-pointer active:scale-95"
                  >
                    Configure Controlled Upgrade →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Rollout Summary + Continue */}
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-[#060c1a] border border-slate-700/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Config:</span>
              <span className={`text-[11px] font-mono font-bold ${featureFlags.lms > 0 ? 'text-sky-300' : 'text-slate-500'}`}>
                FF_LMS · {featureFlags.lms}%
              </span>
              <span className="text-slate-700">·</span>
              <span className={`text-[11px] font-mono font-bold ${featureFlags.visiting_cards > 0 ? 'text-sky-300' : 'text-slate-500'}`}>
                FF_VISIT_CARD · {featureFlags.visiting_cards}%
              </span>
              <span className="text-slate-700">·</span>
              <span className={`text-[11px] font-mono font-bold ${featureFlags.ai_chatbot > 0 ? 'text-sky-300' : 'text-slate-500'}`}>
                FF_HR_CHATBOT · {featureFlags.ai_chatbot}%
              </span>
              <span className="text-slate-700">·</span>
              <span className={`text-[11px] font-mono font-bold ${frameworkConfigured ? 'text-amber-300' : 'text-slate-500'}`}>
                Framework: {frameworkConfigured ? 'Controlled' : 'Pending'}
              </span>
            </div>

            <button
              onClick={handleContinueToDeployment}
              disabled={!frameworkConfigured}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                frameworkConfigured
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Deployment Validation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STAGE 3: BLUE-GREEN DEPLOYMENT SIMULATOR
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'deployment_validation' && (
        <div className="flex-1 flex flex-col px-5 py-3 overflow-y-auto min-h-0">
          {/* Header */}
          <div className="pb-2.5 border-b border-white/8 shrink-0 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-white leading-tight">Blue-Green Deployment Simulator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sequence the deployment actions to execute a zero-downtime release.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-sky-400 bg-[#060c1a] px-3 py-1.5 rounded-xl border border-sky-500/25 shrink-0 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              {deploymentSlots.filter(Boolean).length} / 4 actions sequenced
            </div>
          </div>

          {/* Dialogue bar */}
          <div className="mt-2 px-3 py-2 rounded-xl bg-[#0d1428]/80 border border-indigo-500/25 grid grid-cols-1 lg:grid-cols-2 gap-2 shrink-0 text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-black text-sky-400 shrink-0">DANIEL:</span>
              <span className="truncate italic">"The framework upgrade touches shared components. Don't test directly on live production."</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-black text-indigo-400 shrink-0">AARAV:</span>
              <span className="truncate italic">"Prepare Green, run compatibility validation, and switch traffic only once verified."</span>
            </div>
          </div>

          {/* Environment panels */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-7 gap-3 shrink-0 items-center">
            {/* BLUE ENVIRONMENT */}
            <div className="md:col-span-3 rounded-2xl border-2 p-4 transition-all bg-gradient-to-br from-blue-950/60 to-[#0d1428] border-blue-500/50 shadow-lg shadow-blue-950/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0 shadow-md">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black uppercase text-blue-300 tracking-wider">BLUE</span>
                      <code className="text-[10px] font-mono text-slate-400">v1.0.0</code>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Current Production</div>
                    <div className="text-[10px] text-slate-500">Serving all active branches</div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 bg-blue-500/15 text-blue-300 border-blue-500/30">
                  ● LIVE
                </span>
              </div>
            </div>

            {/* TRAFFIC INDICATOR */}
            <div className="md:col-span-1 flex flex-col items-center justify-center gap-1 py-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Traffic</span>
              <div className="text-[10px] font-mono font-black px-2 py-1 rounded-lg my-0.5 transition-all whitespace-nowrap border bg-blue-500/15 text-blue-300 border-blue-500/30">
                → Blue
              </div>
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
              <span className="text-[9px] text-slate-600 font-mono">100%</span>
            </div>

            {/* GREEN ENVIRONMENT */}
            <div className="md:col-span-3 rounded-2xl border-2 p-4 transition-all bg-gradient-to-br from-sky-950/30 to-[#0d1428] border-sky-500/35">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md border bg-slate-700/30 border-slate-600/40 text-slate-400">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black uppercase tracking-wider text-sky-400">
                        GREEN
                      </span>
                      <code className="text-[10px] font-mono text-slate-400">v2.0.0</code>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Staging · Phase 2 + Framework</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {deploymentSlots.filter(Boolean).length === 4
                        ? '4 / 4 actions mapped'
                        : `${deploymentSlots.filter(Boolean).length} / 4 actions mapped`}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 bg-slate-800 text-slate-400 border-slate-700">
                  {deploymentSlots.filter(Boolean).length === 4 ? 'READY' : 'STAGING'}
                </span>
              </div>
            </div>
          </div>

          {/* Drag-and-drop workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3 min-h-0">
            {/* Available Actions */}
            <div className="lg:col-span-5 flex flex-col bg-[#0d1428]/80 rounded-2xl border border-slate-700/50 p-3 min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                    Deployment Actions
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Drag or click + Place to sequence</p>
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {SCRAMBLED_ACTIONS.map((action) => {
                  const isPlaced = deploymentSlots.includes(action.id);
                  return (
                    <div
                      key={action.id}
                      draggable={!isPlaced}
                      onDragStart={(e) => {
                        e.dataTransfer?.setData('text/plain', action.id);
                        setDraggedActionId(action.id);
                      }}
                      className={`rounded-xl border transition-all ${
                        isPlaced
                          ? 'opacity-30 border-slate-800 bg-slate-900/50 pointer-events-none'
                          : 'bg-gradient-to-r from-sky-950/20 to-[#0d1428] border-slate-700/60 hover:border-sky-400/50 cursor-grab active:cursor-grabbing shadow-sm'
                      }`}
                    >
                      <div className="px-3 py-2.5 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Letter badge */}
                          <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-300 font-mono text-sm font-black flex items-center justify-center shrink-0">
                            {action.letter}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block leading-snug">
                              {action.title}
                            </span>
                          </div>
                        </div>

                        {!isPlaced && (
                          <button
                            onClick={() => {
                              const openSlotIdx = deploymentSlots.findIndex((s) => s === null);
                              if (openSlotIdx !== -1) {
                                handleAssignActionToSlot(openSlotIdx, action.id);
                              }
                            }}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white shrink-0 cursor-pointer transition-colors border border-sky-500/30 hover:border-sky-400"
                          >
                            + Place
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sequence slots */}
            <div className="lg:col-span-4 flex flex-col bg-[#0d1428]/80 rounded-2xl border border-slate-700/50 p-3 min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                  Deployment Sequence
                </h3>
                <span className="text-[10px] text-slate-500">Drop in order →</span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const assignedActionId = deploymentSlots[slotIdx];
                  const assignedAction = DEPLOYMENT_ACTIONS.find((a) => a.id === assignedActionId);

                  return (
                    <div key={slotIdx} className="relative">
                      {/* Connecting line between steps */}
                      {slotIdx < 3 && (
                        <div className="absolute left-4 bottom-0 translate-y-full w-px h-2 bg-slate-700 z-10" />
                      )}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const actionId = e.dataTransfer?.getData('text/plain') || draggedActionId;
                          if (actionId) {
                            handleAssignActionToSlot(slotIdx, actionId);
                            setDraggedActionId(null);
                          }
                        }}
                        className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 min-h-[54px] ${
                          assignedAction
                            ? 'bg-[#101935] border-indigo-500/40 text-slate-200 shadow-sm'
                            : 'bg-[#060c1a]/60 border-dashed border-slate-700/70 hover:border-sky-500/50 hover:bg-sky-950/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Step number circle */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-black border-2 shrink-0 ${
                              assignedAction
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                                : 'bg-slate-800 border-slate-600 text-slate-500'
                            }`}
                          >
                            {slotIdx + 1}
                          </div>

                          {assignedAction ? (
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-white block leading-snug truncate">
                                {assignedAction.title}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic">Drop Step {slotIdx + 1} action here</span>
                          )}
                        </div>

                        {assignedAction && (
                          <button
                            onClick={() => handleClearSlot(slotIdx)}
                            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-600 shrink-0 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status + Complete */}
            <div className="lg:col-span-3 flex flex-col bg-[#0d1428]/80 rounded-2xl border border-slate-700/50 p-3 min-h-0 justify-between">
              <div className="min-h-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 mb-3 shrink-0">
                  Deployment Status
                </h3>

                <div className="space-y-2">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const assignedActionId = deploymentSlots[slotIdx];
                    const action = DEPLOYMENT_ACTIONS.find((a) => a.id === assignedActionId);
                    return (
                      <div
                        key={slotIdx}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all ${
                          action
                            ? 'bg-indigo-950/30 border-indigo-500/35'
                            : 'bg-slate-800/30 border-slate-700/40'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            action ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'
                          }`}
                        >
                          <span className="text-[10px] font-bold">{slotIdx + 1}</span>
                        </div>
                        <div className="text-xs leading-tight min-w-0">
                          <div className={action ? 'text-indigo-200 font-bold truncate' : 'text-slate-500'}>
                            {action ? `Step ${slotIdx + 1}: ${action.letter}` : `Step ${slotIdx + 1}: Unassigned`}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {action ? action.title : 'Awaiting action placement'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete button */}
              <div className="mt-3 pt-3 border-t border-white/8 shrink-0">
                <button
                  onClick={handleFinishDeployment}
                  disabled={!deploymentSlots.every((s) => s !== null)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    deploymentSlots.every((s) => s !== null)
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-lg shadow-indigo-900/40 cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Complete & Return to Meeting</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: CONFIGURE CONTROLLED FRAMEWORK UPGRADE
      ══════════════════════════════════════════════════════════════════ */}
      {isFrameworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#0d1428] border border-amber-500/40 rounded-2xl p-6 shadow-2xl shadow-amber-950/40 text-slate-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/40">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Controlled Upgrade Protocol</h3>
                <span className="text-[10px] font-mono text-amber-400">Core Framework Security Upgrade</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#060c1a] p-3.5 rounded-xl border border-white/5 my-3">
              {FRAMEWORK_UPGRADE_NOTE}
            </p>

            <div className="text-[11px] text-slate-400 space-y-2 my-3">
              {[
                'Isolated Blue-Green staging validation',
                'Zero downtime compatibility regression test suite',
                'Automated rollback trigger on database connection stall',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/50">
              <button
                onClick={() => setIsFrameworkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledgeFramework}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-900/40"
              >
                Confirm Controlled Pathway →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
