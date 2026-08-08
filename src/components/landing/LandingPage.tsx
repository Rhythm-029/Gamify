import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Users, Clock, ChevronDown, 
  Layers, Cpu, FileText, Volume2, VolumeX
} from 'lucide-react';
import { sound } from '../onboarding/SoundEngine';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onViewLeaderboard: () => void;
  onViewCertificate: () => void;
}

const GAME_STAKEHOLDERS = [
  {
    id: "aarav",
    name: "Aarav Kapoor",
    role: "Senior Transformation Consultant",
    department: "Digital Transformation Office",
    dp: "/character/AaravDP.png",
    accentColor: "#eab308",
    trustLevel: 95,
    tags: ["Your Guide", "Seen It All", "No Sugarcoating"],
    quote: "This place runs fast, decisions matter, and everyone here is sharp. Don't try to impress everyone — just make the right decisions."
  },
  {
    id: "marcus",
    name: "Marcus Reed",
    role: "Chief Technology Officer (CTO)",
    department: "Technology & Engineering",
    dp: "/character/marcus_reed/MarcusDP.png",
    accentColor: "#3b82f6",
    trustLevel: 65,
    tags: ["Intimidating", "Zero Shortcuts", "Better Be Prepared"],
    quote: "I don't repeat myself. Think before you commit. Technology remembers every decision."
  },
  {
    id: "emma",
    name: "Emma Carter",
    role: "HR Transformation Specialist",
    department: "HR Transformation",
    dp: "/character/Emma_Carter/EmmaDP.png",
    accentColor: "#10b981",
    trustLevel: 80,
    tags: ["Empathetic", "Notices Everything", "People Over Process"],
    quote: "Behind every requirement is a real employee. Systems fail when people were never understood."
  },
  {
    id: "olivia",
    name: "Olivia Hayes",
    role: "Director of InfoSec & Compliance",
    department: "Cybersecurity & Governance",
    dp: "/character/Olivia_hayes/OliviaDP.png",
    accentColor: "#e11d48",
    trustLevel: 50,
    tags: ["Non-Negotiable", "Evidence Only", "Will Halt Launch"],
    quote: "I'm watching every endpoint you touch. Bring evidence, or don't bring anything. Hope isn't a security strategy."
  },
  {
    id: "daniel",
    name: "Daniel Brooks",
    role: "Transformation Program Manager",
    department: "Program Delivery",
    dp: "/character/Daniel_Brooks/DanielDP.png",
    accentColor: "#f97316",
    trustLevel: 70,
    tags: ["Deadline Obsessed", "Tracks Everything", "Coffee Required"],
    quote: "Fourteen deliverables. Three sprints. Already behind. Keep Jira updated or I'll find out anyway."
  },
  {
    id: "sophia",
    name: "Sophia Bennett",
    role: "VP of HR — Titan Manufacturing",
    department: "Client: Titan Manufacturing",
    dp: "/character/Sophia_bennett/SophiaDP.png",
    accentColor: "#9333ea",
    trustLevel: 60,
    tags: ["Results Over Everything", "12,000 People Waiting", "No Jargon"],
    quote: "Our 12,000 factory workers are stuck on systems from 2009. I don't need impressive — I need it to work."
  }
];

