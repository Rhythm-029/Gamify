import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, ArrowRight, ArrowLeft, Check,
  Clock, ShieldAlert, Users, Layers, AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getSessionAssignmentResult, setSessionAssignmentResult } from '../../data/chaptersData';

export interface ScopeAssignmentResult {
  priorities: string[];
  dependencyChoice: 'A' | 'B' | 'C';
  validations: string[];
  evaluation: {
    score: number;
    scheduleScore: number;
    riskScore: number;
    governanceScore: number;
    efficiencyScore: number;
    aaravResponse: string;
    isStrong: boolean;
    feedbackItems: string[];
  };
}

interface ProjectAmigoScopeAssignmentProps {
  onSubmitted?: (result: ScopeAssignmentResult) => void;
  onOpenTeams?: () => void;
  onClose?: () => void;
}

const MODULE_OPTIONS = [
  {
    id: 'Appraisals',
    title: 'Appraisals',
    desc: 'Performance reviews, ratings & annual appraisal cycle workflows',
    icon: '📊',
  },
  {
    id: 'Attendance',
    title: 'Attendance',
    desc: 'Daily clock-in/out, shift scheduling & attendance verification',
    icon: '⏱️',
  },
  {
    id: 'Leave Management',
    title: 'Leave Management',
    desc: 'Leave balance tracking, accruals & manager approval chains',
    icon: '🌴',
  },
  {
    id: 'Form 16',
    title: 'Form 16',
    desc: 'Statutory tax certificate downloads & payroll compliance documents',
    icon: '📑',
  },
  {
    id: 'Learning Management',
    title: 'Learning Management',
    desc: 'Training catalogs, compliance courses & employee certifications',
    icon: '🎓',
  },
  {
    id: 'Digital Visiting Cards',
    title: 'Digital Visiting Cards',
    desc: 'Digital staff identity cards with dynamic QR codes for client interactions',
    icon: '🪪',
  },
];

const DEPENDENCY_OPTIONS = [
  {
    id: 'A' as const,
    label: 'Ask Daniel to proceed using the current assumptions and deal with access later.',
    desc: 'Defer authentication integration and build features assuming standard interfaces.',
  },
  {
    id: 'B' as const,
    label: 'Record LDAP access as a dependency, arrange a follow-up with the responsible owner, and continue with work that isn\'t blocked.',
    desc: 'Establish clear dependency governance while maintaining engineering momentum on unblocked modules.',
  },
  {
    id: 'C' as const,
    label: 'Pause all project work until LDAP access is available.',
    desc: 'Halt sprint execution across all tracks until sandbox credentials are provided.',
  },
];

const VALIDATION_ITEMS = [
  {
    id: 'peak_load',
    label: 'Whether the technical approach can support the expected peak load.',
    detail: 'Kickoff raised 30,000 concurrent logins during appraisal peaks.',
  },
  {
    id: 'delivery_90_days',
    label: 'Whether the team can deliver the proposed scope within 90 days.',
    detail: 'Feasibility assessment against engineering capacity and technical complexity.',
  },
  {
    id: 'client_phase1_approval',
    label: 'Whether the client has approved the final Phase 1 scope.',
    detail: 'Formal baseline sign-off from Sophia Bennett and steering committee.',
  },
];

