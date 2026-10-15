import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, ChevronDown, ChevronLeft, ChevronRight,
  Sparkles, CheckCircle2, Play, ArrowRight, RotateCcw
} from 'lucide-react';
import { CHAPTERS, type Chapter, getStoredChapterStatuses, updateChapterStatus } from '../../data/chaptersData';

interface ChapterSelectHubProps {
  playerConfig: {
    name: string;
    role: string;
    company: string;
    email: string;
    linkedin: string;
  } | null;
  onStartChapter: (chapterId: number) => void;
}

// Visual metadata tailored for all 12 chapters
const CHAPTER_VISUALS: Record<number, { title: string; subtitle: string; description: string; thumb: string; yOffset: number }> = {
  1: {
    title: 'THE REQUIREMENT STORM',
    subtitle: 'Project Titan Kickoff',
    description: 'An enterprise HRMS transformation begins with an ambitious deadline, incomplete information, and conflicting expectations.',
    thumb: '/assets/ch1_thumb.jpg',
    yOffset: 0,
  },
  2: {
    title: 'Scope & Alignment',
    subtitle: 'Act I · Stakeholder Triage',
    description: 'Navigate a minefield of competing agendas. The CFO wants ROI in 60 days. The CHRO wants change management. Who do you align with first?',
    thumb: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&auto=format&fit=crop&q=80',
    yOffset: 14,
  },
  3: {
    title: 'The Delivery Plan',
    subtitle: 'Act I · Milestones & Architecture',
    description: 'Translate ambiguous client demands into a structured agile delivery sprint roadmap with verifiable milestone checkpoints.',
    thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80',
    yOffset: 26,
  },
  4: {
    title: 'Stakeholder Friction',
    subtitle: 'Act II · Boardroom Politics',
    description: 'Tensions flare as legacy teams resist digital automation. Neutralize bureaucratic roadblocks with diplomatic data storytelling.',
    thumb: '/assets/chess_thumb.jpg',
    yOffset: 40,
  },
  5: {
    title: 'The First Prototype',
    subtitle: 'Act II · Cera AI Build',
    description: 'Cera AI begins code generation. Manage scope, architectural integrity, and speed while pressure mounts from leadership.',
    thumb: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80',
    yOffset: 56,
  },
  6: {
    title: 'The Change Request',
    subtitle: 'Act II · Scope Creep Crisis',
    description: 'A surprise client change order threatens project timeline and budget. Negotiate phased releases without sacrificing quality.',
    thumb: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&auto=format&fit=crop&q=80',
    yOffset: 72,
  },
  7: {
    title: 'Technical Due Diligence',
    subtitle: 'Act III · Architecture Review',
    description: 'InfoSec and Enterprise Architecture subject the solution to intense stress testing and penetration compliance gates.',
    thumb: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80',
    yOffset: 90,
  },
  8: {
    title: 'The Security Gate',
    subtitle: 'Act III · Governance Audit',
    description: 'High-stakes compliance audit. Audit logs, role-based permissions, and data encryption come under regulatory scrutiny.',
    thumb: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&auto=format&fit=crop&q=80',
    yOffset: 110,
  },
  9: {
    title: 'Delivery Under Pressure',
    subtitle: 'Act III · The Final Sprint',
    description: 'Critical production bugs emerge 48 hours before enterprise rollout. Make consequential triage trade-offs under high stakes.',
    thumb: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&auto=format&fit=crop&q=80',
    yOffset: 130,
  },
  10: {
    title: 'Testing & Acceptance',
    subtitle: 'Act IV · User Validation',
    description: 'UAT rollout to 5,000 pilot bank employees. Measure adoption friction, gather feedback, and fix operational choke points.',
    thumb: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&auto=format&fit=crop&q=80',
    yOffset: 152,
  },
  11: {
    title: 'The Executive Review',
    subtitle: 'Act IV · Steering Committee',
    description: 'Defend transformation outcomes, ROI metrics, and operational readiness before the ICICI Bank Steering Committee.',
    thumb: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&auto=format&fit=crop&q=80',
    yOffset: 172,
  },
  12: {
    title: 'The Transformation Verdict',
    subtitle: 'Act IV · Board Decision',
    description: 'The final presentation to the Board of Directors. Earn your Brained Executive Certification and transformation verdict.',
    thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop&q=80',
    yOffset: 195,
  },
};

