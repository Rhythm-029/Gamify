import React, { useState } from 'react';
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
  FileText,
  Target,
  Zap,
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

  // Tab 1: Regional Audit & Anomaly Resolution
  const [selectedRegion, setSelectedRegion] = useState<'mumbai' | 'pune' | 'bangalore' | 'delhi'>('delhi');
  const [auditResolution, setAuditResolution] = useState<'deduct_delhi' | 'keep_all' | 'discard_delhi'>(
    chapter9State.auditResolution || 'deduct_delhi'
  );
  const [auditChecklist, setAuditChecklist] = useState({
    reconcileApm: Boolean(chapter9State.telemetryVerified),
    verifyInc0241Branch: Boolean(chapter9State.telemetryVerified),
    biometricMatch: Boolean(chapter9State.telemetryVerified),
  });
  const [telemetryAuditSigned, setTelemetryAuditSigned] = useState<boolean>(
    Boolean(chapter9State.telemetryVerified)
  );

  // Computed audited hours based on audit resolution
  const certifiedHours =
    auditResolution === 'deduct_delhi'
      ? 14150 // 15,000 - 850 unverified manual hours
      : auditResolution === 'discard_delhi'
      ? 12700 // 15,000 - 2,300 (entire Delhi cluster dropped)
      : 15000; // raw unadjusted hours

  // Tab 2: Financial Sensitivity & Monetization Strategy
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'base' | 'aggressive'>(
    chapter9State.financialScenario || 'base'
  );
  const [hourlyRate, setHourlyRate] = useState<number>(chapter9State.hourlyCostRateINR || 650);
  const [reinvestmentStrategy, setReinvestmentStrategy] = useState<'casa_cross_sell' | 'headcount_cut' | 'compliance_surge'>(
    chapter9State.reinvestmentStrategy || 'casa_cross_sell'
  );

  // Tab 3: Presentation Deck & Framing
  const [executiveFraming, setExecutiveFraming] = useState<'commercial_value' | 'technical_latency' | 'headcount_reduction'>(
    chapter9State.executiveFraming || 'commercial_value'
  );
  const [deckEndorsed, setDeckEndorsed] = useState<boolean>(Boolean(chapter9State.slidesApproved));
  const [deckChecklist, setDeckChecklist] = useState({
    monetaryTie: Boolean(chapter9State.slidesApproved),
    paybackSpeed: Boolean(chapter9State.slidesApproved),
    phase2Ask: Boolean(chapter9State.slidesApproved),
  });

  // Tab 4: Boardroom Defense & Decision
  const [cfoChallengeAnswer, setCfoChallengeAnswer] = useState<'revenue_tied' | 'strict_timesheets' | 'unquantified'>(
    chapter9State.cfoChallengeAnswer || 'revenue_tied'
  );
  const [cooChallengeAnswer, setCooChallengeAnswer] = useState<'canary_sharding' | 'big_bang' | 'delay_months'>(
    chapter9State.cooChallengeAnswer || 'canary_sharding'
  );
  const [selectedDecision, setSelectedDecision] = useState<Chapter9DecisionChoice | null>(
    chapter9State.decisionChosen || 'choice_b'
  );

  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Calculate dynamic financial outputs based on audited hours and rate
  const financialModel = computeFinancialModel(hourlyRate, 5500000, certifiedHours);

  // Handle Tab Switch
  const handleTabChange = (tab: RoiMetricTab) => {
    sound.playClick();
    setActiveTab(tab);
    onUpdateState({ selectedTab: tab });
  };

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

  // Step 1: Sign off Telemetry & Proceed
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
      auditResolution,
      auditedHours: certifiedHours,
    });
    setActiveTab('financial');
  };

  // Step 2: Commit Financial Model & Proceed
  const handleCommitFinancialModel = () => {
    sound.playSystemClearance();
    onUpdateState({
      financialModelReviewed: true,
      financialModelCommitted: true,
      hourlyCostRateINR: hourlyRate,
      financialScenario: selectedScenario,
      reinvestmentStrategy,
      auditedHours: certifiedHours,
    });
    setActiveTab('slides');
  };

  // Step 3: Endorse Deck & Proceed
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
      executiveFraming,
    });
    setActiveTab('governance');
  };

  // Step 4: Ratify Boardroom Decision & Finalize Chapter 9
  const handleRatifyDecision = async () => {
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
      cfoDefenseAnswer: cfoChallengeAnswer === 'revenue_tied' ? 'casa_cross_sell' : 'idle_time',
      hourlyCostRateINR: hourlyRate,
      telemetryVerified: true,
      financialModelCommitted: true,
      slidesApproved: true,
      completed: true,
      auditResolution,
      auditedHours: certifiedHours,
      reinvestmentStrategy,
      executiveFraming,
      cfoChallengeAnswer,
      cooChallengeAnswer,
    };

    const initialScorecard = computeChapter9Score(tempState);

    // Apply corporate bonus points for rigorous audit and boardroom defense
    if (auditResolution === 'deduct_delhi') {
      initialScorecard.governanceScore = Math.min(100, initialScorecard.governanceScore + 5);
      initialScorecard.totalScore = Math.min(100, initialScorecard.totalScore + 2);
    }
    if (cfoChallengeAnswer === 'revenue_tied') {
      initialScorecard.efficiencyScore = Math.min(100, initialScorecard.efficiencyScore + 5);
      initialScorecard.totalScore = Math.min(100, initialScorecard.totalScore + 2);
    }
    if (cooChallengeAnswer === 'canary_sharding') {
      initialScorecard.riskScore = Math.min(100, initialScorecard.riskScore + 5);
      initialScorecard.totalScore = Math.min(100, initialScorecard.totalScore + 2);
    }

    onUpdateState({
      decisionChosen: selectedDecision,
      cfoDefenseAnswer: cfoChallengeAnswer === 'revenue_tied' ? 'casa_cross_sell' : 'idle_time',
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      hourlyCostRateINR: hourlyRate,
      completed: true,
      scorecard: initialScorecard,
      auditResolution,
      auditedHours: certifiedHours,
      reinvestmentStrategy,
      executiveFraming,
      cfoChallengeAnswer,
      cooChallengeAnswer,
    });

    if (onNotifyDesktop) {
      onNotifyDesktop(
        isRecommended ? 'Executive Boardroom Unanimous Approval!' : 'Boardroom Skepticism Notice',
        isRecommended
          ? 'Sophia Bennett, CFO Rajiv Mehra, and the Board ratified Phase 2 budget (+₹1.2 Crore authorized)!'
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
          cfoDefenseChoice: cfoChallengeAnswer === 'revenue_tied' ? 'casa_cross_sell' : 'idle_time',
          hourlyRateINR: hourlyRate,
          scenarioChosen: selectedScenario,
          grossSavingsINR: financialModel.totalSavingsINR,
          netBenefitINR: financialModel.netBenefitINR,
          netRoiPct: financialModel.roiPercentage,
          paybackPeriodMonths: financialModel.paybackPeriodMonths,
          cycleReductionPct: ROI_TELEMETRY.cycleReductionPct,
          manHoursSaved: certifiedHours,
          telemetryVerified: true,
          financialModelCommitted: true,
          slidesApproved: true,
          auditResolution,
          reinvestmentStrategy,
          executiveFraming,
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
          evaluatorName: 'Sophia Bennett & Rajiv Mehra (CFO)',
          evaluatorRole: 'Executive Steering Committee · ICICI Bank',
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
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40 transition-all animate-pulse"
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

      {/* ── 4 CORPORATE WORKSPACE TABS (FREELY CLICKABLE) ── */}
      <nav className="px-6 py-2 border-b border-slate-800 bg-[#090e1a] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* TAB 1 */}
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

          {/* TAB 2 */}
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

          {/* TAB 3 */}
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

          {/* TAB 4 */}
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

        <div className="text-[11px] font-mono text-slate-400">
          Validation Progress:{' '}
          <span className="text-emerald-400 font-bold">
            {[telemetryAuditSigned, chapter9State.financialModelCommitted, deckEndorsed, chapter9State.completed].filter(Boolean).length} / 4
          </span>{' '}
          Milestones
        </div>
      </nav>

      {/* ── WORKSPACE CONTENT AREA ── */}
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
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Certified Capacity</div>
                <div className="text-xl font-black text-white mt-1">{certifiedHours.toLocaleString()} Hours</div>
                <div className="text-xs text-emerald-400 mt-0.5">
                  {auditResolution === 'deduct_delhi' ? 'Audited (Delhi Override Deducted)' : 'Operational Hours Baseline'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-amber-500/30">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Active Coverage</div>
                <div className="text-xl font-black text-white mt-1">80,000 Staff</div>
                <div className="text-xs text-slate-400 mt-0.5">4,800 Branch Network Target</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-indigo-500/30">
                <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Reliability SLA</div>
                <div className="text-xl font-black text-white mt-1">99.4% SLA</div>
                <div className="text-xs text-slate-400 mt-0.5">Zero 504 Timeout Outages</div>
              </div>
            </div>

            {/* Regional Pilot Breakdown Table with Interactive Inspector */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Regional Pilot Deployment Telemetry (Reconciliation Dataset)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">SELECT CLUSTER TO INSPECT AUDIT LOGS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                {[
                  { id: 'mumbai', name: 'Mumbai Central HQ', officers: '26,000', saved: '5,400 hrs', drop: '-44%', flag: 'Audited & Clean' },
                  { id: 'pune', name: 'Pune Tech Cluster', officers: '21,000', saved: '4,100 hrs', drop: '-41%', flag: 'Memory Leak Resolved' },
                  { id: 'bangalore', name: 'Bangalore Retail', officers: '18,000', saved: '3,200 hrs', drop: '-43%', flag: 'Biometric 100%' },
                  { id: 'delhi', name: 'Delhi NCR Outlets', officers: '15,000', saved: '2,300 hrs', drop: '-39%', flag: '850 Hr Override Anomaly' },
                ].map((cluster) => (
                  <button
                    key={cluster.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedRegion(cluster.id as any);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRegion === cluster.id
                        ? 'bg-cyan-500/10 border-cyan-500/60 shadow-md'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{cluster.name}</span>
                      {cluster.id === 'delhi' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ALERT
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
                      <span>{cluster.officers} Officers</span>
                      <span className="text-emerald-400 font-mono font-bold">{cluster.saved}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500 flex justify-between">
                      <span>Cycle {cluster.drop}</span>
                      <span className="text-cyan-400 font-mono">{cluster.flag}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Cluster Detail Telemetry Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mt-3 text-xs space-y-2">
                {selectedRegion === 'mumbai' && (
                  <div>
                    <span className="font-bold text-cyan-300">Mumbai Central Cluster Telemetry:</span> 26,000 branch officers completed annual reviews in 11.8 days (down from 21.0d). Cryptographic SHA-256 biometric attendance logs verified across 340 branches with zero manual overrides.
                  </div>
                )}
                {selectedRegion === 'pune' && (
                  <div>
                    <span className="font-bold text-cyan-300">Pune Tech Hub Telemetry:</span> 21,000 officers monitored. Chapter 7 memory leak fix verified: all 12 formerly affected branches show zero 504 timeouts and sub-200ms latency under 9:30 AM morning clock-in load.
                  </div>
                )}
                {selectedRegion === 'bangalore' && (
                  <div>
                    <span className="font-bold text-cyan-300">Bangalore Retail Telemetry:</span> 18,000 branch staff. High digital adoption: 96.8% of clock-ins submitted through mobile app without teller queuing.
                  </div>
                )}
                {selectedRegion === 'delhi' && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>INTERNAL AUDIT EXCEPTION FLAG — DELHI NCR REGION:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Group Internal Audit (Mr. K. Sharma) discovered that during a fiber line disruption on Oct 14, Delhi NCR branch managers were permitted to bulk-override attendance for contract employees. This accounts for <span className="text-amber-300 font-bold">850 manual hours</span> that lack cryptographic biometric timestamps. If submitted without adjustment, external auditors (PwC) will challenge the ROI validity before the Board.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BRAIN TASK: AUDIT RESOLUTION SELECTOR */}
            <div className="p-5 rounded-2xl bg-[#121c2d] border border-cyan-500/40 space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Senior PM Analytical Challenge: Delhi Audit Discrepancy Resolution
                  </h4>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  How will you treat the 850 unverified Delhi manual hours before presenting the financial baseline to the Executive Committee?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Approach A */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setAuditResolution('deduct_delhi');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    auditResolution === 'deduct_delhi'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Deduct 850 Manual Hours</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Approach A
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Certify a baseline of <span className="text-white font-bold">14,150 hours</span>. Disclose the fiber outage and exclude unverified contractor entries from the verified equation.
                    </p>
                  </div>
                </div>

                {/* Approach B */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setAuditResolution('keep_all');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    auditResolution === 'keep_all'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Include Full 15,000 Hours</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Approach B
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Count all raw Delhi hours without adjustment to maintain the maximum headline savings figure for the Board.
                    </p>
                  </div>
                </div>

                {/* Approach C */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setAuditResolution('discard_delhi');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    auditResolution === 'discard_delhi'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Nullify Delhi NCR (-2,300 hrs)</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Approach C
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Discard all Delhi hours entirely, reducing verified hours to 12,700 to eliminate any potential data dispute.
                    </p>
                  </div>
                </div>
              </div>

              {/* Protocol Checkboxes */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase font-mono mb-2">
                  Pre-Flight Verification Protocol:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div
                    onClick={() => setAuditChecklist((prev) => ({ ...prev, reconcileApm: !prev.reconcileApm }))}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-2.5 cursor-pointer hover:border-cyan-500/40 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={auditChecklist.reconcileApm}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-cyan-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white">1. APM Latency Trace Match</div>
                      <div className="text-[11px] text-slate-400">Response time &lt;200ms with zero message loss.</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setAuditChecklist((prev) => ({ ...prev, verifyInc0241Branch: !prev.verifyInc0241Branch }))}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-2.5 cursor-pointer hover:border-cyan-500/40 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={auditChecklist.verifyInc0241Branch}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-cyan-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white">2. INC-0241 Validation</div>
                      <div className="text-[11px] text-slate-400">Memory leak hotfix verified on all 12 branches.</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setAuditChecklist((prev) => ({ ...prev, biometricMatch: !prev.biometricMatch }))}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-2.5 cursor-pointer hover:border-cyan-500/40 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={auditChecklist.biometricMatch}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-cyan-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white">3. Biometric SHA-256 Audit</div>
                      <div className="text-[11px] text-slate-400">{certifiedHours.toLocaleString()} verified hours locked.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: PROCEED TO FINANCIAL SENSITIVITY (ALWAYS CLICKABLE!) */}
              <div className="pt-2 flex justify-between items-center">
                <div className="text-xs text-slate-400">
                  Certified Baseline: <span className="text-emerald-400 font-bold font-mono">{certifiedHours.toLocaleString()} Hours</span> ready for monetary calibration.
                </div>
                <button
                  onClick={handleSignOffTelemetry}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proceed to Financial Sensitivity Model</span>
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
            {/* Phase 1 Investment & Labor Calibration */}
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
                    <span className="font-mono text-white">₹22.0 L</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">2. Attendance Sync Biometric Adapters</span>
                    <span className="font-mono text-white">₹18.0 L</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">3. Infrastructure Load Testing & Telemetry</span>
                    <span className="font-mono text-white">₹15.0 L</span>
                  </div>
                </div>
              </div>

              {/* Right: Labor Hourly Cost Sensitivity Selector */}
              <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Hourly Cost Sensitivity Assumptions
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">Active: ₹{hourlyRate}/hr</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleScenarioChange('conservative')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedScenario === 'conservative'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase font-bold">Conservative</div>
                    <div className="text-sm font-bold mt-1">₹550 / hr</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Junior Tellers Only</div>
                  </button>

                  <button
                    onClick={() => handleScenarioChange('base')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedScenario === 'base'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase font-bold">Base Case</div>
                    <div className="text-sm font-bold mt-1">₹650 / hr</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">ICICI Benchmark</div>
                  </button>

                  <button
                    onClick={() => handleScenarioChange('aggressive')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedScenario === 'aggressive'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase font-bold">Aggressive</div>
                    <div className="text-sm font-bold mt-1">₹750 / hr</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Loaded Cost + Overhead</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Financial Outputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Gross Capacity Value</div>
                <div className="text-xl font-black text-white mt-1">
                  ₹{(financialModel.totalSavingsINR / 100000).toFixed(1)} Lakhs
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{certifiedHours.toLocaleString()} hrs @ ₹{hourlyRate}/hr</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Net Financial Benefit</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  ₹{(financialModel.netBenefitINR / 100000).toFixed(1)} Lakhs
                </div>
                <div className="text-xs text-emerald-400/80 mt-0.5">Year 1 Net (After ₹55L CapEx)</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Net Return on Investment</div>
                <div className="text-xl font-black text-cyan-400 mt-1">
                  +{financialModel.roiPercentage}%
                </div>
                <div className="text-xs text-slate-400 mt-0.5">ROI = (Net Benefit / CapEx)</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Capital Payback Speed</div>
                <div className="text-xl font-black text-amber-300 mt-1">
                  {financialModel.paybackPeriodMonths} Months
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Full ₹55L Amortized</div>
              </div>
            </div>

            {/* BRAIN TASK: CFO CAPACITY MONETIZATION PLAN */}
            <div className="p-5 rounded-2xl bg-[#121c2d] border border-emerald-500/40 space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Senior PM Analytical Challenge: Strategic Capacity Monetization Plan
                  </h4>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  CFO Rajiv Mehra's condition: <span className="italic">"Hours saved are an accounting illusion unless converted into top-line revenue or cost deflation."</span> How will you allocate the {certifiedHours.toLocaleString()} freed branch hours?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Strategy A: CASA Cross-sell */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setReinvestmentStrategy('casa_cross_sell');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    reinvestmentStrategy === 'casa_cross_sell'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">CASA Retail Sales Outreach</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Strategy A
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Reallocate 70% of freed hours to customer relationship managers for CASA deposit generation (+14% conversion) and 30% to KYC verification.
                    </p>
                  </div>
                </div>

                {/* Strategy B: Contractor Cuts */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setReinvestmentStrategy('headcount_cut');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    reinvestmentStrategy === 'headcount_cut'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Contractor Agency Headcount Cut</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Strategy B
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Directly terminate temporary branch clerk agency contracts to realize immediate cash OpEx savings across regional hubs.
                    </p>
                  </div>
                </div>

                {/* Strategy C: Compliance Surge */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setReinvestmentStrategy('compliance_surge');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    reinvestmentStrategy === 'compliance_surge'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Regulatory Compliance Surge</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Strategy C
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Allocate 100% of freed capacity to clearing the statutory Anti-Money Laundering & KYC branch documentation backlog.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION: NAVIGATION */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Telemetry Audit</span>
                </button>

                <button
                  onClick={handleCommitFinancialModel}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit Model & Proceed to Presentation Deck</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: BOARDROOM PRESENTATION DECK ── */}
        {activeTab === 'slides' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Slide Preview & Carousel */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Presentation className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Executive Boardroom Deck (4 Master Slides)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-purple-300">Slide {slideIndex + 1} of {PRESENTATION_SLIDES.length}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
                      disabled={slideIndex === 0}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSlideIndex((prev) => Math.min(PRESENTATION_SLIDES.length - 1, prev + 1))}
                      disabled={slideIndex === PRESENTATION_SLIDES.length - 1}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slide Display */}
              {PRESENTATION_SLIDES[slideIndex] && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#121929] to-[#0a0f1d] border border-purple-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                        {PRESENTATION_SLIDES[slideIndex].category} SECTION
                      </span>
                      <h2 className="text-lg font-black text-white mt-0.5">
                        {PRESENTATION_SLIDES[slideIndex].title}
                      </h2>
                      <div className="text-xs text-slate-400">
                        {PRESENTATION_SLIDES[slideIndex].subtitle}
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-sm font-bold">
                      {PRESENTATION_SLIDES[slideIndex].keyStat}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    {PRESENTATION_SLIDES[slideIndex].bulletPoints.map((bullet, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                    <span className="font-bold text-white">Executive Takeaway:</span> {PRESENTATION_SLIDES[slideIndex].takeaway}
                  </div>
                </div>
              )}
            </div>

            {/* BRAIN TASK: EXECUTIVE NARRATIVE FRAMING */}
            <div className="p-5 rounded-2xl bg-[#121c2d] border border-purple-500/40 space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Senior PM Analytical Challenge: Strategic Boardroom Narrative Hook
                  </h4>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  How should Jane frame the opening presentation to win immediate alignment from both the CEO and the CFO?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Framing 1 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setExecutiveFraming('commercial_value');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    executiveFraming === 'commercial_value'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Commercial Value Creation</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Framing 1
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Position Amigo as a commercial enablement engine converting operational drag into frontline CASA sales capacity and net value.
                    </p>
                  </div>
                </div>

                {/* Framing 2 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setExecutiveFraming('technical_latency');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    executiveFraming === 'technical_latency'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Technical Infrastructure</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Framing 2
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Lead with sub-200ms transaction latency, Kafka queue telemetry, and microservice container resilience.
                    </p>
                  </div>
                </div>

                {/* Framing 3 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setExecutiveFraming('headcount_reduction');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    executiveFraming === 'headcount_reduction'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Headcount & Agency Cost Cuts</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Framing 3
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Lead with eliminating branch staffing redundancies and replacing manual reviewers with automated validation rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION: NAVIGATION */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setActiveTab('financial')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Financial Sensitivity</span>
                </button>

                <button
                  onClick={handleEndorseDeck}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Endorse Deck & Enter Boardroom Defense</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: LIVE BOARDROOM DEFENSE & EXECUTIVE VOTE ── */}
        {activeTab === 'governance' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Live Boardroom Atmosphere & Stakeholders */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Executive Steering Committee — Live Defense Session
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                  Quorum Present · Phase 2 Capital Gate
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Sophia */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
                  <img
                    src="/character/Sophia_bennett/SophiaDP.png"
                    alt="Sophia"
                    className="w-10 h-10 rounded-full border border-emerald-500/40 object-cover"
                  />
                  <div>
                    <div className="font-bold text-white">Sophia Bennett</div>
                    <div className="text-[11px] text-emerald-400">Head of HR Operations</div>
                    <div className="text-[10px] text-slate-400">Sponsor · Endorsing ROI Model</div>
                  </div>
                </div>

                {/* CFO Rajiv Mehra */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 font-mono">
                    RM
                  </div>
                  <div>
                    <div className="font-bold text-white">Rajiv Mehra</div>
                    <div className="text-[11px] text-amber-400">Chief Financial Officer</div>
                    <div className="text-[10px] text-slate-400">Challenging Realized P&L Impact</div>
                  </div>
                </div>

                {/* COO Vikram Malhotra */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 font-mono">
                    VM
                  </div>
                  <div>
                    <div className="font-bold text-white">Vikram Malhotra</div>
                    <div className="text-[11px] text-cyan-400">Chief Operating Officer</div>
                    <div className="text-[10px] text-slate-400">Challenging 4,800 Branch Scale Risk</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CFO CHALLENGE 1: FINANCIAL REALIZATION */}
            <div className="p-5 rounded-2xl bg-[#121c2d] border border-amber-500/40 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  ROUND 1 — CFO RAJIV MEHRA DIRECT CROSS-EXAMINATION:
                </h4>
              </div>
              <p className="text-xs text-slate-200 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                "Jane, operational hours saved is a vanity metric unless it converts into real bank balance sheet value. If 14,150 hours are saved across branch officers, how do you prove they aren't just drinking tea in the staff room?"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div
                  onClick={() => {
                    sound.playClick();
                    setCfoChallengeAnswer('revenue_tied');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    cfoChallengeAnswer === 'revenue_tied'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white">A. CASA Sales Quotas & Dashboards</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    The {certifiedHours.toLocaleString()} hours are formally reallocated into frontline CASA sales outreach with branch manager incentive tracking.
                  </div>
                </div>

                <div
                  onClick={() => {
                    sound.playClick();
                    setCfoChallengeAnswer('strict_timesheets');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    cfoChallengeAnswer === 'strict_timesheets'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white">B. Rigid Micro-Monitoring Timesheets</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Enforce hourly check-ins on branch teller desktops to physically monitor active terminal keys.
                  </div>
                </div>

                <div
                  onClick={() => {
                    sound.playClick();
                    setCfoChallengeAnswer('unquantified');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    cfoChallengeAnswer === 'unquantified'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white">C. Standard Soft Goodwill Benefit</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Argue that employee morale and less stress is self-evident and does not require tracking.
                  </div>
                </div>
              </div>
            </div>

            {/* COO CHALLENGE 2: NATIONWIDE SCALE RISK */}
            <div className="p-5 rounded-2xl bg-[#121c2d] border border-cyan-500/40 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  ROUND 2 — COO VIKRAM MALHOTRA RESILIENCE CHALLENGE:
                </h4>
              </div>
              <p className="text-xs text-slate-200 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                "In Chapter 7, an unhandled memory leak triggered 504 timeouts across 12 branches. When we scale from 4 pilot clusters to 4,800 branches nationwide with 80,000 users hitting the system on morning appraisal deadlines, what prevents total cluster collapse?"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div
                  onClick={() => {
                    sound.playClick();
                    setCooChallengeAnswer('canary_sharding');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    cooChallengeAnswer === 'canary_sharding'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white">A. 4-Wave Canary + Kafka Sharding</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Scale in 4 regional waves (1,200 branches/wave) with Kafka partition sharding, automated latency breakers, and 24/7 telemetry.
                  </div>
                </div>

                <div
                  onClick={() => {
                    sound.playClick();
                    setCooChallengeAnswer('big_bang');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    cooChallengeAnswer === 'big_bang'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white">B. Immediate Big-Bang Launch</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Switch all 4,800 branches live nationwide this weekend to avoid multi-version operational fragmentation.
                  </div>
                </div>

                <div
                  onClick={() => {
                    sound.playClick();
                    setCooChallengeAnswer('delay_months');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    cooChallengeAnswer === 'delay_months'
                      ? 'bg-slate-800/90 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white">C. 6-Month Pilot Extension</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Delay nationwide scale-out by 2 quarters to run further manual stress testing.
                  </div>
                </div>
              </div>
            </div>

            {/* FINAL EXECUTIVE ROLLOUT MOTION */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Final Boardroom Motion — Executive Steering Committee Vote
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">MOTION ID: AMIGO-GOV-09</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Choice B */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedDecision('choice_b');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedDecision === 'choice_b'
                      ? 'bg-slate-800/90 border-cyan-500/70 ring-1 ring-cyan-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Motion B: Deliver Detailed ROI Presentation</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Motion B
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                    Present the certified 14,150 hours, +{financialModel.roiPercentage}% Net ROI, 6.8-month payback, and phased 4-wave rollout. Authorizes ₹1.2 Crore Phase 2 nationwide capital allocation.
                  </p>
                </div>

                {/* Choice A */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedDecision('choice_a');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedDecision === 'choice_a'
                      ? 'bg-slate-800/90 border-cyan-500/70 ring-1 ring-cyan-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Motion A: Rely on General Delivery Outcomes</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Motion A
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                    Present high-level delivery milestones without quantified hourly cost conversions or amortized payback models.
                  </p>
                </div>
              </div>

              {/* ACTION: RATIFY & CONCLUDE */}
              <div className="pt-3 flex justify-between items-center border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('slides')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Presentation Deck</span>
                </button>

                {!chapter9State.completed ? (
                  <button
                    onClick={handleRatifyDecision}
                    disabled={isSubmittingDecision}
                    className="px-7 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-700/40 border border-emerald-400/40"
                  >
                    <Award className="w-4 h-4" />
                    <span>{isSubmittingDecision ? 'Ratifying with Executive Board...' : 'Ratify Boardroom Decision & Conclude Chapter 9'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      CHAPTER 9 COMPLETE
                    </span>
                    <button
                      onClick={onOpenScorecard}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/40 animate-bounce"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Executive Scorecard</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
