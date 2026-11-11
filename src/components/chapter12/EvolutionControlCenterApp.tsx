import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  ShieldAlert,
  GraduationCap,
  Contact2,
  Bot,
  ArrowRight,
  Server,
  Check,
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
  const [scopeError, setScopeError] = useState<string | null>(null);
  const [scopeCompleted, setScopeCompleted] = useState<boolean>(
    Boolean(chapter12State.scopeCompleted)
  );
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);

  // ── STAGE 2: FEATURE FLAGS & FRAMEWORK STATE ──
  const [featureFlags, setFeatureFlags] = useState<Record<string, FeatureFlagRollout>>({
    lms: chapter12State.featureFlags?.lms ?? 25,
    visiting_cards: chapter12State.featureFlags?.visiting_cards ?? 5,
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
  const [deploymentInterruption, setDeploymentInterruption] = useState<string | null>(null);
  const [isSimulatingTests, setIsSimulatingTests] = useState(false);
  const [deploymentCompleted, setDeploymentCompleted] = useState<boolean>(
    Boolean(chapter12State.deploymentCompleted)
  );

  // Derive Blue-Green live state from slots
  const hasStep1 = deploymentSlots[0] === 'action_a';
  const hasStep2 = hasStep1 && deploymentSlots[1] === 'action_b';
  const hasStep3 = hasStep2 && deploymentSlots[2] === 'action_c';
  const hasStep4 = hasStep3 && deploymentSlots[3] === 'action_d';

  // ───────────────────────────────────────────────────────────────────────────
  // STAGE 1: DRAG & DROP HANDLERS (UPGRADE SCOPE)
  // ───────────────────────────────────────────────────────────────────────────
  const handleAssignModule = (moduleId: string, category: UpgradeCategory) => {
    sound.playClick();
    const mod = UPGRADE_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;

    const updated = { ...scopeAssignments, [moduleId]: category };

    if (mod.category !== category) {
      sound.playPenaltyPing();
      setScopeError(
        mod.id === 'framework_upgrade'
          ? 'Remember, the framework upgrade changes the underlying platform. It needs a separate compatibility and upgrade validation process.'
          : 'LMS, Digital Visiting Cards, and AI HR Chatbot introduce new functional capabilities—place them under New Functionality, not Core Platform Upgrade.'
      );
      setScopeAssignments(updated);
      setScopeCompleted(false);
      onUpdateState({
        scopeAssignments: updated,
        scopeCompleted: false,
        scopeErrorCount: (chapter12State.scopeErrorCount || 0) + 1,
      });
      return;
    }

    setScopeError(null);
    sound.playSystemClearance();
    setScopeAssignments(updated);

    const correctCount = UPGRADE_MODULES.filter(
      (m) => updated[m.id] === m.category
    ).length;

    const allCorrect = correctCount === 4;
    setScopeCompleted(allCorrect);
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
    setScopeError(null);
    onUpdateState({
      scopeAssignments: updated,
      scopeCompleted: false,
    });
  };

  const handleContinueToStrategy = () => {
    sound.playClick();
    onUpdateState({
      scopeCompleted: true,
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
    setDeploymentInterruption(null);

    const action = DEPLOYMENT_ACTIONS.find((a) => a.id === actionId);
    if (!action) return;

    if (action.correctStep === 4 && (!hasStep1 || !hasStep2 || !hasStep3)) {
      sound.playPenaltyPing();
      setDeploymentInterruption(
        "Hold on. We haven't validated the green environment yet. We shouldn't move production traffic until the release passes its checks."
      );
      return;
    }

    if (action.correctStep !== slotIndex + 1) {
      sound.playPenaltyPing();
      setDeploymentInterruption(
        `Action "${action.title.slice(0, 35)}..." cannot be placed in Step ${
          slotIndex + 1
        }. Ensure prerequisites are sequenced first.`
      );
      return;
    }

    const updatedSlots = [...deploymentSlots];
    updatedSlots[slotIndex] = actionId;
    setDeploymentSlots(updatedSlots);

    if (slotIndex === 1) {
      setIsSimulatingTests(true);
      setTimeout(() => {
        setIsSimulatingTests(false);
        sound.playSystemClearance();
      }, 1200);
    } else {
      sound.playSystemClearance();
    }

    const s1 = updatedSlots[0] === 'action_a';
    const s2 = s1 && updatedSlots[1] === 'action_b';
    const s3 = s2 && updatedSlots[2] === 'action_c';
    const s4 = s3 && updatedSlots[3] === 'action_d';

    setDeploymentCompleted(s4);
    onUpdateState({
      deploymentSlots: updatedSlots,
      greenPrepared: s1,
      testsPassed: s2,
      releaseValidated: s3,
      trafficSwitchedToGreen: s4,
      deploymentCompleted: s4,
    });
  };

  const handleClearSlot = (slotIndex: number) => {
    sound.playClick();
    const updatedSlots = [...deploymentSlots];
    updatedSlots[slotIndex] = null;
    setDeploymentSlots(updatedSlots);
    setDeploymentCompleted(false);
    setDeploymentInterruption(null);

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
    onUpdateState({
      deploymentCompleted: true,
      currentStage: 'steering_final_decision',
      timelineTimestamp: '30:42',
    });
    onReturnToMeeting();
  };

  const correctCategorizedCount = UPGRADE_MODULES.filter(
    (m) => scopeAssignments[m.id] === m.category
  ).length;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TOP HEADER & THREE-STAGE STEPPER (COMPACT & READABLE) ── */}
      <div className="bg-slate-900 border-b border-indigo-500/20 px-5 py-2 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Evolution Control Center
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  v2.0.0 Candidate
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Phase 2 Release Management · ICICI Bank / Project Amigo
              </p>
            </div>
          </div>

          {/* 3-Stage Progress Indicator (Crisp & Unobstructed) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-white/10 self-start lg:self-auto shadow-inner">
            {/* Step 1: Upgrade Scope */}
            <button
              onClick={() => {
                setActiveTab('upgrade_scope');
                onUpdateState({ selectedTab: 'upgrade_scope' });
              }}
              className={`flex items-center gap-1.5 text-xs sm:text-[13px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'upgrade_scope'
                  ? 'bg-sky-600 text-white shadow-md'
                  : scopeCompleted
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {scopeCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center border border-white/20">
                  1
                </span>
              )}
              <span>Upgrade Scope</span>
            </button>

            <span className="text-slate-600 font-bold text-xs">→</span>

            {/* Step 2: Release Strategy */}
            <button
              onClick={() => {
                if (scopeCompleted) {
                  setActiveTab('release_strategy');
                  onUpdateState({ selectedTab: 'release_strategy' });
                }
              }}
              disabled={!scopeCompleted}
              className={`flex items-center gap-1.5 text-xs sm:text-[13px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'release_strategy'
                  ? 'bg-sky-600 text-white shadow-md'
                  : strategyCompleted
                  ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer'
                  : scopeCompleted
                  ? 'text-slate-400 hover:text-slate-200 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              {strategyCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center border border-white/20">
                  2
                </span>
              )}
              <span>Release Strategy</span>
            </button>

            <span className="text-slate-600 font-bold text-xs">→</span>

            {/* Step 3: Deployment Validation */}
            <button
              onClick={() => {
                if (strategyCompleted) {
                  setActiveTab('deployment_validation');
                  onUpdateState({ selectedTab: 'deployment_validation' });
                }
              }}
              disabled={!strategyCompleted}
              className={`flex items-center gap-1.5 text-xs sm:text-[13px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'deployment_validation'
                  ? 'bg-sky-600 text-white shadow-md'
                  : deploymentCompleted
                  ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer'
                  : strategyCompleted
                  ? 'text-slate-400 hover:text-slate-200 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              {deploymentCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center border border-white/20">
                  3
                </span>
              )}
              <span>Deployment Validation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STAGE 1: UPGRADE SCOPE (ALL 4 ITEMS + FOOTER FIT CLEANLY AT ONCE) ── */}
      {activeTab === 'upgrade_scope' && (
        <div className="flex-1 flex flex-col px-5 py-2.5 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-0">
          {/* Header Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/10 gap-2 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  CR-024 | Phase 2 Evolution
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Steering Committee has requested the reactivation of deferred Phase 2 modules along with a core framework security upgrade.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-sky-400 shrink-0 bg-slate-900 px-3 py-1 rounded-xl border border-sky-500/30">
              Categorized: {correctCategorizedCount} / 4
            </div>
          </div>

          {/* Contextual Error Guidance from Daniel */}
          {scopeError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-2.5 text-amber-200 text-xs shrink-0"
            >
              <img
                src={CHAPTER12_CHARACTERS.daniel.avatar}
                alt="Daniel"
                className="w-6 h-6 rounded-full border border-amber-400 shrink-0 object-cover"
              />
              <div className="text-xs leading-snug">
                <span className="font-bold text-amber-300">DANIEL: </span>
                {scopeError}
              </div>
            </motion.div>
          )}

          {/* Main 2-Column Layout */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2 min-h-0">
            {/* Left Column: Available Components */}
            <div className="flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800 p-2.5 min-h-0">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Available Components ({UPGRADE_MODULES.length})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Drag cards or use buttons
                </span>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
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
                      className={`px-3 py-2 rounded-xl border transition-all ${
                        isAssigned
                          ? 'opacity-35 border-slate-800 bg-slate-950 pointer-events-none'
                          : 'bg-slate-800/90 border-slate-700/80 hover:border-sky-400/60 cursor-grab active:cursor-grabbing shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0">
                            {mod.id === 'lms' && <GraduationCap className="w-4 h-4" />}
                            {mod.id === 'visiting_cards' && <Contact2 className="w-4 h-4" />}
                            {mod.id === 'ai_chatbot' && <Bot className="w-4 h-4" />}
                            {mod.id === 'framework_upgrade' && <ShieldAlert className="w-4 h-4 text-amber-400" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[13px] font-bold text-white leading-tight">{mod.name}</h4>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        {!isAssigned && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleAssignModule(mod.id, 'new_functionality')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-700 hover:bg-sky-600 text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                              title="Assign to New Functionality"
                            >
                              + New Func
                            </button>
                            <button
                              onClick={() => handleAssignModule(mod.id, 'core_platform_upgrade')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-700 hover:bg-amber-600 text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                              title="Assign to Core Platform"
                            >
                              + Core Plat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Two Drop Zones */}
            <div className="flex flex-col gap-2 min-h-0">
              {/* DROP ZONE 1: NEW FUNCTIONALITY (Holds all 3 items cleanly visible at once) */}
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
                className="flex-[1.7] flex flex-col bg-slate-900/80 rounded-2xl border-2 border-dashed border-sky-500/45 hover:border-sky-400/80 p-2.5 transition-colors min-h-0"
              >
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <h3 className="text-xs font-black uppercase tracking-wider text-sky-400">
                    New Functionality
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    (Drop relevant capability modules here)
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                  {Object.entries(scopeAssignments)
                    .filter(([_, cat]) => cat === 'new_functionality')
                    .map(([modId]) => {
                      const mod = UPGRADE_MODULES.find((m) => m.id === modId);
                      if (!mod) return null;
                      const isCorrect = mod.category === 'new_functionality';
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
                            className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                              <span className="text-xs sm:text-[13px] font-bold">{mod.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveScopeAssignment(modId)}
                              className="text-[10px] text-slate-300 hover:text-white px-2.5 py-0.5 rounded bg-slate-800/90 cursor-pointer shrink-0"
                            >
                              Remove
                            </button>
                          </motion.div>
                        </div>
                      );
                    })}

                  {Object.values(scopeAssignments).filter((c) => c === 'new_functionality').length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 italic py-3">
                      Drop functional capability modules here (LMS, Visiting Cards, AI HR Chatbot)
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
                className="flex-1 flex flex-col bg-slate-900/80 rounded-2xl border-2 border-dashed border-amber-500/45 hover:border-amber-400/80 p-2.5 transition-colors min-h-0"
              >
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Core Platform Upgrade
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    (Drop framework upgrade here)
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                  {Object.entries(scopeAssignments)
                    .filter(([_, cat]) => cat === 'core_platform_upgrade')
                    .map(([modId]) => {
                      const mod = UPGRADE_MODULES.find((m) => m.id === modId);
                      if (!mod) return null;
                      const isCorrect = mod.category === 'core_platform_upgrade';
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
                            className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                              <span className="text-xs sm:text-[13px] font-bold">{mod.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveScopeAssignment(modId)}
                              className="text-[10px] text-slate-300 hover:text-white px-2.5 py-0.5 rounded bg-slate-800/90 cursor-pointer shrink-0"
                            >
                              Remove
                            </button>
                          </motion.div>
                        </div>
                      );
                    })}

                  {Object.values(scopeAssignments).filter((c) => c === 'core_platform_upgrade').length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 italic py-2">
                      Drop core platform and framework security upgrades here
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs">
              {correctCategorizedCount === 4 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ✓ 4/4 components categorized correctly
                </span>
              ) : (
                <span className="text-slate-400">
                  Categorize all 4 components into appropriate buckets to continue.
                </span>
              )}
            </div>

            <button
              onClick={handleContinueToStrategy}
              disabled={correctCategorizedCount !== 4}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                correctCategorizedCount === 4
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Release Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 2: FEATURE FLAG RELEASE PLANNER (ALL 3 FLAGS + FRAMEWORK FIT IN VIEW) ── */}
      {activeTab === 'release_strategy' && (
        <div className="flex-1 flex flex-col justify-between px-5 py-2 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-0">
          <div>
            <div className="pb-1.5 border-b border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black text-white leading-tight">
                  Release Strategy
                </h2>
                <p className="text-[11px] text-slate-300">
                  Control how Phase 2 capabilities become available to employees using feature flags.
                </p>
              </div>
              {Object.values(featureFlags).some((v) => v === 100) ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Caution: 100% immediate exposure weakens blast-radius protection
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Progressive Guardrail Active
                </span>
              )}
            </div>

            <div className="my-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-200 min-w-0">
                <span className="font-bold text-sky-400 shrink-0">DANIEL:</span>
                <p className="truncate">
                  "We can deploy functionality without exposing it to everyone via feature flags."
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200 min-w-0">
                <span className="font-bold text-indigo-400 shrink-0">AARAV:</span>
                <p className="truncate">
                  "I want a controlled rollout, not a single switch exposing everything to the bank."
                </p>
              </div>
            </div>

            {/* 3 Feature Flag Cards */}
            <div className="space-y-1.5 shrink-0">
              {FEATURE_FLAG_DEFINITIONS.map((def) => {
                const currentRollout = featureFlags[def.moduleId] ?? 0;
                const rolloutOption = ROLLOUT_PERCENTAGES.find(
                  (r) => r.value === currentRollout
                );

                return (
                  <div
                    key={def.id}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0">
                          {def.moduleId === 'lms' && <GraduationCap className="w-4 h-4" />}
                          {def.moduleId === 'visiting_cards' && <Contact2 className="w-4 h-4" />}
                          {def.moduleId === 'ai_chatbot' && <Bot className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h4 className="text-[13px] font-bold text-white leading-tight">{def.name}</h4>
                            <span className="text-[11px] font-mono text-sky-300 font-semibold">
                              Flag: {def.flagKey}
                            </span>
                            <span className="text-[11px] text-slate-400 hidden lg:inline truncate">
                              · {def.description}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                            rolloutOption?.color || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rolloutOption?.label} ({currentRollout}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
                      <span className="text-[11px] text-slate-400 mr-1 font-medium">Target Exposure:</span>
                      {ROLLOUT_PERCENTAGES.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSetRollout(def.moduleId, opt.value)}
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            currentRollout === opt.value
                              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-400'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {opt.value}% · {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Core Framework Security Upgrade */}
            <div className="mt-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-bold text-amber-300 leading-tight">
                        Core Framework Security Upgrade
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {frameworkConfigured ? '✓ Configured' : 'Pending Compatibility Validation'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Requires a controlled deployment with compatibility and integration validation.
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {frameworkConfigured ? (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Controlled Pathway Configured
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsFrameworkModalOpen(true)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer"
                    >
                      Configure Controlled Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Rollout Summary */}
          <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-300">Rollout Summary:</span>
              <span className="font-mono text-sky-400">LMS — {featureFlags.lms}% enabled</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-sky-400">Visiting Cards — {featureFlags.visiting_cards}% enabled</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-sky-400">HR Chatbot — {featureFlags.ai_chatbot}% enabled</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-amber-400">
                Framework: {frameworkConfigured ? 'Controlled (Separate)' : 'Pending'}
              </span>
            </div>

            <button
              onClick={handleContinueToDeployment}
              disabled={!frameworkConfigured}
              className={`px-5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                frameworkConfigured
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Deployment Validation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 3: BLUE-GREEN DEPLOYMENT SIMULATOR (ALL 4 OPTIONS & SLOTS FIT AT ONCE) ── */}
      {activeTab === 'deployment_validation' && (
        <div className="flex-1 flex flex-col px-5 py-2.5 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-0">
          {/* Header Subtitle */}
          <div className="pb-1.5 border-b border-white/10 shrink-0 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-white leading-tight">
                Blue-Green Deployment Simulator
              </h2>
              <p className="text-xs text-slate-300">
                Configure a safe zero-downtime deployment sequence by dragging or placing actions into Steps 1 → 4.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-3 py-1 rounded-lg border border-sky-500/30 shrink-0">
              Steps: {[hasStep1, hasStep2, hasStep3, hasStep4].filter(Boolean).length} / 4
            </div>
          </div>

          {/* Compact Dialogue Bar */}
          <div className="my-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 grid grid-cols-1 lg:grid-cols-2 gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <span className="font-bold text-sky-400 shrink-0">DANIEL:</span>
              <span className="truncate">"The framework upgrade touches shared components. Don't test directly on live production."</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="font-bold text-indigo-400 shrink-0">AARAV:</span>
              <span className="truncate">"Prepare Green, run compatibility validation, and switch traffic only once verified."</span>
            </div>
          </div>

          {/* Interruption Alert if Early Traffic Switch Attempted */}
          {deploymentInterruption && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2.5 text-rose-200 text-xs shrink-0"
            >
              <img
                src={CHAPTER12_CHARACTERS.daniel.avatar}
                alt="Daniel"
                className="w-6 h-6 rounded-full border border-rose-400 shrink-0 object-cover"
              />
              <div className="text-xs leading-snug">
                <span className="font-bold text-rose-300">DANIEL: </span>
                {deploymentInterruption}
              </div>
            </motion.div>
          )}

          {/* Sleek Horizontal Blue vs Green Environment Strip */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-2 shrink-0 items-center">
            {/* BLUE ENVIRONMENT */}
            <div
              className={`md:col-span-3 px-3 py-2 rounded-xl border transition-all flex items-center justify-between ${
                hasStep4
                  ? 'bg-slate-900/60 border-slate-800 opacity-80'
                  : 'bg-blue-950/40 border-blue-500/50 shadow-md'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-blue-400">BLUE ENVIRONMENT</span>
                    <span className="text-[11px] font-mono font-bold text-white">(v1.0.0)</span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-tight">Current Production · Serving all employees</div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full shrink-0 ${
                  hasStep4
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {hasStep4 ? 'STANDBY' : 'LIVE'}
              </span>
            </div>

            {/* TRAFFIC ROUTING */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-0.5 text-center">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">Traffic</span>
              <div
                className={`text-[11px] font-mono font-black px-2 py-0.5 rounded my-0.5 transition-all whitespace-nowrap ${
                  hasStep4
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}
              >
                {hasStep4 ? '100% → Green' : '100% → Blue'}
              </div>
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* GREEN ENVIRONMENT */}
            <div
              className={`md:col-span-3 px-3 py-2 rounded-xl border transition-all flex items-center justify-between ${
                hasStep4
                  ? 'bg-emerald-950/50 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                  : hasStep3
                  ? 'bg-emerald-950/30 border-emerald-500/40'
                  : hasStep1
                  ? 'bg-slate-900/80 border-slate-700'
                  : 'bg-slate-900/50 border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-emerald-400">GREEN ENVIRONMENT</span>
                    <span className="text-[11px] font-mono font-bold text-white">(v2.0.0)</span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-tight">Phase 2 modules + Framework Upgrade</div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full shrink-0 ${
                  hasStep4
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500 font-black'
                    : hasStep3
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : hasStep1
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hasStep4
                  ? 'LIVE'
                  : hasStep3
                  ? 'VALIDATED'
                  : hasStep1
                  ? 'TESTING READY'
                  : 'NOT VALIDATED'}
              </span>
            </div>
          </div>

          {/* ── DRAG AND DROP WORKSPACE: 3 COLUMNS SCALED TO KEEP ALL 4 OPTIONS, 4 SLOTS & COMPLETE CTA VISIBLE ── */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            {/* COLUMN 1: AVAILABLE DEPLOYMENT ACTIONS (5 cols) */}
            <div className="lg:col-span-5 flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800 p-3 min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Available Deployment Actions ({DEPLOYMENT_ACTIONS.length})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Drag cards or click + Place
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {DEPLOYMENT_ACTIONS.map((action) => {
                  const isPlaced = deploymentSlots.includes(action.id);
                  return (
                    <div
                      key={action.id}
                      draggable={!isPlaced}
                      onDragStart={(e) => {
                        e.dataTransfer?.setData('text/plain', action.id);
                        setDraggedActionId(action.id);
                      }}
                      className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                        isPlaced
                          ? 'opacity-35 border-slate-800 bg-slate-950 pointer-events-none'
                          : 'bg-slate-800/95 border-slate-700 hover:border-sky-400/70 cursor-grab active:cursor-grabbing shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-sky-600/30 text-sky-300 font-mono text-xs font-black flex items-center justify-center shrink-0 border border-sky-500/30">
                          {action.letter}
                        </span>
                        <span className="text-xs sm:text-[12.5px] text-slate-100 font-medium leading-snug">
                          {action.title}
                        </span>
                      </div>

                      {!isPlaced && (
                        <button
                          onClick={() => {
                            const openSlotIdx = deploymentSlots.findIndex((s) => s === null);
                            if (openSlotIdx !== -1) {
                              handleAssignActionToSlot(openSlotIdx, action.id);
                            }
                          }}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-sky-600 text-white shrink-0 cursor-pointer transition-colors shadow-sm"
                        >
                          + Place
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: 4 STEP SEQUENCING TARGET SLOTS (4 cols) */}
            <div className="lg:col-span-4 flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800 p-3 min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Target Sequence (Steps 1 → 4)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Drop in sequence
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const assignedActionId = deploymentSlots[slotIdx];
                  const assignedAction = DEPLOYMENT_ACTIONS.find(
                    (a) => a.id === assignedActionId
                  );

                  return (
                    <div
                      key={slotIdx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const actionId = e.dataTransfer?.getData('text/plain') || draggedActionId;
                        if (actionId) {
                          handleAssignActionToSlot(slotIdx, actionId);
                          setDraggedActionId(null);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-between gap-2 min-h-[50px] ${
                        assignedAction
                          ? 'bg-slate-800/90 border-emerald-500/45 shadow-sm'
                          : 'bg-slate-950/60 border-dashed border-slate-700/90 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold flex items-center justify-center border border-sky-500/30 shrink-0">
                          {slotIdx + 1}
                        </span>

                        {assignedAction ? (
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-white block leading-snug">
                              {assignedAction.title}
                            </span>
                            {slotIdx === 1 && isSimulatingTests && (
                              <div className="text-[10px] text-sky-400 animate-pulse mt-0.5">
                                Running compatibility & integration checks...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            Drop Step {slotIdx + 1} action here
                          </span>
                        )}
                      </div>

                      {assignedAction && (
                        <button
                          onClick={() => handleClearSlot(slotIdx)}
                          className="text-[10px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-700/80 hover:bg-slate-600 shrink-0 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 3: DEPLOYMENT STATUS & COMPLETION (3 cols) */}
            <div className="lg:col-span-3 flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800 p-3 min-h-0 justify-between">
              <div className="min-h-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-2 shrink-0">
                  Deployment Status
                </h3>

                <div className="space-y-1.5 pr-1">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        hasStep1 ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <div className="text-xs leading-tight">
                      <div className={hasStep1 ? 'text-white font-bold' : 'text-slate-400'}>
                        Environment Prepared
                      </div>
                      <div className="text-[10px] text-slate-500">v2.0.0 staging configured</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        hasStep2 ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <div className="text-xs leading-tight">
                      <div className={hasStep2 ? 'text-white font-bold' : 'text-slate-400'}>
                        Tests Passed
                      </div>
                      <div className="text-[10px] text-slate-500">Compatibility & security</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        hasStep3 ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <div className="text-xs leading-tight">
                      <div className={hasStep3 ? 'text-white font-bold' : 'text-slate-400'}>
                        Release Validated
                      </div>
                      <div className="text-[10px] text-slate-500">Go-live certified</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        hasStep4 ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <div className="text-xs leading-tight">
                      <div className={hasStep4 ? 'text-white font-bold' : 'text-slate-400'}>
                        Traffic Switched
                      </div>
                      <div className="text-[10px] text-slate-500">Zero-downtime cutover</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete & Return to Meeting Button */}
              <div className="mt-2 pt-2 border-t border-white/10 shrink-0">
                <button
                  onClick={handleFinishDeployment}
                  disabled={!hasStep4}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    hasStep4
                      ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95'
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

      {/* ── MODAL: CONFIGURE CONTROLLED UPGRADE (FRAMEWORK SECURITY) ── */}
      {isFrameworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  Controlled Upgrade Protocol
                </h3>
                <span className="text-[10px] font-mono text-amber-400">
                  Core Framework Security Upgrade
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-white/5 my-3">
              {FRAMEWORK_UPGRADE_NOTE}
            </p>

            <div className="text-[11px] text-slate-400 space-y-1 my-3">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Isolated Blue-Green staging validation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero downtime compatibility regression test suite</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated rollback trigger on database connection stall</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsFrameworkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledgeFramework}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer font-bold"
              >
                Confirm Controlled Pathway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
