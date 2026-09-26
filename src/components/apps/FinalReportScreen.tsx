/**
 * FinalReportScreen — the definitive end-of-game report.
 *
 * Shows:
 *  - Score breakdown across 7 dimensions (scoreEngine.ts)
 *  - Character feedback from all 4 stakeholders
 *  - Requirement coverage matrix
 *  - Downloadable certificate
 *  - Global leaderboard
 *
 * Score IS shown (user requested it). No hallucination — purely deterministic.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  Trophy, Award, Download, ArrowRight, Users, FileText,
  Shield, Zap, MessageSquare, Search, CheckCircle2,
  XCircle, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Star, RefreshCw, ExternalLink
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { computeScore, getCharacterFeedback } from '../../utils/scoreEngine';
import type { DimensionScore, CharacterFeedback } from '../../utils/scoreEngine';
import { Leaderboard } from '../landing/Leaderboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Props ─────────────────────────────────────────────────────────────────────

interface FinalReportScreenProps {
  onReturnToDashboard?: () => void;
}

// ── Outcome config ─────────────────────────────────────────────────────────────

const OUTCOME = {
  excellent: {
    label: 'Outstanding', color: '#34d399', bg: 'from-emerald-900/60 to-emerald-800/20',
    border: 'border-emerald-500/40', ring: '#34d399',
    title: 'Outstanding Transformation Delivery',
    narrative: 'You approached Project Titan with the discipline of an experienced transformation consultant. Requirements were uncovered proactively, stakeholders were engaged, and the prototype reflected what the business actually needed. Titan Manufacturing has a strong foundation for their HR transformation.',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    certColor: '#10b981',
  },
  strong: {
    label: 'Strong', color: '#60a5fa', bg: 'from-blue-900/60 to-blue-800/20',
    border: 'border-blue-500/40', ring: '#60a5fa',
    title: 'Solid Consulting Engagement',
    narrative: 'You managed the Titan HR Portal engagement competently. Core requirements were covered and key stakeholders were engaged. There were some gaps — a few hidden requirements were missed, and some documentation could have been stronger — but the overall delivery demonstrates solid consulting fundamentals.',
    badgeBg: 'bg-blue-500/20 text-blue-300',
    certColor: '#3b82f6',
  },
  developing: {
    label: 'Developing', color: '#fbbf24', bg: 'from-amber-900/60 to-amber-800/20',
    border: 'border-amber-500/40', ring: '#fbbf24',
    title: 'A Work In Progress',
    narrative: 'You engaged with the simulation but several important elements were missed or handled reactively. Requirements surfaced late, some stakeholders were not contacted, and the documentation had gaps. This is a realistic reflection of early-career consulting — the instincts are there, but structure and discipline need development.',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    certColor: '#f59e0b',
  },
  needs_improvement: {
    label: 'Needs Work', color: '#f87171', bg: 'from-red-900/60 to-red-800/20',
    border: 'border-red-500/40', ring: '#f87171',
    title: 'Significant Gaps Identified',
    narrative: 'The engagement had fundamental gaps in requirement discovery, stakeholder communication, and documentation. A consulting engagement of this nature requires active management — requirements do not surface themselves, stakeholders do not stay aligned without contact, and documentation is how a consultant demonstrates competence.',
    badgeBg: 'bg-red-500/20 text-red-300',
    certColor: '#ef4444',
  },
};

const DIMENSION_ICON: Record<string, React.FC<{ className?: string }>> = {
  kickoff_engagement: Users,
  stakeholder_management: Users,
  requirement_discovery: Search,
  delivery_execution: Zap,
  documentation: FileText,
  communication: MessageSquare,
  security_awareness: Shield,
};

// ── Grade bar ─────────────────────────────────────────────────────────────────

const GradeBar: React.FC<{ score: number; grade: DimensionScore['grade'] }> = ({ score, grade }) => {
  const color = grade === 'excellent' ? '#34d399' : grade === 'good' ? '#60a5fa' : grade === 'developing' ? '#fbbf24' : '#f87171';
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
  );
};

// ── Certificate renderer ───────────────────────────────────────────────────────

const Certificate: React.FC<{
  playerName: string;
  score: number;
  outcome: keyof typeof OUTCOME;
  date: string;
  onDownload: () => void;
}> = ({ playerName, score, outcome, date, onDownload }) => {
  const cfg = OUTCOME[outcome];
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}>
      {/* Header band */}
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${cfg.certColor}, #a78bfa, ${cfg.certColor})` }} />

      <div className="p-8 text-center relative">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[120px] font-black opacity-[0.03] text-white">B</span>
        </div>

        {/* Logo + title */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl" style={{ background: cfg.certColor }}>B</div>
          <div className="text-left">
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Brained Consulting</p>
            <p className="text-white font-bold text-sm">Project Titan Simulation</p>
          </div>
        </div>

        <p className="text-white/50 text-xs uppercase tracking-[0.3em] mb-3">Certificate of Completion</p>
        <p className="text-white/60 text-sm mb-2">This certifies that</p>
        <h2 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>{playerName || 'Digital Transformer'}</h2>
        <p className="text-white/50 text-sm mb-6">has successfully completed the Digital Transformation Leadership Simulation</p>

        {/* Score ring */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-5xl font-black mb-1" style={{ color: cfg.certColor }}>{score}</div>
            <div className="text-white/40 text-xs uppercase tracking-widest">out of 100</div>
          </div>
          <div className="text-left">
            <div className="text-white/60 text-xs mb-1">Outcome</div>
            <div className="text-lg font-bold text-white">{cfg.title.split(' ')[0]} {cfg.title.split(' ')[1]}</div>
            <div className="text-white/40 text-xs">{date}</div>
          </div>
        </div>

        {/* Competencies */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
          {['Stakeholder Management', 'Requirement Discovery', 'Delivery Execution'].map(c => (
            <div key={c} className="rounded-lg border border-white/10 bg-white/5 py-2 px-1 text-white/60">{c}</div>
          ))}
        </div>

        {/* Signature */}
        <div className="flex justify-around text-xs text-white/30 border-t border-white/10 pt-4">
          <div>
            <div className="text-white/60 font-bold text-sm mb-1" style={{ fontFamily: 'Georgia, serif' }}>Marcus Reed</div>
            <div>CTO, Brained Consulting</div>
          </div>
          <div>
            <div className="text-white/60 font-bold text-sm mb-1" style={{ fontFamily: 'Georgia, serif' }}>Aarav Kapoor</div>
            <div>Senior Transformation Advisor</div>
          </div>
        </div>
      </div>

      {/* Footer band */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${cfg.certColor}, #a78bfa, ${cfg.certColor})` }} />

      {/* Download button */}
      <div className="px-8 py-4 bg-white/[0.02] flex justify-center">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white/80 border border-white/20 hover:bg-white/10 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Certificate (PNG)
        </button>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

export const FinalReportScreen: React.FC<FinalReportScreenProps> = ({ onReturnToDashboard }) => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<'report' | 'certificate' | 'leaderboard'>('report');
  const [animateIn, setAnimateIn] = useState(false);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const hasSavedRef = useRef(false);

  const playerName = localStorage.getItem('brained_player_name') || 'Consultant';
  const playerCompany = localStorage.getItem('brained_player_company') || '';
  const sessionId = state.sessionId || localStorage.getItem('brained_session_id') || '';

  const report = computeScore(state);
  const feedback = getCharacterFeedback(report, state);
  const cfg = OUTCOME[report.outcome];
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Save score to backend (once)
  useEffect(() => {
    if (hasSavedRef.current || !sessionId) return;
    hasSavedRef.current = true;
    fetch(`${API_BASE}/api/game/report/${sessionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});

    // Also post computed score so leaderboard updates
    fetch(`${API_BASE}/api/game/session/${sessionId}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: report.totalScore,
        outcome: report.outcome,
        player_name: playerName,
        player_company: playerCompany,
        requirements_discovered: report.requirementsFound,
        total_requirements: report.totalRequirements,
      }),
    }).catch(() => {});
  }, [sessionId, report.totalScore, report.outcome, playerName, playerCompany]);

  const handleDownloadCert = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#0f1117', useCORS: true });
      const link = document.createElement('a');
      link.download = `brained_cert_${playerName.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Screenshot not available in this browser. Try right-clicking the certificate and saving the image.');
    }
  }, [playerName]);

  const TABS = [
    { id: 'report', label: 'Full Report' },
    { id: 'certificate', label: 'Certificate' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#080a0f] text-white flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top gradient band */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, #7c3aed, ${cfg.ring}, #7c3aed)` }} />

      {/* Header */}
      <div className={`border-b border-white/10 bg-gradient-to-b ${cfg.bg} px-6 py-8`}>
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: animateIn ? 1 : 0, y: animateIn ? 0 : -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${cfg.border} ${cfg.badgeBg}`}>
                <Trophy className="w-3 h-3" />
                Project Titan — Final Assessment
              </div>
              <h1 className="text-3xl font-black text-white mb-1">{cfg.title}</h1>
              <p className="text-white/50 text-sm">{playerName}{playerCompany ? ` · ${playerCompany}` : ''} · {dateStr}</p>
            </div>

            {/* Score ring */}
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <motion.circle
                    cx="48" cy="48" r="40" fill="none" stroke={cfg.ring} strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: animateIn ? 2 * Math.PI * 40 * (1 - report.totalScore / 100) : 2 * Math.PI * 40 }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: cfg.ring }}>{report.totalScore}</span>
                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">/ 100</span>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-1">Top {100 - report.percentile}% of players</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Requirements Found', value: `${report.requirementsFound}/${report.totalRequirements}`, ok: report.requirementsFound >= 8 },
              { label: 'Stakeholders Engaged', value: `${report.stakeholdersEngaged}/4`, ok: report.stakeholdersEngaged >= 3 },
              { label: 'Prototype Built', value: state.prototypeBuilt ? 'Yes' : 'No', ok: state.prototypeBuilt },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border bg-white/5 px-4 py-3 ${s.ok ? 'border-white/10' : 'border-red-500/30'}`}>
                <div className="text-white/40 text-xs mb-1">{s.label}</div>
                <div className={`text-lg font-bold ${s.ok ? 'text-white' : 'text-red-400'}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/10 bg-[#0c0e17]">
        <div className="max-w-4xl mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── REPORT TAB ────────────────────────────────────────────────── */}
          {activeTab === 'report' && (
            <motion.div
              key="report"
              className="max-w-4xl mx-auto px-6 py-8 space-y-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {/* Outcome narrative */}
              <div className={`rounded-2xl border bg-gradient-to-br ${cfg.bg} ${cfg.border} p-6`}>
                <p className="text-white/80 leading-relaxed text-sm">{cfg.narrative}</p>
              </div>

              {/* Dimension breakdown */}
              <div>
                <h2 className="text-white font-bold text-lg mb-4">Score Breakdown</h2>
                <div className="space-y-3">
                  {report.dimensions.map((dim, i) => {
                    const Icon = DIMENSION_ICON[dim.id] ?? FileText;
                    const isExpanded = expandedDim === dim.id;
                    const gradeColor = dim.grade === 'excellent' ? '#34d399' : dim.grade === 'good' ? '#60a5fa' : dim.grade === 'developing' ? '#fbbf24' : '#f87171';
                    return (
                      <motion.div
                        key={dim.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: animateIn ? 1 : 0, x: animateIn ? 0 : -10 }}
                        transition={{ delay: 0.1 * i }}
                        className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
                      >
                        <button
                          className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                          onClick={() => setExpandedDim(isExpanded ? null : dim.id)}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${gradeColor}20` }}>
                            <Icon className="w-4 h-4" style={{ color: gradeColor }} />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-white">{dim.label}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold" style={{ color: gradeColor }}>
                                  {dim.weightedScore}/{dim.weight} pts
                                </span>
                                <span className="text-white/30 text-xs">({dim.weight}% weight)</span>
                              </div>
                            </div>
                            <GradeBar score={dim.rawScore} grade={dim.grade} />
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30 shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4 pt-1 border-t border-white/5">
                                <p className="text-white/60 text-sm">{dim.breakdown}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.strengths.length > 0 && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-emerald-400 font-bold text-sm">What Worked</h3>
                    </div>
                    <ul className="space-y-3">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="text-white/70 text-sm">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.areasToGrow.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingDown className="w-4 h-4 text-amber-400" />
                      <h3 className="text-amber-400 font-bold text-sm">Areas to Develop</h3>
                    </div>
                    <ul className="space-y-3">
                      {report.areasToGrow.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                          <span className="text-white/70 text-sm">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Requirement coverage matrix */}
              <div>
                <h2 className="text-white font-bold text-lg mb-4">Requirement Coverage</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {state.prototypeFeatures.map(f => (
                    <div
                      key={f.id}
                      className={`rounded-lg border px-3 py-2 flex items-center gap-2 text-xs ${
                        f.included
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : f.discovered
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-white/10 bg-white/5 text-white/30'
                      }`}
                    >
                      {f.included ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : f.discovered ? <CheckCircle2 className="w-3 h-3 shrink-0 opacity-50" /> : <XCircle className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{f.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-white/40">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Included in prototype</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Discovered, not included</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" /> Not discovered</span>
                </div>
              </div>

              {/* Stakeholder feedback */}
              <div>
                <h2 className="text-white font-bold text-lg mb-4">Stakeholder Feedback</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {feedback.map(fb => (
                    <div
                      key={fb.characterId}
                      className={`rounded-xl border p-4 ${
                        fb.sentiment === 'positive' ? 'border-emerald-500/20 bg-emerald-500/5'
                        : fb.sentiment === 'neutral' ? 'border-white/10 bg-white/[0.03]'
                        : 'border-red-500/20 bg-red-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img src={fb.avatar} alt={fb.name} className="w-10 h-10 rounded-full object-cover border border-white/20" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div>
                          <div className="text-white font-semibold text-sm">{fb.name}</div>
                          <div className="text-white/40 text-xs">{fb.role}</div>
                        </div>
                        <div className="ml-auto">
                          {fb.sentiment === 'positive' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                           : fb.sentiment === 'negative' ? <XCircle className="w-4 h-4 text-red-400" />
                           : <Star className="w-4 h-4 text-amber-400" />}
                        </div>
                      </div>
                      <p className="text-white/60 text-sm italic">"{fb.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setActiveTab('certificate')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Global Leaderboard
                </button>
                {onReturnToDashboard && (
                  <button
                    onClick={onReturnToDashboard}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-500 transition-colors ml-auto"
                  >
                    Play Again <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── CERTIFICATE TAB ────────────────────────────────────────────── */}
          {activeTab === 'certificate' && (
            <motion.div
              key="cert"
              className="max-w-2xl mx-auto px-6 py-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div ref={certRef}>
                <Certificate
                  playerName={playerName}
                  score={report.totalScore}
                  outcome={report.outcome}
                  date={dateStr}
                  onDownload={handleDownloadCert}
                />
              </div>
              <p className="text-white/30 text-xs text-center mt-4">
                Share your achievement with your network — paste the image on LinkedIn or WhatsApp.
              </p>
            </motion.div>
          )}

          {/* ── LEADERBOARD TAB ─────────────────────────────────────────────── */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="lb"
              className="max-w-4xl mx-auto px-6 py-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Leaderboard highlightSessionId={sessionId || undefined} limit={20} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#0c0e17] px-6 py-3 flex items-center justify-between text-xs text-white/30">
        <span>Brained Consulting · Project Titan Simulation</span>
        <span>Score: {report.totalScore}/100 · {cfg.label} Performance</span>
      </div>
    </div>
  );
};

export default FinalReportScreen;