const SIMULATION_APPS = [
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: <Users className="w-5 h-5 text-indigo-400" />,
    tag: 'Real-time Video Calls & Chat',
    desc: 'Receive incoming video calls from CTO Marcus and mentor Aarav. Manage high-pressure stakeholder group chats with instant voice synthesis.'
  },
  {
    id: 'mail',
    name: 'Outlook Mail',
    icon: <FileText className="w-5 h-5 text-sky-400" />,
    tag: 'Executive Inbox & Approvals',
    desc: 'Filter urgent directives from non-critical noise. Compose strategic responses that impact C-Suite trust levels in real time.'
  },
  {
    id: 'jira',
    name: 'Linear & Jira Board',
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    tag: 'Sprint & Scope Velocity',
    desc: 'Manage sprint backlogs, prioritize critical technical debt vs feature requests, and prevent deadline slippage before PM Daniel intervenes.'
  },
  {
    id: 'whiteboard',
    name: 'Architecture Board',
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    tag: 'System Design & Diagramming',
    desc: 'Evaluate microservices architectures, data pipelines, and security controls to satisfy InfoSec Lead Olivia\'s zero-trust audit.'
  }
];

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
  onViewLeaderboard,
  onViewCertificate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambienceRef = useRef<{ nodes: AudioNode[]; master: GainNode } | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
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
    <div className="min-h-screen bg-[#070913] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-500 selection:text-white">

      {/* ── STICKY HEADER ── */}
      <header className="w-full bg-[#070913] border-b border-white/10 sticky top-0 z-50 h-14">
        <nav className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-600 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-xs text-white">BQ</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white">Brained Quest</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wider">Enterprise Edition</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-mono tracking-wider text-slate-300 uppercase">
            <a href="#overview" className="hover:text-white transition-colors">The Mandate</a>
            <a href="#characters" className="hover:text-white transition-colors">Stakeholders</a>
            <a href="#workspace" className="hover:text-white transition-colors">Simulation OS</a>
            <button onClick={onViewLeaderboard} className="hover:text-white transition-colors cursor-pointer">Leaderboard</button>
            <button onClick={onViewCertificate} className="hover:text-white transition-colors cursor-pointer">Credentials</button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sound Toggle Button */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-mono"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
              <span className="hidden sm:inline">{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>

            <button onClick={handleEnterRoom}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-xl shadow-indigo-600/40 hover:scale-105 flex items-center space-x-2 cursor-pointer">
              <span>Start Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO VIDEO — BELOW HEADER, FILLS FULL WIDTH+HEIGHT, NO BARS ── */}
      <section
        className="relative flex-shrink-0 overflow-hidden"
        style={{ height: 'calc(100vh - 3.5rem)', background: '#000' }}
      >
        {/*
          object-cover = fills 100% width AND height, no black bars ever.
          objectPosition 'center 15%' = content sits slightly below center-top
          so the video headline is visible but not right at the cut.
          ?v=3 cache-bust = forces browser to load the new CRF-8 sharpened encode.
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
            imageRendering: 'high-quality',
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

          <motion.button
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-white/80 cursor-pointer bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20"
            onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}>
            <span>Scroll for Mandate &amp; Game Details</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </section>

      {/* ── SCROLL SECTION 1: MANDATE ── */}
      <section id="overview" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10 w-full">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-extrabold">CORPORATE REALITY SIMULATOR</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">The Titan Manufacturing Mandate</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            You have been assigned as Lead Transformation Architect for Brained Consulting. Your mission: modernize Titan Manufacturing's 15-year-old HR portal for 12,000 factory workers in 6 weeks.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/70 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-sky-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-5"><Cpu className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold text-white mb-2">1. Technical Judgment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Evaluate system architectures, API schemas, and technical debt. CTO Marcus Reed will scrutinize every design decision — zero shortcuts tolerated.</p>
          </div>
          <div className="bg-slate-950/70 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5"><Users className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold text-white mb-2">2. Stakeholder Diplomacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Balance competing C-Suite agendas. HR Lead Emma cares about factory workers, InfoSec Olivia enforces zero-trust, while PM Daniel demands speed.</p>
          </div>
          <div className="bg-slate-950/70 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5"><Clock className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold text-white mb-2">3. Time Compression (1m = 1d)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Every 60 seconds represents a full working day. Deadlines compound rapidly, emails pile up, and delayed approvals lock down sprints.</p>
          </div>
        </div>
      </section>

      {/* ── SCROLL SECTION 2: CHARACTER MATRIX ── */}
      <section id="characters" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-extrabold">C-SUITE MATRIX</span>
            <h2 className="text-3xl font-black text-white mt-1">Meet the Brained Universe Characters</h2>
            <p className="text-slate-400 text-sm mt-1">Official personas, motivations, and trust dynamics you must navigate.</p>
          </div>
          <button onClick={handleEnterRoom} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center space-x-2 cursor-pointer shrink-0">
            <span>Enter Simulation Room</span><ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAME_STAKEHOLDERS.map((char) => (
            <div key={char.id} className="bg-slate-950/75 backdrop-blur-2xl rounded-2xl p-5 border border-white/10 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all"
              style={{ borderTopWidth: '3px', borderTopColor: char.accentColor }}>
              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <img src={char.dp} alt={char.name} className="w-12 h-12 rounded-xl object-cover border-2 shadow-md shrink-0"
                    style={{ borderColor: char.accentColor }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${char.name}`; }} />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-white tracking-tight truncate">{char.name}</h3>
                    <p className="text-[11px] font-semibold truncate" style={{ color: char.accentColor }}>{char.role}</p>
                    <p className="text-[9px] text-slate-500 font-mono truncate">{char.department}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {char.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border"
                      style={{ background: char.accentColor + '15', borderColor: char.accentColor + '35', color: char.accentColor }}>{tag}</span>
                  ))}
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 mb-4 text-xs italic text-slate-300 leading-relaxed">"{char.quote}"</div>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Baseline Trust:</span>
                <span className="font-bold text-emerald-400">{char.trustLevel}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCROLL SECTION 3: SIMULATION OS ── */}
      <section id="workspace" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10 w-full">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-extrabold">HYPER-REALISTIC WORKSPACE</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">The Brained OS Suite</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Not static multiple-choice questions. Work inside realistic clones of standard enterprise SaaS software.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SIMULATION_APPS.map((app) => (
            <div key={app.id} className="bg-slate-950/75 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">{app.icon}</div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">{app.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/5 text-slate-400 border border-white/10">{app.tag}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{app.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCROLL SECTION 4: FINAL CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center w-full">
        <div className="bg-slate-950/90 backdrop-blur-2xl p-10 sm:p-14 rounded-3xl border border-white/15 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 mb-6 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-white">BQ</div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 font-serif">Ready to test your execution under pressure?</h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mb-8 font-light leading-relaxed">
            The executive committee is assembling. Your email inbox is loading. Titan Manufacturing's deadline is counting down.
          </p>
          <button onClick={handleEnterRoom} className="px-10 py-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-lg transition-all shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 flex items-center space-x-3 cursor-pointer group">
            <span>Enter the room</span>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/10 py-10 px-6 bg-slate-950/90 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">BQ</div>
            <span className="text-slate-300 font-semibold">Brained Quest — Enterprise Digital Transformation Engine</span>
          </div>
          <div className="flex space-x-6 text-slate-400 font-mono text-[10px]">
            <span>ENTERPRISE CLEARANCE</span>
            <span>PRIVACY SHIELD</span>
            <span>ISO/IEC 27001 AUDITED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
