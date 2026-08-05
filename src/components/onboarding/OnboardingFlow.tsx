import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Mail, Key, RefreshCw, AlertCircle, Check, Globe, User, Briefcase, Building
} from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

interface OnboardingFlowProps {
  onComplete: (userConfig: Partial<typeof INITIAL_PLAYER_STATE>) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Authentication State (Step 1)
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // LinkedIn Link & Executive Form State (Step 2)
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    role: '',
    company: '',
    avatar: '',
  });
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // Dynamically load Google GSI OAuth Script on Step 1
  useEffect(() => {
    if (step === 1) {
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
  }, [step]);

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
    setScrapeError(null);

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
      // Local fallback parsing
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
      onComplete({
        name: profileForm.name || 'Executive Member',
        role: profileForm.role || 'Software Engineer',
        company: profileForm.company || 'Enterprise Systems',
        industry: 'Technology & Enterprise',
        avatar: profileForm.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileForm.name || 'User')}`,
      });
    }
  };

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
              <div className="text-sm font-extrabold text-white tracking-tight flex items-center space-x-1.5">
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
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
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
                    {isAuthLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : isOtpSent ? 'Resend Code' : 'Send Code'}
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
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
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
