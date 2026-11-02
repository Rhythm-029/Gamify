import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Award,
  Layers,
  ArrowUpRight,
  Users,
  Presentation,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  PieChart,
  Lightbulb,
  ExternalLink,
  Sliders,
  CheckSquare,
  Square,
  MessageSquare,
  ArrowRight,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import type {
  Chapter9State,
  Chapter9DecisionChoice,
  RoiMetricTab,
} from '../../types/chapter9';
import {
  CHAPTER9_TITLE,
  CHAPTER9_SUBTITLE,
  CHAPTER9_PROJECT_NAME,
  CHAPTER9_LOCATION,
  CHAPTER9_CHARACTERS,
  ROI_TELEMETRY,
  computeFinancialModel,
  PRESENTATION_SLIDES,
  BOARDROOM_DIALOGUES,
  CHAPTER9_DECISION_OPTIONS,
  computeChapter9Score,
} from '../../data/chapter9Data';
import { requestChapterAIEvaluation } from '../../services/aiEvaluationService';
import { sound } from '../onboarding/SoundEngine';

interface ExecutiveRoiBoardroomAppProps {
  chapter9State: Chapter9State;
  onUpdateState: (updater: Partial<Chapter9State> | ((prev: Chapter9State) => Chapter9State)) => void;
  onOpenScorecard: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

export const ExecutiveRoiBoardroomApp: React.FC<ExecutiveRoiBoardroomAppProps> = ({
  chapter9State,
  onUpdateState,
  onOpenScorecard,
  onNotifyDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<RoiMetricTab>(chapter9State.selectedTab || 'telemetry');
  const [slideIndex, setSlideIndex] = useState<number>(chapter9State.currentSlideIndex || 0);
  const [hourlyRate, setHourlyRate] = useState<number>(chapter9State.hourlyCostRateINR || 650);
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'base' | 'aggressive'>(
    chapter9State.financialScenario || 'base'
  );
  const [reinvestmentStrategy, setReinvestmentStrategy] = useState<'casa_cross_sell' | 'headcount_cut'>(
    'casa_cross_sell'
  );
  const [selectedDecision, setSelectedDecision] = useState<Chapter9DecisionChoice | null>(
    chapter9State.decisionChosen || null
  );
  const [cfoDefenseChoice, setCfoDefenseChoice] = useState<'casa_cross_sell' | 'idle_time' | null>(
    chapter9State.cfoDefenseAnswer || null
  );

  // Corporate verification checklists
  const [telemetryAuditSigned, setTelemetryAuditSigned] = useState<boolean>(
    Boolean(chapter9State.telemetryVerified)
  );
  const [auditChecklist, setAuditChecklist] = useState({
    reconcileApm: Boolean(chapter9State.telemetryVerified),
    verifyInc0241Branch: Boolean(chapter9State.telemetryVerified),
    biometricMatch: Boolean(chapter9State.telemetryVerified),
  });

  const [deckEndorsed, setDeckEndorsed] = useState<boolean>(
    Boolean(chapter9State.slidesApproved)
  );
  const [deckChecklist, setDeckChecklist] = useState({
    monetaryTie: Boolean(chapter9State.slidesApproved),
    paybackSpeed: Boolean(chapter9State.slidesApproved),
    phase2Ask: Boolean(chapter9State.slidesApproved),
  });

  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Calculate dynamic financial outputs
  const financialModel = computeFinancialModel(hourlyRate, 5500000, ROI_TELEMETRY.manHoursSaved);

  const stage = chapter9State.currentStage;
  const isDecisionMade = Boolean(chapter9State.decisionChosen);

  // Handle Scenario Toggling
  const handleScenarioChange = (scenario: 'conservative' | 'base' | 'aggressive') => {
    setSelectedScenario(scenario);
    sound.playClick();
    if (scenario === 'conservative') {
      setHourlyRate(550);
    } else if (scenario === 'base') {
      setHourlyRate(650);
    } else {
      setHourlyRate(750);
    }
  };

  const handleTabChange = (tab: RoiMetricTab) => {
    sound.playClick();
    setActiveTab(tab);
    onUpdateState((prev) => {
      const updates: Partial<Chapter9State> = { selectedTab: tab };
      if (tab === 'telemetry') updates.telemetryReviewed = true;
      if (tab === 'financial') updates.financialModelReviewed = true;
      if (tab === 'slides') updates.slidesReviewed = true;
      return { ...prev, ...updates };
    });
  };

  const handleSlideChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < PRESENTATION_SLIDES.length) {
      sound.playClick();
      setSlideIndex(newIndex);
      onUpdateState({ currentSlideIndex: newIndex, slidesReviewed: true });
    }
  };