export const ChapterSelectHub: React.FC<ChapterSelectHubProps> = ({ playerConfig, onStartChapter }) => {
  const [chapterStatuses, setChapterStatuses] = useState<Record<number, string>>(() => getStoredChapterStatuses());
  const [selectedChapterId, setSelectedChapterId] = useState<number>(() => {
    const statuses = getStoredChapterStatuses();
    return statuses[2] === 'unlocked' ? 2 : 1;
  });
  const [hoveredChapter, setHoveredChapter] = useState<number | null>(null);
  const [deniedToast, setDeniedToast] = useState<string | null>(null);
  const [unlockedBanner, setUnlockedBanner] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playerName = playerConfig?.name || localStorage.getItem('brained_player_name') || 'Riya Mehta';
  const playerRole = playerConfig?.role || 'Digital Transformer';

  // Check if Chapter 2 was just unlocked from previous completion
  useEffect(() => {
    const justUnlocked = localStorage.getItem('brained_just_unlocked_chapter');
    if (justUnlocked === '2') {
      localStorage.removeItem('brained_just_unlocked_chapter');

      // Start on Chapter 1, then smoothly slide the golden boundary to Chapter 2!
      setSelectedChapterId(1);
      
      const timer = setTimeout(() => {
        // Shift golden boundary and larger box from Chapter 1 to Chapter 2
        setSelectedChapterId(2);
        setChapterStatuses(getStoredChapterStatuses());
        setUnlockedBanner('CHAPTER 02 UNLOCKED: SCOPE & ALIGNMENT');

        // Smooth scroll container to frame Chapter 2 comfortably
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ left: 80, behavior: 'smooth' });
        }

        setTimeout(() => setUnlockedBanner(null), 3500);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleCardClick = (chId: number) => {
    const status = chapterStatuses[chId] || (chId === 1 ? 'unlocked' : 'locked');
    if (status === 'locked') {
      setDeniedToast(`Chapter ${chId} is locked. Complete Chapter ${chId - 1} to unlock.`);
      setTimeout(() => setDeniedToast(null), 2500);
      return;
    }
    // Select chapter with sliding golden border
    setSelectedChapterId(chId);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const unlockedCount = Object.values(chapterStatuses).filter(s => s === 'unlocked' || s === 'completed').length;

  return (
    <div className="relative w-full h-screen bg-[#070b14] text-white overflow-hidden flex flex-col font-sans select-none">
      
      {/* ── CINEMATIC LUXURY HIGH-RISE EXECUTIVE SKYLINE BACKGROUND ── */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-100"
        style={{
          backgroundImage: `url('/assets/executive_skyline_bg.jpg')`,
        }}
      />

      {/* Atmospheric dark gradient overlays to ensure razor-sharp legibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#060811] via-[#060811]/70 to-[#060811]/85 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#060811]/90 via-transparent to-[#060811]/80 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_25%_75%,rgba(245,158,11,0.06),transparent_50%)] pointer-events-none" />

      {/* ═══════════════════════════════════════════════════════════════════
          TOP NAVIGATION BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 flex items-center justify-between px-10 py-5 flex-shrink-0">
        
        {/* Left: Brained Brand with Vertical Separator */}
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold tracking-tight text-white font-sans">
            Brained
          </span>
          <span className="w-px h-7 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-[0.2em] text-slate-200 uppercase font-sans">
              THE TRANSFORMATION ROOM
            </span>
            <span className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-mono">
              A DIGITAL TRANSFORMATION SIMULATION
            </span>
          </div>
        </div>

        {/* Right: Executive Profile Dropdown Pill */}
        <div className="flex items-center space-x-3 bg-white/[0.06] hover:bg-white/[0.10] transition-all border border-white/10 rounded-full py-1.5 pl-2 pr-4 backdrop-blur-md cursor-pointer shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" 
            className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
            alt={playerName} 
          />
          <div className="text-left">
            <div className="text-xs font-semibold text-white leading-tight">{playerName}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{playerRole}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO HEADLINE & MANTRA (TOP HALF)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 px-10 pt-4 pb-2 flex items-start justify-between flex-shrink-0">
        
        {/* Left: Elegant Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-[0.22em] text-amber-400 uppercase font-bold mb-3">
            <span>YOUR JOURNEY</span>
            <span className="text-white/20 font-normal">|</span>
            <span className="text-slate-300">
              {String(unlockedCount).padStart(2, '0')} / 12 CHAPTERS AVAILABLE
            </span>
          </div>

          {/* Master Serif Headline */}
          <h1 className="text-4xl lg:text-[44px] font-serif text-white tracking-wide leading-[1.12] mb-3 font-normal">
            EVERY TRANSFORMATION<br />
            STARTS WITH <span className="text-[#eab308] font-serif italic tracking-wider">A DECISION.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs lg:text-[13px] text-slate-300/90 font-sans leading-relaxed max-w-xl font-normal">
            Navigate twelve chapters of stakeholder pressure, competing priorities and consequential decisions. Your approach determines how the engagement unfolds.
          </p>
        </motion.div>

        {/* Right: The Iconic Corporate Pressure Mantra */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden xl:flex flex-col items-start space-y-1 text-slate-400 font-mono text-[11px] tracking-[0.28em] select-none text-left"
        >
          <div>SAME</div>
          <div>PEOPLE.</div>
          <div className="pt-1.5">REAL</div>
          <div>PRESSURE.</div>
          <div className="pt-1.5">HIGHER</div>
          <div>STAKES.</div>
          <div className="w-9 h-[2px] bg-amber-400/80 mt-3 shadow-[0_0_8px_#f59e0b]" />
        </motion.div>
      </div>

      {/* ── CELEBRATORY UNLOCKED BANNER ── */}
      <AnimatePresence>
        {unlockedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/60 backdrop-blur-xl text-amber-300 font-mono text-xs font-bold tracking-widest flex items-center space-x-2.5 shadow-[0_0_35px_rgba(245,158,11,0.5)]"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{unlockedBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CANVAS: SMOOTH HORIZONTAL SCROLLING JOURNEY TRACK
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 w-full flex flex-col justify-end pb-8 overflow-hidden group/track">
        
        {/* Floating Left & Right Scroll Buttons */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 hover:border-amber-400 text-white hover:text-amber-400 flex items-center justify-center backdrop-blur-md transition-all shadow-xl opacity-70 hover:opacity-100 cursor-pointer"
          title="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 hover:border-amber-400 text-white hover:text-amber-400 flex items-center justify-center backdrop-blur-md transition-all shadow-xl opacity-70 hover:opacity-100 cursor-pointer"
          title="Scroll Right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* ── HORIZONTALLY SCROLLABLE TRACK CONTAINER ── */}
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-hidden px-14 flex items-end relative scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }}
        >
          {/* Scrollable SVG Spline Curve across all 12 chapters (spanning full width) */}
          <div className="absolute left-0 right-0 bottom-0 top-0 pointer-events-none z-0" style={{ width: '3100px' }}>
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 3100 400">
              <defs>
                <linearGradient id="goldPathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.35" />
                </linearGradient>
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Ascending Timeline Spline connecting all 12 Chapter Nodes */}
              <path
                d="M 120 310 C 350 305, 500 300, 750 280 C 1100 255, 1450 215, 1850 170 C 2250 130, 2650 95, 3000 65"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="5"
                strokeOpacity="0.2"
                filter="url(#goldGlow)"
              />
              <path
                d="M 120 310 C 350 305, 500 300, 750 280 C 1100 255, 1450 215, 1850 170 C 2250 130, 2650 95, 3000 65"
                fill="none"
                stroke="url(#goldPathGrad)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* ── 12 CARDS WITH HEALTHY SPACING (GAP-8) ── */}
          <div className="relative z-10 flex items-end space-x-8 py-6 pr-14" style={{ minWidth: 'max-content' }}>
            {CHAPTERS.map((ch) => {
              const visual = CHAPTER_VISUALS[ch.id] || {
                title: ch.title,
                subtitle: ch.subtitle,
                description: ch.description,
                thumb: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&auto=format&fit=crop&q=80',
                yOffset: ch.id * 12,
              };

              const status = chapterStatuses[ch.id] || (ch.id === 1 ? 'unlocked' : 'locked');
              const isCompleted = status === 'completed';
              const isUnlocked = status === 'unlocked' || isCompleted;
              const isSelected = selectedChapterId === ch.id;
              const isHovered = hoveredChapter === ch.id;

              return (
                <motion.div
                  key={ch.id}
                  layout
                  transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                  onMouseEnter={() => setHoveredChapter(ch.id)}
                  onMouseLeave={() => setHoveredChapter(null)}
                  onClick={() => handleCardClick(ch.id)}
                  className={`relative flex-shrink-0 rounded-2xl backdrop-blur-xl flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'w-[280px] p-4 bg-[#090e1a]/95'
                      : 'w-[185px] p-3 bg-[#0a0f1d]/85'
                  } ${
                    !isUnlocked 
                      ? 'grayscale contrast-75 brightness-75 border border-white/[0.08]' 
                      : 'border border-white/10'
                  }`}
                  style={{
                    height: isSelected ? '345px' : '270px',
                    marginBottom: `${visual.yOffset}px`,
                    transform: isHovered && !isSelected ? 'translateY(-6px)' : 'none',
                  }}
                >
                  {/* ── SLIDING GOLDEN BOUNDARY (FRAMER MOTION LAYOUT ID) ── */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-golden-boundary"
                      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                      className="absolute inset-0 rounded-2xl border-2 border-amber-400 pointer-events-none shadow-[0_0_35px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    >
                      {/* Top Amber Highlight Strip */}
                      <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_8px_#f59e0b]" />
                    </motion.div>
                  )}

                  {/* ── CARD CONTENT ── */}
                  <div className="relative z-10">
                    {/* Header: Number & Status Badge */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-serif font-bold ${
                        isSelected ? 'text-3xl text-white' : 'text-xl text-slate-300'
                      }`}>
                        {String(ch.id).padStart(2, '0')}
                      </span>

                      {/* Status indicator: Completed check or Lock icon */}
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[9px] font-mono font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>COMPLETED</span>
                        </span>
                      ) : !isUnlocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      ) : null}
                    </div>

                    {/* Title & Subtitle */}
                    <div className={`font-black uppercase tracking-wide line-clamp-1 ${
                      isSelected ? 'text-xs text-white' : 'text-[11px] text-slate-200'
                    }`}>
                      {visual.title}
                    </div>
                    <div className="text-[10px] text-amber-400/90 font-medium truncate mb-2">
                      {visual.subtitle}
                    </div>

                    {/* Thumbnail Image (Full color when unlocked, Black & White when locked) */}
                    <div className={`relative w-full rounded-lg overflow-hidden border border-white/10 mb-2 transition-all ${
                      isSelected ? 'h-24 shadow-md' : 'h-20'
                    }`}>
                      <img 
                        src={visual.thumb} 
                        alt={visual.title} 
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isUnlocked ? 'group-hover:scale-105' : 'grayscale'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Rich description shown when Selected/Expanded */}
                    {isSelected && (
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                        {visual.description}
                      </p>
                    )}
                  </div>

                  {/* ── CARD FOOTER / ACTION BUTTON ── */}
                  <div className="relative z-10 pt-2">
                    {isSelected ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartChapter(ch.id);
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-slate-950 font-bold text-xs tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>REPLAY CHAPTER {String(ch.id).padStart(2, '0')}</span>
                          </>
                        ) : (
                          <>
                            <span>BEGIN CHAPTER {String(ch.id).padStart(2, '0')}</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </>
                        )}
                      </motion.button>
                    ) : isUnlocked ? (
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>SELECT TO PLAY</span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-[9px] font-mono text-slate-500 space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>LOCKED</span>
                      </div>
                    )}
                  </div>

                  {/* ── NODE CONNECTOR TO THE SPLINE PATH ── */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
                    <div className={`w-[1.5px] h-3 ${isSelected ? 'bg-amber-400' : 'bg-white/20'}`} />
                    <div className={`rounded-full border transition-all ${
                      isSelected
                        ? 'w-4 h-4 border-amber-300 bg-amber-500 shadow-[0_0_12px_#f59e0b]'
                        : isUnlocked
                        ? 'w-3 h-3 border-white/60 bg-slate-200 shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                        : 'w-2.5 h-2.5 border-white/30 bg-slate-600'
                    }`} />
                  </div>

                  {/* Hover Tooltip for Locked Cards */}
                  {isHovered && !isUnlocked && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black/95 border border-white/20 text-[9px] font-mono text-slate-300 whitespace-nowrap shadow-xl z-40 pointer-events-none">
                      Unlocks after Ch.{ch.id - 1}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM FOOTER: QUOTE & INTERACTION INDICATOR
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-20 px-10 py-3 flex items-center justify-between border-t border-white/[0.06] bg-black/30 backdrop-blur-md flex-shrink-0">
        
        {/* Left: Inspiring Corporate Quote */}
        <div className="text-left font-serif text-slate-400 text-xs italic leading-relaxed">
          “Complex projects aren’t solved by luck.<br />
          They’re shaped by how you lead.”
          <div className="not-italic font-sans text-[9px] tracking-[0.2em] text-slate-500 uppercase mt-0.5">
            — THE TRANSFORMATION ROOM
          </div>
        </div>

        {/* Center: Mouse Interaction Prompt with Horizontal Scroll Cue */}
        <div className="flex flex-col items-center space-y-1 text-slate-500 select-none">
          <div className="flex items-center space-x-2 text-[9px] font-mono tracking-[0.25em] text-slate-400 uppercase">
            <span>SCROLL HORIZONTALLY TO EXPLORE ALL 12 CHAPTERS</span>
          </div>
          <div className="w-12 h-px bg-slate-700" />
        </div>

        {/* Right: Security & Engine Watermark */}
        <div className="text-right font-mono text-[9px] text-slate-500 tracking-wider hidden sm:block">
          TITAN SIMULATION · ENGINE v3.4<br />
          <span className="text-slate-600">CONFIDENTIAL & PROPRIETARY</span>
        </div>
      </footer>

      {/* ── ACCESS DENIED FLOATING TOAST ── */}
      <AnimatePresence>
        {deniedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center space-x-2"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{deniedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
