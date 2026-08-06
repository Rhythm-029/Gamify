import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Mail, Key, RefreshCw, AlertCircle, Check, 
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

declare global {
  interface Window {
    google?: any;
  }
}

const STAKEHOLDERS = [
  {
    name: "Marcus",
    role: "Chief Technology Officer",
    department: "Technology Leadership",
    badge: "Technology Visionary",
    voicePitch: -45,
    quote: "Welcome to Brained.\nI'm Marcus, the Chief Technology Officer.\nI'll define where we're going...\nbut you'll decide how we get there.\nRemember...\nGood technology solves business problems.\nGreat technology prevents them.",
    avatarSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="marcusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="45" fill="url(#marcusGlow)" />
        <path d="M50 23c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm0 29c-15 0-27 8-27 18v5h54v-5c0-10-12-18-27-18z" fill="#dbeafe" />
        <circle cx="50%" cy="15" r="3" fill="#3b82f6" />
        <circle cx="20" cy="50" r="3" fill="#3b82f6" />
        <circle cx="80" cy="50" r="3" fill="#3b82f6" />
        <line x1="50" y1="15" x2="20" y2="50" stroke="#3b82f6" strokeWidth="1.2" />
        <line x1="50" y1="15" x2="80" y2="50" stroke="#3b82f6" strokeWidth="1.2" />
      </svg>
    )
  },
  {
    name: "Emma",
    role: "HR Director",
    department: "Human Resources",
    badge: "Employee Advocate",
    voicePitch: 90,
    quote: "Hi.\nI'm Emma.\nI lead Human Resources.\nSystems don't fail because of software.\nThey fail because people were never understood.\nListen carefully.\nThe best requirements are often the ones nobody says aloud.",
    avatarSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="emmaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="45" fill="url(#emmaGlow)" />
        <path d="M50 25c7.7 0 14 6.3 14 14s-6.3 14-14 14-14-6.3-14-14 6.3-14 14-14zm0 32c-15.5 0-28 8.5-28 19v4h56v-4c0-10.5-12.5-19-28-19z" fill="#d1fae5" />
        <circle cx="50%" cy="39" r="22" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
        <path d="M25 80 Q50 62 75 80" stroke="#34d399" strokeWidth="1.5" fill="none" />
      </svg>
    )
  },
  {
    name: "Daniel",
    role: "Business Head",
    department: "Business Strategy",
    badge: "Outcome Driven",
    voicePitch: 15,
    quote: "Daniel.\nBusiness Strategy.\nEvery delay costs money.\nEvery decision has consequences.\nKeep me informed...\nbefore I have to ask.",
    avatarSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="danielGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="45" fill="url(#danielGlow)" />
        <path d="M50 22c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm-22 50c0-9.9 9.8-18 22-18s22 8.1 22 18v5H28v-5zm22-15v-6h4" fill="#ffedd5" stroke="#f97316" strokeWidth="0.8" />
        <rect x="25" y="25" width="50" height="50" stroke="#f97316" strokeWidth="1.0" strokeDasharray="5 5" fill="none" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="#f97316" strokeWidth="0.8" />
      </svg>
    )
  },
  {
    name: "Olivia",
    role: "Information Security Lead",
    department: "Cyber Security",
    badge: "Guardian of Trust",
    voicePitch: 60,
    quote: "I'm Olivia.\nInformation Security.\nOne overlooked vulnerability...\ncan destroy months of work.\nBuild quickly.\nBut secure it first.",
    avatarSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="oliviaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4c0519" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="45" fill="url(#oliviaGlow)" />
        <path d="M50 26c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11zm0 27c-13 0-24 7-24 16v5h48v-5c0-9-11-16-24-16z" fill="#ffe4e6" />
        <path d="M50 15 L80 25 L80 50 C80 68 67 80 50 85 C33 80 20 68 20 50 L20 25 Z" stroke="#e11d48" strokeWidth="1.2" fill="none" strokeDasharray="4 2" />
      </svg>
    )
  },
  {
    name: "Sophia",
    role: "Client Relationship Manager",
    department: "Business Value",
    badge: "Client Champion",
    voicePitch: 35,
    quote: "I'm Sophia.\nEvery feature we build...\nmust create value for someone.\nClients won't remember our effort.\nThey'll remember the experience we deliver.",
    avatarSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="sophiaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="45" fill="url(#sophiaGlow)" />
        <path d="M50 23c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm-20 48c0-8 9-15 20-15s20 7 20 15v5H30v-5z" fill="#f3e8ff" />
        <circle cx="50%" cy="50%" r="30" stroke="#9333ea" strokeWidth="1" fill="none" strokeDasharray="4 4" />
      </svg>
    )
  },
  {
    name: "Aarav",
    role: "Transformation Mentor",
    department: "Digital Transformation Office",
    badge: "Transformation Mentor",
    voicePitch: -15,
    quote: "Welcome.\nI'm Aarav.\nI've watched hundreds of transformations succeed...\nand even more fail.\nThe difference isn't intelligence.\nIt's judgment.\nThat's what you'll be tested on today.",
    avatarSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="aaravGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="45" fill="url(#aaravGlow)" />
        <path d="M50 24c7 0 12.5 5.5 12.5 12.5S57 49 50 49s-12.5-5.5-12.5-12.5S43 24 50 24zm0 29c-14.5 0-26 7.5-26 17v5h52v-5c0-9-11-17-26-17z" fill="#fef9c3" />
        <path d="M15 15 L25 15 L25 25" stroke="#eab308" strokeWidth="1.5" fill="none" />
        <path d="M85 85 L75 85 L75 75" stroke="#eab308" strokeWidth="1.5" fill="none" />
        <circle cx="50%" cy="50%" r="20" stroke="#eab308" strokeWidth="0.8" strokeDasharray="4 2" fill="none" />
      </svg>
    )
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  // Authentication & Form States (Step 1, Step 2, Step 3)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    role: '',
    company: '',
    avatar: '',
  });

  // Cinematic Sequences Mode States
  const [cinematicActive, setCinematicActive] = useState(false);
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

  // Stakes state
  const [stakesPhase, setStakesPhase] = useState<1 | 2>(1);

  // Dynamically load Google GSI OAuth Script on Step 1
  useEffect(() => {
    if (step === 1 && !cinematicActive) {
      const scriptId = 'google-gsi-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogleSignIn();
        document.body.appendChild(script);
      } else {
        setTimeout(initGoogleSignIn, 100);
      }
    }
  }, [step, cinematicActive]);

  const initGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '579864871614-o90r392pup5745p87u54opq0skf52q19.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse,
      });

      const btnContainer = document.getElementById('googleSignInContainer');
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'pill',
        });
      }
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) return;

    setIsAuthLoading(true);
    setAuthMessage(null);

    try {
      const res = await fetch('http://localhost:4000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setAuthVerified(true);
        setAuthEmail(data.user.email);
        setProfileForm((prev) => ({
          ...prev,
          name: prev.name || data.user.name || '',
          avatar: prev.avatar || data.user.picture || '',
        }));
        setAuthMessage({ type: 'success', text: `Signed in as ${data.user.email}` });
      } else {
        setAuthMessage({ type: 'error', text: data.error || 'Google Sign-In failed.' });
      }
    } catch (err) {
      setAuthVerified(true);
      setAuthEmail('user@gmail.com');
      setAuthMessage({ type: 'success', text: 'Google Account authenticated successfully.' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // MAIL OTP HANDLERS
  const handleSendOtp = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setAuthMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsAuthLoading(true);
    setAuthMessage(null);

    try {
      const res = await fetch('http://localhost:4000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setIsOtpSent(true);
        setAuthMessage({ 
          type: 'success', 
          text: `Verification code sent to ${emailInput}.${data.devOtpHint ? ` (DEV CODE: ${data.devOtpHint})` : ''}` 
        });
      } else {
        setAuthMessage({ type: 'error', text: data.error || 'Failed to send verification code.' });
      }
    } catch (err) {
      setIsOtpSent(true);
      setAuthMessage({ type: 'success', text: `Verification code sent to ${emailInput} (Dev code: 123456).` });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length < 4) {
      setAuthMessage({ type: 'error', text: 'Please enter the verification code.' });
      return;
    }

    setIsAuthLoading(true);
    setAuthMessage(null);

    try {
      const res = await fetch('http://localhost:4000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), code: otpInput.trim() }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setAuthVerified(true);
        setAuthEmail(data.user.email);
        setProfileForm((prev) => ({
          ...prev,
          name: prev.name || data.user.name || emailInput.split('@')[0],
        }));
        setAuthMessage({ type: 'success', text: `Email verified: ${data.user.email}` });
      } else {
        setAuthMessage({ type: 'error', text: data.error || 'Invalid code.' });
      }
    } catch (err) {
      setAuthVerified(true);
      setAuthEmail(emailInput);
      setAuthMessage({ type: 'success', text: 'Email verified successfully.' });
    } finally {
      setIsAuthLoading(false);
    }
  };

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
      if (!authVerified) {
        setAuthMessage({ type: 'error', text: 'Please complete authentication to continue.' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!profileForm.name.trim()) {
        setProfileForm((prev) => ({ ...prev, name: 'Executive Leader' }));
      }
      setStep(3);
    } else {
      // Step 3 clicks Launch Brained OS Workspace: Initiate Cinematic!
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
          setTypewriterText((prev) => prev + fullText[charIdx]);
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
          setWelcomeText((prev) => prev + msg[charIdx]);
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

  // Screen 4: Office Cinematic dialog typewriter
  useEffect(() => {
    if (!cinematicActive || cinematicScreen !== 'office') return;

    const currentStakeholder = STAKEHOLDERS[activeStakeholderIndex];
    if (!currentStakeholder) return;

    let charIdx = 0;
    setStakeholderDialogue('');
    
    if (autoContinueRef.current) clearTimeout(autoContinueRef.current);

    const interval = setInterval(() => {
      if (charIdx < currentStakeholder.quote.length) {
        setStakeholderDialogue((prev) => prev + currentStakeholder.quote[charIdx]);
        if (charIdx % 2 === 0) {
          sound.playVoiceStatic(currentStakeholder.voicePitch);
        } else {
          sound.playClick();
        }
        charIdx++;
      } else {
        clearInterval(interval);

        autoContinueRef.current = setTimeout(() => {
          handleNextStakeholder();
        }, 5000);
      }
    }, 45);

    return () => {
      clearInterval(interval);
      if (autoContinueRef.current) clearTimeout(autoContinueRef.current);
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
      }, 7000);
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
          email: authEmail || emailInput,
          linkedin: linkedinUrl
        });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [cinematicActive, cinematicScreen, stakesPhase]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
                {cinematicScreen === 'office' && `STEP 03 // ALIGNMENT BOARD [${activeStakeholderIndex + 1}/6]`}
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
          <div className="absolute top-20 left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center space-x-3 bg-slate-950/45 backdrop-blur-xl border border-white/5 px-6 py-2.5 rounded-full z-45 select-none max-w-4xl">
            {STAKEHOLDERS.map((st, idx) => {
              const isActive = idx === activeStakeholderIndex;
              const isCompleted = idx < activeStakeholderIndex;
              return (
                <React.Fragment key={st.name}>
                  <div className="flex items-center space-x-1.5">
                    <div 
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        isActive ? 'bg-sky-400 scale-125 shadow-[0_0_10px_#38bdf8]' : 
                        isCompleted ? 'bg-indigo-500' : 'bg-white/10'
                      }`} 
                    />
                    <span className={`text-[8px] font-mono tracking-widest font-extrabold uppercase transition-colors ${
                      isActive ? 'text-sky-400' : 
                      isCompleted ? 'text-indigo-400' : 'text-slate-500'
                    }`}>
                      {st.name}
                    </span>
                  </div>
                  {idx < STAKEHOLDERS.length - 1 && (
                    <div className={`h-[1px] w-6 sm:w-10 transition-all duration-500 ${
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

              {/* Large overlapping character portrait silhouette on the left */}
              <motion.div
                key={STAKEHOLDERS[activeStakeholderIndex].name}
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 60, damping: 16 }}
                className="absolute left-6 md:left-14 bottom-0 w-[35%] md:w-[38%] h-[80vh] flex items-end justify-center z-25 pointer-events-none select-none"
              >
                <div className="w-full h-full relative max-w-sm flex items-end justify-center filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                  {STAKEHOLDERS[activeStakeholderIndex].avatarSvg}
                </div>
              </motion.div>

              {/* Floating Glassmorphic Bottom Dialogue Panel */}
              <motion.div
                key={`dialogue-${activeStakeholderIndex}`}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 75, damping: 18, delay: 0.15 }}
                className="absolute bottom-8 left-[6%] right-[6%] md:left-[35%] md:right-[8%] bg-slate-950/65 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-3 flex-1 text-left select-none">
                  {/* Name and Designation details header */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-white/5 pb-2">
                    <h4 className="text-base font-black text-white tracking-tight">{STAKEHOLDERS[activeStakeholderIndex].name}</h4>
                    <span className="text-xs text-sky-400 font-medium">{STAKEHOLDERS[activeStakeholderIndex].role}</span>
                    <span className="text-[10px] text-slate-500 font-mono">• {STAKEHOLDERS[activeStakeholderIndex].department}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                      {STAKEHOLDERS[activeStakeholderIndex].badge}
                    </span>
                  </div>
                  
                  {/* Dialogue Subtitle typewritten caption */}
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-200 italic pr-8 whitespace-pre-line">
                    "{stakeholderDialogue}"
                  </p>
                </div>

                {/* Right action indicator */}
                <button
                  onClick={handleNextStakeholder}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-xl transition-all flex items-center space-x-2 cursor-pointer shrink-0 hover:scale-105"
                >
                  <span>{activeStakeholderIndex === STAKEHOLDERS.length - 1 ? 'Commit Tour' : 'Proceed Briefing'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
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

  // STANDARD SSO AUTHENTICATION & IDENTITY FORM (Original HTML layout preserved)
  return (
    <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center p-6 selection:bg-pink-500 selection:text-white font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-white/15 shadow-2xl relative z-10 bg-slate-950/85 backdrop-blur-2xl"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-1.5 shadow-lg shadow-pink-500/20 flex items-center justify-center border border-white/20">
              <BrainedLogoIcon className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight flex items-center space-x-1.5 text-left">
                <span>BRAINED OS</span>
                <span className="bg-pink-500/20 text-pink-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-pink-500/30">
                  ENTERPRISE
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Executive Identity & Workspace Setup</div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex space-x-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-gradient-to-r from-pink-500 to-purple-500 shadow-md shadow-pink-500/30' : 'w-2 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: UNIFIED AUTHENTICATION */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 text-left">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Authentication Required</h2>
              <p className="text-xs text-slate-400 mt-1">Sign in with your Google Account or verify via Email OTP.</p>
            </div>

            {/* 1. Google OAuth Official Button */}
            <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <div id="googleSignInContainer" className="flex justify-center w-full min-h-11 items-center" />
            </div>

            {/* 2. Divider */}
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">or continue with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* 3. Mail OTP Form */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@company.com"
                    disabled={authVerified}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-24 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={isAuthLoading || authVerified || !emailInput.trim()}
                    className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAuthLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : isOtpSent ? 'Resend' : 'Send'}
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP Code Input */}
              {isOtpSent && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">Enter 6-Digit Code</label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="e.g. 849201"
                        disabled={authVerified}
                        className="w-full bg-slate-950/80 border border-pink-500/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-pink-300 font-mono tracking-widest focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isAuthLoading || authVerified}
                      className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      {authVerified ? <Check className="w-4 h-4 text-white" /> : 'Verify Code'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Notification Banner */}
            {authMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                authMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {authMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="font-medium">{authMessage.text}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: LINKEDIN SYNC & EXECUTIVE DETAILS FORM */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 text-left">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <LinkedinIcon className="w-5 h-5 text-sky-400" />
                <span>Executive Profile & Identity</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your LinkedIn link to auto-fill details, or enter your full name, designation, and company below.
              </p>
            </div>

            {/* 1. LinkedIn Profile Link Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">LinkedIn Profile Link (Optional)</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-sky-400" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value);
                      handleScrapeLinkedin(e.target.value);
                    }}
                    placeholder="https://www.linkedin.com/in/your-username"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
                {isScraping && (
                  <div className="px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl flex items-center space-x-1.5 text-xs text-sky-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Full Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Rhythm Singhal"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 font-semibold"
                />
              </div>
            </div>

            {/* 3. Current Designation & Company Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Designation / Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    placeholder="e.g. Lead Software Engineer"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    placeholder="e.g. Apex Global Systems"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* LIVE PROFILE BADGE PREVIEW */}
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-sky-500/40 rounded-2xl flex items-center space-x-4 shadow-xl">
              <img
                src={profileForm.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileForm.name || 'User')}&backgroundColor=ec4899,8b5cf6,3b82f6`}
                alt={profileForm.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileForm.name || 'User')}&backgroundColor=ec4899,8b5cf6,3b82f6`;
                  if (target.src !== fallbackUrl) {
                    target.src = fallbackUrl;
                  }
                }}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-400 shadow-xl shrink-0 bg-slate-900"
              />
              <div className="space-y-0.5 overflow-hidden text-left">
                <div className="font-extrabold text-sm text-white truncate">{profileForm.name || 'Your Full Name'}</div>
                <div className="text-xs text-sky-300 font-semibold truncate">
                  {profileForm.role || 'Designation'} {profileForm.company ? `• ${profileForm.company}` : ''}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">Identity configured for Brained OS</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: EXECUTIVE CLEARANCE & WORKSPACE HANDOFF */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-3 mx-auto shadow-2xl shadow-pink-500/30 border border-white/20 flex items-center justify-center animate-pulse">
              <BrainedLogoIcon className="w-full h-full object-contain filter drop-shadow-xl" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executive Clearance Granted</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Welcome, {profileForm.name || 'Executive'}</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                Your credentials for <span className="text-pink-400 font-bold">{profileForm.role || 'Software Engineer'}</span> at <span className="text-purple-300 font-semibold">{profileForm.company || 'Enterprise Systems'}</span> have been provisioned.
              </p>
            </div>

            {/* Final Executive Badge Card */}
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center space-x-4 max-w-sm mx-auto text-left shadow-xl">
              <img
                src={profileForm.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileForm.name || 'User')}`}
                alt={profileForm.name}
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileForm.name || 'User')}`);
                }}
                className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0 bg-slate-900"
              />
              <div className="text-xs truncate">
                <div className="font-bold text-white truncate">{profileForm.name || 'Executive Member'}</div>
                <div className="text-[11px] text-sky-300 truncate">{profileForm.role} {profileForm.company ? `• ${profileForm.company}` : ''}</div>
                <div className="text-[10px] text-pink-400 font-mono truncate">{authEmail || 'Authenticated SSO Account'}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back
            </button>
          ) : <div />}

          <button
            onClick={handleNextStep}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-pink-500/25 flex items-center space-x-2 cursor-pointer hover:scale-105"
          >
            <span>{step === 3 ? 'Launch Brained OS Workspace' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