export const ProjectAmigoScopeAssignment: React.FC<ProjectAmigoScopeAssignmentProps> = ({
  onSubmitted,
  onOpenTeams,
  onClose,
}) => {
  const { addSignal } = useGame();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [dependencyChoice, setDependencyChoice] = useState<'A' | 'B' | 'C' | null>(null);
  const [selectedValidations, setSelectedValidations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ScopeAssignmentResult | null>(() => {
    return getSessionAssignmentResult();
  });

  const handleTogglePriority = (id: string) => {
    if (selectedPriorities.includes(id)) {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== id));
    } else {
      if (selectedPriorities.length < 3) {
        setSelectedPriorities([...selectedPriorities, id]);
      }
    }
  };

  const handleToggleValidation = (id: string) => {
    if (selectedValidations.includes(id)) {
      setSelectedValidations(selectedValidations.filter((v) => v !== id));
    } else {
      setSelectedValidations([...selectedValidations, id]);
    }
  };

  const handleSubmit = () => {
    if (!dependencyChoice) return;
    setIsSubmitting(true);

    // ── Scoring Algorithm ──
    const hasAppraisals = selectedPriorities.includes('Appraisals');
    const hasAttendance = selectedPriorities.includes('Attendance');
    const hasLeave = selectedPriorities.includes('Leave Management');

    // Schedule Score (0-25)
    let scheduleScore = 15;
    if (selectedValidations.includes('delivery_90_days')) scheduleScore += 5;
    if (hasAppraisals) scheduleScore += 5;

    // Risk Management Score (0-25)
    let riskScore = 10;
    if (dependencyChoice === 'B') riskScore = 25;
    else if (dependencyChoice === 'C') riskScore = 15;
    else if (dependencyChoice === 'A') riskScore = 10;

    // Governance Score (0-25)
    let governanceScore = 10;
    if (selectedValidations.includes('peak_load')) governanceScore += 8;
    if (selectedValidations.includes('client_phase1_approval')) governanceScore += 7;

    // Efficiency Score (0-25)
    let efficiencyScore = 12;
    if (hasAppraisals && (hasAttendance || hasLeave)) efficiencyScore = 25;
    else if (hasAttendance || hasLeave) efficiencyScore = 18;

    const totalScore = scheduleScore + riskScore + governanceScore + efficiencyScore;
    const isStrong = dependencyChoice === 'B' && hasAppraisals && selectedValidations.length >= 2;

    // Dynamic Aarav response based on actual choices
    let aaravResponse = '';
    const feedbackItems: string[] = [];

    if (isStrong) {
      aaravResponse = `Good. We've got a starting point, and you've flagged the areas that still need confirmation.\n\nI'll take the proposed priorities to Sophia, while Daniel checks the technical dependencies. We'll need to validate feasibility before treating the 90-day timeline as a commitment.`;
      feedbackItems.push('Prioritized critical-path business modules aligned with appraisal cycle');
      feedbackItems.push('Handled LDAP dependency through explicit governance without stalling work');
      feedbackItems.push('Identified vital technical capacity and timeline validation gates');
    } else if (dependencyChoice === 'A') {
      aaravResponse = `You've identified initial scope priorities, but deferring the LDAP access dependency poses a serious integration risk. Proceeding on unverified assumptions usually causes major rework down the line.\n\nWe need to treat LDAP as an explicit dependency while Daniel keeps unblocked tracks moving.`;
      feedbackItems.push('Warning: Deferring technical dependencies creates high architectural rework risk');
      if (hasAppraisals) feedbackItems.push('Good focus on the appraisal cycle deadline');
    } else if (dependencyChoice === 'C') {
      aaravResponse = `You've rightly spotted that LDAP is a blocker, but pausing all project tracks stops momentum on work that doesn't rely on authentication. We should keep core module planning moving while escalating the credential access.`;
      feedbackItems.push('Warning: Halting entire project tracks causes unnecessary delivery delays');
    } else {
      aaravResponse = `You've laid out an initial direction, but we must make sure the team validates peak load capacity and feasibility before we commit to Sophia's 90-day target. Let's make sure our technical assumptions hold before building.`;
      feedbackItems.push('Caution: Delivery feasibility requires explicit verification before client commitment');
    }

    addSignal('Completed Project Amigo Scope Assignment', 'delivery', totalScore >= 80 ? 25 : 15);

    const result: ScopeAssignmentResult = {
      priorities: selectedPriorities,
      dependencyChoice: dependencyChoice,
      validations: selectedValidations,
      evaluation: {
        score: totalScore,
        scheduleScore,
        riskScore,
        governanceScore,
        efficiencyScore,
        aaravResponse,
        isStrong,
        feedbackItems,
      },
    };

    setSessionAssignmentResult(result);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData(result);
      if (onSubmitted) onSubmitted(result);
    }, 1200);
  };

  // If already submitted, show clean executive review card
  if (submittedData) {
    return (
      <div className="flex-1 flex flex-col bg-[#fbfbfd] text-slate-800 font-sans overflow-y-auto p-6 sm:p-10 select-text">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <span className="text-[11px] font-mono tracking-widest text-blue-700 font-bold uppercase">
              PROJECT AMIGO · ASSIGNMENT 01
            </span>
            <h1 className="text-2xl font-serif font-black text-slate-900 mt-1">
              Planning Decisions Submitted
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Your initial planning proposal has been sent to Aarav Kapoor for review.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Executive Proposal Summary</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Prioritized Capabilities: </span>
                <span className="font-bold text-slate-900">{submittedData.priorities.join(', ')}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Dependency Handling: </span>
                <span className="font-bold text-slate-900">
                  {submittedData.dependencyChoice === 'B'
                    ? 'Record dependency & proceed with unblocked modules'
                    : submittedData.dependencyChoice === 'A'
                    ? 'Proceed on assumptions, defer access'
                    : 'Pause all project tracks'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Confirmed Validation Gates: </span>
                <span className="font-bold text-slate-900">{submittedData.validations.length} critical items flagged</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <div className="font-bold text-[11px] uppercase tracking-wider text-blue-800 mb-1">
                Aarav's Assessment Preview
              </div>
              <p className="italic text-slate-700">
                "{submittedData.evaluation.aaravResponse}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Window
              </button>
            )}
            {onOpenTeams && (
              <button
                onClick={onOpenTeams}
                className="px-5 py-2.5 rounded-lg bg-[#464EB8] hover:bg-[#5B63D3] text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm transition-all ml-auto"
              >
                <span>View Full Feedback in Teams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] text-slate-900 font-sans overflow-hidden select-text relative">
      
      {/* ── TOP CORPORATE APP HEADER ── */}
      <div className="h-14 px-8 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-xs">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-blue-700 font-bold uppercase">
            PROJECT AMIGO · INITIAL PLANNING · ASSIGNMENT 01
          </span>
          <div className="text-xs font-bold text-slate-900">Define the Priorities</div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className={`px-2.5 py-1 rounded-md font-semibold ${currentStep === 1 ? 'bg-blue-600 text-white' : currentStep > 1 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-500'}`}>
            {currentStep > 1 ? '✓ STEP 1' : 'STEP 1 OF 3'}
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-md font-semibold ${currentStep === 2 ? 'bg-blue-600 text-white' : currentStep > 2 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-500'}`}>
            {currentStep > 2 ? '✓ STEP 2' : 'STEP 2 OF 3'}
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-md font-semibold ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            STEP 3 OF 3
          </span>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-6">

          {/* Context Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                The situation
              </div>
              <ul className="text-xs text-slate-700 space-y-0.5 mt-1 list-disc list-inside">
                <li>90-day business delivery window.</li>
                <li>High expected traffic during the appraisal cycle.</li>
                <li>LDAP access not yet confirmed.</li>
              </ul>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 self-start sm:self-center shrink-0">
              Ref: Project_Amigo_Internal_Brief.pdf
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1: CAPABILITY PRIORITIZATION
          ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-serif font-black text-slate-900">
                  Step 1 — What deserves attention first?
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  The business has requested several capabilities, but the team still needs to validate the delivery approach.
                  Select up to three capabilities you would prioritize for initial planning.
                </p>
                <div className="mt-2 text-[11px] font-mono font-semibold text-blue-700">
                  {selectedPriorities.length} of 3 selected
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODULE_OPTIONS.map((mod) => {
                  const isSelected = selectedPriorities.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleTogglePriority(mod.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xl">{mod.icon}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-2">{mod.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{mod.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={selectedPriorities.length === 0}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center space-x-2 shadow-sm cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2: TECHNICAL DEPENDENCY
          ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-serif font-black text-slate-900">
                  Step 2 — Handle the technical dependency
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Review the update from engineering and select your management strategy.
                </p>
              </div>

              {/* Internal Teams Message Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-700 text-xs font-bold">
                    D
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Daniel</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">Developer · Teams Update</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
                  "One thing to flag: we still don't have confirmed access to the LDAP sandbox. Until that's sorted, we can't complete end-to-end authentication testing."
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-900">What would you do next?</div>
                <div className="space-y-2.5">
                  {DEPENDENCY_OPTIONS.map((opt) => {
                    const isSelected = dependencyChoice === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setDependencyChoice(opt.id)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 text-slate-600 bg-white'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 leading-snug">{opt.label}</div>
                          <div className="text-[11px] text-slate-500 mt-1 leading-tight">{opt.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!dependencyChoice}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center space-x-2 shadow-sm cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3: WHAT NEEDS CONFIRMATION?
          ═══════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-serif font-black text-slate-900">
                  Step 3 — What needs confirmation?
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  You've identified an initial direction. Before the team makes a delivery commitment, select the items that still need to be confirmed.
                </p>
              </div>

              <div className="space-y-2.5">
                {VALIDATION_ITEMS.map((item) => {
                  const isChecked = selectedValidations.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleValidation(item.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3.5 ${
                        isChecked
                          ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 leading-snug">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedValidations.length === 0}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center space-x-2 shadow-sm cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reviewing your planning decisions…</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Assignment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
