import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  // 'connecting' -> 'martha_alert' -> 'daniel_diagnosis' -> 'aarav_mandate' -> 'transition_to_studio'
  // Or if completed: 'closing_resolution'
  const [stage, setStage] = useState<
    | 'connecting'
    | 'martha_alert'
    | 'daniel_diagnosis'
    | 'aarav_mandate'
    | 'transition_to_studio'
    | 'closing_resolution'
  >(() => {
    if (chapter7State.completed) return 'closing_resolution';
    if (chapter7State.meetingCompleted || chapter7State.studioOpened) return 'transition_to_studio';
    return 'connecting';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'martha' | 'daniel' | 'aarav' | 'player' | null>('martha');
  const [subtitleText, setSubtitleText] = useState<string>('');

  const streamRef = useRef<MediaStream | null>(null);

  // Request or stop webcam video if available
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

  // Sync if completed
  useEffect(() => {
    if (chapter7State.completed) {
      setStage('closing_resolution');
    }
  }, [chapter7State.completed]);

  // Dialogue sequence
  useEffect(() => {
    if (stage === 'connecting') {
      sound.playMessagePing();
      const timer = setTimeout(() => {
        setStage('martha_alert');
        setActiveSpeaker('martha');
        setSubtitleText(
          "Jane! We've got a production issue. The Attendance Sync service is returning intermittent 504 errors. Twelve branch officers reported login issues this morning."
        );
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'martha_alert') {
      timer = setTimeout(() => {
        setStage('daniel_diagnosis');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "I've checked the service logs. There's a memory leak building up over time. I've started preparing a hotfix, but we need to make sure this doesn't happen again."
        );
      }, 6500);
    } else if (stage === 'daniel_diagnosis') {
      timer = setTimeout(() => {
        setStage('aarav_mandate');
        setActiveSpeaker('aarav');
        setSubtitleText(
          "Let's get the service stable first. But I don't want us closing this incident just because the hotfix works. We need to understand why it happened and document how we're preventing a recurrence."
        );
      }, 6500);
    } else if (stage === 'aarav_mandate') {
      timer = setTimeout(() => {
        setStage('transition_to_studio');
        setActiveSpeaker(null);
        setSubtitleText(
          "Incident escalated. Launch the Incident Response & RCA Studio to coordinate hotfix deployment, build the RCA, and establish preventive monitoring."
        );
        onUpdateState({ meetingCompleted: true, studioOpened: true });
      }, 6800);
    }
    return () => clearTimeout(timer);
  }, [stage, onUpdateState]);

  const handleEnterStudio = () => {
    sound.playSystemClearance();
    onUpdateState({ meetingCompleted: true, studioOpened: true, activeTab: 'immediate' });
    onOpenStudio();
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0914] text-slate-100 select-none overflow-hidden font-sans">
      {/* TEAMS CALL TOP BAR */}
      <div className="h-12 bg-[#171022] border-b border-rose-900/60 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-[#4f52b2] flex items-center justify-center text-white font-bold text-xs shadow">
            T
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Incident Response: Attendance Sync Service 504 Errors</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                SEV-1 PRODUCTION INCIDENT
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Live Bridge · Martha, Daniel, Aarav · Daniel sharing Dynatrace monitoring screen
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {stage === 'closing_resolution' ? (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View RCA & Incident Scorecard</span>
            </button>
          ) : (
            <button
              onClick={handleEnterStudio}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer border border-rose-400/40"
            >
              <Wrench className="w-3.5 h-3.5 text-rose-200" />
              <span>Open Incident Response Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN CALL STAGE */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative">
        {/* LEFT / CENTER: SHARED DYNATRACE ALERT & LOGS SCREEN */}
        <div className="flex-1 bg-[#120c1c] border border-rose-500/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          {/* Header */}
          <div className="h-9 bg-[#1c1228] border-b border-rose-900/60 px-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-rose-300 font-mono text-[11px] font-bold">
              <MonitorUp className="w-3.5 h-3.5 text-rose-400" />
              <span>Daniel Brooks sharing: Dynatrace APM Problems & Microservice Heap</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                12 BRANCH USERS LOCKED OUT
              </span>
            </div>
          </div>

          {/* Shared Screen Telemetry Visual (Dynatrace Style) */}
          <div className="flex-1 p-4 bg-[#0a0710] flex flex-col space-y-3.5 overflow-y-auto font-mono text-xs">
            {/* Incident Alert Banner */}
            <div className="bg-[#1f101f] border border-rose-500/60 rounded-xl p-3.5 flex items-start justify-between shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0 animate-bounce" />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Active Incident: Attendance Sync HTTP 504 Gateway Timeout</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono">
                      INC-2849
                    </span>
                  </div>
                  <div className="text-xs text-rose-200/90 mt-1 font-sans">
                    Attendance Sync container memory heap increasing monotonically from 220MB to 998MB.
                    Garbage collector unable to free zombie sockets in connection pool.
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Impact Scope</span>
                <span className="text-sm font-bold text-rose-300 font-mono">12 Branch Officers</span>
              </div>
            </div>

            {/* Dynatrace Timeline Chart Simulation */}
            <div className="bg-[#140e20] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  <span>Microservice Heap Memory Leak & 504 Gateway Error Rate</span>
                </span>
                <span className="text-[10px] text-rose-400 font-bold">Duration: 42m active</span>
              </div>

              {/* Memory graph visual */}
              <div className="h-24 flex items-end space-x-1.5 pt-3 pb-1 border-b border-slate-800">
                <div className="flex-1 bg-rose-500/30 rounded-t h-[20%]" title="08:00 AM - 220MB (Normal)" />
                <div className="flex-1 bg-rose-500/40 rounded-t h-[30%]" title="08:15 AM - 350MB" />
                <div className="flex-1 bg-rose-500/50 rounded-t h-[45%]" title="08:30 AM - 510MB" />
                <div className="flex-1 bg-rose-500/60 rounded-t h-[60%]" title="08:45 AM - 690MB" />
                <div className="flex-1 bg-rose-500/75 rounded-t h-[80%]" title="09:00 AM - 840MB" />
                <div className="flex-1 bg-rose-500/95 rounded-t h-[98%] animate-pulse" title="09:15 AM - 998MB (OOM)" />
              </div>

              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>08:00 AM (Check-in start)</span>
                <span>08:45 AM (First 504 reports)</span>
                <span className="text-rose-400 font-bold">09:15 AM (OOM Crash / Saturation)</span>
              </div>
            </div>

            {/* Service Log Snippet */}
            <div className="bg-[#0e0a16] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                Container Logs: attendance-sync-pod-774d
              </div>
              <div className="text-rose-400">
                [ERROR] 09:14:22.381 [http-nio-8080-exec-14] SocketTimeoutException: Connection pool exhausted (active: 100/100, pending: 412)
              </div>
              <div className="text-rose-300">
                [FATAL] 09:15:01.104 java.lang.OutOfMemoryError: Java heap space (Unreleased BiometricClient instances)
              </div>
              <div className="text-amber-400">
                [WARN] 09:15:10.822 API Gateway returned 504 Gateway Timeout for branch_id: ICICI-BOM-04
              </div>
            </div>
          </div>

          {/* Subtitle / Dialogue Bar */}
          <div className="bg-[#171024] border-t border-rose-900/60 p-3 min-h-[58px] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
              <div className="text-xs sm:text-sm text-slate-200 font-medium">
                {activeSpeaker && (
                  <span className="font-bold text-rose-400 uppercase tracking-wide mr-2 text-[11px] font-mono">
                    [{activeSpeaker === 'martha' ? 'Martha (Regional Branch Ops)' : activeSpeaker === 'daniel' ? 'Daniel Kapoor (Lead Developer)' : activeSpeaker === 'aarav' ? 'Aarav (Lead Delivery Partner)' : 'You (Jane / Consultant)'}]:
                  </span>
                )}
                <span>{subtitleText}</span>
              </div>
            </div>

            {stage === 'transition_to_studio' && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleEnterStudio}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 text-white font-extrabold text-xs shadow-lg cursor-pointer flex items-center space-x-1.5 shrink-0 border border-rose-300"
              >
                <span>Launch Incident Studio</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* RIGHT: PARTICIPANTS GALLERY */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2.5 shrink-0">
          {/* Martha */}
          <div
            className={`flex-1 min-h-[105px] rounded-2xl bg-[#140e1e] border ${
              activeSpeaker === 'martha'
                ? 'border-rose-400 ring-2 ring-rose-500/40'
                : 'border-slate-800'
            } p-2 flex flex-col justify-between relative overflow-hidden transition-all`}
          >
            <div className="flex items-center space-x-2">
              <img
                src="/character/Emma_Carter/EmmaDP.png"
                alt="Martha"
                className="w-10 h-10 rounded-full border border-rose-400/50 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xs font-bold text-white">Martha</div>
                <div className="text-[10px] text-rose-400 font-mono">Regional Branch Ops</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                {activeSpeaker === 'martha' ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                ) : (
                  'Active'
                )}
              </span>
              <span className="text-slate-500">12 Officers Impacted</span>
            </div>
          </div>

          {/* Daniel */}
          <div
            className={`flex-1 min-h-[105px] rounded-2xl bg-[#140e1e] border ${
              activeSpeaker === 'daniel'
                ? 'border-rose-400 ring-2 ring-rose-500/40'
                : 'border-slate-800'
            } p-2 flex flex-col justify-between relative overflow-hidden transition-all`}
          >
            <div className="flex items-center space-x-2">
              <img
                src="/character/Daniel_Brooks/DanielDP.png"
                alt="Daniel"
                className="w-10 h-10 rounded-full border border-cyan-400/50 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xs font-bold text-white">Daniel Kapoor</div>
                <div className="text-[10px] text-cyan-400 font-mono">Lead Developer</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                {activeSpeaker === 'daniel' ? (
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                ) : (
                  'Sharing Screen'
                )}
              </span>
              <span className="text-slate-500">Hotfix Prepared</span>
            </div>
          </div>

          {/* Aarav */}
          <div
            className={`flex-1 min-h-[105px] rounded-2xl bg-[#140e1e] border ${
              activeSpeaker === 'aarav'
                ? 'border-amber-400 ring-2 ring-amber-500/40'
                : 'border-slate-800'
            } p-2 flex flex-col justify-between relative overflow-hidden transition-all`}
          >
            <div className="flex items-center space-x-2">
              <img
                src="/character/AaravDP.png"
                alt="Aarav"
                className="w-10 h-10 rounded-full border border-amber-400/50 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xs font-bold text-white">Aarav</div>
                <div className="text-[10px] text-amber-400 font-mono">Lead Delivery Partner</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                {activeSpeaker === 'aarav' ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                ) : (
                  'Active'
                )}
              </span>
              <span className="text-slate-500">RCA Governance</span>
            </div>
          </div>

          {/* Player Feed (Jane) */}
          <div className="flex-1 min-h-[105px] rounded-2xl bg-[#140e1e] border border-slate-800 p-2 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center font-bold text-white text-xs border border-white/20">
                YOU
              </div>
              <div>
                <div className="text-xs font-bold text-white">Jane / Consultant</div>
                <div className="text-[10px] text-slate-400 font-mono">Incident Commander</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>On Call</span>
              <span className="text-slate-500">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="h-14 bg-[#171022] border-t border-rose-900/60 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Clock className="w-4 h-4 text-rose-400" />
          <span>Incident Bridge Duration: 05:40 · SEV-1 In Progress</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMicMuted((prev) => !prev)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              micMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCameraOff((prev) => !prev)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              cameraOff ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {stage === 'closing_resolution' ? (
            <button
              onClick={onOpenScorecard}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
            >
              View Scorecard
            </button>
          ) : (
            <button
              onClick={handleEnterStudio}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>Incident Response Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
