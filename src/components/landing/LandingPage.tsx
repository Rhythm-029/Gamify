import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../onboarding/SoundEngine';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onViewLeaderboard: () => void;
  onViewCertificate: () => void;
}

// ──────────────────────────────────────────────────────────────────
// Corporate Ambient Music Engine
// Cinematic dark-corporate tension pad — Dm/Am minor suspended chords
// Low drone + melodic arpeggiated notes + reverb simulation
// ──────────────────────────────────────────────────────────────────
function buildCorporateAmbience(ctx: AudioContext): { nodes: AudioNode[]; master: GainNode } {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.40, ctx.currentTime);
  master.connect(ctx.destination);

  const nodes: AudioNode[] = [master];

  // Reverb simulation via delay
  const delay = ctx.createDelay();
  delay.delayTime.setValueAtTime(0.4, ctx.currentTime);
  const delayGain = ctx.createGain();
  delayGain.gain.setValueAtTime(0.3, ctx.currentTime);
  delay.connect(delayGain);
  delayGain.connect(delay);
  delayGain.connect(master);
  nodes.push(delay, delayGain);

  // Warm lowpass filter
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, ctx.currentTime);
  filter.connect(master);
  filter.connect(delay);
  nodes.push(filter);

  // Warm continuous drone chords (A-minor ninth / F-major seventh sequence)
  const freqs = [110.0, 164.8, 220.0, 261.6, 329.6, 392.0]; // A2, E3, A3, C4, E4, G4
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.connect(g);
    g.connect(filter);
    osc.start(ctx.currentTime);
    nodes.push(osc, g);
  });

  // Repeating melodic arpeggio chime loop (every 3 seconds)
  const arpNotes = [440.0, 523.3, 659.3, 784.0, 659.3, 523.3]; // A4 C5 E5 G5 E5 C5
  let noteIndex = 0;

  const playNextNote = () => {
    if (ctx.state !== 'running') return;
    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const freq = arpNotes[noteIndex % arpNotes.length];
      noteIndex++;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.6);
    } catch {}
  };

  playNextNote();
  const intervalId = setInterval(playNextNote, 2200);

  // Store interval so we can clear it on stop
  (master as any)._intervalId = intervalId;

  return { nodes, master };
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onViewLeaderboard: _onViewLeaderboard,
  onViewCertificate: _onViewCertificate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambienceRef = useRef<{ nodes: AudioNode[]; master: GainNode } | null>(null);
  const [, setMusicStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // ── Start corporate ambient tune (Web Audio synth pad) ──
  const startMusic = () => {
    try {
      if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        ambienceRef.current = buildCorporateAmbience(ctx);
        setMusicStarted(true);
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
        setMusicStarted(true);
      }
    } catch (e) {
      console.warn('Audio synth init failed:', e);
    }
  };

  // ── Enable audio safely on valid user gesture (click/keydown/touchstart) ──
  const enableAllAudio = () => {
    try {
      const vid = videoRef.current;
      if (vid) {
        vid.muted = false;
        vid.volume = 0.6;
        if (vid.paused) {
          vid.play().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Video audio unmute failed:', e);
    }
    startMusic();
    setIsMuted(false);
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (isMuted) {
      enableAllAudio();
    } else {
      if (vid) {
        vid.muted = true;
      }
      if (ambienceRef.current && audioCtxRef.current) {
        ambienceRef.current.master.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      }
      setIsMuted(true);
    }
  };

  useEffect(() => {
    const vid = videoRef.current;

    // Try playing with sound immediately (works if user already interacted or browser allows it)
    if (vid) {
      vid.muted = false;
      vid.volume = 0.6;
      vid.play().then(() => {
        // Played with sound successfully
        setIsMuted(false);
        startMusic();
      }).catch(() => {
        // Browser blocked unmuted autoplay — fall back to muted, then unmute on first interaction
        vid.muted = true;
        vid.play().catch(() => {});

        const onInteract = () => {
          enableAllAudio();
        };

        window.addEventListener('click', onInteract, { once: true });
        window.addEventListener('keydown', onInteract, { once: true });
        window.addEventListener('touchstart', onInteract, { once: true });
      });
    } else {
      startMusic();
    }

    return () => {
      if (ambienceRef.current) {
        if ((ambienceRef.current.master as any)._intervalId) {
          clearInterval((ambienceRef.current.master as any)._intervalId);
        }
        const ctx = audioCtxRef.current;
        if (ctx) {
          ambienceRef.current.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
          setTimeout(() => ctx.close(), 1500);
        }
      }
    };
  }, []);

  const handleEnterRoom = () => {
    // Mute video and fade out corporate ambient tune when entering simulation room
    const vid = videoRef.current;
    if (vid) vid.muted = true;

    if (ambienceRef.current && audioCtxRef.current) {
      ambienceRef.current.master.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.8);
    }
    sound.playSystemClearance();
    onStartOnboarding();
  };

  return (
    <div className="h-screen bg-[#070913] text-white flex flex-col font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">

      {/* ── HERO VIDEO — FILLS FULL VIEWPORT, NO HEADER ── */}
      <section
        className="relative flex-1 overflow-hidden"
        style={{ background: '#000' }}
      >
        {/*
          object-cover = fills 100% width AND height, no black bars ever.
          objectPosition 'center 15%' = content sits slightly below center-top
          so the video headline is visible but not right at the cut.
        */}
        <video
          ref={videoRef}
          src="/start_video/intro_1080p.mp4"
          poster="/start_video/frame0.jpg"
          autoPlay
          playsInline
          preload="auto"
          onPlay={(e) => {
            try { e.currentTarget.playbackRate = 0.8; } catch {}
          }}
          onEnded={(e) => e.currentTarget.pause()}
          className="absolute inset-0 w-full h-full select-none"
          style={{
            objectFit: 'cover',
            objectPosition: 'center 15%',
            willChange: 'transform',
          }}
        />

        {/* Floating Sound Badge */}
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-30 flex items-center space-x-2 backdrop-blur-md transition-all cursor-pointer shadow-lg px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border"
          style={isMuted
            ? { background: 'rgba(15,15,30,0.85)', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.5)' }
            : { background: 'rgba(15,15,30,0.6)', color: '#6ee7b7', borderColor: 'rgba(110,231,183,0.3)' }
          }
        >
          {isMuted
            ? <><VolumeX className="w-4 h-4 text-amber-400" /><span>Unmute</span></>
            : <><Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /><span>Sound On</span></>
          }
        </button>

        {/* Bottom fade only — minimal, doesn't dim video content */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: '28%', background: 'linear-gradient(to top, #070913 0%, rgba(7,9,19,0.4) 60%, transparent 100%)' }} />

        {/* Enter Room CTA — floats at bottom of video */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 w-full px-4 text-center">
          <button onClick={handleEnterRoom}
            className="px-10 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-lg transition-all shadow-[0_0_70px_rgba(255,255,255,0.5)] hover:scale-105 flex items-center space-x-3 cursor-pointer group">
            <span>Enter the room</span>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};