  // Corporate Module 1: Telemetry Sign-off
  const handleSignOffTelemetry = () => {
    sound.playSystemClearance();
    setTelemetryAuditSigned(true);
    setAuditChecklist({
      reconcileApm: true,
      verifyInc0241Branch: true,
      biometricMatch: true,
    });
    onUpdateState({
      telemetryReviewed: true,
      telemetryVerified: true,
    });
  };

  // Corporate Module 2: Commit Financial Model
  const handleCommitFinancialModel = () => {
    sound.playSystemClearance();
    onUpdateState({
      financialModelReviewed: true,
      financialModelCommitted: true,
      hourlyCostRateINR: hourlyRate,
      financialScenario: selectedScenario,
    });
    setActiveTab('slides');
  };

  // Corporate Module 3: Endorse Deck
  const handleEndorseDeck = () => {
    sound.playSystemClearance();
    setDeckEndorsed(true);
    setDeckChecklist({
      monetaryTie: true,
      paybackSpeed: true,
      phase2Ask: true,
    });
    onUpdateState({
      slidesReviewed: true,
      slidesApproved: true,
    });
    setActiveTab('governance');
  };

  // Corporate Module 4: Submit Boardroom Decision & Conclude
  const handleConfirmDecision = async () => {
    if (!selectedDecision || isSubmittingDecision) return;
    setIsSubmittingDecision(true);

    const isRecommended = selectedDecision === 'choice_b';
    if (isRecommended) {
      sound.playSystemClearance();
    } else {
      sound.playPenaltyPing();
    }

    const tempState: Chapter9State = {
      ...chapter9State,
      decisionChosen: selectedDecision,
      cfoDefenseAnswer: cfoDefenseChoice,
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      hourlyCostRateINR: hourlyRate,
      completed: true,
      telemetryVerified: true,
      financialModelCommitted: true,
      slidesApproved: true,
    };

    const initialScorecard = computeChapter9Score(tempState);

    onUpdateState({
      decisionChosen: selectedDecision,
      cfoDefenseAnswer: cfoDefenseChoice,
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      hourlyCostRateINR: hourlyRate,
      completed: true,
      scorecard: initialScorecard,
    });

    if (onNotifyDesktop) {
      onNotifyDesktop(
        isRecommended ? 'Boardroom Unanimous Approval!' : 'Boardroom Skepticism Notice',
        isRecommended
          ? 'Sophia Bennett and the CFO accepted the ROI model. Phase 2 budget ratified!'
          : 'The Board questioned the project business value due to lack of quantified ROI.'
      );
    }

    // Request Grok AI Evaluation in background
    setAiLoading(true);
    try {
      const aiResult = await requestChapterAIEvaluation(
        9,
        {
          decisionChosen: selectedDecision,
          decisionTitle: CHAPTER9_DECISION_OPTIONS[selectedDecision].title,
          cfoDefenseChoice,
          hourlyRateINR: hourlyRate,
          scenarioChosen: selectedScenario,
          grossSavingsINR: financialModel.totalSavingsINR,
          netBenefitINR: financialModel.netBenefitINR,
          netRoiPct: financialModel.roiPercentage,
          paybackPeriodMonths: financialModel.paybackPeriodMonths,
          cycleReductionPct: ROI_TELEMETRY.cycleReductionPct,
          manHoursSaved: ROI_TELEMETRY.manHoursSaved,
          telemetryVerified: true,
          financialModelCommitted: true,
          slidesApproved: true,
        },
        {
          totalScore: initialScorecard.totalScore,
          scheduleScore: initialScorecard.scheduleScore,
          riskScore: initialScorecard.riskScore,
          governanceScore: initialScorecard.governanceScore,
          efficiencyScore: initialScorecard.efficiencyScore,
          outcomeType: initialScorecard.outcomeType,
          outcomeTitle: initialScorecard.outcomeTitle,
          outcomeText: initialScorecard.outcomeText,
          evaluatorName: initialScorecard.evaluatorName,
          evaluatorRole: initialScorecard.evaluatorRole,
          executiveSummary: initialScorecard.executiveFeedback,
          whatYouDidWell: [initialScorecard.whatYouDidWell],
          whatToImprove: [initialScorecard.whatToImprove],
          leadershipCoaching: initialScorecard.keyTakeaway,
        }
      );

      if (aiResult) {
        onUpdateState((prev) => ({
          ...prev,
          scorecard: {
            ...prev.scorecard,
            totalScore: aiResult.totalScore ?? initialScorecard.totalScore,
            scheduleScore: aiResult.scheduleScore ?? initialScorecard.scheduleScore,
            riskScore: aiResult.riskScore ?? initialScorecard.riskScore,
            governanceScore: aiResult.governanceScore ?? initialScorecard.governanceScore,
            efficiencyScore: aiResult.efficiencyScore ?? initialScorecard.efficiencyScore,
            outcomeType: aiResult.outcomeType ?? initialScorecard.outcomeType,
            outcomeTitle: aiResult.outcomeTitle ?? initialScorecard.outcomeTitle,
            outcomeText: aiResult.outcomeText ?? initialScorecard.outcomeText,
            whatYouDidWell: (aiResult.strengths && aiResult.strengths[0]) || initialScorecard.whatYouDidWell,
            whatToImprove: (aiResult.improvements && aiResult.improvements[0]) || initialScorecard.whatToImprove,
            executiveFeedback: aiResult.executiveSummary || initialScorecard.executiveFeedback,
          },
        }));
      }
    } catch (e) {
      console.warn('AI evaluation error, deterministic scoring preserved:', e);
    } finally {
      setAiLoading(false);
      setIsSubmittingDecision(false);
    }
  };

