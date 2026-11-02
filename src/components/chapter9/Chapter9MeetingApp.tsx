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
  PhoneOff,
  Sparkles,
  Users,
  Presentation,
  TrendingUp,
  BarChart3,
  DollarSign,
  Building2,
  ChevronRight,
  ShieldCheck,
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
  // Meeting stages matching Scene 9.1:
  // 1. 'telemetry_briefing': 23:00–23:45 (Martha presents 42% cycle reduction & 15,000 hrs saved)
  // 2. 'roi_preparation': 23:45–24:20 (Jane synthesizes 15,000 hrs into ₹97.5L monetary savings)
  // 3. 'boardroom_decision': 24:20–25:00 (The Board is waiting: Choice A vs Choice B)
  // 4. 'decision_feedback': Boardroom reaction and next steps
  const [meetingStage, setMeetingStage] = useState<
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
  const [activeSpeaker, setActiveSpeaker] = useState<'martha' | 'jane' | 'mark'>('martha');

  const streamRef = useRef<MediaStream | null>(null);
  const financialModel = computeFinancialModel(
    chapter9State.hourlyCostRateINR || 650,
    5500000,
    ROI_TELEMETRY.manHoursSaved
  );

  // Webcam stream
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
    if (meetingStage === 'telemetry_briefing') {
      setActiveSpeaker('martha');
    } else if (meetingStage === 'roi_preparation') {
      setActiveSpeaker('jane');
    } else if (meetingStage === 'boardroom_decision') {
      setActiveSpeaker('mark');
    } else {
      setActiveSpeaker(chapter9State.decisionChosen === 'choice_b' ? 'mark' : 'mark');
    }
  }, [meetingStage, chapter9State.decisionChosen]);

  const handleAdvanceToRoi = () => {
    sound.playMessagePing();
    setMeetingStage('roi_preparation');
    onUpdateState({
      currentStage: 'roi_preparation',
      timelineTimestamp: '23:45',
      telemetryReviewed: true,
    });
  };

  const handleAdvanceToDecision = () => {
    sound.playMessagePing();
    setMeetingStage('boardroom_decision');
    onUpdateState({
      currentStage: 'boardroom_decision',
      timelineTimestamp: '24:20',
      financialModelReviewed: true,
    });
  };

  const handleConfirmDecision = async () => {
    if (!selectedDecision || isSubmitting) return;
    setIsSubmitting(true);
    sound.playSystemClearance();

    const tempState: Chapter9State = {
      ...chapter9State,
      decisionChosen: selectedDecision,
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      completed: true,
      meetingCompleted: true,
      callCompleted: true,
    };

    const scorecard = computeChapter9Score(tempState);

    onUpdateState({
      decisionChosen: selectedDecision,
      currentStage: 'presentation_delivered',
      timelineTimestamp: '25:00',
      completed: true,
      meetingCompleted: true,
      callCompleted: true,
      scorecard,
    });

    setMeetingStage('decision_feedback');

    // Trigger Grok AI evaluation asynchronously
    try {
      const aiResult = await requestChapterAIEvaluation(
        9,
        {
          decisionChosen: selectedDecision,
          decisionTitle: CHAPTER9_DECISION_OPTIONS[selectedDecision].title,
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
            keyTakeaway: aiResult.leadershipCoaching || scorecard.keyTakeaway,
            aiEvaluated: true,
            evaluatedAt: aiResult.evaluatedAt || new Date().toISOString(),
          },
        }));
      }
    } catch (e) {
      console.warn('AI evaluation error fallback utilized:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRoiSuite = () => {
    onUpdateState({
      meetingCompleted: true,
      callCompleted: true,
      boardroomRoomOpened: true,
    });
    if (onOpenBoardroom) onOpenBoardroom();
    else if (onCompleteMeeting) onCompleteMeeting();
  };

  return (
    <div className="flex flex-col h-full bg-[#070d14] text-slate-100 select-none overflow-hidden font-sans">
      {/* TEAMS CALL TOP BAR */}
      <header className="px-5 py-2.5 bg-[#0b1420] border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white">
                Microsoft Teams — {CHAPTER9_LOCATION}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Timeline: {chapter9State.timelineTimestamp || '23:00'} / 25:00
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {CHAPTER9_PROJECT_NAME} · Scene 9.1: Presenting Financial & Operational Impact
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* OPEN EXECUTIVE ROI DASHBOARD BUTTON */}
          <button
            onClick={handleOpenRoiSuite}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Executive ROI Dashboard</span>
          </button>

          {chapter9State.completed && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all animate-pulse"
            >
              <span>View Scorecard</span>
              <Sparkles className="w-3 h-3 text-emerald-200" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN MEETING VIEWPORT */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative justify-between">
        {/* VIDEO PARTICIPANT TILES (3 TILES) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* TILE 1: MARTHA VANCE (OPS TELEMETRY) */}
          <div
            className={`p-3 rounded-2xl bg-gradient-to-b from-[#0c1622] to-[#08101a] border flex flex-col justify-between relative transition-all min-h-[140px] ${
              activeSpeaker === 'martha'
                ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="text-lg">{CHAPTER9_CHARACTERS.martha.avatar}</span>
                <span>{CHAPTER9_CHARACTERS.martha.name}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20">
                Ops Telemetry
              </span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-3xl mb-1 shadow-inner relative">
                {CHAPTER9_CHARACTERS.martha.avatar}
                {activeSpeaker === 'martha' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeSpeaker === 'martha' ? 'Speaking: Telemetry Data' : 'Listening'}
              </span>
            </div>

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Mumbai & Pune Feeds</span>
              <span className="text-emerald-400">1080p Encrypted</span>
            </div>
          </div>

          {/* TILE 2: JANE COOPER (PM / PLAYER) */}
          <div
            className={`p-3 rounded-2xl bg-gradient-to-b from-[#0c1622] to-[#08101a] border flex flex-col justify-between relative transition-all min-h-[140px] ${
              activeSpeaker === 'jane'
                ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-950/40'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="text-lg">{CHAPTER9_CHARACTERS.jane.avatar}</span>
                <span>{CHAPTER9_CHARACTERS.jane.name} (You)</span>
              </span>
              <span className="text-[10px] font-mono text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/20">
                Senior PM
              </span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-3xl mb-1 shadow-inner relative">
                {CHAPTER9_CHARACTERS.jane.avatar}
                {activeSpeaker === 'jane' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full border-2 border-slate-900 animate-ping" />
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeSpeaker === 'jane' ? 'Speaking: ROI Formulation' : 'Listening'}
              </span>
            </div>

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Lead Consultant</span>
              <span className="text-sky-400">Audio Active</span>
            </div>
          </div>

          {/* TILE 3: MARK STERLING (HEAD OF HR & SPONSOR) */}
          <div
            className={`p-3 rounded-2xl bg-gradient-to-b from-[#0c1622] to-[#08101a] border flex flex-col justify-between relative transition-all min-h-[140px] ${
              activeSpeaker === 'mark'
                ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/40'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="text-lg">{CHAPTER9_CHARACTERS.mark.avatar}</span>
                <span>{CHAPTER9_CHARACTERS.mark.name}</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20">
                Head of HR
              </span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl mb-1 shadow-inner relative">
                {CHAPTER9_CHARACTERS.mark.avatar}
                {activeSpeaker === 'mark' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 animate-ping" />
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeSpeaker === 'mark' ? 'Speaking: Boardroom Direct' : 'Listening'}
              </span>
            </div>

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Executive Sponsor</span>
              <span className="text-amber-400">Boardroom Suite</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE STAGE CONTENT CONTAINER */}
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-y-auto flex flex-col justify-between">
          {/* STAGE 1: TELEMETRY BRIEFING (23:00 - 23:45) */}
          {meetingStage === 'telemetry_briefing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Scene 9.1 · Part 1 (23:00–23:45)
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Martha Presents Production Telemetry
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Verified Data
                </span>
              </div>

              {/* TELEMETRY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-[11px] text-slate-400">Appraisal Cycle</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    -42% Faster
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">21.0 days → 12.2 days</div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30">
                  <div className="text-[11px] text-slate-400">Workforce Time Saved</div>
                  <div className="text-2xl font-black text-teal-300 font-mono mt-1">
                    15,000 hrs
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Across 80,000 employees</div>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30">
                  <div className="text-[11px] text-slate-400">SLA Compliance</div>
                  <div className="text-2xl font-black text-sky-300 font-mono mt-1">99.4%</div>
                  <div className="text-[10px] text-slate-400 mt-1">Up from 61.2% baseline</div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <div className="text-[11px] text-slate-400">eNPS Improvement</div>
                  <div className="text-2xl font-black text-indigo-300 font-mono mt-1">+28 pts</div>
                  <div className="text-[10px] text-slate-400 mt-1">Branch satisfaction</div>
                </div>
              </div>

              {/* DIALOGUE BOX */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <p>
                  <span className="font-bold text-emerald-400">Martha Vance: </span>
                  "Jane, Mark, the telemetry from Mumbai, Pune, and regional branches is unanimous:
                  Appraisal cycle completion dropped from 21 days down to 12.2 days — a 42% reduction.
                  We clocked 15,000 verified operational hours saved across branch managers."
                </p>
                <p>
                  <span className="font-bold text-amber-400">Mark Sterling: </span>
                  "Brilliant operational data, Martha. But the CFO and the Board won't fund Phase 2
                  on operational hours alone. They think in cash value, EBITDA, and capital return."
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAdvanceToRoi}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <span>Synthesize Financial ROI (Jane's Turn)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: ROI PREPARATION (23:45 - 24:20) */}
          {meetingStage === 'roi_preparation' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                    Scene 9.1 · Part 2 (23:45–24:20)
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Jane Prepares the Monetary ROI Equation
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Financial Conversion
                </span>
              </div>

              {/* FINANCIAL MODEL HIGHLIGHTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Workforce Hourly Rate</div>
                  <div className="text-xl font-black text-white font-mono mt-1">₹650 / hr</div>
                  <div className="text-[10px] text-slate-400 mt-1">ICICI Bank blended cost</div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-[11px] text-slate-400">Gross Capacity Savings</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">₹97.5 Lakhs</div>
                  <div className="text-[10px] text-slate-400 mt-1">15,000 hrs × ₹650</div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30">
                  <div className="text-[11px] text-slate-400">Net Year 1 ROI</div>
                  <div className="text-2xl font-black text-teal-300 font-mono mt-1">+77.3%</div>
                  <div className="text-[10px] text-slate-400 mt-1">Against ₹55L Phase 1 spend</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
                  <div className="text-[11px] text-slate-400">Capital Payback Period</div>
                  <div className="text-2xl font-black text-amber-300 font-mono mt-1">6.8 Months</div>
                  <div className="text-[10px] text-slate-400 mt-1">Full capital recovery</div>
                </div>
              </div>

              {/* DIALOGUE BOX */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <p>
                  <span className="font-bold text-sky-400">Jane Cooper: </span>
                  "Mark, 15,000 hours saved is an operational win, but here is the financial
                  justification: at ICICI's blended workforce rate of ₹650/hour, that represents
                  ₹97.5 Lakhs in annual capacity value. Against our ₹55 Lakh Phase 1 spend, that
                  proves a +77.3% Net ROI in Year 1 with a full capital payback in just 6.8 months."
                </p>
                <p>
                  <span className="font-bold text-amber-400">Mark Sterling: </span>
                  "The Boardroom doors are opening. The CFO and Steering Committee are taking their
                  seats right now. It's time to make your executive move."
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAdvanceToDecision}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all animate-pulse"
                >
                  <span>Enter Executive Decision Gate</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: EXECUTIVE DECISION SCREEN (24:20 - 25:00) */}
          {meetingStage === 'boardroom_decision' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Scene 9.1 · Part 3 (24:20–25:00) · Executive Decision Gate
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    The Board is waiting for evidence of business impact. What should Jane do?
                  </h3>
                </div>
              </div>

              {/* TWO DECISION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* CHOICE A */}
                <div
                  onClick={() => setSelectedDecision('choice_a')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedDecision === 'choice_a'
                      ? 'bg-rose-950/30 border-rose-500 shadow-lg'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Choice A · Poor Decision
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedDecision === 'choice_a'
                            ? 'bg-rose-500 border-rose-400 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {selectedDecision === 'choice_a' && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">
                      Skip formal ROI tracking. Assume leadership already knows the project was successful.
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Rely on informal word-of-mouth. Present no telemetry conversions, cost baselines,
                      or payback models to the CFO.
                    </p>
                  </div>

                  <div className="pt-2 mt-3 border-t border-slate-800 text-[10px] font-mono text-rose-400 flex gap-2">
                    <span>Delivery Governance: -20</span>
                    <span>Trust & Risk: -15</span>
                  </div>
                </div>

                {/* CHOICE B (RECOMMENDED) */}
                <div
                  onClick={() => setSelectedDecision('choice_b')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedDecision === 'choice_b'
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-lg'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Choice B · Recommended
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedDecision === 'choice_b'
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {selectedDecision === 'choice_b' && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">
                      Deliver a detailed ROI and business value impact presentation to the executive steering committee.
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Present verified 42% cycle reduction, 15,000 man-hours converted into ₹97.5 Lakhs savings,
                      +77.3% ROI, and 6.8-month payback.
                    </p>
                  </div>

                  <div className="pt-2 mt-3 border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex flex-wrap gap-2">
                    <span>Schedule: +15</span>
                    <span>Delivery Governance: +25</span>
                    <span>Trust & Risk: +20</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {selectedDecision
                    ? `Selected: ${selectedDecision === 'choice_b' ? 'Choice B' : 'Choice A'}`
                    : 'Select a choice above to deliver to the Board'}
                </span>
                <button
                  onClick={handleConfirmDecision}
                  disabled={!selectedDecision || isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Presenting to Steering Committee...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Boardroom Decision</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: POST-DECISION FEEDBACK */}
          {meetingStage === 'decision_feedback' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Executive Steering Committee Verdict
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {chapter9State.decisionChosen === 'choice_b'
                      ? 'Unanimous Boardroom Approval — Phase 2 Budget Released!'
                      : 'Boardroom Skepticism — Phase 2 Budget Frozen!'}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    chapter9State.decisionChosen === 'choice_b'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {chapter9State.decisionChosen === 'choice_b' ? 'Exemplary Leadership' : 'Governance Penalty'}
                </span>
              </div>

              {/* VERDICT SUMMARY */}
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                  chapter9State.decisionChosen === 'choice_b'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-100'
                }`}
              >
                <p className="font-bold text-sm">
                  {chapter9State.decisionChosen === 'choice_b'
                    ? 'Mark Sterling (Head of HR): "Outstanding delivery, Jane! The CFO remarked that this was the first engineering transformation review where a PM proved measurable EBITDA and workforce capacity return. They unanimously ratified Phase 2."'
                    : 'Mark Sterling (Head of HR): "Jane, that was a failure. The CFO asked for quantifiable financial return, and without data, the Board viewed the project as an expensive cost center. Phase 2 funding has been placed on indefinite hold."'}
                </p>
                <p className="text-[11px] opacity-90">
                  <span className="font-bold">Core Takeaway: </span>
                  A project is not truly successful until its business value can be measured and communicated.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleOpenRoiSuite}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer border border-slate-700 transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Explore Interactive ROI Dashboard & Slides</span>
                </button>

                {onOpenScorecard && (
                  <button
                    onClick={onOpenScorecard}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all animate-pulse"
                  >
                    <span>View Executive Scorecard</span>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* CALL BOTTOM TOOLBAR */}
        <div className="mt-3 py-2 px-4 bg-[#0b1420] border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMicMuted((prev) => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                micMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCameraOff((prev) => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                cameraOff ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Encrypted Video Call · 3 Participants</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenRoiSuite}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
