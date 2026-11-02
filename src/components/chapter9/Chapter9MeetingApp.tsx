import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Presentation,
  TrendingUp,
  BarChart3,
  DollarSign,
  Building2,
  ChevronRight,
  ShieldCheck,
  Volume2,
  FileText,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import type { Chapter9State, Chapter9DecisionChoice } from '../../types/chapter9';
import {
  CHAPTER9_TITLE,
  CHAPTER9_SUBTITLE,
  CHAPTER9_PROJECT_NAME,
  CHAPTER9_LOCATION,
  CHAPTER9_CHARACTERS,
  ROI_TELEMETRY,
  computeFinancialModel,
  BOARDROOM_DIALOGUES,
  CHAPTER9_DECISION_OPTIONS,
  computeChapter9Score,
} from '../../data/chapter9Data';
import { sound } from '../onboarding/SoundEngine';
import { requestChapterAIEvaluation } from '../../services/aiEvaluationService';

interface Chapter9MeetingAppProps {
  chapter9State: Chapter9State;
  onUpdateState: (updater: Partial<Chapter9State> | ((prev: Chapter9State) => Chapter9State)) => void;
  onCompleteMeeting?: () => void;
  onOpenBoardroom?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter9MeetingApp: React.FC<Chapter9MeetingAppProps> = ({
  chapter9State,
  onUpdateState,
  onCompleteMeeting,
  onOpenBoardroom,
  onOpenScorecard,
}) => {
  // Call stages:
  // 1. 'telemetry_briefing': 23:00–23:45 (Martha presents verified 42% cycle reduction & 15,000 hrs saved)
  // 2. 'roi_preparation': 23:45–24:20 (Jane synthesizes 15,000 hrs into ₹97.5L monetary savings)
  // 3. 'boardroom_decision': 24:20–25:00 (The Board is waiting: Choice A vs Choice B)
  // 4. 'decision_feedback': Boardroom reaction, Phase 2 budget approval, next steps
  const [stage, setStage] = useState<
    'telemetry_briefing' | 'roi_preparation' | 'boardroom_decision' | 'decision_feedback'
  >(() => {
    if (chapter9State.completed || chapter9State.decisionChosen) return 'decision_feedback';
    if (chapter9State.currentStage === 'boardroom_decision') return 'boardroom_decision';
    if (chapter9State.currentStage === 'roi_preparation') return 'roi_preparation';
    return 'telemetry_briefing';
  });

  const [selectedDecision, setSelectedDecision] = useState<Chapter9DecisionChoice | null>(
    chapter9State.decisionChosen || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'martha' | 'sophia' | 'jane'>('martha');

  const streamRef = useRef<MediaStream | null>(null);
  const financialModel = computeFinancialModel(
    chapter9State.hourlyCostRateINR || 650,
    5500000,
    ROI_TELEMETRY.manHoursSaved
  );

  // Request or stop webcam video if available
  useEffect(() => {
    if (!cameraOff) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
        })
        .catch(() => {
          setCameraOff(true);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraOff]);

  // Sync speaker with stage
  useEffect(() => {
    if (stage === 'telemetry_briefing') {
      setActiveSpeaker('martha');
    } else if (stage === 'roi_preparation') {
      setActiveSpeaker('jane');
    } else if (stage === 'boardroom_decision') {
      setActiveSpeaker('sophia');
    } else {
      setActiveSpeaker('sophia');
    }
  }, [stage]);

  const speakDialogue = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAdvanceToRoi = () => {
    sound.playMessagePing();
    setStage('roi_preparation');
    onUpdateState({
      currentStage: 'roi_preparation',
      timelineTimestamp: '23:45',
      telemetryReviewed: true,
    });
  };

  const handleAdvanceToDecision = () => {
    sound.playMessagePing();
    setStage('boardroom_decision');
    onUpdateState({
      currentStage: 'boardroom_decision',
      timelineTimestamp: '24:20',
      financialModelReviewed: true,
    });
  };

  const handleSelectDecision = async (choice: Chapter9DecisionChoice) => {
    if (isSubmitting) return;
    setSelectedDecision(choice);
    setIsSubmitting(true);

    if (choice === 'choice_b') {
      sound.playSystemClearance();
    } else {
      sound.playPenaltyPing();
    }

    const tempState: Chapter9State = {
      ...chapter9State,
      decisionChosen: choice,
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      completed: true,
      meetingCompleted: true,
      callCompleted: true,
    };

    const scorecard = computeChapter9Score(tempState);

    onUpdateState({
      decisionChosen: choice,
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      completed: true,
      meetingCompleted: true,
      callCompleted: true,
      scorecard,
    });

    setStage('decision_feedback');

    // Trigger Grok AI evaluation asynchronously
    try {
      const aiResult = await requestChapterAIEvaluation(
        9,
        {
          decisionChosen: choice,
          decisionTitle: CHAPTER9_DECISION_OPTIONS[choice].title,
          grossSavingsINR: financialModel.totalSavingsINR,
          netBenefitINR: financialModel.netBenefitINR,
          netRoiPct: financialModel.roiPercentage,
          paybackPeriodMonths: financialModel.paybackPeriodMonths,
          cycleReductionPct: ROI_TELEMETRY.cycleReductionPct,
          manHoursSaved: ROI_TELEMETRY.manHoursSaved,
        },
        {
          totalScore: scorecard.totalScore,
          scheduleScore: scorecard.scheduleScore,
          riskScore: scorecard.riskScore,
          governanceScore: scorecard.governanceScore,
          efficiencyScore: scorecard.efficiencyScore,
          outcomeType: scorecard.outcomeType,
          outcomeTitle: scorecard.outcomeTitle,
          outcomeText: scorecard.outcomeText,
          evaluatorName: scorecard.evaluatorName,
          evaluatorRole: scorecard.evaluatorRole,
          executiveSummary: scorecard.executiveFeedback,
          whatYouDidWell: [scorecard.whatYouDidWell],
          whatToImprove: [scorecard.whatToImprove],
          leadershipCoaching: scorecard.keyTakeaway,
        }
      );

      if (aiResult) {
        onUpdateState((prev) => ({
          ...prev,
          scorecard: {
            ...prev.scorecard,
            totalScore: aiResult.totalScore ?? scorecard.totalScore,
            scheduleScore: aiResult.scheduleScore ?? scorecard.scheduleScore,
            riskScore: aiResult.riskScore ?? scorecard.riskScore,
            governanceScore: aiResult.governanceScore ?? scorecard.governanceScore,
            efficiencyScore: aiResult.efficiencyScore ?? scorecard.efficiencyScore,
            outcomeType: aiResult.outcomeType ?? scorecard.outcomeType,
            outcomeTitle: aiResult.outcomeTitle ?? scorecard.outcomeTitle,
            outcomeText: aiResult.outcomeText ?? scorecard.outcomeText,
            whatYouDidWell: (aiResult.strengths && aiResult.strengths[0]) || scorecard.whatYouDidWell,
            whatToImprove: (aiResult.improvements && aiResult.improvements[0]) || scorecard.whatToImprove,
            executiveFeedback: aiResult.executiveSummary || scorecard.executiveFeedback,
          },
        }));
      }
    } catch (e) {
      console.warn('AI evaluation error, deterministic scoring preserved:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenBoardroomSuite = () => {
    sound.playClick();
    onUpdateState({ boardroomRoomOpened: true });
    if (onOpenBoardroom) {
      onOpenBoardroom();
    } else if (onCompleteMeeting) {
      onCompleteMeeting();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#070b14] text-slate-100 font-sans select-none overflow-hidden">
      {/* ── TOP HEADER (TEAMS EXECUTIVE BRIEFING BAR) ── */}
      <header className="px-5 py-3 border-b border-slate-800 bg-[#0c1220]/90 backdrop-blur flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
                EXECUTIVE LEADERSHIP PHASE · SCENE 9.1
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                BOARDROOM STEERING COMMITTEE
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{CHAPTER9_LOCATION}</span>
              <span className="text-slate-400 text-xs font-normal">
                · {CHAPTER9_PROJECT_NAME} ROI Validation & Impact
              </span>
            </h1>
          </div>
        </div>

        {/* Status Pills & Action Button */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">
              {stage === 'telemetry_briefing'
                ? '23:00–23:45'
                : stage === 'roi_preparation'
                ? '23:45–24:20'
                : stage === 'boardroom_decision'
                ? '24:20–25:00'
                : '25:00 Concluded'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold">STEERING COMMITTEE IN SESSION</span>
          </div>

          {stage === 'decision_feedback' && (
            <button
              onClick={handleOpenBoardroomSuite}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Launch Executive ROI Dashboard</span>
            </button>
          )}

          {onOpenScorecard && chapter9State.completed && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer border border-slate-700 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Scorecard</span>
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col justify-between max-w-6xl mx-auto w-full">
        {/* ── PARTICIPANTS ROW (SOPHIA BENNETT, MARTHA, JANE) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 shrink-0">
          {/* Sophia Bennett (Head of HR & Executive Sponsor) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'sophia'
                ? 'bg-[#151c28] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER9_CHARACTERS.sophia.avatar}
                  alt={CHAPTER9_CHARACTERS.sophia.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {CHAPTER9_CHARACTERS.sophia.name}
                  </span>
                  {activeSpeaker === 'sophia' && (
                    <span className="text-amber-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-amber-300/80 font-mono uppercase tracking-wider">
                  Head of HR · Executive Sponsor
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Executive Steering Committee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Martha (Monitoring & Ops Telemetry) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'martha'
                ? 'bg-[#101f28] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER9_CHARACTERS.martha.avatar}
                  alt={CHAPTER9_CHARACTERS.martha.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {CHAPTER9_CHARACTERS.martha.name}
                  </span>
                  {activeSpeaker === 'martha' && (
                    <span className="text-cyan-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-cyan-300/80 font-mono uppercase tracking-wider">
                  Monitoring & Ops Telemetry
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Production Telemetry Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Jane (Player / PM) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'jane'
                ? 'bg-[#181a30] border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER9_CHARACTERS.jane.avatar}
                  alt={CHAPTER9_CHARACTERS.jane.name}
                  className="w-12 h-12 rounded-xl object-cover border border-indigo-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    Jane (You)
                  </span>
                  {activeSpeaker === 'jane' && (
                    <span className="text-indigo-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-indigo-300/80 font-mono uppercase tracking-wider">
                  Lead Project Manager (You)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Delivery Governance & ROI Lead</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DYNAMIC CENTER STAGE (SCENE 9.1 PROGRESSION) ── */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* ── STAGE 1: 23:00–23:45 Operations Telemetry Presentation ── */}
            {stage === 'telemetry_briefing' && (
              <motion.div
                key="stage_telemetry"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span>23:00–23:45 · Verified Operations Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    4,800 BRANCHES · PILOT TELEMETRY
                  </span>
                </div>

                {/* 4 Telemetry Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Appraisal Duration</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      42% Reduction
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">21.0 Days → 12.2 Days</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Man-Hours Saved</div>
                    <div className="text-sm font-bold text-white mt-0.5">15,000 Hours</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Verified Capacity Gain</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Active Coverage</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">80,000 Employees</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Mumbai, Pune & Nationwide</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">System SLA</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">99.4% Compliance</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Zero 504 Timeouts</div>
                  </div>
                </div>

                {/* Martha Exact Dialogue Box */}
                <div className="p-5 rounded-2xl bg-[#141d2d] border border-cyan-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER9_CHARACTERS.martha.avatar}
                        alt="Martha"
                        className="w-8 h-8 rounded-lg object-cover border border-cyan-500/50"
                      />
                      <span className="font-bold text-cyan-300 text-sm">Martha (Ops Telemetry):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "Jane, Sophia, I've just finished aggregating the telemetry across our 4,800 branches: appraisal cycle duration collapsed from 21 days to 12.2 days — a 42% reduction, saving 15,000 operational man-hours!"
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Read dialogue aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "{BOARDROOM_DIALOGUES.telemetry_briefing[1].text}"
                  </p>
                </div>

                {/* Sophia Bennett Sponsor Prompt */}
                <div className="p-4 rounded-2xl bg-[#1a1c2a] border border-amber-500/30 flex items-start space-x-3">
                  <img
                    src={CHAPTER9_CHARACTERS.sophia.avatar}
                    alt="Sophia"
                    className="w-8 h-8 rounded-lg object-cover border border-amber-500/50 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1 text-xs sm:text-[13px] text-slate-200">
                    <span className="font-bold text-amber-300">Sophia Bennett (Head of HR): </span>
                    <span>
                      "Phenomenal data from Mumbai and Pune. But the Board and Finance won't release Phase 2 funding on operational hours alone. They think in financial return, payback periods, and EBITDA impact. Jane, prepare the financial equation."
                    </span>
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleAdvanceToRoi}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer border border-cyan-400/40"
                  >
                    <span>Synthesize Financial ROI (Jane's Turn)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 2: 23:45–24:20 Monetary ROI Synthesis ── */}
            {stage === 'roi_preparation' && (
              <motion.div
                key="stage_roi"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>23:45–24:20 · Monetary ROI & Financial Model Synthesis</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    CFO & EXECUTIVE STEERING COMMITTEE
                  </span>
                </div>

                {/* 4 Financial Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Hourly Cost Assumption</div>
                    <div className="text-sm font-bold text-white mt-0.5">₹650 / hr</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Blended Branch Rate</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Gross Annual Savings</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">₹97.5 Lakhs</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">15,000 hrs × ₹650/hr</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Phase 1 Capital Spend</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">₹55.0 Lakhs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Engineering & Setup</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Net ROI & Payback</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">+77.3% ROI</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">6.8 Months Payback</div>
                  </div>
                </div>

                {/* Jane's Presentation Dialogue Box */}
                <div className="p-5 rounded-2xl bg-[#14202c] border border-emerald-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER9_CHARACTERS.jane.avatar}
                        alt="Jane"
                        className="w-8 h-8 rounded-lg object-cover border border-emerald-500/50"
                      />
                      <span className="font-bold text-emerald-300 text-sm">Jane (Lead PM):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "Let's translate the operational win into financial reality: 15,000 hours saved across branch staff at our ₹650/hr rate equals ₹97.5 Lakhs in annual capacity value. Against our ₹55 Lakh Phase 1 spend, that delivers a +77.3% Net ROI and full payback in just 6.8 months!"
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "{BOARDROOM_DIALOGUES.roi_preparation[0].text} Against our ₹55 Lakh Phase 1 capital expenditure, that yields a Net Financial Benefit of ₹42.5 Lakhs in Year 1 alone — delivering a +77.3% Net ROI and 6.8-month payback period."
                  </p>
                </div>

                {/* Sophia Bennett Reaction */}
                <div className="p-4 rounded-2xl bg-[#1c1a26] border border-amber-500/30 flex items-start space-x-3">
                  <img
                    src={CHAPTER9_CHARACTERS.sophia.avatar}
                    alt="Sophia"
                    className="w-8 h-8 rounded-lg object-cover border border-amber-500/50 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1 text-xs sm:text-[13px] text-slate-200">
                    <span className="font-bold text-amber-300">Sophia Bennett (Head of HR): </span>
                    <span>
                      "That is the exact financial justification the Board needs. The CFO will not be able to argue against a 6.8-month payback. The boardroom doors are opening now. Let's decide how you present this."
                    </span>
                  </div>
                </div>

                {/* Proceed Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleAdvanceToDecision}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer border border-emerald-400/40"
                  >
                    <span>Proceed to Executive Decision</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 3: 24:20–25:00 Strategic Executive Decision Screen ── */}
            {stage === 'boardroom_decision' && (
              <motion.div
                key="stage_decision"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span>24:20–25:00 · Strategic Decision Screen</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    EXECUTIVE STEERING COMMITTEE DIRECTIVE
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    The Board is waiting for evidence of business impact. What should Jane do?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Choose how Jane presents the outcomes of Project Amigo to the Executive Steering Committee and CFO.
                  </p>
                </div>

                {/* Choices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* CHOICE A */}
                  <div
                    onClick={() => handleSelectDecision('choice_a')}
                    className="group cursor-pointer rounded-2xl p-5 border border-slate-700 bg-[#0d1322] hover:bg-rose-950/20 hover:border-rose-500/60 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                          {CHAPTER9_DECISION_OPTIONS.choice_a.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          Poor Decision
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                        "Skip formal ROI tracking. Assume leadership already knows the project was successful and rely on informal word-of-mouth."
                      </p>
                      <p className="text-slate-400 text-xs">
                        {CHAPTER9_DECISION_OPTIONS.choice_a.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-rose-400">
                      <span>Delivery Governance: -20 pts</span>
                      <span>Trust & Risk: -15 pts</span>
                    </div>
                  </div>

                  {/* CHOICE B */}
                  <div
                    onClick={() => handleSelectDecision('choice_b')}
                    className="group cursor-pointer rounded-2xl p-5 border border-emerald-500/50 bg-[#0d1829] hover:bg-emerald-950/30 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {CHAPTER9_DECISION_OPTIONS.choice_b.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Recommended
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                        "Deliver a detailed ROI and business value impact presentation to the executive steering committee."
                      </p>
                      <p className="text-slate-400 text-xs">
                        {CHAPTER9_DECISION_OPTIONS.choice_b.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-emerald-400 font-bold">
                      <span>Schedule: +15 | Governance: +25</span>
                      <span>Trust & Risk: +20 pts</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 4: Decision Feedback & Boardroom Ratification ── */}
            {stage === 'decision_feedback' && selectedDecision && (
              <motion.div
                key="stage_feedback"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`border rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden ${
                  selectedDecision === 'choice_b'
                    ? 'bg-[#0f1d2a] border-emerald-500/50'
                    : 'bg-[#1a0f16] border-rose-500/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 font-mono text-xs font-bold tracking-wider uppercase">
                    {selectedDecision === 'choice_b' ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Executive Steering Committee Ratification
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Executive Funding Refusal (Phase 2 Frozen)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    25:00 · FINAL BOARDROOM VOTE
                  </span>
                </div>

                {/* Outcome Speech Box */}
                <div
                  className={`p-5 rounded-2xl border relative space-y-3 ${
                    selectedDecision === 'choice_b'
                      ? 'bg-[#13282b] border-emerald-500/40 text-emerald-100'
                      : 'bg-[#29131a] border-rose-500/40 text-rose-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={CHAPTER9_CHARACTERS.sophia.avatar}
                      alt="Sophia Bennett"
                      className="w-10 h-10 rounded-xl object-cover border border-amber-400/50 shadow"
                    />
                    <div>
                      <span className="font-bold text-amber-300 text-sm">
                        Sophia Bennett (Head of HR Operations):
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {selectedDecision === 'choice_b'
                          ? 'Reporting Unanimous Approval by the CFO and Board'
                          : 'Reporting Rejection of Phase 2 Capital by the Board'}
                      </div>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    {selectedDecision === 'choice_b'
                      ? '"Sensational outcome, Jane! The CFO was thoroughly impressed by your +77.3% Net ROI model and 6.8-month payback period. The Steering Committee voted unanimously to approve Phase 2 budget in full."'
                      : '"Jane, that was a disaster. Because we presented no quantitative financial justification, the CFO assumed Project Amigo was an expensive vanity project. The Board placed Phase 2 under indefinite audit hold."'}
                  </p>
                </div>

                {/* Score Delta Pill */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Applied Evaluation Scores:</span>
                  {selectedDecision === 'choice_b' ? (
                    <span className="font-mono text-emerald-400 font-bold">
                      +15 Schedule · +25 Governance · +20 Trust & Risk Management
                    </span>
                  ) : (
                    <span className="font-mono text-rose-400 font-bold">
                      -20 Delivery Governance · -15 Trust & Risk Management
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  {selectedDecision === 'choice_a' ? (
                    <button
                      onClick={() => handleSelectDecision('choice_b')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Revise to Recommended Approach (Choice B)</span>
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-300 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Phase 2 is funded. Executive Boardroom Dashboard unlocked!</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleOpenBoardroomSuite}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-950" />
                      <span>Open Executive ROI Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {onOpenScorecard && (
                      <button
                        onClick={onOpenScorecard}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>View Scorecard</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── MEDIA / CONTROLS FOOTER ── */}
        <footer className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMicMuted((prev) => !prev)}
              className={`p-2 rounded-xl border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                micMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-[11px] font-mono">{micMuted ? 'Muted' : 'Mic Live'}</span>
            </button>

            <button
              onClick={() => setCameraOff((prev) => !prev)}
              className={`p-2 rounded-xl border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                cameraOff
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cameraOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="text-[11px] font-mono">{cameraOff ? 'Cam Off' : 'Cam Feed'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Microsoft Teams · Executive Steering Committee Session · TLS 1.3 Encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
