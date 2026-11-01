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
  Volume2,
  MonitorUp,
  Cpu,
  Wrench,
  AlertCircle,
  PhoneOff,
  Users,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Chapter7State } from '../../types/chapter7';
import { sound } from '../onboarding/SoundEngine';

interface Chapter7MeetingAppProps {
  chapter7State: Chapter7State;
  onUpdateState: (updater: Partial<Chapter7State> | ((prev: Chapter7State) => Chapter7State)) => void;
  onOpenStudio: () => void;
  onOpenScorecard: () => void;
}

export const Chapter7MeetingApp: React.FC<Chapter7MeetingAppProps> = ({
  chapter7State,
  onUpdateState,
  onOpenStudio,
  onOpenScorecard,
}) => {
  // Call stages:
  // 'connecting' -> 'daniel_intro' -> 'daniel_screen_share' -> 'aarav_mandate' -> 'call_ended'
  // If completed: 'resolution_summary'
  const [stage, setStage] = useState<
    | 'connecting'
    | 'daniel_intro'
    | 'daniel_screen_share'
    | 'aarav_mandate'
    | 'call_ended'
    | 'resolution_summary'
  >(() => {
    if (chapter7State.completed || chapter7State.incidentStatus === 'resolved') return 'resolution_summary';
    if (chapter7State.callCompleted || chapter7State.meetingCompleted || chapter7State.studioUnlocked) {
      return 'call_ended';
    }
    return 'connecting';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'daniel' | 'aarav' | 'martha' | 'player' | null>('daniel');
  const [subtitleText, setSubtitleText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    if (!cameraOff) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
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

  // Sync if chapter completes
  useEffect(() => {
    if (chapter7State.completed || chapter7State.incidentStatus === 'resolved') {
      setStage('resolution_summary');
    }
  }, [chapter7State.completed, chapter7State.incidentStatus]);

  // Helper for speech synthesis
  const speakDialogue = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore speech error
      }
    }
  };

  // Progression logic
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === 'connecting') {
      sound.playMessagePing();
      timer = setTimeout(() => {
        setStage('daniel_intro');
        setActiveSpeaker('daniel');
        const text = "I've checked the service metrics. Memory consumption is gradually increasing, and the service is eventually timing out. It looks like a memory leak. I've started preparing a hotfix.";
        setSubtitleText(text);
        speakDialogue(text);
      }, 1500);
    } else if (stage === 'daniel_intro') {
      timer = setTimeout(() => {
        setStage('daniel_screen_share');
        setActiveSpeaker('daniel');
        const text = "We can deploy the patch, but I don't want us to close this incident without understanding why it happened.";
        setSubtitleText(text);
        speakDialogue(text);
      }, 7000);
    } else if (stage === 'daniel_screen_share') {
      timer = setTimeout(() => {
        setStage('aarav_mandate');
        setActiveSpeaker('aarav');
        sound.playMessagePing();
        const text = "Exactly. Get the service stable first. But we also need a proper incident record and a Root Cause Analysis. I want to know what failed, who was affected, and what we're changing to prevent this from happening again.";
        setSubtitleText(text);
        speakDialogue(text);
      }, 8000);
    } else if (stage === 'aarav_mandate') {
      timer = setTimeout(() => {
        setStage('call_ended');
        setActiveSpeaker(null);
        sound.playSystemClearance();
        setSubtitleText(
          "Call ended. Aarav has assigned you ownership of INC-0241. Complete the incident response in Incident Response Studio."
        );
        onUpdateState({
          callCompleted: true,
          meetingCompleted: true,
          screenShareViewed: true,
          aaravAssignmentViewed: true,
          studioUnlocked: true,
        });
      }, 8500);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stage]);

  const handleLaunchStudio = () => {
    sound.playSystemClearance();
    onUpdateState({
      callCompleted: true,
      meetingCompleted: true,
      studioUnlocked: true,
      studioOpened: true,
      activeTab: 'immediate',
    });
    onOpenStudio();
  };

  const handleManualNext = () => {
    sound.playClick();
    if (stage === 'daniel_intro') {
      setStage('daniel_screen_share');
      setActiveSpeaker('daniel');
      const text = "We can deploy the patch, but I don't want us to close this incident without understanding why it happened.";
      setSubtitleText(text);
      speakDialogue(text);
    } else if (stage === 'daniel_screen_share') {
      setStage('aarav_mandate');
      setActiveSpeaker('aarav');
      sound.playMessagePing();
      const text = "Exactly. Get the service stable first. But we also need a proper incident record and a Root Cause Analysis. I want to know what failed, who was affected, and what we're changing to prevent this from happening again.";
      setSubtitleText(text);
      speakDialogue(text);
    } else if (stage === 'aarav_mandate') {
      setStage('call_ended');
      setActiveSpeaker(null);
      sound.playSystemClearance();
      onUpdateState({
        callCompleted: true,
        meetingCompleted: true,
        screenShareViewed: true,
        aaravAssignmentViewed: true,
        studioUnlocked: true,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0713] text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TEAMS TOP CALL BAR ── */}
      <div className="h-12 bg-[#150d21] border-b border-rose-900/60 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-[#4f52b2] flex items-center justify-center text-white font-bold text-xs shadow">
            T
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Incident Bridge: Attendance Sync 504 Timeouts</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                SEV-2 INCIDENT
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Daniel Brooks · Martha Vance · Aarav Kapoor · Jane (Consultant)
            </div>
          </div>
        </div>

        {/* Action button in bar */}
        <div className="flex items-center space-x-2">
          {stage === 'resolution_summary' ? (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View RCA Scorecard</span>
            </button>
          ) : (
            <button
              onClick={handleLaunchStudio}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer border border-rose-400/40"
            >
              <Wrench className="w-3.5 h-3.5 text-rose-200" />
              <span>Open Incident Response Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN CALL STAGE ── */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative">
        {/* CENTER: SCREEN-SHARE TELEMETRY OR CALL CONNECTING */}
        <div className="flex-1 bg-[#120b1c] border border-rose-500/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          {/* Header */}
          <div className="h-9 bg-[#190f25] border-b border-rose-900/60 px-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-rose-300 font-mono text-[11px] font-bold">
              <MonitorUp className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {stage === 'daniel_screen_share' || stage === 'aarav_mandate' || stage === 'call_ended'
                  ? 'Daniel Brooks sharing: Service Metrics & Memory Utilisation'
                  : 'Incident Triage Call Active'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                12 Branch Officers Impacted
              </span>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 p-4 bg-[#0a0612] flex flex-col space-y-3.5 overflow-y-auto font-mono text-xs">
            {/* Service & Error Banner */}
            <div className="bg-[#190d23] border border-rose-500/60 rounded-xl p-3.5 flex items-start justify-between shadow-md">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0 animate-bounce" />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Incident: INC-0241</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono">
                      SEV-2
                    </span>
                  </div>
                  <div className="text-xs text-rose-200 mt-1 font-sans">
                    <span className="font-bold text-white">Affected Service:</span> Attendance Sync (<code className="text-rose-300">attendance-sync-pod</code>)
                  </div>
                  <div className="text-xs text-rose-300/80 font-sans mt-0.5">
                    <span className="font-bold text-white">Reported Error:</span> 504 Gateway Timeout · Memory leak causing monotonic heap exhaustion
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-sans">Scope Impact</span>
                <span className="text-sm font-bold text-rose-300 font-mono">12 Branch Officers</span>
              </div>
            </div>

            {/* Visual Monitoring Graph Dashboard (Accurate to Section 4) */}
            <div className="bg-[#130b1e] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>Attendance Sync Service: Memory Utilisation (%) & 504 Error Rate</span>
                </span>
                <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  Critical Monotonic Leak
                </span>
              </div>

              {/* Time-based Memory Utilization Graph */}
              <div className="relative pt-2 pb-1">
                {/* Y-Axis Labels */}
                <div className="flex h-36">
                  <div className="w-10 flex flex-col justify-between text-[9px] text-slate-500 font-mono pr-2 text-right">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>

                  {/* Graph Canvas */}
                  <div className="flex-1 border-l border-b border-slate-800 relative flex items-end">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-b border-slate-700 w-full" />
                      <div className="border-b border-slate-700 w-full" />
                      <div className="border-b border-slate-700 w-full" />
                      <div className="border-b border-slate-700 w-full" />
                    </div>

                    {/* Bars simulating monotonic heap growth */}
                    <div className="w-full h-full flex items-end justify-between px-2 gap-2 z-10">
                      {/* 08:00 */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="w-full bg-sky-500/30 rounded-t h-[22%] transition-all group-hover:bg-sky-500/50" />
                        <span className="text-[9px] text-slate-400 mt-1 font-mono">22%</span>
                      </div>
                      {/* 08:30 */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="w-full bg-amber-500/40 rounded-t h-[46%] transition-all group-hover:bg-amber-500/60" />
                        <span className="text-[9px] text-slate-400 mt-1 font-mono">46%</span>
                      </div>
                      {/* 09:00 */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="w-full bg-orange-500/60 rounded-t h-[72%] transition-all group-hover:bg-orange-500/80" />
                        <span className="text-[9px] text-slate-400 mt-1 font-mono">72%</span>
                      </div>
                      {/* 09:15 */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="w-full bg-rose-500/80 rounded-t h-[91%] animate-pulse group-hover:bg-rose-500" />
                        <span className="text-[9px] text-rose-300 font-bold mt-1 font-mono">91%</span>
                      </div>
                      {/* 09:30 */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="w-full bg-rose-600 rounded-t h-[98%] shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse" />
                        <span className="text-[9px] text-rose-400 font-bold mt-1 font-mono">98%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* X-Axis Labels (Time-based) */}
                <div className="flex pl-10 pr-2 justify-between text-[9px] text-slate-400 font-mono mt-1">
                  <span>08:00 AM</span>
                  <span>08:30 AM</span>
                  <span>09:00 AM</span>
                  <span className="text-rose-400 font-bold">09:15 AM (First 504s)</span>
                  <span className="text-rose-400 font-bold">09:30 AM (Peak Outage)</span>
                </div>
              </div>

              {/* 504 Gateway Error Rate Spike Visual */}
              <div className="bg-[#0b0612] p-3 rounded-lg border border-rose-900/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">504 Error Rate Spike</div>
                  <div className="text-xs text-rose-300 font-bold mt-0.5">
                    Spiked to 38.4% timeout rate as memory passed 85% threshold
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-xs border border-rose-500/40">
                  +38.4% SPIKE
                </div>
              </div>
            </div>

            {/* Aarav Assignment Callout if Call Ended */}
            {stage === 'call_ended' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1b1029] border border-amber-500/60 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.25)] space-y-2.5"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Incident Assignment from Aarav Kapoor
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  “Jane, take ownership of INC-0241. Coordinate the recovery, document the root cause, and put together the preventive actions. I've added Incident Response Studio to your desktop. Complete the incident response there.”
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleLaunchStudio}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer border border-rose-400/40"
                  >
                    <span>Launch Incident Response Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Subtitles & Captions Bar */}
          <div className="p-3 bg-[#130a1c] border-t border-rose-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 flex-1 pr-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
              <div className="text-xs text-slate-200 leading-snug">
                <span className="font-bold text-rose-300 mr-1.5 font-mono">
                  [{activeSpeaker === 'daniel' ? 'Daniel' : activeSpeaker === 'aarav' ? 'Aarav' : 'Jane'}]:
                </span>
                {subtitleText || 'Call in progress...'}
              </div>
            </div>

            {stage !== 'call_ended' && stage !== 'resolution_summary' && (
              <button
                onClick={handleManualNext}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
              >
                Next »
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: PARTICIPANT CARDS */}
        <div className="w-full md:w-64 flex flex-col space-y-3 shrink-0">
          {/* Daniel Brooks */}
          <div
            className={`rounded-xl bg-[#140c20] border p-3 flex flex-col justify-between transition-all ${
              activeSpeaker === 'daniel'
                ? 'border-rose-400 ring-2 ring-rose-500/40'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <img
                src="/character/Daniel_Brooks/DanielDP.png"
                alt="Daniel"
                className="w-10 h-10 rounded-full border border-sky-400/40 object-cover shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-white">Daniel Brooks</div>
                <div className="text-[10px] text-sky-400 font-mono">Lead Developer</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>{activeSpeaker === 'daniel' ? 'Speaking...' : 'On Call'}</span>
              <span className="text-rose-400">Preparing Hotfix</span>
            </div>
          </div>

          {/* Martha Vance */}
          <div
            className={`rounded-xl bg-[#140c20] border p-3 flex flex-col justify-between transition-all ${
              activeSpeaker === 'martha'
                ? 'border-rose-400 ring-2 ring-rose-500/40'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <img
                src="/character/Emma_Carter/EmmaDP.png"
                alt="Martha"
                className="w-10 h-10 rounded-full border border-rose-400/40 object-cover shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-white">Martha Vance</div>
                <div className="text-[10px] text-rose-400 font-mono">Branch Ops Manager</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>On Call</span>
              <span className="text-amber-400">12 Officers Impacted</span>
            </div>
          </div>

          {/* Aarav Kapoor */}
          <div
            className={`rounded-xl bg-[#140c20] border p-3 flex flex-col justify-between transition-all ${
              activeSpeaker === 'aarav'
                ? 'border-amber-400 ring-2 ring-amber-500/40'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <img
                src="/character/AaravDP.png"
                alt="Aarav"
                className="w-10 h-10 rounded-full border border-amber-400/40 object-cover shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-white">Aarav Kapoor</div>
                <div className="text-[10px] text-amber-400 font-mono">Project Manager</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>{activeSpeaker === 'aarav' ? 'Speaking...' : 'Joined Bridge'}</span>
              <span className="text-emerald-400">Delivery Lead</span>
            </div>
          </div>

          {/* Player Feed */}
          <div className="rounded-xl bg-[#140c20] border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                YOU
              </div>
              <div>
                <div className="text-xs font-bold text-white">Jane (Consultant)</div>
                <div className="text-[10px] text-slate-400 font-mono">Incident Commander</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>Muted: {micMuted ? 'Yes' : 'No'}</span>
              <span className="text-slate-300">INC-0241 Lead</span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="pt-2 flex items-center justify-center space-x-3 bg-[#11091b] p-2.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setMicMuted(!micMuted)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                micMuted ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title={micMuted ? 'Unmute' : 'Mute'}
            >
              {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCameraOff(!cameraOff)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                cameraOff ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLaunchStudio}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer shadow"
              title="Leave Call & Open Studio"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
