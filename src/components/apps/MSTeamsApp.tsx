import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, CheckCircle2,
  Users, MonitorUp, MoreHorizontal, Shield, Wifi, AlertTriangle
} from 'lucide-react';

interface MSTeamsAppProps {
  onPenalty?: (trustDelta: number, xpDelta: number) => void;
}

// ── Meeting participants ──────────────────────────────────────────────────────
const PARTICIPANTS = [
  {
    id: 'marcus',
    name: 'Marcus Reed',
    label: 'Marcus (CTO)',
    role: 'Chief Technology Officer',
    dp: '/character/marcus_reed/MarcusDP.png',
    accentColor: '#3b82f6',
    speakingColor: 'rgba(59,130,246,0.9)',
    isSpeaking: true,
  },
  {
    id: 'aarav',
    name: 'Aarav Kapoor',
    label: 'Aarav (Your Manager)',
    role: 'Senior Digital Transformation Consultant',
    dp: '/character/AaravDP.png',
    accentColor: '#eab308',
    speakingColor: 'rgba(234,179,8,0.9)',
    isSpeaking: false,
  },
];

// ── CTO speech script ─────────────────────────────────────────────────────────
const SPEECH_SCRIPT = [
  { speaker: 'marcus', text: "Good morning everyone. Let's get started — Project Titan kickoff, Day 1." },
  { speaker: 'aarav',  text: "Morning Marcus. Alex just joined. We're all set on our end." },
  { speaker: 'marcus', text: "Good. Alex — I'm Marcus Reed, CTO. I'll define where we're going. You'll decide how we get there." },
  { speaker: 'marcus', text: "Remember: good technology solves business problems. Great technology prevents them." },
  { speaker: 'aarav',  text: "Alex, this is the real deal. Marcus doesn't repeat himself, so listen carefully." },
  { speaker: 'marcus', text: "Open your workstation. Project Titan starts now. I expect weekly executive updates, no surprises." },
  { speaker: 'marcus', text: "One more thing — professional standards apply here. Camera on, focus sharp. We clear?" },
];

