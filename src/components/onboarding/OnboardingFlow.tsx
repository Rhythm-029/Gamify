import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, RefreshCw, 
  Globe, User, Briefcase, Building, Volume2, VolumeX
} from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';
import { sound } from './SoundEngine';
import { OfficeBlueprints } from './OfficeBlueprints';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

interface OnboardingFlowProps {
  onComplete: (userConfig: Partial<typeof INITIAL_PLAYER_STATE> & {
    email?: string;
    linkedin?: string;
  }) => void;
}

const STAKEHOLDERS = [
  {
    name: "Aarav",
    role: "Senior Digital Transformation Consultant",
    department: "Digital Transformation Office",
    badge: "Your Mentor",
    voicePitch: -15,
    audioFile: "/voice/01_aarav_intro.mp3",
    fullImage: "/character/aaravFull.png",
    dp: "/character/AaravDP.png",
    accentColor: "#eab308",
    tags: ["Your Guide", "Seen It All", "No Sugarcoating"],
    quote: "Aarav here. I'll be your mentor on this one.\nFair warning — this team doesn't hand-hold.\nEveryone you're about to meet is sharp, opinionated, and has a very short patience for vague answers.\nI'll walk you through them. Pay attention."
  },
  {
    name: "Marcus",
    role: "Chief Technology Officer (CTO)",
    department: "Technology & Engineering",
    badge: "Technology Visionary",
    voicePitch: -45,
    audioFile: "/voice/02_marcus_intro.mp3",
    fullImage: "/character/marcus_reed/MarcusFull.png",
    dp: "/character/marcus_reed/MarcusDP.png",
    accentColor: "#3b82f6",
    tags: ["Intimidating", "Zero Shortcuts", "Better Be Prepared"],
    quote: "That's Marcus Reed. Our CTO.\nBrilliant, calculated — and honestly a little intimidating.\nHe doesn't repeat himself. Ever.\nIf you're not prepared when you walk into his office, don't walk in at all.\nEvery commitment you make, he will remember."
  },
  {
    name: "Emma",
    role: "HR Transformation Specialist",
    department: "HR Transformation",
    badge: "Employee Advocate",
    voicePitch: 90,
    audioFile: "/voice/03_emma_intro.mp3",
    fullImage: "/character/Emma_Carter/EmmaFull.png",
    dp: "/character/Emma_Carter/EmmaDP.png",
    accentColor: "#10b981",
    tags: ["Empathetic", "Notices Everything", "People Over Process"],
    quote: "Emma Carter. HR — but not what you're picturing.\nShe catches the requirements that engineers completely miss.\nThe ones no one says out loud.\nIf she flags something, take it seriously.\nShe's usually three steps ahead."
  },
  {
    name: "Daniel",
    role: "Transformation Program Manager",
    department: "Program Delivery",
    badge: "Deadline Guardian",
    voicePitch: 15,
    audioFile: "/voice/05_daniel_intro.mp3",
    fullImage: "/character/Daniel_Brooks/danielFull.png",
    dp: "/character/Daniel_Brooks/DanielDP.png",
    accentColor: "#f97316",
    tags: ["Deadline Obsessed", "Tracks Everything", "Coffee Required"],
    quote: "Daniel Brooks. Program Manager.\nHoodie, coffee, and perpetually behind on something.\nDon't let that fool you — he tracks every blocker, risk, and missed update.\nKeep Jira current before he asks.\nBecause when he asks, it's already too late."
  },
  {
    name: "Aarav",
    role: "Senior Digital Transformation Consultant",
    department: "Digital Transformation Office",
    badge: "Your Mentor",
    voicePitch: -15,
    audioFile: "/voice/07_aarav_closing.mp3",
    fullImage: "/character/aaravFull.png",
    dp: "/character/AaravDP.png",
    accentColor: "#eab308",
    tags: ["60s = 1 Day", "No Ctrl+Z", "Good Luck"],
    quote: "That's the team.\nIn here, every decision compounds — even sixty seconds plays like a full working day.\nThe pressure is real. The mistakes are permanent.\nThere's no undo, no skip, no 'I'll come back to it'.\nYour OS is live. Go make it count."
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  // Form States
  const [linkedinUrl] = useState('');
  const [profileForm] = useState({
    name: 'Executive Member',
    role: 'Senior Digital Transformation Consultant',
    company: 'Enterprise Systems',
    avatar: '',
  });

  // Cinematic Sequences Mode States (starts immediately)
  const [cinematicActive] = useState(true);
  const [cinematicScreen, setCinematicScreen] = useState<'transition' | 'init' | 'welcome' | 'office' | 'stakes'>('transition');
  const [isMuted, setIsMuted] = useState(false);

  // Canvas drift animation states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Typewriter sequence states
  const [initLines, setInitLines] = useState<string[]>([]);
  const [currentInitIndex, setCurrentInitIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [welcomeText, setWelcomeText] = useState('');

  // Office cinematic states
  const [activeStakeholderIndex, setActiveStakeholderIndex] = useState(0);
  const [stakeholderDialogue, setStakeholderDialogue] = useState('');
  const autoContinueRef = useRef<any>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stakes state
  const [stakesPhase, setStakesPhase] = useState<1 | 2>(1);

  // Start cinematic ambient music & initialization automatically on mount
  useEffect(() => {
    sound.startAmbientMusic();
    sound.playSystemClearance();

    setInitLines([
      `INITIALIZING BRAINED OS // WORKSTATION CLEARANCE v4.2`,
      `ALLOCATING CONTEXT BUFFERS... DONE`,
      `VERIFYING EXECUTIVE PROFILE: EXECUTIVE MEMBER`,
      `AUTHENTICATING MENTOR ALIGNMENT PROTOCOLS...`,
      `ESTABLISHING HIGH-BANDWIDTH WORKSPACE LINK...`
    ]);

    const timer = setTimeout(() => {
      setCinematicScreen('init');
      sound.playTyping();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // LINKEDIN LINK SCRAPER & AUTO-FILL
  const handleScrapeLinkedin = async (targetUrl?: string) => {
    const urlToScrape = targetUrl || linkedinUrl;
    if (!urlToScrape.trim()) return;

    setIsScraping(true);

    try {
      const res = await fetch('http://localhost:4000/api/linkedin/fetch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: urlToScrape.trim() }),
      });
      const data = await res.json();

      if (data.success && data.profile) {
        const p = data.profile;
        setProfileForm((prev) => ({
          ...prev,
          name: p.name || prev.name,
          role: p.jobStatus || p.headline || prev.role || 'Software Engineer & Tech Lead',
          company: p.company || prev.company || 'Enterprise Systems',
          avatar: p.avatar || prev.avatar || `https://unavatar.io/linkedin/${p.username}`,
        }));
      }
    } catch (err) {
      const match = urlToScrape.match(/linkedin\.com\/in\/([^\/\?#]+)/i);
      if (match && match[1]) {
        const parsedName = match[1]
          .replace(/-[a-f0-9]{6,12}$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .replace(/\d+/g, '')
          .trim();

        if (parsedName) {
          setProfileForm((prev) => ({
            ...prev,
            name: parsedName,
            avatar: prev.avatar || `https://unavatar.io/linkedin/${match[1]}`,
          }));
        }
      }
    } finally {
      setIsScraping(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!profileForm.name.trim()) {
        setProfileForm((prev) => ({ ...prev, name: 'Executive Leader' }));
      }
      setStep(2);
    } else {
      // Step 2 clicks Launch Brained OS Workspace: Initiate Cinematic!
      sound.startAmbientMusic();
      sound.playSystemClearance();
      setCinematicActive(true);
      setCinematicScreen('transition');
      
      setTimeout(() => {
        setCinematicScreen('init');
      }, 2500);
    }
  };

  // Sound Engine Muting Effect
  useEffect(() => {
    sound.setMute(isMuted);
    // Also mute/unmute the ElevenLabs voice audio element (not routed through SoundEngine)
    if (voiceAudioRef.current) {
      voiceAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Particle background canvas loops
  useEffect(() => {
    if (!cinematicActive || cinematicScreen === 'transition') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      char?: string;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.8) * 0.4,
        opacity: Math.random() * 0.4 + 0.1,
        char: Math.random() > 0.8 ? (Math.random() > 0.5 ? '1' : '0') : undefined
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(7, 9, 19, 1)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity})`;
        if (p.char) {
          ctx.font = '8px monospace';
          ctx.fillText(p.char, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [cinematicActive, cinematicScreen]);

  // Screen 2: System Initialization typewriters
  useEffect(() => {
    if (!cinematicActive || cinematicScreen !== 'init') return;

    const initLinesData = [
      "Authenticating Identity...",
      "Connecting to Brained Network...",
      "Assigning Enterprise Workspace...",
      "Loading Stakeholder Profiles...",
      "Initializing Transformation Environment..."
    ];

    if (currentInitIndex < initLinesData.length) {
      const fullText = initLinesData[currentInitIndex];
      let charIdx = 0;
      setTypewriterText('');
      
      const interval = setInterval(() => {
        if (charIdx < fullText.length) {
          const char = fullText[charIdx];
          setTypewriterText((prev) => prev + char);
          sound.playClick();
          charIdx++;
        } else {
          clearInterval(interval);
          sound.playSystemClearance();
          
          setTimeout(() => {
            setInitLines((prev) => [...prev, fullText]);
            setCurrentInitIndex((prev) => prev + 1);
          }, 1200);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      const timer = setTimeout(() => {
        setCinematicScreen('welcome');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cinematicActive, cinematicScreen, currentInitIndex]);

  // Screen 3: Welcome Text
  useEffect(() => {
    if (!cinematicActive || cinematicScreen !== 'welcome') return;

    const msg = `Today, you begin your journey as a Digital Transformer.`;
    let charIdx = 0;
    setWelcomeText('');

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (charIdx < msg.length) {
          const char = msg[charIdx];
          setWelcomeText((prev) => prev + char);
          sound.playClick();
          charIdx++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setCinematicScreen('office');
          }, 3500);
        }
      }, 60);
      return () => clearInterval(interval);
    }, 1500);

    return () => clearTimeout(timer);
  }, [cinematicActive, cinematicScreen]);

  // Screen 4: Office Cinematic dialog typewriter with ElevenLabs Voice Audio integration
  useEffect(() => {
    if (!cinematicActive || cinematicScreen !== 'office') return;

    const currentStakeholder = STAKEHOLDERS[activeStakeholderIndex];
    if (!currentStakeholder) return;

    let charIdx = 0;
    setStakeholderDialogue('');
    
    if (autoContinueRef.current) clearTimeout(autoContinueRef.current);

    // Stop previous voice audio if playing
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }

    let intervalId: any = null;
    let audioEnded = false;

    const startTypewriter = (msPerChar: number = 32, useAudioTrack: boolean = false) => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (charIdx < currentStakeholder.quote.length) {
          const char = currentStakeholder.quote[charIdx];
          setStakeholderDialogue((prev) => prev + char);
          if (!useAudioTrack) {
            if (charIdx % 2 === 0) {
              sound.playVoiceStatic(currentStakeholder.voicePitch);
            } else {
              sound.playClick();
            }
          }
          charIdx++;
        } else {
          clearInterval(intervalId);
          // If no audio track is active, auto-advance after 3.5s fallback
          if (!useAudioTrack || audioEnded) {
            autoContinueRef.current = setTimeout(() => {
              handleNextStakeholder();
            }, 3500);
          }
        }
      }, msPerChar);
    };

    // Try playing ElevenLabs voice MP3 file if present in /public/voice/
    if (currentStakeholder.audioFile) {
      const audio = new Audio(currentStakeholder.audioFile);
      voiceAudioRef.current = audio;

      const initAudioTypewriter = () => {
        if (!audio.duration || isNaN(audio.duration)) {
          startTypewriter(32, true);
          return;
        }
        const totalDurationMs = audio.duration * 1000;
        const msPerChar = Math.max(15, Math.floor(totalDurationMs / currentStakeholder.quote.length));
        startTypewriter(msPerChar, true);
      };

      if (audio.readyState >= 1) {
        initAudioTypewriter();
      } else {
        audio.onloadedmetadata = () => {
          initAudioTypewriter();
        };
      }

      audio.onended = () => {
        audioEnded = true;
        // Auto-advance to next stakeholder like a video cutscene when audio ends!
        autoContinueRef.current = setTimeout(() => {
          handleNextStakeholder();
        }, 600);
      };

      audio.play().catch(() => {
        // Fallback: If voice file missing (404), use default typewriter pacing
        startTypewriter(32, false);
      });
    } else {
      startTypewriter(32, false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (autoContinueRef.current) clearTimeout(autoContinueRef.current);
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
    };
  }, [cinematicActive, cinematicScreen, activeStakeholderIndex]);

  const handleNextStakeholder = () => {
    if (autoContinueRef.current) clearTimeout(autoContinueRef.current);

    if (activeStakeholderIndex < STAKEHOLDERS.length - 1) {
      sound.playSystemClearance();
      setActiveStakeholderIndex((prev) => prev + 1);
    } else {
      sound.playSystemClearance();
      setCinematicScreen('stakes');
    }
  };

  // Screen 5: Stakes phase timers
  useEffect(() => {
    if (!cinematicActive || cinematicScreen !== 'stakes') return;

    if (stakesPhase === 1) {
      const timer = setTimeout(() => {
        setStakesPhase(2);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        sound.stopAll();
        onComplete({
          name: profileForm.name || 'Executive Member',
          role: profileForm.role || 'Software Engineer',
          company: profileForm.company || 'Enterprise Systems',
          industry: 'Technology & Enterprise',
          avatar: profileForm.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileForm.name || 'User')}`,
          email: profileForm.name ? `${profileForm.name.toLowerCase().replace(/\s+/g, '.')}@brained.os` : 'executive@brained.os',
          linkedin: linkedinUrl
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [cinematicActive, cinematicScreen, stakesPhase]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    // Immediately mute/unmute voice audio element
    if (voiceAudioRef.current) {
      voiceAudioRef.current.muted = newMuted;
    }
  };

  // RENDERING CINEMATIC MODES
  if (cinematicActive) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#070913] text-white flex flex-col font-sans select-none overflow-hidden z-50">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Global Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-600 to-pink-600 p-1 flex items-center justify-center border border-white/20 shadow-lg shadow-indigo-500/10">
              <span className="text-[10px] font-black text-white">BR</span>
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-white tracking-widest uppercase">Brained Consulting</div>
              <div className="text-[8px] text-slate-500 font-mono tracking-wider">WORKSPACE PROVISIONING ENGINE</div>
            </div>
          </div>

          {cinematicScreen !== 'transition' && (
            <div className="flex items-center space-x-4">
              <div className="text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                {cinematicScreen === 'init' && 'STEP 01 // WORKSTATION INITIALIZATION'}
                {cinematicScreen === 'welcome' && 'STEP 02 // IDENTITY VERIFIED'}
                {cinematicScreen === 'office' && `STEP 03 // ALIGNMENT BOARD [${activeStakeholderIndex + 1}/${STAKEHOLDERS.length}]`}
                {cinematicScreen === 'stakes' && 'STEP 04 // ENGAGEMENT CONTRACT'}
              </div>
              
              <button 
                onClick={toggleMute}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Top Progression Timeline Indicator */}
        {cinematicScreen === 'office' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center space-x-2 bg-slate-950/60 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full z-45 select-none max-w-5xl shadow-xl">
            {STAKEHOLDERS.slice(0, 4).map((st, idx) => {
              const isActive = idx === activeStakeholderIndex || (activeStakeholderIndex === 4 && idx === 0);
              const isCompleted = idx < activeStakeholderIndex && !isActive;
              return (
                <React.Fragment key={`${st.name}-${idx}`}>
                  <div className="flex items-center space-x-1.5">
                    <div className="relative">
                      <img
                        src={st.dp}
                        alt={st.name}
                        className={`w-7 h-7 rounded-full object-cover border-2 transition-all duration-500 ${
                          isActive ? 'scale-125 shadow-lg' : 
                          isCompleted ? 'opacity-80' : 'opacity-30 grayscale'
                        }`}
                        style={{ borderColor: isActive ? st.accentColor : isCompleted ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {isActive && (
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950 animate-pulse"
                          style={{ background: st.accentColor }} />
                      )}
                    </div>
                    <span className={`text-[8px] font-mono tracking-widest font-extrabold uppercase transition-colors hidden lg:inline ${
                      isActive ? 'text-white' : 
                      isCompleted ? 'text-indigo-400' : 'text-slate-600'
                    }`}>
                      {st.name}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`h-[1px] w-4 sm:w-6 transition-all duration-500 ${
                      idx < activeStakeholderIndex ? 'bg-indigo-500/70' : 'bg-white/5'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {cinematicScreen === 'transition' && (
            <motion.div 
              key="transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center relative z-10"
            >
              <motion.div 
                className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent top-0"
                animate={{ y: ['0vh', '100vh'] }}
                transition={{ duration: 2.0, ease: 'easeInOut' }}
              />
              <div className="text-center space-y-4">
                <div className="w-8 h-8 rounded-full border border-sky-500 border-t-transparent animate-spin mx-auto opacity-70" />
                <span className="text-[10px] font-mono tracking-widest text-sky-400 font-extrabold uppercase animate-pulse">ESTABLISHING CLEARANCE SECURE HANDOFF...</span>
              </div>
            </motion.div>
          )}

          {cinematicScreen === 'init' && (
            <motion.div 
              key="init"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.0 } }}
              className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
            >
              <div className="w-full max-w-md space-y-4">
                {initLines.map((line, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-slate-300 font-mono text-sm">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="font-semibold">{line}</span>
                  </div>
                ))}
                {currentInitIndex < 5 && (
                  <div className="flex items-center space-x-3 font-mono text-sm text-sky-400 font-extrabold">
                    <span className="w-2.5 h-2.5 rounded bg-sky-400 animate-pulse shrink-0" />
                    <span>{typewriterText}</span>
                    <span className="w-1.5 h-4 bg-sky-400 animate-blink animate-infinite" />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {cinematicScreen === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 1.0 } }}
              className="flex-1 flex flex-col items-center justify-center bg-black text-center px-6 relative z-10"
            >
              <div className="space-y-8">
                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="text-4xl sm:text-5xl font-black text-white tracking-[0.3em] font-sans"
                >
                  W E L C O M E
                </motion.h1>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.0, delay: 0.8 }}
                  className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-sky-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent uppercase tracking-wider font-mono"
                >
                  {profileForm.name}
                </motion.h2>
                <div className="h-10 pt-4 flex items-center justify-center font-serif italic text-slate-300 font-light text-base max-w-md leading-relaxed">
                  <span>{welcomeText}</span>
                  {welcomeText.length > 0 && welcomeText.length < 52 && (
                    <span className="w-1 h-5 bg-white inline-block ml-1 animate-blink" />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {cinematicScreen === 'office' && (
            <motion.div 
              key="office"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 w-full h-full relative z-10"
            >
              {/* Full screen background office floor blueprints */}
              <OfficeBlueprints activeStakeholderIndex={activeStakeholderIndex} />

              {/* Large overlapping character portrait — naturally blended into scene */}
              <motion.div
                key={STAKEHOLDERS[activeStakeholderIndex].name}
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 60, damping: 16 }}
                className="absolute left-0 md:left-4 bottom-0 w-[40%] md:w-[42%] h-[88vh] flex items-end justify-center z-25 pointer-events-none select-none"
              >
                {/* Soft ambient glow puddle behind character feet */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ background: STAKEHOLDERS[activeStakeholderIndex].accentColor }}
                />

                {/* Character image — bottom-anchored, fades into floor */}
                <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
                  <img
                    src={STAKEHOLDERS[activeStakeholderIndex].fullImage}
                    alt={STAKEHOLDERS[activeStakeholderIndex].name}
                    className="w-full h-full object-contain object-bottom select-none"
                    draggable={false}
                    onError={(e) => { (e.target as HTMLImageElement).src = STAKEHOLDERS[activeStakeholderIndex].dp; }}
                  />

                  {/* Bottom fade — character feet dissolve into the floor */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(7,9,19,1) 0%, rgba(7,9,19,0.6) 12%, rgba(7,9,19,0) 30%)' }}
                  />
                  {/* Left edge fade — portrait side merges with blueprint background */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(to right, rgba(7,9,19,0.65) 0%, rgba(7,9,19,0) 28%)' }}
                  />
                </div>
              </motion.div>

              {/* Floating Glassmorphic Bottom Dialogue Panel */}
              <motion.div
                key={`dialogue-${activeStakeholderIndex}`}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 75, damping: 18, delay: 0.15 }}
                className="absolute bottom-8 left-[6%] right-[6%] md:left-[40%] md:right-[5%] bg-slate-950/75 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden"
                style={{ borderLeftWidth: '3px', borderLeftColor: STAKEHOLDERS[activeStakeholderIndex].accentColor }}
              >
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2.5 flex-1 text-left select-none">
                    {/* Character identity with DP thumbnail */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <img
                        src={STAKEHOLDERS[activeStakeholderIndex].dp}
                        alt={STAKEHOLDERS[activeStakeholderIndex].name}
                        className="w-8 h-8 rounded-xl object-cover shrink-0 border-2"
                        style={{ borderColor: STAKEHOLDERS[activeStakeholderIndex].accentColor + '70' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <h4 className="text-sm font-black text-white tracking-tight">{STAKEHOLDERS[activeStakeholderIndex].name}</h4>
                      <span className="text-[11px] font-semibold" style={{ color: STAKEHOLDERS[activeStakeholderIndex].accentColor }}>
                        {STAKEHOLDERS[activeStakeholderIndex].role}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">
                        • {STAKEHOLDERS[activeStakeholderIndex].department}
                      </span>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border"
                        style={{
                          background: STAKEHOLDERS[activeStakeholderIndex].accentColor + '18',
                          borderColor: STAKEHOLDERS[activeStakeholderIndex].accentColor + '45',
                          color: STAKEHOLDERS[activeStakeholderIndex].accentColor,
                        }}
                      >
                        {STAKEHOLDERS[activeStakeholderIndex].badge}
                      </span>
                    </div>

                    {/* Personality tags */}
                    {STAKEHOLDERS[activeStakeholderIndex].tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {STAKEHOLDERS[activeStakeholderIndex].tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest"
                            style={{
                              background: STAKEHOLDERS[activeStakeholderIndex].accentColor + '12',
                              color: STAKEHOLDERS[activeStakeholderIndex].accentColor + 'cc',
                              border: `1px solid ${STAKEHOLDERS[activeStakeholderIndex].accentColor}30`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-white/5" />

                    {/* Dialogue typewriter — Aarav narrating (no wrapping quotes to avoid clip) */}
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-200 whitespace-pre-line">
                      {stakeholderDialogue}
                    </p>
                  </div>

                  {/* Proceed button — styled per character accent */}
                  <button
                    onClick={handleNextStakeholder}
                    className="px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer shrink-0 hover:scale-105 border"
                    style={{
                      background: STAKEHOLDERS[activeStakeholderIndex].accentColor + '22',
                      borderColor: STAKEHOLDERS[activeStakeholderIndex].accentColor + '55',
                      color: 'white',
                    }}
                  >
                    <span>{activeStakeholderIndex === STAKEHOLDERS.length - 1 ? 'Enter Workspace' : 'Proceed Briefing'}</span>
                    <ArrowRight className="w-4 h-4" style={{ color: STAKEHOLDERS[activeStakeholderIndex].accentColor }} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {cinematicScreen === 'stakes' && (
            <motion.div 
              key="stakes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.2 } }}
              className="flex-1 flex flex-col items-center justify-center bg-black px-6 text-center select-none relative z-10"
            >
              <div className="max-w-2xl space-y-10">
                <AnimatePresence mode="wait">
                  {stakesPhase === 1 ? (
                    <motion.div 
                      key="phase1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 1.0 }}
                      className="space-y-6"
                    >
                      <span className="text-[10px] font-mono text-amber-500 font-extrabold tracking-[0.4em] uppercase">DECISION PROTOCOL</span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-sans">
                        Every transformation begins with a decision.
                      </h2>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="phase2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 1.0 }}
                      className="space-y-6"
                    >
                      <span className="text-[10px] font-mono text-sky-500 font-extrabold tracking-[0.4em] uppercase">CLEARANCE APPROVED</span>
                      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight font-sans">
                        Today, every decision is yours.
                      </h2>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};
