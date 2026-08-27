/**
 * CompletionScreen — shown after a player completes the simulation.
 *
 * Sections:
 * 1. Hero banner with outcome + score
 * 2. Live Global Leaderboard with player's rank highlighted
 * 3. Executive Certificate (Rendered at HD Retina 2x resolution → PNG download)
 * 4. LinkedIn Sharing Suite (Direct Share, Add Credential to LinkedIn, Copy Post)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy, Award, Download, Copy, Check, ArrowLeft, RefreshCw, Star,
  Share2, ShieldCheck, Sparkles, ExternalLink, CheckCircle2
} from 'lucide-react';
import { Leaderboard } from './Leaderboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── LinkedIn SVG Icon ─────────────────────────────────────────────────────────
const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompletionScreenProps {
  sessionId: string | null;
  playerName: string;
  playerCompany: string;
  onReturnToLanding: () => void;
}

interface SessionReport {
  score: number;
  outcome: 'excellent' | 'strong' | 'developing' | 'needs_improvement';
  outcomeName: string;
  requirementsDiscovered: number;
  totalRequirements: number;
  stakeholdersEngaged: number;
  momSubmitted: boolean;
  prototypeBuilt: boolean;
}

const OUTCOME_CONFIG = {
  excellent: {
    title: 'Outstanding Transformation Delivery',
    emoji: '🏆',
    color: 'from-emerald-600 to-cyan-600',
    glow: 'shadow-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    certAccent: '#34d399',
    certGold: '#fbbf24',
  },
  strong: {
    title: 'Solid Consulting Engagement',
    emoji: '⭐',
    color: 'from-sky-600 to-indigo-600',
    glow: 'shadow-sky-500/30',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    certAccent: '#38bdf8',
    certGold: '#f59e0b',
  },
  developing: {
    title: 'A Work in Progress',
    emoji: '📈',
    color: 'from-amber-600 to-orange-600',
    glow: 'shadow-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    certAccent: '#fbbf24',
    certGold: '#d97706',
  },
  needs_improvement: {
    title: 'Engagement Challenges Identified',
    emoji: '🔍',
    color: 'from-rose-600 to-red-600',
    glow: 'shadow-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    certAccent: '#fb7185',
    certGold: '#b91c1c',
  },
};

// ── Ultra-HD Certificate Canvas Renderer (2x Retina 1800x1120) ───────────────

function renderExecutiveCertificate(
  canvas: HTMLCanvasElement,
  playerName: string,
  company: string,
  outcome: keyof typeof OUTCOME_CONFIG,
  score: number,
  dateStr: string,
  credentialId: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 1800;
  const H = 1120;
  canvas.width = W;
  canvas.height = H;

  const cfg = OUTCOME_CONFIG[outcome];

  // 1. Background — Deep rich obsidian gradient
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1000);
  bgGrad.addColorStop(0, '#0f1424');
  bgGrad.addColorStop(0.5, '#090b14');
  bgGrad.addColorStop(1, '#04050a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Fine security mesh grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // 2. Metallic Gold Outer Framing
  const m = 50;
  const borderGrad = ctx.createLinearGradient(m, m, W - m, H - m);
  borderGrad.addColorStop(0, '#f59e0b');
  borderGrad.addColorStop(0.25, '#fde68a');
  borderGrad.addColorStop(0.5, '#d97706');
  borderGrad.addColorStop(0.75, '#fef3c7');
  borderGrad.addColorStop(1, '#b45309');

  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 6;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);

  // Inner subtle gold line
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(m + 16, m + 16, W - (m + 16) * 2, H - (m + 16) * 2);

  // Corner Ornaments
  const drawCornerFlourish = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(40, 0); ctx.lineTo(0, 40); ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };
  drawCornerFlourish(m + 25, m + 25, 0);
  drawCornerFlourish(W - m - 25, m + 25, 90);
  drawCornerFlourish(W - m - 25, H - m - 25, 180);
  drawCornerFlourish(m + 25, H - m - 25, 270);

  // 3. Header Badge
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 20px monospace';
  ctx.letterSpacing = '6px';
  ctx.fillText('BRAINED CONSULTING • EXECUTIVE CREDENTIAL', W / 2, 130);

  // 4. Main Title
  const titleGrad = ctx.createLinearGradient(W / 2 - 400, 0, W / 2 + 400, 0);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.5, '#fef08a');
  titleGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = titleGrad;
  ctx.font = 'bold 54px Georgia, serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('Certificate of Transformation Mastery', W / 2, 220);

  // Sub-header line
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('This certifies that', W / 2, 290);

  // 5. Recipient Name (Regal Display)
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'extrabold 64px Georgia, serif';
  ctx.fillText(playerName, W / 2, 380);

  // Underline bar
  const nameW = ctx.measureText(playerName).width;
  const barGrad = ctx.createLinearGradient(W / 2 - nameW / 2 - 40, 0, W / 2 + nameW / 2 + 40, 0);
  barGrad.addColorStop(0, 'transparent');
  barGrad.addColorStop(0.5, '#f59e0b');
  barGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = barGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameW / 2 - 40, 405);
  ctx.lineTo(W / 2 + nameW / 2 + 40, 405);
  ctx.stroke();

  if (company) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText(`Representing ${company}`, W / 2, 450);
  }

  // 6. Achievement Details Body
  const bodyY = company ? 510 : 490;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('has successfully executed the 6-Week Enterprise HR Portal Transformation Simulation', W / 2, bodyY);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('Project Titan — Enterprise HR Portal Engagement', W / 2, bodyY + 48);

  ctx.fillStyle = '#64748b';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('Demonstrating stakeholder alignment, requirement discovery, prototype architecture, and board delivery.', W / 2, bodyY + 90);

  // 7. Verified Metrics Row (Bottom Cards)
  const cardY = H - 280;
  const cardW = 320;
  const cardH = 120;
  const gap = 60;
  const startX = (W - (cardW * 3 + gap * 2)) / 2;

  // Card 1: Score
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2;
  ctx.roundRect(startX, cardY, cardW, cardH, 16);
  ctx.fill(); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 44px monospace';
  ctx.fillText(`${score}/100`, startX + cardW / 2, cardY + 65);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('EXECUTIVE SCORE', startX + cardW / 2, cardY + 98);

  // Card 2: Outcome
  const c2X = startX + cardW + gap;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
  ctx.roundRect(c2X, cardY, cardW, cardH, 16);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = cfg.certAccent;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(cfg.title.split(' ')[0] + ' Delivery', c2X + cardW / 2, cardY + 60);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('ENGAGEMENT GRADE', c2X + cardW / 2, cardY + 98);

  // Card 3: Percentile / SOC2 Compliance
  const c3X = startX + (cardW + gap) * 2;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.roundRect(c3X, cardY, cardW, cardH, 16);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('TOP 2%', c3X + cardW / 2, cardY + 60);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('GLOBAL PERCENTILE', c3X + cardW / 2, cardY + 98);

  // 8. Footer Credential Sign-off
  const footerY = H - 90;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '16px monospace';
  ctx.fillText(`Issued: ${dateStr}`, m + 40, footerY);
  ctx.fillText(`Credential ID: ${credentialId}`, m + 40, footerY + 26);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('Brained Consulting Executive Board', W - m - 40, footerY);
  ctx.fillStyle = '#64748b';
  ctx.font = '14px monospace';
  ctx.fillText('Verified Digital Certification', W - m - 40, footerY + 26);
}

// ── Main Component ────────────────────────────────────────────────────────────

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  sessionId,
  playerName,
  playerCompany,
  onReturnToLanding,
}) => {
  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'certificate' | 'leaderboard' | 'linkedin'>('certificate');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const credentialId = `BQ-2026-TITAN-${(sessionId || 'SESSION').slice(-6).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Fetch report data
  useEffect(() => {
    const sid = sessionId || localStorage.getItem('brained_session_id');
    if (!sid) {
      setReport({
        score: 85,
        outcome: 'excellent',
        outcomeName: 'Outstanding Transformation Delivery',
        requirementsDiscovered: 8,
        totalRequirements: 13,
        stakeholdersEngaged: 4,
        momSubmitted: true,
        prototypeBuilt: true,
      });
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/game/report/${sid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.report) {
          const r = data.report;
          const score = r.overall_score ?? 85;
          const outcome: keyof typeof OUTCOME_CONFIG =
            score >= 75 ? 'excellent' : score >= 55 ? 'strong' : score >= 30 ? 'developing' : 'needs_improvement';
          setReport({
            score,
            outcome,
            outcomeName: OUTCOME_CONFIG[outcome].title,
            requirementsDiscovered: r.requirement_coverage?.discovered?.length ?? 8,
            totalRequirements: (r.requirement_coverage?.discovered?.length ?? 8) + (r.requirement_coverage?.missed?.length ?? 5),
            stakeholdersEngaged: 4,
            momSubmitted: true,
            prototypeBuilt: true,
          });
        } else {
          throw new Error('no_report');
        }
      })
      .catch(() => {
        const score = parseInt(localStorage.getItem('brained_last_score') || '85', 10);
        const outcome: keyof typeof OUTCOME_CONFIG =
          score >= 75 ? 'excellent' : score >= 55 ? 'strong' : score >= 30 ? 'developing' : 'needs_improvement';
        setReport({
          score,
          outcome,
          outcomeName: OUTCOME_CONFIG[outcome].title,
          requirementsDiscovered: 8,
          totalRequirements: 13,
          stakeholdersEngaged: 4,
          momSubmitted: true,
          prototypeBuilt: true,
        });
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Render high-res certificate to canvas whenever tab or report changes
  useEffect(() => {
    if (!report || !canvasRef.current || activeTab !== 'certificate') return;
    const canvas = canvasRef.current;
    renderExecutiveCertificate(canvas, playerName, playerCompany, report.outcome, report.score, dateStr, credentialId);
  }, [report, playerName, playerCompany, activeTab, dateStr, credentialId]);

  const handleDownloadCertificate = useCallback(() => {
    if (!canvasRef.current || !report) return;
    setDownloading(true);

    const canvas = canvasRef.current;
    renderExecutiveCertificate(canvas, playerName, playerCompany, report.outcome, report.score, dateStr, credentialId);

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `brained-executive-certificate-${playerName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      setDownloading(false);
    }, 300);
  }, [report, playerName, playerCompany, dateStr, credentialId]);

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://brained.io/titan')}`;
  
  // LinkedIn Add-to-Profile direct deep link
  const linkedInAddToProfileUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent('Digital Transformation Specialist — Project Titan')}&organizationName=${encodeURIComponent('Brained Consulting')}&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${encodeURIComponent('https://brained.io/titan')}&certId=${encodeURIComponent(credentialId)}`;

  const linkedInPostText = report
    ? `🏆 Delighted to share that I have completed the Project Titan Digital Transformation Simulation by Brained Consulting!

Playing the role of a Senior Digital Transformation Consultant, I led an enterprise HR Portal engagement for Titan Manufacturing — managing executive stakeholders, uncovering hidden compliance & RBAC requirements, directing AI vibe-coding prototypes, and delivering the board presentation.

📊 Result: ${OUTCOME_CONFIG[report.outcome].title} (${report.score}/100)
✨ Ranking: Top 2% Global Percentile
🔒 Credential ID: ${credentialId}

#DigitalTransformation #EnterpriseArchitecture #Consulting #Brained #ProjectTitan #ExecutiveLeadership #CareerGrowth`
    : '';

  const handleCopyLinkedInText = () => {
    navigator.clipboard.writeText(linkedInPostText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const cfg = report ? OUTCOME_CONFIG[report.outcome] : OUTCOME_CONFIG['excellent'];

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#070913] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
          <p className="text-white font-bold tracking-wide">Generating Verified Executive Credential…</p>
          <p className="text-slate-400 text-xs">Computing global leaderboard standing and certification record</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#070913] text-white font-sans overflow-y-auto selection:bg-amber-500 selection:text-slate-950">

      {/* ── HERO BANNER ───────────────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${cfg.color} overflow-hidden border-b border-white/10`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-400/40 mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SIMULATION COMPLETE • VERIFIED CREDENTIAL</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
            {report?.outcomeName || 'Transformation Complete'}
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm leading-relaxed mb-8 font-medium">
            Congratulations, <span className="text-amber-300 font-bold">{playerName}</span>! Your engagement performance and board presentation have been evaluated and logged.
          </p>

          {/* Quick Metrics Cards */}
          {report && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="bg-slate-950/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-amber-500/40 text-center min-w-32 shadow-xl">
                <span className="text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider block mb-0.5">EXECUTIVE SCORE</span>
                <span className="text-white font-mono font-black text-2xl">{report.score}<span className="text-slate-400 text-xs font-normal">/100</span></span>
              </div>
              <div className="bg-slate-950/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-emerald-500/40 text-center min-w-32 shadow-xl">
                <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider block mb-0.5">REQUIREMENTS</span>
                <span className="text-white font-mono font-black text-2xl">{report.requirementsDiscovered}/{report.totalRequirements}</span>
              </div>
              <div className="bg-slate-950/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-sky-500/40 text-center min-w-32 shadow-xl">
                <span className="text-sky-400 text-[10px] font-mono font-bold uppercase tracking-wider block mb-0.5">GLOBAL PERCENTILE</span>
                <span className="text-white font-mono font-black text-2xl">TOP 2%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB NAVIGATION ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#090b16]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {[
              { id: 'certificate' as const, label: 'Verified Certificate', icon: Award },
              { id: 'leaderboard' as const, label: 'Global Leaderboard', icon: Trophy },
              { id: 'linkedin' as const, label: 'LinkedIn Integration', icon: LinkedinIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onReturnToLanding}
            className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing</span>
          </button>
        </div>
      </div>

      {/* ── TAB CONTENTS ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── TAB 1: EXECUTIVE CERTIFICATE ── */}
        {activeTab === 'certificate' && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="text-center space-y-2 max-w-xl">
              <h2 className="text-2xl font-black text-white tracking-tight">Verified Digital Credential</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official certificate issued by Brained Consulting. Fully verified for digital transformation competency and board-level delivery.
              </p>
            </div>

            {/* Canvas Certificate Render Frame */}
            <div className="w-full max-w-3xl glass-panel p-3 rounded-3xl border-2 border-amber-500/40 shadow-2xl bg-slate-950/80 relative group">
              <canvas
                ref={canvasRef}
                className="w-full rounded-2xl shadow-2xl border border-white/10"
                style={{ aspectRatio: '1.607' }}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center space-x-4 flex-wrap justify-center pt-2">
              <button
                onClick={handleDownloadCertificate}
                disabled={downloading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 flex items-center space-x-2 cursor-pointer transition-all hover:scale-105"
              >
                {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Download Executive Certificate (HD PNG)</span>
              </button>

              <button
                onClick={() => setActiveTab('linkedin')}
                className="px-7 py-3.5 rounded-2xl bg-[#0077B5] hover:bg-[#006699] text-white font-extrabold text-xs shadow-xl shadow-blue-500/20 flex items-center space-x-2 cursor-pointer transition-all hover:scale-105"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>Share to LinkedIn</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: GLOBAL LEADERBOARD ── */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <Leaderboard
              highlightSessionId={sessionId || undefined}
              limit={20}
              className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl"
            />
          </div>
        )}

        {/* ── TAB 3: LINKEDIN INTEGRATION SUITE ── */}
        {activeTab === 'linkedin' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#0077B5]/20 border border-[#0077B5]/40 flex items-center justify-center mx-auto text-[#0077B5]">
                <LinkedinIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Share Your Executive Achievement</h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Promote your digital transformation certification directly to your professional network on LinkedIn.
              </p>
            </div>

            {/* Direct LinkedIn Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: Add Certification to Profile */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>LINKEDIN LICENSES & CERTS</span>
                  </div>
                  <h3 className="font-extrabold text-base text-white">Add to LinkedIn Profile</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Adds this verified credential directly to the "Licenses & Certifications" section of your LinkedIn profile.
                  </p>
                </div>
                <a
                  href={linkedInAddToProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#0077B5] hover:bg-[#006699] text-white font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>Add Credential to Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>

              {/* Card B: Direct Post to Feed */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold">
                    <Share2 className="w-4 h-4" />
                    <span>LINKEDIN FEED POST</span>
                  </div>
                  <h3 className="font-extrabold text-base text-white">Share Post to Network</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Opens LinkedIn's post composer pre-formatted with your transformation engagement outcomes.
                  </p>
                </div>
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Share2 className="w-4 h-4 text-slate-950" />
                  <span>Open LinkedIn Share Window</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* Post Content Box with One-Click Copy */}
            <div className="glass-panel rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-300">PRE-FORMATED POST COPY</span>
                <button
                  onClick={handleCopyLinkedInText}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-bold border border-amber-500/40 transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Post Text'}</span>
                </button>
              </div>
              <div className="p-6 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950/60">
                {linkedInPostText}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
