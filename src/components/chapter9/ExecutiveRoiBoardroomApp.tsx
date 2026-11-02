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
  const [selectedDecision, setSelectedDecision] = useState<Chapter9DecisionChoice | null>(
    chapter9State.decisionChosen || null
  );
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const financialModel = computeFinancialModel(hourlyRate, 5500000, ROI_TELEMETRY.manHoursSaved);

  // Sync stage based on user exploration
  const stage = chapter9State.currentStage;
  const isDecisionMade = Boolean(chapter9State.decisionChosen);

  const handleTabChange = (tab: RoiMetricTab) => {
    setActiveTab(tab);
    onUpdateState((prev) => {
      const updates: Partial<Chapter9State> = { selectedTab: tab };
      if (tab === 'telemetry') updates.telemetryReviewed = true;
      if (tab === 'financial') updates.financialModelReviewed = true;
      if (tab === 'slides') updates.slidesReviewed = true;

      // Auto-advance timeline stage
      if (prev.currentStage === 'telemetry_briefing' && (tab === 'financial' || tab === 'slides')) {
        updates.currentStage = 'roi_preparation';
        updates.timelineTimestamp = '23:45';
      }
      return { ...prev, ...updates };
    });
  };

  const handleSlideChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < PRESENTATION_SLIDES.length) {
      setSlideIndex(newIndex);
      onUpdateState({ currentSlideIndex: newIndex, slidesReviewed: true });
    }
  };

  const handleAdvanceToDecision = () => {
    onUpdateState({
      currentStage: 'boardroom_decision',
      timelineTimestamp: '24:20',
      selectedTab: 'governance',
    });
    setActiveTab('governance');
  };

  const handleConfirmDecision = async () => {
    if (!selectedDecision || isSubmittingDecision) return;
    setIsSubmittingDecision(true);

    const isRecommended = selectedDecision === 'choice_b';

    // 1. Compute deterministic score immediately
    const tempState: Chapter9State = {
      ...chapter9State,
      decisionChosen: selectedDecision,
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      hourlyCostRateINR: hourlyRate,
      completed: true,
    };

    const initialScorecard = computeChapter9Score(tempState);

    onUpdateState({
      decisionChosen: selectedDecision,
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
          ? 'Sophia Bennett and the CFO accepted the ROI model. Phase 2 budget unlocked!'
          : 'The Board questioned the project business value due to lack of quantified ROI.'
      );
    }

    // 2. Request Grok AI Evaluation in background
    setAiLoading(true);
    try {
      const aiResult = await requestChapterAIEvaluation(9, {
        decisionChosen: selectedDecision,
        decisionTitle: CHAPTER9_DECISION_OPTIONS[selectedDecision].title,
        hourlyRateINR: hourlyRate,
        grossSavingsINR: financialModel.totalSavingsINR,
        netBenefitINR: financialModel.netBenefitINR,
        netRoiPct: financialModel.roiPercentage,
        paybackPeriodMonths: financialModel.paybackPeriodMonths,
        cycleReductionPct: ROI_TELEMETRY.cycleReductionPct,
        slidesReviewed: chapter9State.slidesReviewed,
        telemetryReviewed: chapter9State.telemetryReviewed,
        financialModelReviewed: chapter9State.financialModelReviewed,
      }, {
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
      });

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
            keyTakeaway: aiResult.leadershipCoaching || initialScorecard.keyTakeaway,
            aiEvaluated: true,
            evaluatedAt: aiResult.evaluatedAt || new Date().toISOString(),
          },
        }));
      }
    } catch (e) {
      console.warn('Grok AI evaluation fallback utilized:', e);
    } finally {
      setAiLoading(false);
      setIsSubmittingDecision(false);
    }
  };

  // Dialogues to display based on stage
  let activeDialogues = BOARDROOM_DIALOGUES.telemetry_briefing;
  if (stage === 'roi_preparation') {
    activeDialogues = BOARDROOM_DIALOGUES.roi_preparation;
  } else if (stage === 'boardroom_decision') {
    activeDialogues = BOARDROOM_DIALOGUES.boardroom_decision;
  } else if (stage === 'presentation_delivered' || stage === 'chapter_complete') {
    activeDialogues =
      chapter9State.decisionChosen === 'choice_b'
        ? BOARDROOM_DIALOGUES.choice_b_reaction
        : BOARDROOM_DIALOGUES.choice_a_reaction;
  }

  return (
    <div className="flex flex-col h-full bg-[#070d14] text-slate-100 select-none overflow-hidden font-sans">
      {/* HEADER / NAVIGATION BAR */}
      <header className="px-5 py-3 border-b border-emerald-500/20 bg-[#0b1420]/80 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                {CHAPTER9_LOCATION}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Timeline: {chapter9State.timelineTimestamp || '23:00'} / 25:00
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {CHAPTER9_PROJECT_NAME} — {CHAPTER9_SUBTITLE}
            </p>
          </div>
        </div>

        {/* PROGRESSION TIMELINE PILLS */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <div
            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 transition-all ${
              stage === 'telemetry_briefing'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>23:00–23:45 Telemetry</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div
            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 transition-all ${
              stage === 'roi_preparation'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>23:45–24:20 ROI Modeling</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div
            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 transition-all ${
              stage === 'boardroom_decision' || stage === 'presentation_delivered'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>24:20–25:00 Executive Decision</span>
          </div>
        </div>

        {/* SCORECARD CTA BUTTON */}
        <div className="flex items-center space-x-2">
          {isDecisionMade && (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 border border-emerald-400/40 flex items-center space-x-2 cursor-pointer transition-all animate-pulse"
            >
              <Award className="w-3.5 h-3.5 text-emerald-200" />
              <span>Executive Scorecard</span>
              <Sparkles className="w-3 h-3 text-emerald-200" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN DUAL-PANE WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANE: LIVE BOARDROOM VIDEO FEED & NARRATIVE DIALOGUE (38%) */}
        <div className="w-full md:w-[38%] border-r border-slate-800/80 bg-[#08101a]/95 flex flex-col justify-between overflow-hidden">
          {/* EXECUTIVE SUITE VIDEO HUD */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                Live Video Feed · Boardroom Suite 4B
              </span>
              <span className="text-[10px] font-mono text-slate-400">Encrypted HD Stream</span>
            </div>

            {/* THREE PARTICIPANTS GRID */}
            <div className="grid grid-cols-3 gap-2">
              {/* JANE */}
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center text-center relative group">
                <img
                  src={CHAPTER9_CHARACTERS.jane.avatar}
                  alt={CHAPTER9_CHARACTERS.jane.name}
                  className="w-12 h-12 rounded-full object-cover border border-sky-400/50 mb-1 shadow-inner"
                />
                <span className="text-[11px] font-bold text-slate-200">Jane (You)</span>
                <span className="text-[9px] text-sky-400">Lead Senior PM</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              {/* MARTHA */}
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center text-center relative group">
                <img
                  src={CHAPTER9_CHARACTERS.martha.avatar}
                  alt={CHAPTER9_CHARACTERS.martha.name}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-400/50 mb-1 shadow-inner"
                />
                <span className="text-[11px] font-bold text-slate-200">Martha</span>
                <span className="text-[9px] text-emerald-400">Ops Telemetry</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              {/* SOPHIA (HEAD OF HR) */}
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center text-center relative group">
                <img
                  src={CHAPTER9_CHARACTERS.sophia.avatar}
                  alt={CHAPTER9_CHARACTERS.sophia.name}
                  className="w-12 h-12 rounded-full object-cover border border-amber-400/50 mb-1 shadow-inner"
                />
                <span className="text-[11px] font-bold text-slate-200">Sophia Bennett</span>
                <span className="text-[9px] text-amber-400">Head of HR (Sponsor)</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>

          {/* LIVE DIALOGUE LOG */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/50">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Meeting Audio Transcript · {chapter9State.timelineTimestamp || '23:00'}
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono">Agent Active</span>
            </div>

            {activeDialogues.map((d) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                  d.speaker === 'Sophia' || d.speaker === 'Mark'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                    : d.speaker === 'Martha'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                    : 'bg-sky-950/20 border-sky-500/30 text-sky-100'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold flex items-center gap-1.5">
                    <img
                      src={d.avatar}
                      alt={d.speaker}
                      className="w-5 h-5 rounded-full object-cover border border-slate-600"
                    />
                    <span>{d.speaker}</span>
                    <span className="text-slate-400 font-normal">({d.role})</span>
                  </span>
                  <span className="font-mono text-slate-400">{d.timestamp}</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-200">{d.text}</p>
              </motion.div>
            ))}
          </div>

          {/* STAGE CONTROLS FOOTER */}
          <div className="p-3.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              {stage === 'telemetry_briefing' && 'Review telemetry data with Martha'}
              {stage === 'roi_preparation' && 'Model monetary savings before Board arrives'}
              {stage === 'boardroom_decision' && 'Executive Decision required'}
              {stage === 'presentation_delivered' && 'Decision rendered to Steering Committee'}
            </div>

            {stage === 'telemetry_briefing' && (
              <button
                onClick={() => handleTabChange('financial')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <span>Prepare ROI Model</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {stage === 'roi_preparation' && (
              <button
                onClick={handleAdvanceToDecision}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all animate-pulse"
              >
                <span>Enter Boardroom</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT PANE: INTERACTIVE EXECUTIVE ROI DASHBOARD & PRESENTATION SUITE (62%) */}
        <div className="flex-1 flex flex-col bg-[#070e17] overflow-hidden">
          {/* TABS HEADER */}
          <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleTabChange('telemetry')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
                  activeTab === 'telemetry'
                    ? 'bg-[#070e17] text-emerald-300 border-emerald-500/40 border-b-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>1. Operational Telemetry</span>
                {chapter9State.telemetryReviewed && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
              </button>

              <button
                onClick={() => handleTabChange('financial')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
                  activeTab === 'financial'
                    ? 'bg-[#070e17] text-teal-300 border-teal-500/40 border-b-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>2. Financial ROI Modeler</span>
                {chapter9State.financialModelReviewed && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
              </button>

              <button
                onClick={() => handleTabChange('slides')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
                  activeTab === 'slides'
                    ? 'bg-[#070e17] text-sky-300 border-sky-500/40 border-b-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>3. Boardroom Slide Deck</span>
                {chapter9State.slidesReviewed && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
              </button>

              <button
                onClick={() => handleTabChange('governance')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
                  activeTab === 'governance'
                    ? 'bg-[#070e17] text-amber-300 border-amber-500/40 border-b-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>4. Executive Decision</span>
                {isDecisionMade && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 pb-1">
              {stage === 'boardroom_decision' && (
                <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" /> Boardroom Waiting
                </span>
              )}
            </div>
          </div>

          {/* TAB CONTENTS CONTAINER */}
          <div className="flex-1 p-5 overflow-y-auto">
            {/* TAB 1: OPERATIONAL TELEMETRY */}
            {activeTab === 'telemetry' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* HEADLINE KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* METRIC 1: 42% CYCLE DROP */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Appraisal Cycle</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
                        -42% Faster
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        21.0 days → <span className="text-emerald-400 font-bold">12.2 days</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[42%]" />
                    </div>
                  </div>

                  {/* METRIC 2: 15,000 MAN HOURS */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-teal-950/40 to-slate-900/60 border border-teal-500/30 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Workforce Hours Saved</span>
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black text-teal-300 font-mono tracking-tight">
                        15,000 hrs
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Across 80,000 bank staff
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full w-[78%]" />
                    </div>
                  </div>

                  {/* METRIC 3: SLA COMPLIANCE */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-sky-950/40 to-slate-900/60 border border-sky-500/30 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>SLA Compliance Rate</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black text-sky-300 font-mono tracking-tight">
                        99.4%
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Up from 61.2% in legacy HRMS
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full w-[99.4%]" />
                    </div>
                  </div>

                  {/* METRIC 4: eNPS SATISFACTION */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Employee eNPS</span>
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight">
                        +28 Pts
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Branch satisfaction score
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full w-[65%]" />
                    </div>
                  </div>
                </div>

                {/* TELEMETRY BREAKDOWN DETAIL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* CYCLE TIME COMPARISON */}
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-200">
                          Appraisal Submission & Signoff P90 Latency
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          42% Reduction
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-4">
                        Comparison of time required for manager evaluation, peer feedback, and HR
                        consolidation across 4,800 bank branches.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-slate-400">Legacy Manual Appraisal System</span>
                            <span className="text-rose-400 font-bold">21.0 Days</span>
                          </div>
                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500/70 w-[100%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-slate-400">Project Amigo Automated Cloud Platform</span>
                            <span className="text-emerald-400 font-bold">12.2 Days</span>
                          </div>
                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[58%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Audited by: ICICI Operations Telemetry</span>
                      <span className="text-slate-300 font-mono">Verified 8.8 Days Saved</span>
                    </div>
                  </div>

                  {/* REGIONAL MAN-HOURS SAVINGS DISTRIBUTION */}
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-200">
                          15,000 Man-Hours Saved by Hub
                        </span>
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded-full">
                          Verified Telemetry
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-4">
                        Hours formerly spent in manual spreadsheet compilation, missing biometric
                        reconciliations, and offline appraisal chases.
                      </p>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Mumbai Corporate & Metro Branches</span>
                          <span className="font-mono text-teal-300 font-bold">6,200 hrs (41%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-400 h-full w-[41%]" />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Delhi NCR Commercial Clusters</span>
                          <span className="font-mono text-teal-300 font-bold">4,700 hrs (31%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-400 h-full w-[31%]" />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Pune & Tier-2 Retail Network</span>
                          <span className="font-mono text-teal-300 font-bold">4,100 hrs (28%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-400 h-full w-[28%]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Total Operational Capacity:</span>
                      <span className="text-emerald-400 font-bold font-mono">15,000 Verified Hours</span>
                    </div>
                  </div>
                </div>

                {/* BOTTOM CALLOUT / GUIDANCE */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-slate-300 leading-relaxed">
                    <span className="font-bold text-amber-300">Senior PM Insight: </span>
                    15,000 man-hours saved is a compelling operational metric, but executive
                    leadership and the CFO don't approve multi-million budgets based on hours alone.
                    In the next step, model these hours into financial currency to justify Phase 1
                    investment and secure Phase 2 budget.
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: FINANCIAL ROI MODELER */}
            {activeTab === 'financial' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* FINANCIAL HIGHLIGHT BANNER */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                          Monetary Value Equation
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                          Year 1 Impact
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white mt-1">
                        Operational Capacity Converted into Balance Sheet ROI
                      </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Net Year 1 ROI</div>
                        <div className="text-xl font-black text-emerald-400 font-mono">
                          +{financialModel.roiPercentage}%
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Capital Payback</div>
                        <div className="text-xl font-black text-teal-300 font-mono">
                          {financialModel.paybackPeriodMonths} Mo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE FINANCIAL CALCULATOR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* CONTROLS & ASSUMPTIONS (5 cols) */}
                  <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-200">
                        Financial Baseline Assumptions
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Configurable</span>
                    </div>

                    {/* HOURLY RATE SLIDER */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-medium">Blended Hourly Workforce Rate:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          ₹{hourlyRate.toLocaleString()} / hr
                        </span>
                      </div>
                      <input
                        type="range"
                        min="400"
                        max="1200"
                        step="25"
                        value={hourlyRate}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setHourlyRate(val);
                          onUpdateState({ hourlyCostRateINR: val, financialModelReviewed: true });
                        }}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>₹400/hr (Min)</span>
                        <span className="text-slate-300 font-semibold">₹650/hr (ICICI Standard)</span>
                        <span>₹1,200/hr (Senior)</span>
                      </div>
                    </div>

                    {/* INVESTMENT AMOUNT */}
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex justify-between items-center text-xs">
                      <div>
                        <div className="text-slate-300 font-medium">Phase 1 Capital Investment (CAPEX)</div>
                        <div className="text-[10px] text-slate-400">Development, infra, security & rollout</div>
                      </div>
                      <span className="font-mono text-amber-300 font-bold text-sm">₹55.0 Lakhs</span>
                    </div>

                    {/* HOURS SAVED INPUT */}
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex justify-between items-center text-xs">
                      <div>
                        <div className="text-slate-300 font-medium">Verified Operational Hours Saved</div>
                        <div className="text-[10px] text-slate-400">Audited from Mumbai & Pune branches</div>
                      </div>
                      <span className="font-mono text-teal-300 font-bold text-sm">15,000 hrs</span>
                    </div>

                    {/* CRITICAL DISTINCTION ALERT */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-slate-300 space-y-1">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Senior PM Learning Distinction
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        15,000 man-hours saved is an <span className="text-slate-200 font-bold">operational benefit</span>,
                        not automatically a financial saving. To claim monetary ROI, the simulation translates this
                        using the hourly cost baseline (₹650/hr) against the project investment amount (₹55 Lakhs).
                      </p>
                    </div>
                  </div>

                  {/* FINANCIAL OUTPUT METRICS (7 cols) */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* GROSS COST SAVINGS */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30 flex flex-col justify-between">
                      <div className="text-slate-400 text-xs flex justify-between">
                        <span>Gross Capacity Savings</span>
                        <span className="text-emerald-400 font-mono">15k hrs × ₹{hourlyRate}</span>
                      </div>
                      <div className="my-3">
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                          ₹{(financialModel.totalSavingsINR / 100000).toFixed(2)} Lakhs
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Direct workforce capacity freed up
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                        Annualized productivity value
                      </div>
                    </div>

                    {/* NET BENEFIT */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-teal-500/30 flex flex-col justify-between">
                      <div className="text-slate-400 text-xs flex justify-between">
                        <span>Net Value Generated</span>
                        <span className="text-teal-400 font-mono">Savings - CAPEX</span>
                      </div>
                      <div className="my-3">
                        <div className="text-2xl font-black text-teal-300 font-mono">
                          ₹{(financialModel.netBenefitINR / 100000).toFixed(2)} Lakhs
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Net positive cash-equivalent gain
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                        Direct bottom-line improvement
                      </div>
                    </div>

                    {/* NET ROI % */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/30 flex flex-col justify-between">
                      <div className="text-slate-400 text-xs flex justify-between">
                        <span>Net Return on Investment</span>
                        <span className="text-indigo-400 font-mono">(Net / Spend) × 100</span>
                      </div>
                      <div className="my-3">
                        <div className="text-3xl font-black text-indigo-300 font-mono">
                          +{financialModel.roiPercentage}%
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Year 1 Return for ICICI Bank
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                        Surpasses 25% enterprise hurdle rate
                      </div>
                    </div>

                    {/* PAYBACK PERIOD */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 flex flex-col justify-between">
                      <div className="text-slate-400 text-xs flex justify-between">
                        <span>Capital Payback Period</span>
                        <span className="text-amber-400 font-mono">CAPEX / Run Rate</span>
                      </div>
                      <div className="my-3">
                        <div className="text-3xl font-black text-amber-300 font-mono">
                          {financialModel.paybackPeriodMonths} Months
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Full investment amortized
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                        Capital recovery in under 2 quarters
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleTabChange('slides')}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <span>View Boardroom Presentation Deck</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: BOARDROOM SLIDE DECK */}
            {activeTab === 'slides' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* SLIDE NAVIGATION CONTROLS */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                      Slide {slideIndex + 1} of {PRESENTATION_SLIDES.length}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 font-mono">
                      {PRESENTATION_SLIDES[slideIndex].category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleSlideChange(slideIndex - 1)}
                      disabled={slideIndex === 0}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-400 px-2">
                      {slideIndex + 1} / {PRESENTATION_SLIDES.length}
                    </span>
                    <button
                      onClick={() => handleSlideChange(slideIndex + 1)}
                      disabled={slideIndex === PRESENTATION_SLIDES.length - 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 cursor-pointer transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ACTIVE SLIDE PROJECTION SCREEN */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1624] to-[#070e17] border border-sky-500/30 shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                  {/* SLIDE HEADER */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold">
                        ICICI Bank Executive Steering Committee Review
                      </span>
                      <span className="text-sm font-black font-mono text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/40 shadow-sm">
                        {PRESENTATION_SLIDES[slideIndex].keyStat}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-white tracking-tight">
                      {PRESENTATION_SLIDES[slideIndex].title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {PRESENTATION_SLIDES[slideIndex].subtitle}
                    </p>

                    {/* BULLET POINTS */}
                    <div className="my-5 space-y-2.5">
                      {PRESENTATION_SLIDES[slideIndex].bulletPoints.map((bp, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SLIDE FOOTER / TAKEAWAY */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-sky-200 flex items-center justify-between">
                    <span className="font-medium">
                      Executive Takeaway: {PRESENTATION_SLIDES[slideIndex].takeaway}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Project Amigo Deck</span>
                  </div>
                </div>

                {/* PRESENTER NOTES / PROMPT */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="text-slate-300">
                    <span className="font-bold text-sky-300">Jane's Presenter Cue: </span>
                    "When presenting to Sophia and the CFO, tie operational hours directly to balance sheet capacity and payback velocity."
                  </div>
                  <button
                    onClick={handleAdvanceToDecision}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                  >
                    <span>Proceed to Decision</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 4: EXECUTIVE DECISION SCREEN (24:20 - 25:00) */}
            {activeTab === 'governance' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* DECISION PROMPT BANNER */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                      Executive Decision Gate
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 font-mono">
                      24:20 – 25:00
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white">
                    The Board is waiting for evidence of business impact. What should Jane do?
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Sophia Bennett (Head of HR) and the Executive Steering Committee are in the boardroom.
                    Your decision will determine the future of Project Amigo and funding for Phase 2.
                  </p>
                </div>

                {/* TWO DECISION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CHOICE A: SKIP FORMAL ROI TRACKING */}
                  <div
                    onClick={() => !isDecisionMade && setSelectedDecision('choice_a')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedDecision === 'choice_a'
                        ? 'bg-rose-950/30 border-rose-500 shadow-xl shadow-rose-950/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    } ${isDecisionMade ? 'cursor-default' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {CHAPTER9_DECISION_OPTIONS.choice_a.riskLabel}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedDecision === 'choice_a'
                              ? 'bg-rose-500 border-rose-400 text-white'
                              : 'border-slate-600'
                          }`}
                        >
                          {selectedDecision === 'choice_a' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1">
                        {CHAPTER9_DECISION_OPTIONS.choice_a.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mb-3">
                        {CHAPTER9_DECISION_OPTIONS.choice_a.subtitle}
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {CHAPTER9_DECISION_OPTIONS.choice_a.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="font-mono text-slate-400">Score Impact:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px]">
                          Delivery Governance: -20
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px]">
                          Trust & Risk: -15
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CHOICE B: DELIVER DETAILED ROI PRESENTATION (RECOMMENDED) */}
                  <div
                    onClick={() => !isDecisionMade && setSelectedDecision('choice_b')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedDecision === 'choice_b'
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-xl shadow-emerald-950/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    } ${isDecisionMade ? 'cursor-default' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {CHAPTER9_DECISION_OPTIONS.choice_b.riskLabel}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedDecision === 'choice_b'
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'border-slate-600'
                          }`}
                        >
                          {selectedDecision === 'choice_b' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1">
                        {CHAPTER9_DECISION_OPTIONS.choice_b.title}
                      </h3>
                      <p className="text-[11px] text-emerald-400/90 mb-3">
                        {CHAPTER9_DECISION_OPTIONS.choice_b.subtitle}
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {CHAPTER9_DECISION_OPTIONS.choice_b.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="font-mono text-slate-400">Score Impact:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                          Delivery Governance: +25
                        </span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px]">
                          Trust & Risk: +20
                        </span>
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold text-[10px]">
                          Schedule / Timeline: +15
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONFIRM DECISION OR VIEW RESULTS */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    {isDecisionMade ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Decision executed in Boardroom. Check narrative response and scorecard.
                      </span>
                    ) : selectedDecision ? (
                      <span className="text-slate-300">
                        Selected: <span className="font-bold text-white">{selectedDecision === 'choice_b' ? 'Choice B' : 'Choice A'}</span>
                      </span>
                    ) : (
                      <span>Select a decision above to proceed.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isDecisionMade ? (
                      <button
                        onClick={handleConfirmDecision}
                        disabled={!selectedDecision || isSubmittingDecision}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        {isSubmittingDecision ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Submitting to Steering Committee...</span>
                          </>
                        ) : (
                          <>
                            <span>Execute Boardroom Presentation</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={onOpenScorecard}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all animate-pulse"
                      >
                        <Award className="w-4 h-4 text-emerald-200" />
                        <span>Open Executive Scorecard</span>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AI EVALUATION STATUS PILL */}
                {aiLoading && (
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-500/30 flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    <span>Grok AI Evaluator synthesizing Sophia Bennett's executive review...</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
