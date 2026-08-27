import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Download, ShieldCheck, ExternalLink } from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';

interface CertificateAppProps {
  playerState: typeof INITIAL_PLAYER_STATE;
}

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

export const CertificateApp: React.FC<CertificateAppProps> = ({ playerState }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      /* Confetti fallback */
    }
  }, []);

  const credentialId = `BQ-2026-EX-8941`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://brained.io/titan')}`;
  const linkedInAddToProfileUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent('Digital Transformation Specialist — Project Titan')}&organizationName=${encodeURIComponent('Brained Consulting')}&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${encodeURIComponent('https://brained.io/titan')}&certId=${encodeURIComponent(credentialId)}`;

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden select-none">
      <div className="h-12 bg-slate-900/90 border-b border-white/10 px-6 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white tracking-wide">Verified Executive Digital Transformation Certificate</span>
        </div>
        <span className="text-emerald-400 font-mono font-semibold text-[10px] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
          Credential ID: {credentialId}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
        {/* CERTIFICATE CANVAS FRAME */}
        <div className="w-full max-w-3xl glass-panel p-10 rounded-3xl border-2 border-amber-500/50 relative overflow-hidden text-center shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Award className="w-80 h-80 text-amber-400" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono mb-6 border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>BRAINED CONSULTING EXECUTIVE CREDENTIAL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight mb-2">
            Certificate of Transformation Mastery
          </h1>

          <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest font-mono">
            This is to officially certify that
          </p>

          <h2 className="text-2xl sm:text-4xl font-black text-amber-400 font-serif tracking-wide mb-6">
            {playerState.name}
          </h2>

          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            has successfully led and delivered the 6-week Enterprise HR Portal digital transformation simulation at <span className="text-white font-semibold">{playerState.company}</span>, maintaining an Executive Trust score of <span className="text-emerald-400 font-bold">{playerState.trustScore}%</span> and earning <span className="text-sky-400 font-bold">{playerState.transformationXP} XP</span> (Top 2% Global Percentile).
          </p>

          {/* Verification Badge Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">VERIFIED BY</span>
              <span className="font-bold text-slate-200">Brained C-Suite</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SECURITY AUDIT</span>
              <span className="font-bold text-emerald-400">PASSED SOC2</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ISSUED</span>
              <span className="font-bold text-slate-200">August 2026</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center space-x-4 flex-wrap justify-center">
          <a
            href={linkedInAddToProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-[#0077B5] hover:bg-[#006699] text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center space-x-2 cursor-pointer transition-all hover:scale-105"
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>Add to LinkedIn Profile</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <a
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center space-x-2 cursor-pointer transition-all hover:scale-105"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Share Post on LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};
