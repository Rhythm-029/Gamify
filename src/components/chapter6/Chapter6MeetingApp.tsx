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
  Activity,
  AlertTriangle,
  MonitorUp,
  Database,
  Layers,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import type { Chapter6State } from '../../types/chapter6';
import { sound } from '../onboarding/SoundEngine';

interface Chapter6MeetingAppProps {
  chapter6State: Chapter6State;
  onUpdateState: (updater: Partial<Chapter6State> | ((prev: Chapter6State) => Chapter6State)) => void;
  onOpenCommandCentre: () => void;
  onOpenScorecard: () => void;
}

export const Chapter6MeetingApp: React.FC<Chapter6MeetingAppProps> = ({
  chapter6State,
  onUpdateState,
  onOpenCommandCentre,
  onOpenScorecard,
}) => {
  // Call stages:
  // 'connecting' -> 'daniel_intro' -> 'player_question' -> 'daniel_explain' -> 'durgaprasad_add' -> 'marcus_decree' -> 'transition_to_cc'
  // Or if completed: 'closing_reaction'
  const [stage, setStage] = useState<
    | 'connecting'
    | 'daniel_intro'
    | 'player_question'
    | 'daniel_explain'
    | 'durgaprasad_add'
    | 'marcus_decree'
    | 'transition_to_cc'
    | 'closing_reaction'
  >(() => {
    if (chapter6State.completed) return 'closing_reaction';
    if (chapter6State.meetingCompleted || chapter6State.commandCentreOpened) return 'transition_to_cc';
    return 'connecting';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'daniel' | 'durgaprasad' | 'marcus' | 'player' | null>('daniel');
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
    if (chapter6State.completed) {
      setStage('closing_reaction');
    }
  }, [chapter6State.completed]);

  // Meeting progression
  useEffect(() => {
    if (stage === 'connecting') {
      sound.playMessagePing();
      const timer = setTimeout(() => {
        setStage('daniel_intro');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "Hey, we've completed the initial load test. Most of the modules are working, but when we simulated 30,000 employees logging in together, the appraisal submission endpoint started slowing down. We're seeing response times of around 4.2 seconds."
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'daniel_intro') {
      timer = setTimeout(() => {
        setStage('player_question');
        setActiveSpeaker('player');
        setSubtitleText("Prompt: Ask Daniel what seems to be causing the degradation.");
      }, 6500);
    } else if (stage === 'daniel_explain') {
      timer = setTimeout(() => {
        setStage('durgaprasad_add');
        setActiveSpeaker('durgaprasad');
        setSubtitleText(
          "From the SRE perspective, Redis cache hit rate is sitting at only 42%. Over half of all appraisal form queries are falling through to PostgreSQL, which is saturating our 200-connection pool to 98%."
        );
      }, 6000);
    } else if (stage === 'durgaprasad_add') {
      timer = setTimeout(() => {
        setStage('marcus_decree');
        setActiveSpeaker('marcus');
        setSubtitleText(
          "Let's be very clear here. We cannot push this to production just because the functional tests passed. We need the performance issue resolved, the test repeated and the required approvals documented."
        );
      }, 6200);
    } else if (stage === 'marcus_decree') {
      timer = setTimeout(() => {
        setStage('transition_to_cc');
        setActiveSpeaker(null);
        setSubtitleText(
          "The meeting has ended. The Performance Command Centre application is now available on your desktop."
        );
        onUpdateState({ meetingCompleted: true, commandCentreOpened: true });
      }, 7500);
    }
    return () => clearTimeout(timer);
  }, [stage, onUpdateState]);

  const handlePlayerQuestionClick = () => {
    sound.playButtonSelect();
    setStage('daniel_explain');
    setActiveSpeaker('daniel');
    setSubtitleText(
      "The database connection pool is getting overwhelmed. Marcus has reviewed the initial results, and he wants us to investigate the caching configuration before we move forward."
    );
  };

  const handleEnterCommandCentre = () => {
    sound.playSystemClearance();
    onUpdateState({ meetingCompleted: true, commandCentreOpened: true, activeSection: 'diagnose' });
    onOpenCommandCentre();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] text-slate-100 select-none overflow-hidden font-sans">
      {/* TEAMS CALL TOP BAR */}
      <div className="h-12 bg-[#101424] border-b border-slate-800/80 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-[#4f52b2] flex items-center justify-center text-white font-bold text-xs shadow">
            T
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Project Amigo — 30,000-User Stress Test Performance Review</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                CRITICAL SEV-2 INCIDENT
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Live Bridge · 4 Participants · Daniel Brooks sharing screen
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {stage === 'closing_reaction' ? (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View Performance Scorecard</span>
            </button>
          ) : (
            <button
              onClick={handleEnterCommandCentre}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer border border-cyan-400/40"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-200" />
              <span>Open Performance Command Centre</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN CALL STAGE */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative">
        {/* LEFT / CENTER: DANIEL'S SHARED SCREEN */}
        <div className="flex-1 bg-[#0d1222] border border-cyan-500/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          {/* Shared Screen Header */}
          <div className="h-9 bg-[#13192e] border-b border-slate-800 px-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-cyan-300 font-mono text-[11px] font-bold">
              <MonitorUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Daniel Brooks is sharing: APM Cluster Dashboard (Simulated 30,000 Load)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                LATENCY SLA BREACHED
              </span>
            </div>
          </div>

          {/* Screen Content: Live Interactive APM Telemetry Mockup */}
          <div className="flex-1 p-4 bg-[#090d18] flex flex-col space-y-3.5 overflow-y-auto font-mono text-xs">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#11172a] border border-cyan-500/30 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>Concurrent Users</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-bold text-cyan-300 mt-1 font-mono">30,000</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-0.5">● Target Reached</div>
              </div>

              <div className="bg-[#11172a] border border-rose-500/50 rounded-xl p-3 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>API Response Time</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                </div>
                <div className="text-xl font-bold text-rose-400 mt-1 font-mono">4.2 sec</div>
                <div className="text-[9px] text-rose-400 font-bold mt-0.5">▲ SLA Violation (&gt; 2.0s)</div>
              </div>

              <div className="bg-[#11172a] border border-rose-500/50 rounded-xl p-3 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>DB Pool Utilization</span>
                  <Database className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-xl font-bold text-rose-400 mt-1 font-mono">98% (196/200)</div>
                <div className="text-[9px] text-rose-400 font-bold mt-0.5">▲ Saturated / Exhausted</div>
              </div>

              <div className="bg-[#11172a] border border-amber-500/40 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span>Redis Cache Hit Rate</span>
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-amber-400 mt-1 font-mono">42%</div>
                <div className="text-[9px] text-amber-400 font-bold mt-0.5">▼ Needs Work (High Miss)</div>
              </div>
            </div>

            {/* Simulated Live APM Chart & Slowest Query Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-[160px]">
              {/* Latency Trace Box */}
              <div className="bg-[#10162a] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] font-bold text-slate-200">Trace Explorer: /api/v1/appraisal/submit</span>
                  <span className="text-rose-400 font-bold text-[10px]">4,210 ms total</span>
                </div>
                <div className="space-y-1.5 py-2 text-[10px] text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">1. AuthGateway / SSO Verify</span>
                    <span className="text-emerald-400 font-bold">35 ms [OK]</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">2. Redis Template Cache Lookup</span>
                    <span className="text-amber-400 font-bold">12 ms [CACHE MISS]</span>
                  </div>
                  <div className="flex justify-between items-center py-1 bg-rose-500/10 px-1.5 rounded border border-rose-500/30">
                    <span className="text-rose-300 font-bold">3. PostgresPool.getConnection()</span>
                    <span className="text-rose-400 font-extrabold">3,150 ms [BLOCKED/QUEUED]</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">4. SELECT * FROM appraisal_forms</span>
                    <span className="text-rose-400 font-bold">890 ms</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  Postgres pool has 412 incoming requests waiting in queue.
                </div>
              </div>

              {/* Real-time Response Time Histogram Sparkline */}
              <div className="bg-[#10162a] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] font-bold text-slate-200">Latency Distribution (30k Users)</span>
                  <span className="text-[10px] text-slate-400 font-mono">P99: 4.8s · P95: 4.2s</span>
                </div>
                {/* Visual Bars */}
                <div className="flex items-end space-x-2 h-24 pt-3 pb-1">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-500/50 rounded-t h-[25%]" />
                    <span className="text-[9px] text-slate-400">&lt;100ms</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-500/40 rounded-t h-[15%]" />
                    <span className="text-[9px] text-slate-400">100-300ms</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-amber-500/60 rounded-t h-[20%]" />
                    <span className="text-[9px] text-slate-400">300-500ms</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-rose-500/80 rounded-t h-[75%] animate-pulse" />
                    <span className="text-[9px] text-rose-400 font-bold">&gt;4,000ms</span>
                  </div>
                </div>
                <div className="text-[9px] text-rose-300/80 text-center font-mono bg-rose-950/40 py-1 rounded border border-rose-900/60">
                  Critical bottleneck detected in database connection pooling & cache miss rate
                </div>
              </div>
            </div>
          </div>

          {/* Live Meeting Subtitle Bar */}
          <div className="bg-[#12182c] border-t border-slate-800 p-3 min-h-[58px] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <div className="text-xs sm:text-sm text-slate-200 font-medium">
                {activeSpeaker && (
                  <span className="font-bold text-cyan-400 uppercase tracking-wide mr-2 text-[11px] font-mono">
                    [{activeSpeaker === 'daniel' ? 'Daniel Kapoor (Dev Lead)' : activeSpeaker === 'durgaprasad' ? 'Durgaprasad Karri (SRE)' : activeSpeaker === 'marcus' ? 'Marcus Reed (CTO)' : 'You (Consultant)'}]:
                  </span>
                )}
                <span>{subtitleText}</span>
              </div>
            </div>

            {stage === 'player_question' && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePlayerQuestionClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer flex items-center space-x-1.5 shrink-0 border border-amber-300"
              >
                <span>"What seems to be causing it?"</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}

            {stage === 'transition_to_cc' && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleEnterCommandCentre}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-lg cursor-pointer flex items-center space-x-1.5 shrink-0 border border-cyan-300"
              >
                <span>Launch Performance Command Centre</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* RIGHT: PARTICIPANTS GALLERY */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2.5 shrink-0">
          {/* Daniel Brooks */}
          <div
            className={`flex-1 min-h-[105px] rounded-2xl bg-[#0f1424] border ${
              activeSpeaker === 'daniel'
                ? 'border-cyan-400 ring-2 ring-cyan-500/40'
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
                  'Muted'
                )}
              </span>
              <span className="text-slate-500">Shared Screen Active</span>
            </div>
          </div>

          {/* Durgaprasad Karri */}
          <div
            className={`flex-1 min-h-[105px] rounded-2xl bg-[#0f1424] border ${
              activeSpeaker === 'durgaprasad'
                ? 'border-cyan-400 ring-2 ring-cyan-500/40'
                : 'border-slate-800'
            } p-2 flex flex-col justify-between relative overflow-hidden transition-all`}
          >
            <div className="flex items-center space-x-2">
              <img
                src="/character/durgaprasad.jpg"
                alt="Durgaprasad Karri"
                className="w-10 h-10 rounded-full border border-cyan-400/50 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xs font-bold text-white">Durgaprasad Karri</div>
                <div className="text-[10px] text-cyan-400 font-mono">SRE | Cloud & DevOps</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                {activeSpeaker === 'durgaprasad' ? (
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                ) : (
                  'Muted'
                )}
              </span>
              <span className="text-slate-500">Observability Lead</span>
            </div>
          </div>

          {/* Marcus Reed */}
          <div
            className={`flex-1 min-h-[105px] rounded-2xl bg-[#0f1424] border ${
              activeSpeaker === 'marcus'
                ? 'border-cyan-400 ring-2 ring-cyan-500/40'
                : 'border-slate-800'
            } p-2 flex flex-col justify-between relative overflow-hidden transition-all`}
          >
            <div className="flex items-center space-x-2">
              <img
                src="/character/marcus_reed/MarcusDP.png"
                alt="Marcus"
                className="w-10 h-10 rounded-full border border-cyan-400/50 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xs font-bold text-white">Marcus Reed</div>
                <div className="text-[10px] text-rose-400 font-mono">Chief Technology Officer</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                {activeSpeaker === 'marcus' ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                ) : (
                  'Muted'
                )}
              </span>
              <span className="text-slate-500">Executive Sponsor</span>
            </div>
          </div>

          {/* Player Feed */}
          <div
            className={`flex-1 min-h-[105px] rounded-2xl bg-[#0f1424] border ${
              activeSpeaker === 'player'
                ? 'border-amber-400 ring-2 ring-amber-500/40'
                : 'border-slate-800'
            } p-2 flex flex-col justify-between relative overflow-hidden`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs border border-white/20">
                YOU
              </div>
              <div>
                <div className="text-xs font-bold text-white">Consultant (You)</div>
                <div className="text-[10px] text-slate-400 font-mono">Transformation Lead</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                {activeSpeaker === 'player' ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                ) : (
                  'Active'
                )}
              </span>
              <span className="text-slate-500">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLS BAR */}
      <div className="h-14 bg-[#101424] border-t border-slate-800/80 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Incident Call Duration: 04:12</span>
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
          {stage === 'closing_reaction' ? (
            <button
              onClick={onOpenScorecard}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
            >
              View Scorecard
            </button>
          ) : (
            <button
              onClick={handleEnterCommandCentre}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>Switch to Command Centre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
