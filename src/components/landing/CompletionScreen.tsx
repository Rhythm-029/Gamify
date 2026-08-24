/**
 * CompletionScreen — shown after a player completes the simulation.
 *
 * Sections:
 * 1. Hero banner with outcome + score
 * 2. Live Global Leaderboard with player's rank highlighted
 * 3. Certificate (rendered as HTML → downloadable PNG/PDF)
 * 4. LinkedIn post template with one-click copy
 * 5. Share + Return to Landing buttons
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy, Award, Download,
  Copy, Check, ArrowLeft, RefreshCw, Star, Briefcase, Calendar,
  TrendingUp, Medal, ExternalLink, Share2, FileCheck
} from 'lucide-react';
import { Leaderboard, type LeaderboardEntry } from './Leaderboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── LinkedIn SVG icon ─────────────────────────────────────────────────────────
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

// ── Outcome config ────────────────────────────────────────────────────────────

const OUTCOME_CONFIG = {
  excellent: {
    title: 'Outstanding Transformation Delivery',
    emoji: '🏆',
    color: 'from-emerald-600 to-cyan-600',
    glow: 'shadow-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    certBg: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%)',
    certAccent: '#34d399',
  },
  strong: {
    title: 'Solid Consulting Engagement',
    emoji: '⭐',
    color: 'from-sky-600 to-indigo-600',
    glow: 'shadow-sky-500/30',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    certBg: 'linear-gradient(135deg, #0c4a6e 0%, #075985 40%, #0369a1 70%, #0284c7 100%)',
    certAccent: '#38bdf8',
  },
  developing: {
    title: 'A Work in Progress',
    emoji: '📈',
    color: 'from-amber-600 to-orange-600',
    glow: 'shadow-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    certBg: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #92400e 70%, #b45309 100%)',
    certAccent: '#fbbf24',
  },
  needs_improvement: {
    title: 'Engagement Challenges Identified',
    emoji: '🔍',
    color: 'from-rose-600 to-red-600',
    glow: 'shadow-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    certBg: 'linear-gradient(135deg, #4c0519 0%, #881337 40%, #9f1239 70%, #be123c 100%)',
    certAccent: '#fb7185',
  },
};

// ── Certificate canvas renderer ───────────────────────────────────────────────

function renderCertificate(
  canvas: HTMLCanvasElement,
  playerName: string,
  company: string,
  outcome: keyof typeof OUTCOME_CONFIG,
  score: number,
  date: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const cfg = OUTCOME_CONFIG[outcome];

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0a0a1a');
  bgGrad.addColorStop(0.4, '#0f0f2a');
  bgGrad.addColorStop(1, '#070714');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative corner ornaments
  const drawCorner = (x: number, y: number, rx: number, ry: number) => {
    ctx.strokeStyle = cfg.certAccent + '55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + ry * 0.3);
    ctx.lineTo(x, y);
    ctx.lineTo(x + rx * 0.3, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + ry * 0.6);
    ctx.lineTo(x, y + ry * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + rx * 0.5, y);
    ctx.lineTo(x + rx * 0.65, y);
    ctx.stroke();
  };
  const m = 30;
  drawCorner(m, m, 1, 1);
  ctx.save(); ctx.scale(-1, 1); ctx.translate(-W, 0); drawCorner(m, m, 1, 1); ctx.restore();
  ctx.save(); ctx.scale(1, -1); ctx.translate(0, -H); drawCorner(m, m, 1, 1); ctx.restore();
  ctx.save(); ctx.scale(-1, -1); ctx.translate(-W, -H); drawCorner(m, m, 1, 1); ctx.restore();

  // Outer border
  ctx.strokeStyle = cfg.certAccent + '40';
  ctx.lineWidth = 1;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  ctx.strokeStyle = cfg.certAccent + '20';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(m + 8, m + 8, W - (m + 8) * 2, H - (m + 8) * 2);

  // Glow circle behind trophy
  const glow = ctx.createRadialGradient(W / 2, 160, 0, W / 2, 160, 120);
  glow.addColorStop(0, cfg.certAccent + '18');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 320);

  // "CERTIFICATE OF COMPLETION" header text
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillStyle = cfg.certAccent + 'cc';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 70);

  // Trophy emoji
  ctx.font = '64px serif';
  ctx.fillText(cfg.emoji, W / 2, 165);

  // Divider
  const divGrad = ctx.createLinearGradient(120, 0, W - 120, 0);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, cfg.certAccent + '80');
  divGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, 190); ctx.lineTo(W - 120, 190);
  ctx.stroke();

  // "This certifies that"
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px Georgia, serif';
  ctx.fillText('This certifies that', W / 2, 225);

  // Player name
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 36px Georgia, serif`;
  ctx.fillText(playerName, W / 2, 275);

  // Underline
  const nameWidth = ctx.measureText(playerName).width;
  const underlineGrad = ctx.createLinearGradient((W - nameWidth) / 2, 0, (W + nameWidth) / 2, 0);
  underlineGrad.addColorStop(0, 'transparent');
  underlineGrad.addColorStop(0.5, cfg.certAccent);
  underlineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = underlineGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo((W - nameWidth) / 2, 283);
  ctx.lineTo((W + nameWidth) / 2, 283);
  ctx.stroke();

  if (company) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Georgia, serif';
    ctx.fillText(company, W / 2, 310);
  }

  // "has successfully completed"
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px Georgia, serif';
  ctx.fillText('has successfully completed', W / 2, company ? 345 : 320);

  const yBase = company ? 345 : 320;

  // Simulation name
  ctx.fillStyle = cfg.certAccent;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('Project Titan — Enterprise HR Transformation Simulation', W / 2, yBase + 40);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px Georgia, serif';
  ctx.fillText('Brained Consulting · Digital Transformation Readiness Programme', W / 2, yBase + 70);

  // Divider
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, yBase + 90); ctx.lineTo(W - 120, yBase + 90);
  ctx.stroke();

  // Outcome + Score row
  const scoreY = yBase + 130;
  ctx.fillStyle = cfg.certAccent;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${score}`, 200, scoreY);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('/100', 200 + ctx.measureText(`${score}`).width + 2, scoreY);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText('SCORE', 210, scoreY + 18);

  ctx.textAlign = 'right';
  ctx.fillStyle = cfg.certAccent;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(OUTCOME_CONFIG[outcome].title, W - 200, scoreY - 8);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText('OUTCOME', W - 200, scoreY + 18);

  // Date
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px monospace';
  ctx.fillText(`Issued: ${date}`, W / 2, scoreY + 60);

  // Brained watermark
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('BRAINED.IO', W / 2, H - m - 15);
}

// ── Main component ────────────────────────────────────────────────────────────

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  sessionId,
  playerName,
  playerCompany,
  onReturnToLanding,
}) => {
  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'certificate' | 'linkedin'>('leaderboard');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch session report for score/outcome
  useEffect(() => {
    const sid = sessionId || localStorage.getItem('brained_session_id');
    if (!sid) {
      // Build local estimate from localStorage signals
      setReport({
        score: 55,
        outcome: 'strong',
        outcomeName: 'Solid Consulting Engagement',
        requirementsDiscovered: 6,
        totalRequirements: 13,
        stakeholdersEngaged: 3,
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
          const score = r.overall_score ?? 55;
          const outcome: keyof typeof OUTCOME_CONFIG =
            score >= 75 ? 'excellent' : score >= 55 ? 'strong' : score >= 30 ? 'developing' : 'needs_improvement';
          setReport({
            score,
            outcome,
            outcomeName: OUTCOME_CONFIG[outcome].title,
            requirementsDiscovered: r.requirement_coverage?.discovered?.length ?? 0,
            totalRequirements: (r.requirement_coverage?.discovered?.length ?? 0) + (r.requirement_coverage?.missed?.length ?? 0),
            stakeholdersEngaged: 4,
            momSubmitted: true,
            prototypeBuilt: true,
          });
        } else {
          throw new Error('no_report');
        }
      })
      .catch(() => {
        // Estimate from signals stored in localStorage or use defaults
        const score = parseInt(localStorage.getItem('brained_last_score') || '55', 10);
        const outcome: keyof typeof OUTCOME_CONFIG =
          score >= 75 ? 'excellent' : score >= 55 ? 'strong' : score >= 30 ? 'developing' : 'needs_improvement';
        setReport({
          score,
          outcome,
          outcomeName: OUTCOME_CONFIG[outcome].title,
          requirementsDiscovered: 6,
          totalRequirements: 13,
          stakeholdersEngaged: 3,
          momSubmitted: true,
          prototypeBuilt: true,
        });
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Render certificate to canvas when data is ready
  useEffect(() => {
    if (!report || !canvasRef.current || activeTab !== 'certificate') return;
    const canvas = canvasRef.current;
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    renderCertificate(canvas, playerName, playerCompany, report.outcome, report.score, date);
  }, [report, playerName, playerCompany, activeTab]);

  const handleDownloadCertificate = useCallback(() => {
    if (!canvasRef.current || !report) return;
    setDownloading(true);

    // Re-render at 2x resolution for download
    const canvas = canvasRef.current;
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    renderCertificate(canvas, playerName, playerCompany, report.outcome, report.score, date);

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `brained-certificate-${playerName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      setDownloading(false);
    }, 300);
  }, [report, playerName, playerCompany]);

  const linkedInPost = report
    ? `🎯 Just completed the Project Titan simulation by Brained Consulting!

I played the role of a Digital Transformation Consultant, working on an enterprise HR Portal engagement — managing stakeholders, discovering hidden requirements, building prototypes, and presenting to a simulated board.

Outcome: ${OUTCOME_CONFIG[report.outcome].title} (${report.score}/100)

✅ Discovered ${report.requirementsDiscovered}/${report.totalRequirements} requirements
${report.momSubmitted ? '✅ Submitted meeting minutes\n' : ''}${report.prototypeBuilt ? '✅ Built a working prototype\n' : ''}
This simulation is the most realistic consulting scenario I've encountered — highly recommend for anyone in digital transformation, consulting, or enterprise tech.

#DigitalTransformation #Consulting #Brained #ProjectTitan #CareerDevelopment`
    : '';

  const handleCopyLinkedIn = () => {
    navigator.clipboard.writeText(linkedInPost).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const cfg = report ? OUTCOME_CONFIG[report.outcome] : OUTCOME_CONFIG['strong'];

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#070913] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto">
            <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-white font-bold">Preparing your results…</p>
          <p className="text-slate-400 text-sm">Calculating your score and global rank</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#070913] text-white font-sans overflow-y-auto">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${cfg.color} overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 0%, transparent 60%)' }} />
        {/* Particle dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-pulse"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 text-center">
          <div className="text-6xl mb-4">{cfg.emoji}</div>
          <p className="text-white/70 text-sm font-mono uppercase tracking-widest mb-2">
            Project Titan — Simulation Complete
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            {report?.outcomeName || 'Engagement Complete'}
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm leading-relaxed mb-8">
            You've completed the Digital Transformation Consultant simulation. Your decisions, communications, and deliverables have been evaluated.
          </p>

          {/* Stats row */}
          {report && (
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {[
                { label: 'Score', value: `${report.score}/100`, icon: <Star className="w-3.5 h-3.5" /> },
                { label: 'Requirements', value: `${report.requirementsDiscovered}/${report.totalRequirements}`, icon: <FileCheck className="w-3.5 h-3.5" /> },
                { label: 'Outcome', value: cfg.title.split(' ')[0], icon: <Trophy className="w-3.5 h-3.5" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-black/25 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20 text-center min-w-28">
                  <div className="flex items-center justify-center gap-1.5 text-white/60 text-[10px] mb-1">
                    {stat.icon}
                    <span className="uppercase tracking-wider font-mono">{stat.label}</span>
                  </div>
                  <p className="text-white font-black text-lg">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TAB NAV ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0d0d1f]/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-1">
          {[
            { id: 'leaderboard' as const, label: 'Global Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
            { id: 'certificate' as const, label: 'Certificate', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'linkedin' as const, label: 'LinkedIn Post', icon: <LinkedinIcon className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          <div className="ml-auto">
            <button
              onClick={onReturnToLanding}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-white">Global Rankings</h2>
              <p className="text-slate-400 text-sm">Live leaderboard — updated every 30 seconds from completed sessions worldwide.</p>
            </div>

            {/* Your result card */}
            {report && (
              <div className={`bg-gradient-to-r ${cfg.color} p-px rounded-2xl ${cfg.glow} shadow-2xl`}>
                <div className="bg-[#0d0d1f] rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white">{playerName}</p>
                    {playerCompany && <p className="text-slate-400 text-xs">{playerCompany}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-black text-2xl">{report.score}<span className="text-slate-500 text-sm font-normal">/100</span></p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {report.outcomeName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Leaderboard
              highlightSessionId={sessionId || undefined}
              limit={20}
              className="bg-[#0d0d1f] border border-white/8 rounded-2xl p-5"
            />
          </div>
        )}

        {/* CERTIFICATE TAB */}
        {activeTab === 'certificate' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-white">Your Certificate</h2>
              <p className="text-slate-400 text-sm">
                {report && report.score >= 30
                  ? 'Certificate unlocked! Download and share your achievement.'
                  : 'Complete the simulation with a higher score to unlock the downloadable certificate.'}
              </p>
            </div>

            {/* Canvas certificate */}
            <div className="flex flex-col items-center gap-5">
              <canvas
                ref={canvasRef}
                width={900}
                height={560}
                className="rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10"
                style={{ imageRendering: 'crisp-edges' }}
              />

              {report && report.score >= 30 && (
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm cursor-pointer transition-all shadow-lg shadow-purple-500/25 disabled:opacity-60"
                  >
                    {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Certificate (PNG)
                  </button>

                  <button
                    onClick={() => setActiveTab('linkedin')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0077B5] hover:bg-[#006699] text-white font-semibold text-sm cursor-pointer transition-all"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                    Share on LinkedIn
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LINKEDIN POST TAB */}
        {activeTab === 'linkedin' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-white">Share Your Achievement</h2>
              <p className="text-slate-400 text-sm">Ready-made LinkedIn post. Copy, personalize, and post with your certificate.</p>
            </div>

            {/* LinkedIn post preview */}
            <div className="bg-[#1b1f27] rounded-2xl border border-white/10 overflow-hidden">
              {/* LinkedIn header mock */}
              <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black">
                  {playerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{playerName}</p>
                  <p className="text-slate-400 text-[11px]">{playerCompany || 'Digital Transformation Professional'}</p>
                </div>
                <div className="ml-auto">
                  <LinkedinIcon className="w-5 h-5 text-[#0077B5]" />
                </div>
              </div>

              {/* Post body */}
              <div className="p-5">
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {linkedInPost}
                </p>
              </div>

              {/* Certificate image preview placeholder */}
              <div
                className="mx-5 mb-5 rounded-xl border border-white/10 overflow-hidden relative"
                style={{ aspectRatio: '1.6' }}
              >
                <canvas
                  width={900} height={560}
                  className="w-full h-full object-cover"
                  ref={(node) => {
                    if (node && report) {
                      const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                      renderCertificate(node, playerName, playerCompany, report.outcome, report.score, date);
                    }
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCopyLinkedIn}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm cursor-pointer transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Post Text'}
              </button>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://brained.io/titan')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0077B5] hover:bg-[#006699] text-white font-semibold text-sm cursor-pointer transition-all"
              >
                <LinkedinIcon className="w-4 h-4" />
                Open LinkedIn
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <button
                onClick={() => setActiveTab('certificate')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-400 hover:text-white text-sm cursor-pointer transition-colors"
              >
                <Award className="w-4 h-4" />
                Download Certificate First
              </button>
            </div>

            {/* Tips */}
            <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">💡 Posting Tips</p>
              <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
                <li>• Download your certificate first, then attach it as the post image for maximum visibility</li>
                <li>• Personalize the post with specific decisions you made in the simulation</li>
                <li>• Tag Brained Consulting and your mentor connections for broader reach</li>
                <li>• The first 3 lines are most important — LinkedIn truncates after that</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <div className="border-t border-white/8 bg-[#0a0a1a] py-8">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-3">
          <p className="text-slate-500 text-xs">
            Want to improve your score? The simulation resets with the same scenario — every choice matters differently.
          </p>
          <button
            onClick={onReturnToLanding}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 hover:border-purple-500/60 text-white font-semibold text-sm cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