  const activeDialogues =
    BOARDROOM_DIALOGUES[stage] || BOARDROOM_DIALOGUES.telemetry_briefing;

  return (
    <div className="h-full flex flex-col bg-[#070b14] text-slate-100 font-sans select-none overflow-hidden">
      {/* ── TOP EXECUTIVE APP BAR ── */}
      <header className="px-5 py-3 border-b border-slate-800 bg-[#0c1220]/95 backdrop-blur flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
                EXECUTIVE ROI VALIDATION DASHBOARD
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                PHASE 2 CAPITAL GATE
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{CHAPTER9_TITLE}</span>
              <span className="text-slate-400 text-xs font-normal">
                · {CHAPTER9_SUBTITLE}
              </span>
            </h1>
          </div>
        </div>

        {/* Corporate Status Indicators */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">23:45–25:00 Boardroom Phase</span>
          </div>

          {chapter9State.completed ? (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40 transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>View Executive Scorecard</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>CORPORATE WORK IN PROGRESS</span>
            </div>
          )}
        </div>
      </header>

      {/* ── 4 CORPORATE WORKSPACE TABS ── */}
      <nav className="px-6 py-2 border-b border-slate-800 bg-[#090e1a] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* TAB 1: TELEMETRY AUDIT */}
          <button
            onClick={() => handleTabChange('telemetry')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. Telemetry Audit</span>
            {telemetryAuditSigned && (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            )}
          </button>

          {/* TAB 2: FINANCIAL MODELING */}
          <button
            onClick={() => handleTabChange('financial')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border ${
              activeTab === 'financial'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>2. Financial Sensitivity Model</span>
            {chapter9State.financialModelCommitted && (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            )}
          </button>

          {/* TAB 3: PRESENTATION DECK */}
          <button
            onClick={() => handleTabChange('slides')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border ${
              activeTab === 'slides'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>3. Boardroom Presentation Deck</span>
            {deckEndorsed && (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            )}
          </button>

          {/* TAB 4: EXECUTIVE DEFENSE & VOTE */}
          <button
            onClick={() => handleTabChange('governance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border ${
              activeTab === 'governance'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>4. Boardroom Defense & Vote</span>
            {chapter9State.completed && (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            )}
          </button>
        </div>

        {/* Corporate Checklist Badge */}
        <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-2">
          <span>Validation Progress:</span>
          <span className="font-bold text-white">
            {[telemetryAuditSigned, chapter9State.financialModelCommitted, deckEndorsed, chapter9State.completed].filter(Boolean).length} / 4 Milestones
          </span>
        </div>
      </nav>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col justify-between max-w-6xl mx-auto w-full">
        {/* ── TAB 1: TELEMETRY & REGIONAL AUDIT ── */}
        {activeTab === 'telemetry' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/30">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Cycle Duration</div>
                <div className="text-xl font-black text-white mt-1">42% Drop</div>
                <div className="text-xs text-slate-400 mt-0.5">21.0 Days down to 12.2 Days</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-emerald-500/30">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Capacity Unlocked</div>
                <div className="text-xl font-black text-white mt-1">15,000 Hours</div>
                <div className="text-xs text-emerald-400 mt-0.5">Verified Operational Hours</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-amber-500/30">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Active Coverage</div>
                <div className="text-xl font-black text-white mt-1">80,000 Staff</div>
                <div className="text-xs text-slate-400 mt-0.5">4,800 Branch Network</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-indigo-500/30">
                <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Reliability SLA</div>
                <div className="text-xl font-black text-white mt-1">99.4% SLA</div>
                <div className="text-xs text-slate-400 mt-0.5">Zero 504 Timeout Outages</div>
              </div>
            </div>

            {/* Regional Pilot Breakdown Table */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Regional Pilot Deployment Telemetry (Reconciliation Dataset)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">DATASET: APM-CLUSTER-PROD-Q3</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <th className="py-2">Zone & Branch Cluster</th>
                      <th className="py-2">Active Users</th>
                      <th className="py-2">Cycle (Before → After)</th>
                      <th className="py-2">Hours Saved</th>
                      <th className="py-2">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2.5 font-semibold text-white">Mumbai Central Pilot Zone</td>
                      <td className="py-2.5">26,000 Officers</td>
                      <td className="py-2.5 text-emerald-400">21.0d → 11.8d (-44%)</td>
                      <td className="py-2.5 font-mono font-bold text-white">5,400 hrs</td>
                      <td className="py-2.5 text-emerald-400 font-mono">✓ 100% Reconciled</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-white">Pune Commercial Hub</td>
                      <td className="py-2.5">21,000 Officers</td>
                      <td className="py-2.5 text-emerald-400">20.5d → 12.1d (-41%)</td>
                      <td className="py-2.5 font-mono font-bold text-white">4,100 hrs</td>
                      <td className="py-2.5 text-emerald-400 font-mono">✓ 100% Reconciled</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-white">Bangalore Retail Branches</td>
                      <td className="py-2.5">18,000 Officers</td>
                      <td className="py-2.5 text-emerald-400">21.5d → 12.3d (-43%)</td>
                      <td className="py-2.5 font-mono font-bold text-white">3,200 hrs</td>
                      <td className="py-2.5 text-emerald-400 font-mono">✓ 100% Reconciled</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-white">Delhi NCR Outlets</td>
                      <td className="py-2.5">15,000 Officers</td>
                      <td className="py-2.5 text-emerald-400">21.0d → 12.8d (-39%)</td>
                      <td className="py-2.5 font-mono font-bold text-white">2,300 hrs</td>
                      <td className="py-2.5 text-emerald-400 font-mono">✓ 100% Reconciled</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Audit Verification Action */}
            <div className="p-5 rounded-2xl bg-[#121c2d] border border-cyan-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Senior PM Telemetry Sign-off Protocol</span>
                    {telemetryAuditSigned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                        AUDITED & SIGNED OFF
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Verify all 3 corporate criteria before translating operational capacity into the financial equation:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div
                  onClick={() => setAuditChecklist((prev) => ({ ...prev, reconcileApm: !prev.reconcileApm }))}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-2.5 cursor-pointer hover:border-cyan-500/40 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={auditChecklist.reconcileApm}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-cyan-500"
                  />
                  <div>
                    <div className="font-bold text-white">1. APM Latency Trace Match</div>
                    <div className="text-[11px] text-slate-400">
                      Confirmed submission endpoint response time holds at &lt;200ms without queue saturation.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setAuditChecklist((prev) => ({ ...prev, verifyInc0241Branch: !prev.verifyInc0241Branch }))}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-2.5 cursor-pointer hover:border-cyan-500/40 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={auditChecklist.verifyInc0241Branch}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-cyan-500"
                  />
                  <div>
                    <div className="font-bold text-white">2. Chapter 7 INC-0241 Validation</div>
                    <div className="text-[11px] text-slate-400">
                      Verified that all 12 branch officers affected by the memory leak now show 100% sync.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setAuditChecklist((prev) => ({ ...prev, biometricMatch: !prev.biometricMatch }))}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-2.5 cursor-pointer hover:border-cyan-500/40 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={auditChecklist.biometricMatch}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-cyan-500"
                  />
                  <div>
                    <div className="font-bold text-white">3. Biometric Timestamp Audit</div>
                    <div className="text-[11px] text-slate-400">
                      15,000 hours verified against actual biometric branch clock-ins and appraisal reviews.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleSignOffTelemetry}
                  disabled={telemetryAuditSigned}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                    telemetryAuditSigned
                      ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{telemetryAuditSigned ? 'Telemetry Verified & Approved' : 'Sign-off Telemetry & Proceed to Financial Model'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: FINANCIAL SENSITIVITY MODELING ── */}
        {activeTab === 'financial' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Phase 1 Investment Structure & Assumptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Phase 1 Capital Expenditure Breakdown */}
              <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Phase 1 Capital Outlay Breakdown
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-300">Total: ₹55.0 Lakhs</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">1. Core Microservice Architecture & DB Tuning</span>
                    <span className="font-mono font-bold text-white">₹32,00,000 (58%)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">2. Change Management & Regional Field Training</span>
                    <span className="font-mono font-bold text-white">₹14,00,000 (25%)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">3. SaaS Infrastructure, Testing & Security SLAs</span>
                    <span className="font-mono font-bold text-white">₹9,00,000 (17%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-200">Corporate Finance Directive:</span> Any proposal for Phase 2 funding (₹85 Lakhs) must demonstrate payback on Phase 1 within &lt;12 months.
                </div>
              </div>

              {/* Right: Interactive Scenario Selector */}
              <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Workforce Rate Sensitivity Levers
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">ACTIVE: ₹{hourlyRate} / HR</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => handleScenarioChange('conservative')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedScenario === 'conservative'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">Conservative</div>
                    <div className="text-sm font-black mt-1">₹550 / hr</div>
                    <div className="text-[9px] mt-0.5 opacity-80">Jr Branch Staff</div>
                  </button>

                  <button
                    onClick={() => handleScenarioChange('base')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedScenario === 'base'
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-bold ring-1 ring-emerald-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">Base (Recommended)</div>
                    <div className="text-sm font-black mt-1">₹650 / hr</div>
                    <div className="text-[9px] mt-0.5 opacity-80">Blended ICICI Rate</div>
                  </button>

                  <button
                    onClick={() => handleScenarioChange('aggressive')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedScenario === 'aggressive'
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">Aggressive</div>
                    <div className="text-sm font-black mt-1">₹750 / hr</div>
                    <div className="text-[9px] mt-0.5 opacity-80">Loaded Cost Rate</div>
                  </button>
                </div>

                {/* Reinvestment Strategy Choice */}
                <div className="pt-1 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">
                    Business Value Translation Rationale:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setReinvestmentStrategy('casa_cross_sell')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        reinvestmentStrategy === 'casa_cross_sell'
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-[11px]">✓ Capacity Reallocation</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Redirect 15,000 hrs to CASA customer sales.</div>
                    </button>

                    <button
                      onClick={() => setReinvestmentStrategy('headcount_cut')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        reinvestmentStrategy === 'headcount_cut'
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-[11px]">Headcount Reduction</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Attempt direct salary cuts (Causes union pushback).</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Calculated Financial KPIs */}
            <div className="p-5 rounded-2xl bg-[#111e2a] border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Calculated Financial Model Outputs (15,000 hrs × ₹{hourlyRate}/hr)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  Net Benefit: +₹{(financialModel.netBenefitINR / 100000).toFixed(1)} Lakhs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Gross Annual Capacity</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">
                    ₹{(financialModel.totalSavingsINR / 100000).toFixed(1)} Lakhs
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">15,000 hrs × ₹{hourlyRate}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Net Financial Benefit</div>
                  <div className="text-lg font-black text-white mt-1">
                    ₹{(financialModel.netBenefitINR / 100000).toFixed(1)} Lakhs
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">After ₹55.0L Investment</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Net Return on Investment</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">
                    +{financialModel.roiPercentage.toFixed(1)}% ROI
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Exceeds 25% Hurdle</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Payback Period</div>
                  <div className="text-lg font-black text-cyan-300 mt-1">
                    {financialModel.paybackPeriodMonths.toFixed(1)} Months
                  </div>
                  <div className="text-[10px] text-cyan-300 mt-0.5">Full Capital Recovery</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCommitFinancialModel}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Commit Financial Equation to Deck & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: BOARDROOM PRESENTATION DECK ASSEMBLY ── */}
        {activeTab === 'slides' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Slide Navigation Header */}
            <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-xs">
                  {slideIndex + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {PRESENTATION_SLIDES[slideIndex].title}
                  </div>
                  <div className="text-[11px] text-purple-300 font-mono">
                    {PRESENTATION_SLIDES[slideIndex].subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSlideChange(slideIndex - 1)}
                  disabled={slideIndex === 0}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400 px-2">
                  {slideIndex + 1} of {PRESENTATION_SLIDES.length}
                </span>
                <button
                  onClick={() => handleSlideChange(slideIndex + 1)}
                  disabled={slideIndex === PRESENTATION_SLIDES.length - 1}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Content Box */}
            <div className="p-6 rounded-2xl bg-[#111628] border border-purple-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  CATEGORY: {PRESENTATION_SLIDES[slideIndex].category} · EXECUTIVE BRIEFING DECK
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-200">
                  KEY KPI: {PRESENTATION_SLIDES[slideIndex].keyStat}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-black text-white">
                  {PRESENTATION_SLIDES[slideIndex].title}
                </h3>
                <div className="space-y-2">
                  {PRESENTATION_SLIDES[slideIndex].bulletPoints.map((bp, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs sm:text-[13px] text-slate-200">
                      <span className="text-purple-400 font-bold">▪</span>
                      <span>{bp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presenter Cue */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
                <span className="font-bold text-white">Jane's Presenter Cue: </span>
                {PRESENTATION_SLIDES[slideIndex].takeaway}
              </div>
            </div>

            {/* Deck Endorsement Checklist */}
            <div className="p-5 rounded-2xl bg-[#141b2c] border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white">
                Executive Presentation Endorsement Checklist:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div
                  onClick={() => setDeckChecklist((prev) => ({ ...prev, monetaryTie: !prev.monetaryTie }))}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-2 cursor-pointer hover:border-purple-500/40"
                >
                  <input type="checkbox" checked={deckChecklist.monetaryTie} onChange={() => {}} className="mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Monetary Capacity Tie</div>
                    <div className="text-[11px] text-slate-400">15,000 hrs converted to ₹97.5L savings.</div>
                  </div>
                </div>

                <div
                  onClick={() => setDeckChecklist((prev) => ({ ...prev, paybackSpeed: !prev.paybackSpeed }))}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-2 cursor-pointer hover:border-purple-500/40"
                >
                  <input type="checkbox" checked={deckChecklist.paybackSpeed} onChange={() => {}} className="mt-0.5" />
                  <div>
                    <div className="font-bold text-white">6.8-Month Payback Proof</div>
                    <div className="text-[11px] text-slate-400">Capital recovery proven before Q4 audit.</div>
                  </div>
                </div>

                <div
                  onClick={() => setDeckChecklist((prev) => ({ ...prev, phase2Ask: !prev.phase2Ask }))}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-2 cursor-pointer hover:border-purple-500/40"
                >
                  <input type="checkbox" checked={deckChecklist.phase2Ask} onChange={() => {}} className="mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Phase 2 Scope Proposal</div>
                    <div className="text-[11px] text-slate-400">₹85L capital ask for 32k corporate staff.</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleEndorseDeck}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Presentation className="w-4 h-4" />
                  <span>Approve Deck & Enter Steering Committee</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: EXECUTIVE DEFENSE & STEERING COMMITTEE VOTE ── */}
        {activeTab === 'governance' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Context Notice */}
            <div className="p-4 rounded-2xl bg-[#141b2c] border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Executive Steering Committee Session (24:20–25:00)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sophia Bennett (Head of HR), the CFO, and the Managing Director are listening to Jane's defense.
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
                CAPITAL RATIFICATION GATE
              </span>
            </div>

            {/* PART A: THE STRATEGIC DECISION SCREEN */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white">
                Part A: The Board is waiting for evidence of business impact. What should Jane do?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CHOICE A */}
                <div
                  onClick={() => !isDecisionMade && setSelectedDecision('choice_a')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    selectedDecision === 'choice_a'
                      ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/50'
                      : 'bg-[#0d1322] border-slate-700 hover:border-rose-500/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                        {CHAPTER9_DECISION_OPTIONS.choice_a.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        Poor Decision
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs leading-relaxed">
                      "Skip formal ROI tracking. Assume leadership already knows the project was successful and rely on informal word-of-mouth."
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-rose-400 flex justify-between">
                    <span>Governance: -20 pts</span>
                    <span>Trust & Risk: -15 pts</span>
                  </div>
                </div>

                {/* CHOICE B */}
                <div
                  onClick={() => !isDecisionMade && setSelectedDecision('choice_b')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    selectedDecision === 'choice_b'
                      ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-[#0d1829] border-slate-700 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {CHAPTER9_DECISION_OPTIONS.choice_b.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Recommended
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs leading-relaxed">
                      "Deliver a detailed ROI and business value impact presentation to the executive steering committee, proving 42% cycle reduction, 15,000 hours saved, and ₹97.5L savings (+77.3% ROI)."
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400 font-bold flex justify-between">
                    <span>Schedule: +15 | Gov: +25</span>
                    <span>Trust & Risk: +20 pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PART B: REAL-WORLD CORPORATE CFO Q&A DEFENSE */}
            <div className="p-5 rounded-2xl bg-[#101726] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Part B: CFO Direct Challenge (Boardroom Q&A)
                </span>
                <span className="text-[10px] font-mono text-slate-400">FINANCE COMMITTEE SCRUTINY</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs italic text-slate-200">
                "Ms. Cooper, 15,000 man-hours saved looks great in a deck. But how does management verify that branch officers converted those freed-up hours into tangible bank value rather than idle downtime?"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div
                  onClick={() => !isDecisionMade && setCfoDefenseChoice('idle_time')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    cfoDefenseChoice === 'idle_time'
                      ? 'bg-rose-950/30 border-rose-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">Option 1: Informal Employee Feedback</div>
                  <div className="text-[11px] mt-0.5">
                    "We can't micromanage officers' time, but our internal surveys show employee happiness is up."
                  </div>
                </div>

                <div
                  onClick={() => !isDecisionMade && setCfoDefenseChoice('casa_cross_sell')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    cfoDefenseChoice === 'casa_cross_sell'
                      ? 'bg-emerald-950/30 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-emerald-300">Option 2: CASA Reinvestment Pipeline (Recommended)</div>
                  <div className="text-[11px] mt-0.5">
                    "Freed-up officer hours were strategically redirected into CASA customer sales, generating a +14% lift in regional cross-sell conversions."
                  </div>
                </div>
              </div>
            </div>

            {/* PART C: BOARDROOM VOTE RATIFICATION */}
            <div className="p-5 rounded-2xl bg-[#0f1d2a] border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Submit Boardroom Presentation & Execute Committee Ratification
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Your presentation will be evaluated against corporate PM leadership principles and the hardcoded scoring rubric.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {isDecisionMade ? (
                  <div className="text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Boardroom presentation delivered and evaluated!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmDecision}
                    disabled={!selectedDecision || isSubmittingDecision}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{isSubmittingDecision ? 'Submitting to Board...' : 'Deliver Boardroom Presentation & Ratify Phase 2'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {chapter9State.completed && (
                  <button
                    onClick={onOpenScorecard}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer border border-slate-700"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>View Chapter 9 Scorecard</span>
                  </button>
                )}
              </div>

              {/* AI Evaluator Status */}
              {aiLoading && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span>Grok AI Evaluator synthesizing Sophia Bennett's boardroom assessment...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
