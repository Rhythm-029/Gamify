import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Download, Share2, ShieldCheck } from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';

interface CertificateAppProps {
  playerState: typeof INITIAL_PLAYER_STATE;
}

export const CertificateApp: React.FC<CertificateAppProps> = ({ playerState }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  }, []);

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Verified Executive Digital Transformation Certificate</span>
        </div>
        <span className="text-emerald-400 font-semibold text-[10px]">Credential ID: BQ-2026-EX-8941</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
        {/* CERTIFICATE CANVAS */}
        <div className="w-full max-w-3xl glass-panel p-10 rounded-3xl border-2 border-amber-500/40 relative overflow-hidden text-center shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Award className="w-64 h-64 text-amber-400" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>BRAINED QUEST EXECUTIVE CREDENTIAL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight mb-2">
            Certificate of Transformation Mastery
          </h1>

          <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest">
            This is to officially certify that
          </p>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-sans tracking-wide mb-6">
            {playerState.name}
          </h2>

          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            has successfully led and delivered the 6-week Enterprise HR Portal digital transformation simulation at <span className="text-white font-semibold">{playerState.company}</span>, maintaining an Executive Trust score of <span className="text-emerald-400 font-bold">{playerState.trustScore}%</span> and earning <span className="text-blue-400 font-bold">{playerState.transformationXP} XP</span> (Top 2% Percentile).
          </p>

          {/* Verification Badge Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">VERIFIED BY</span>
              <span className="font-bold text-slate-200">Apex C-Suite</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SECURITY AUDIT</span>
              <span className="font-bold text-emerald-400">PASSED SOC2</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ISSUED</span>
              <span className="font-bold text-slate-200">July 2026</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center space-x-4">
          <button 
            onClick={() => alert("Downloading PDF Certificate...")}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate PDF</span>
          </button>
          <button 
            onClick={() => alert("LinkedIn Share Modal opened!")}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center space-x-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on LinkedIn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
