import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Server,
  Layers,
  Award,
} from 'lucide-react';
import type { Chapter11State } from '../../types/chapter11';
import {
  CHAPTER11_LOCATION,
  CHAPTER11_PROJECT_NAME,
  CHAPTER11_CHARACTERS,
  CHAPTER11_TIMESTAMP_RANGE,
} from '../../data/chapter11Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter11MeetingAppProps {
  chapter11State: Chapter11State;
  onUpdateState: (updater: Partial<Chapter11State> | ((prev: Chapter11State) => Chapter11State)) => void;
  onOpenConsole?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter11MeetingApp: React.FC<Chapter11MeetingAppProps> = ({
  chapter11State,
  onUpdateState,
  onOpenConsole,
  onOpenScorecard,
}) => {
  // Dialogue steps:
  // 1: marcus_warning (Marcus states 2 AM support reality)
  // 2: player_question (Player asks what operations needs)
  // 3: marcus_three_things (Marcus outlines 3 pillars)
  // 4: daniel_martha (Daniel & Martha debate wiki vs hands-on testing)
  // 5: aarav_mandate (Aarav establishes operational ownership mandate -> launch console)
  const [step, setStep] = useState<number>(() => {
    return chapter11State.meetingCompleted ? 5 : 1;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleNextStep = () => {
    sound.playClick();
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleLaunchConsole = () => {
    sound.playSystemClearance();
    onUpdateState({
      meetingCompleted: true,
      callCompleted: true,
      consoleOpened: true,
      currentStage: 'transition_console',
      timelineTimestamp: '27:45',
    });
    if (onOpenConsole) onOpenConsole();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Meeting Header */}
      <div className="bg-slate-900/90 border-b border-indigo-500/20 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Chapter 11 · Operational Handover
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {CHAPTER11_TIMESTAMP_RANGE}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              {CHAPTER11_LOCATION}
              <span className="text-slate-400 font-normal hidden md:inline">
                | {CHAPTER11_PROJECT_NAME}
              </span>
            </h1>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2">
          {chapter11State.completed ? (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scorecard</span>
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Handover Session Active
            </span>
          )}
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="flex-1 p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 overflow-hidden">
        {/* Participant 1: Marcus (Head of IT Operations) */}
        <div
          className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-3 transition-all ${
            step === 1 || step === 3
              ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/40'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-indigo-300 border border-indigo-500/30">
              Operations Lead
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <img
              src={CHAPTER11_CHARACTERS.marcus.avatar}
              alt="Marcus"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-indigo-400/50 shadow-md"
            />
            <span className="text-xs font-bold text-white mt-2">Marcus</span>
            <span className="text-[10px] text-slate-400 text-center">Head of IT Operations</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 z-10">
            <span>Amigo Ops Console</span>
            {(step === 1 || step === 3) && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Speaking
              </span>
            )}
          </div>
        </div>

        {/* Participant 2: Daniel (Lead Developer) */}
        <div
          className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-3 transition-all ${
            step === 4
              ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/40'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-blue-300 border border-blue-500/30">
              Engineering Lead
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <img
              src={CHAPTER11_CHARACTERS.daniel.avatar}
              alt="Daniel"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-400/50 shadow-md"
            />
            <span className="text-xs font-bold text-white mt-2">Daniel</span>
            <span className="text-[10px] text-slate-400 text-center">Lead Developer</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 z-10">
            <span>Dev Core / Release</span>
            {step === 4 && (
              <span className="text-blue-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" /> Speaking
              </span>
            )}
          </div>
        </div>

        {/* Participant 3: Martha (Junior PM) */}
        <div
          className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-3 transition-all ${
            step === 4
              ? 'border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/10'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-purple-300 border border-purple-500/30">
              PM Coordination
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <img
              src={CHAPTER11_CHARACTERS.martha.avatar}
              alt="Martha"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-purple-400/50 shadow-md"
            />
            <span className="text-xs font-bold text-white mt-2">Martha</span>
            <span className="text-[10px] text-slate-400 text-center">Junior PM · Coordination</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 z-10">
            <span>Transition Tracker</span>
            {step === 4 && (
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Joined
              </span>
            )}
          </div>
        </div>

        {/* Participant 4: Aarav Kapoor (Senior PM Mentor) */}
        <div
          className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-3 transition-all ${
            step === 5
              ? 'border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/40'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-amber-300 border border-amber-500/30">
              Senior Leadership
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <img
              src={CHAPTER11_CHARACTERS.aarav.avatar}
              alt="Aarav Kapoor"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400/50 shadow-md"
            />
            <span className="text-xs font-bold text-white mt-2">Aarav Kapoor</span>
            <span className="text-[10px] text-slate-400 text-center">Senior PM · Mentor</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 z-10">
            <span>Transformation Advisory</span>
            {step === 5 && (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Speaking
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Dialogue & Action Console (Bottom Tray) */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          <AnimatePresence mode="wait">
            {/* Step 1: Marcus opening warning */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400">Marcus (Head of IT Operations):</span>
                  <span className="text-[10px] text-slate-500 font-mono">27:00</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p>
                    "First of all, congratulations on getting the platform live. The business is happy, and the deployment looks stable.
                    <span className="block mt-1 font-semibold text-amber-200">
                      But I need to be clear about something: your development team built this platform. My team has to support it at 2 AM when something breaks. We cannot take ownership just because the project team is ready to move on."
                    </span>
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition-all"
                  >
                    <span>Respond: "Fair point. What does your team need?"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Player's constructive question */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400">You (Project Manager):</span>
                  <span className="text-[10px] text-slate-500 font-mono">27:15</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p className="font-medium text-cyan-100">
                    "Fair point, Marcus. We want a clean transition, not a dumping ground. What specific criteria does IT Operations need fulfilled before formally accepting operational ownership?"
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <span>Hear Marcus's 3 Requirements</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Marcus outlines 3 pillars */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400">Marcus (Head of IT Operations):</span>
                  <span className="text-[10px] text-slate-500 font-mono">27:25</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-indigo-200">
                    "Three non-negotiables before my team signs off:"
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 ml-1">
                    <li><strong className="text-white">Operational Runbooks:</strong> Step-by-step failure resolution and access guides.</li>
                    <li><strong className="text-white">Knowledge Transfer:</strong> Hands-on incident simulations to prove our L1/L2 engineers can triage independently.</li>
                    <li><strong className="text-white">Structured Hypercare:</strong> A mandatory 14-day stabilization window with clear escalation ownership.</li>
                  </ul>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <span>Listen to Daniel & Martha</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Daniel & Martha Exchange */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5"
              >
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div>
                    <span className="font-bold text-blue-400 mr-2">Daniel:</span>
                    <span className="text-slate-300">
                      "Marcus, the architecture and API specs were published in Chapter 10. The system is stable and monitored."
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-purple-400 mr-2">Martha:</span>
                    <span className="text-slate-300">
                      "He's right, Daniel. Documents sitting in a wiki don't guarantee support engineers know what to do at 2 AM. We need to verify hands-on triage."
                    </span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <span>Aarav Kapoor's Leadership Advice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Aarav Kapoor Intervention & Launch */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">Aarav Kapoor (Senior PM · Mentor):</span>
                  <span className="text-[10px] text-slate-500 font-mono">27:45</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p className="font-bold text-amber-200">
                    "This is where project delivery becomes operational ownership. Don't just email files. Ensure the receiving team can actually run, troubleshoot, and maintain the system."
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Marcus has shared the <strong>Operations Transition Console</strong>. Complete the 3 operational transition stages: Runbook Matching, Incident Simulation, and 14-Day Hypercare Planning.
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleLaunchConsole}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <Server className="w-4 h-4" />
                    <span>Open Operations Transition Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Call Controls Bar */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isVideoOff ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Step {step} of 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