// ── Live meeting timer ────────────────────────────────────────────────────────
function useLiveTimer() {
  const [seconds, setSeconds] = useState(247); // starts at ~4:07 like the screenshot
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export const MSTeamsApp: React.FC<MSTeamsAppProps> = ({ onPenalty }) => {
  // ── Stages ──
  const [stage, setStage] = useState<'permission' | 'in_call' | 'ended'>('permission');

  // ── Camera / mic ──
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn]       = useState(true);
  const [camPermission, setCamPermission] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const streamRef  = useRef<MediaStream | null>(null);
  // Callback ref: attaches stream immediately when the <video> element mounts
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  // ── Speech / speaking state ──
  const [speechIdx,   setSpeechIdx]   = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<'marcus' | 'aarav'>('marcus');
  const [aaravNod,    setAaravNod]    = useState(false);

  // ── Penalty toast ──
  const [penaltyToast, setPenaltyToast] = useState<string | null>(null);
  const penaltyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timer = useLiveTimer();

  // ── Speech script auto-advance ────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'in_call') return;
    if (speechIdx >= SPEECH_SCRIPT.length - 1) return;
    const delay = speechIdx === 0 ? 2000 : 4000;
    const id = setTimeout(() => {
      const next = speechIdx + 1;
      setSpeechIdx(next);
      setActiveSpeaker(SPEECH_SCRIPT[next].speaker as 'marcus' | 'aarav');
      // Aarav nod animation
      if (SPEECH_SCRIPT[next].speaker === 'aarav') {
        setAaravNod(true);
        setTimeout(() => setAaravNod(false), 800);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [stage, speechIdx]);

  // ── Cleanup camera on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (penaltyTimeoutRef.current) clearTimeout(penaltyTimeoutRef.current);
    };
  }, []);

  // ── Preview video ref (permission stage only) ───────────────────────────
  const previewVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  // ── Request camera permission ─────────────────────────────────────────────
  const requestCamera = useCallback(async () => {
    setCamPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCamPermission('granted');
      setIsCameraOn(true);
      setStage('in_call');
    } catch {
      setCamPermission('denied');
    }
  }, []);

  const joinWithoutCamera = useCallback(() => {
    setIsCameraOn(false);
    setStage('in_call');
    // Fire immediate penalty for joining with cam off
    showPenaltyToast("You joined without your camera. Marcus noticed. –5 Trust.");
    onPenalty?.(-5, 0);
  }, [onPenalty]);

  // ── Toggle camera on/off ─────────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    if (!isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(t => { t.enabled = true; });
        setIsCameraOn(true);
      } else {
        requestCamera();
      }
    } else {
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = false; });
      setIsCameraOn(false);
      showPenaltyToast("Your camera is off. Professional meetings expect video-on. –5 Trust.");
      onPenalty?.(-5, -10);
    }
  }, [isCameraOn, onPenalty, requestCamera]);

  const showPenaltyToast = (msg: string) => {
    setPenaltyToast(msg);
    if (penaltyTimeoutRef.current) clearTimeout(penaltyTimeoutRef.current);
    penaltyTimeoutRef.current = setTimeout(() => setPenaltyToast(null), 5000);
  };

  const isLastSpeech = speechIdx >= SPEECH_SCRIPT.length - 1;
  const currentLine  = SPEECH_SCRIPT[speechIdx];

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: CAMERA PERMISSION PROMPT
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === 'permission') {
    return (
      <div className="flex-1 flex flex-col bg-[#1a1a2e] text-white font-sans overflow-hidden">
        {/* Teams header bar */}
        <div className="h-10 bg-[#3F4499] px-4 flex items-center justify-between font-semibold select-none border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <Video className="w-4 h-4 text-white" />
            <span>Microsoft Teams — Project Titan Kickoff</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Connecting…</span>
            </div>
          </div>
        </div>

        {/* Permission modal */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a38] to-[#0f0f23] p-6">
          <div className="w-full max-w-md bg-[#252540]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-[#3F4499]/60 px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-400/60 flex-shrink-0">
                  <img src="/character/marcus_reed/MarcusDP.png" alt="Marcus" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Marcus Reed (CTO) is requesting your camera</p>
                  <p className="text-[10px] text-slate-400">Project Titan Kickoff · 3 participants</p>
                </div>
              </div>
            </div>

            {/* Preview area */}
            <div className="px-6 py-5 space-y-5">
              <div className="relative w-full aspect-video rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                {camPermission === 'granted' ? (
                  <video ref={previewVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-slate-500">
                    <VideoOff className="w-10 h-10" />
                    <span className="text-xs font-mono">Camera preview will appear here</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded font-mono text-slate-300">You</div>
              </div>

              {camPermission === 'denied' && (
                <div className="flex items-start space-x-2 text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px]">Camera access was denied. You can join without video, but this may affect your performance score.</p>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center leading-relaxed">
                Professional meetings at Brained require <span className="text-white font-semibold">camera-on</span>. Turning it off during a call with the CTO will impact your <span className="text-blue-400 font-semibold">Trust Score</span>.
              </p>

              {/* CTA buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={requestCamera}
                  disabled={camPermission === 'requesting'}
                  className="w-full py-3 rounded-xl bg-[#3F4499] hover:bg-[#4f54b9] text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {camPermission === 'requesting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Requesting camera access…</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Turn On Camera & Join</span>
                    </>
                  )}
                </button>
                <button
                  onClick={joinWithoutCamera}
                  className="w-full py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-white/10"
                >
                  <VideoOff className="w-4 h-4" />
                  <span>Join Without Video (–5 Trust)</span>
                </button>
              </div>

              {/* Participant preview row */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] text-slate-500 font-mono">Already in call:</span>
                {PARTICIPANTS.map(p => (
                  <div key={p.id} className="relative">
                    <img src={p.dp} alt={p.name} className="w-7 h-7 rounded-full object-cover border-2" style={{ borderColor: p.accentColor }} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                  </div>
                ))}
                <span className="text-[10px] text-slate-400 ml-1">+{PARTICIPANTS.length} waiting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: ENDED
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === 'ended') {
    return (
      <div className="flex-1 flex flex-col bg-slate-950/90 text-white font-sans overflow-hidden">
        <div className="h-10 bg-[#3F4499] px-4 flex items-center justify-between font-semibold select-none border-b border-white/10 flex-shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-white" />
            <span>Microsoft Teams — Project Titan Kickoff</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Teams Meeting Concluded</h2>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            You have received the executive mandate from Marcus Reed (CTO). Open Apple Mail, Slack, or Apple Notes to begin executing on Project Titan.
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Meeting recording saved · Duration: {timer}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: IN CALL — Main meeting grid
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-[#0d0d1a] text-white font-sans overflow-hidden relative select-none">

      {/* ── Penalty toast ───────────────────────────────────────────────── */}
      {penaltyToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2.5 bg-[#2d0a0a] backdrop-blur-md border border-red-500/60 text-red-200 px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold max-w-sm text-center"
          style={{ animation: 'slideDown 0.3s ease' }}
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{penaltyToast}</span>
        </div>
      )}

      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="h-10 bg-[#2d2d5e] px-4 flex items-center justify-between flex-shrink-0 border-b border-white/10 text-xs">
        <div className="flex items-center space-x-2 font-semibold">
          <Video className="w-4 h-4 text-blue-400" />
          <span>Microsoft Teams — Project Titan Kickoff</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">{timer}</span>
            <span className="text-emerald-600">· Live</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
            <Users className="w-3 h-3" />
            <span>3 participants</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
            <Shield className="w-3 h-3" />
            <span>E2E encrypted</span>
          </div>
        </div>
      </div>

      {/* ── Main meeting grid — left: Marcus big | right: sidebar ─────────── */}
      <div className="flex-1 flex gap-2 p-2.5 overflow-hidden min-h-0">

        {/* ── LEFT: Marcus (CTO) — dominant speaker tile ─────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden bg-[#111120] border-2 transition-all duration-300 flex-1"
          style={{
            borderColor: activeSpeaker === 'marcus' ? '#3b82f6' : 'rgba(255,255,255,0.07)',
            boxShadow: activeSpeaker === 'marcus' ? '0 0 28px rgba(59,130,246,0.4)' : 'none',
          }}
        >
          {/* Face-centred portrait */}
          <img
            src="/character/marcus_reed/MarcusDP.png"
            alt="Marcus"
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'center 18%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          {/* Speaking waveform */}
          {activeSpeaker === 'marcus' && (
            <div className="absolute top-4 right-4 flex items-end space-x-0.5 h-5">
              {[4, 7, 10, 7, 4, 7, 10].map((h, i) => (
                <div key={i} className="w-[3px] rounded-full bg-blue-400"
                  style={{ height: `${h}px`, animation: `wavebar ${0.35 + i * 0.07}s ease-in-out infinite alternate` }}
                />
              ))}
            </div>
          )}

          {/* Subtitle box — sits at the top */}
          {activeSpeaker === 'marcus' && (
            <div className="absolute top-4 left-4 right-16 bg-[#3F4499]/92 backdrop-blur-md rounded-2xl px-5 py-3 border border-blue-400/25 shadow-2xl">
              <p className="text-sm font-semibold text-white leading-snug">"{currentLine.text}"</p>
            </div>
          )}
          {activeSpeaker === 'aarav' && (
            <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 shadow-xl">
              <p className="text-xs text-slate-400 leading-snug italic">(Aarav is speaking…)</p>
            </div>
          )}

          {/* Name tag */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: '#3b82f6',
                animation: activeSpeaker === 'marcus' ? 'micropulse 0.8s ease-in-out infinite alternate' : 'none',
                opacity: activeSpeaker === 'marcus' ? 1 : 0.4,
              }}
            />
            <span className="text-sm font-bold text-white">Marcus Reed</span>
            <span className="text-[10px] text-blue-300 font-mono bg-blue-900/40 px-1.5 py-0.5 rounded">CTO</span>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR: Aarav + You ─────────────────────────────────── */}
        <div className="flex flex-col gap-2" style={{ width: '32%' }}>

          {/* Aarav tile — top half */}
          <div
            className="relative rounded-2xl overflow-hidden bg-[#111120] border-2 transition-all duration-300 flex-1"
            style={{
              borderColor: activeSpeaker === 'aarav' ? '#eab308' : 'rgba(255,255,255,0.07)',
              boxShadow: activeSpeaker === 'aarav' ? '0 0 20px rgba(234,179,8,0.35)' : 'none',
              transform: aaravNod ? 'scale(1.015)' : 'scale(1)',
              transition: 'transform 0.25s ease, border-color 0.3s, box-shadow 0.3s',
            }}
          >
            <img
              src="/character/AaravDP.png"
              alt="Aarav"
              className="w-full h-full"
              style={{ objectFit: 'cover', objectPosition: 'center 18%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Subtitle when Aarav speaks */}
            {activeSpeaker === 'aarav' && (
              <div className="absolute top-3 left-3 right-3 bg-[#6b5000]/90 backdrop-blur-md rounded-xl px-3 py-2 border border-yellow-400/30 shadow-xl">
                <p className="text-[11px] font-semibold text-white leading-snug">"{currentLine.text}"</p>
              </div>
            )}

            {/* Waveform */}
            {activeSpeaker === 'aarav' && (
              <div className="absolute top-3 right-3 flex items-end space-x-0.5 h-4">
                {[3, 5, 7, 5, 3].map((h, i) => (
                  <div key={i} className="w-[2px] rounded-full bg-yellow-400"
                    style={{ height: `${h}px`, animation: `wavebar ${0.35 + i * 0.07}s ease-in-out infinite alternate` }}
                  />
                ))}
              </div>
            )}

            {/* Name tag */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full"
                style={{
                  background: '#eab308',
                  opacity: activeSpeaker === 'aarav' ? 1 : 0.4,
                  animation: activeSpeaker === 'aarav' ? 'micropulse 0.8s ease-in-out infinite alternate' : 'none',
                }}
              />
              <span className="text-xs font-bold text-white">Aarav</span>
              <span className="text-[9px] text-yellow-300 font-mono bg-yellow-900/40 px-1 py-0.5 rounded">Manager</span>
            </div>
          </div>

          {/* YOU tile — bottom half */}
          <div
            className="relative rounded-2xl overflow-hidden border-2 flex-1 transition-all duration-300"
            style={{
              background: '#0a0a18',
              borderColor: isCameraOn ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.45)',
              boxShadow: !isCameraOn ? '0 0 16px rgba(239,68,68,0.18)' : 'none',
            }}
          >
            {isCameraOn ? (
              /* Camera ON — contain so face isn't cropped */
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
            ) : (
              /* Camera OFF */
              <div className="w-full h-full flex flex-col items-center justify-center space-y-2.5 bg-[#0a0a18]">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                  <span className="text-xl font-black text-slate-400">YOU</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-red-950/80 border border-red-600/40 text-red-300 px-3 py-1 rounded-full text-[10px] font-semibold">
                  <VideoOff className="w-3 h-3" />
                  <span>Camera Off</span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Your name tag */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <span className="text-xs font-bold text-white">You</span>
              {!isCameraOn && <VideoOff className="w-3 h-3 text-red-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* ── Control bar ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#13132a] border-t border-white/8 px-4 py-2">
        <div className="flex items-center justify-between w-full">

          {/* Left — mic / cam / share / more */}
          <div className="flex items-center space-x-1.5">
            {/* Mic */}
            <button onClick={() => setIsMicOn(m => !m)} title={isMicOn ? 'Mute' : 'Unmute'}
              className="flex flex-col items-center space-y-0.5 cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40'
              }`}>
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </div>
              <span className="text-[9px] text-slate-500 font-medium">{isMicOn ? 'Mute' : 'Unmute'}</span>
            </button>

            {/* Camera */}
            <button onClick={toggleCamera} title={isCameraOn ? 'Stop Video' : 'Start Video'}
              className="flex flex-col items-center space-y-0.5 cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCameraOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40'
              }`}>
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </div>
              <span className="text-[9px] text-slate-500 font-medium">{isCameraOn ? 'Camera' : 'No Video'}</span>
            </button>

            {/* Share — disabled */}
            <button disabled className="flex flex-col items-center space-y-0.5 cursor-not-allowed opacity-30">
              <div className="w-10 h-10 rounded-full bg-white/8 text-slate-500 flex items-center justify-center">
                <MonitorUp className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-600 font-medium">Share</span>
            </button>

            {/* More — disabled */}
            <button disabled className="flex flex-col items-center space-y-0.5 cursor-not-allowed opacity-30">
              <div className="w-10 h-10 rounded-full bg-white/8 text-slate-500 flex items-center justify-center">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-600 font-medium">More</span>
            </button>
          </div>

          {/* Center — Accept Mandate */}
          <div className="flex-1 flex justify-center px-2">
            {isLastSpeech && (
              <button
                onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setStage('ended'); }}
                className="px-5 py-2 rounded-2xl font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all duration-200 hover:scale-105 text-white"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 20px rgba(16,185,129,0.5)',
                  animation: 'glow 1.5s ease-in-out infinite alternate',
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Mandate &amp; Return to Workstation</span>
              </button>
            )}
          </div>

          {/* Right — Leave */}
          <button
            onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setStage('ended'); }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full font-bold text-xs text-white transition-all duration-200 hover:scale-105 cursor-pointer flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
            }}
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes wavebar {
          from { transform: scaleY(0.3); opacity: 0.6; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
        @keyframes micropulse {
          from { opacity: 0.6; transform: scale(0.85); }
          to   { opacity: 1;   transform: scale(1.1);  }
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-10px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);     opacity: 1; }
        }
        @keyframes glow {
          from { box-shadow: 0 0 18px rgba(16,185,129,0.4); }
          to   { box-shadow: 0 0 32px rgba(16,185,129,0.7); }
        }
      `}</style>
    </div>
  );
};
