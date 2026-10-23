/**
 * =========================================================================
 * TEMPORARY CHAPTER SKIP FEATURE - CAN BE REMOVED ON REQUEST
 * =========================================================================
 * 
 * Provides developer/testing shortcuts to jump directly to any chapter
 * (Chapter 1 through 5) without playing through preceding chapters.
 * 
 * TO REMOVE WHEN INSTRUCTED:
 * 1. Delete this file: src/components/dev/TemporaryChapterSkip.tsx
 * 2. Delete src/utils/devChapterSkip.ts
 * 3. Search for `TEMPORARY CHAPTER SKIP FEATURE` across the codebase and
 *    remove the tagged blocks in:
 *    - src/components/os/ChapterSelectHub.tsx
 *    - src/components/os/BrainedMenuBar.tsx
 *    - src/components/landing/LandingPage.tsx
 *    - src/App.tsx
 * =========================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { Zap, ChevronDown, Check, ArrowRight, RotateCcw } from 'lucide-react';
import {
  TEMPORARY_CHAPTER_SKIP_ACTIVE,
  DEV_CHAPTERS,
  executeChapterJump,
  type DevChapterOption,
} from '../../utils/devChapterSkip';

export { TEMPORARY_CHAPTER_SKIP_ACTIVE, DEV_CHAPTERS, executeChapterJump, type DevChapterOption };

// ─────────────────────────────────────────────────────────────────────────────
// 1. Menu Bar Dropdown Widget (rendered inside BrainedMenuBar)
// ─────────────────────────────────────────────────────────────────────────────

interface TemporaryMenuBarChapterSkipProps {
  activeChapter?: number;
  onSelectChapter?: (id: number) => void;
  onReturnToHub?: () => void;
}

export const TemporaryMenuBarChapterSkip: React.FC<TemporaryMenuBarChapterSkipProps> = ({
  activeChapter = 1,
  onSelectChapter,
  onReturnToHub,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!TEMPORARY_CHAPTER_SKIP_ACTIVE || !onSelectChapter) return null;

  const currentCh = DEV_CHAPTERS.find((c) => c.id === activeChapter) || DEV_CHAPTERS[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
        title="Temporary Chapter Skip (Dev Shortcut)"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
        <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-amber-300">
          Skip:
        </span>
        <span className="text-white font-extrabold text-[11px]">
          {currentCh.label}
        </span>
        <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-2xl p-2 z-[9999] backdrop-blur-2xl text-slate-200">
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                Jump to Chapter
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              DEV MODE
            </span>
          </div>

          {/* Chapter Options */}
          <div className="py-1 space-y-1">
            {DEV_CHAPTERS.map((ch) => {
              const isActive = ch.id === activeChapter;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    executeChapterJump(ch.id, onSelectChapter);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 border border-amber-400/50 text-white'
                      : 'hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{ch.icon}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono tracking-tight text-white">
                          {ch.label}
                        </span>
                        <span
                          className="text-[9px] font-mono uppercase px-1 rounded font-bold"
                          style={{ backgroundColor: `${ch.color}25`, color: ch.color }}
                        >
                          {ch.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1">
                        {ch.title}
                      </span>
                    </div>
                  </div>
                  {isActive ? (
                    <span className="flex items-center text-[10px] font-mono text-amber-400 font-bold">
                      <Check className="w-3.5 h-3.5 mr-0.5" /> Active
                    </span>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions Footer */}
          <div className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between px-2 text-[10px] font-mono">
            {onReturnToHub && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onReturnToHub();
                }}
                className="text-slate-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>⎋ Exit to Hub</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                executeChapterJump(activeChapter, onSelectChapter);
              }}
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart {currentCh.label}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Chapter Select Hub Header Dropdown Widget
// ─────────────────────────────────────────────────────────────────────────────

interface TemporaryHubChapterSkipProps {
  onSelectChapter: (id: number) => void;
}

export const TemporaryHubChapterSkip: React.FC<TemporaryHubChapterSkipProps> = ({
  onSelectChapter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!TEMPORARY_CHAPTER_SKIP_ACTIVE) return null;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        title="Temporary Chapter Skip: Jump straight to any chapter"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
        <span>⚡ Quick Jump ▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl text-slate-200">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              ⚡ Instant Chapter Skip
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
              TEMPORARY
            </span>
          </div>

          <div className="py-1 space-y-1">
            {DEV_CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  executeChapterJump(ch.id, onSelectChapter);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{ch.icon}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono tracking-tight text-white group-hover:text-amber-300">
                        {ch.label}
                      </span>
                      <span
                        className="text-[9px] font-mono uppercase px-1 rounded font-bold"
                        style={{ backgroundColor: `${ch.color}25`, color: ch.color }}
                      >
                        {ch.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {ch.title}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Landing Page Header Dropdown Widget
// ─────────────────────────────────────────────────────────────────────────────

interface TemporaryLandingChapterSkipProps {
  onSelectChapter: (id: number) => void;
}

export const TemporaryLandingChapterSkip: React.FC<TemporaryLandingChapterSkipProps> = ({
  onSelectChapter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!TEMPORARY_CHAPTER_SKIP_ACTIVE) return null;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-2 backdrop-blur-md transition-all cursor-pointer shadow-lg px-3 py-1.5 rounded-full text-xs font-mono font-bold border bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-400/40 hover:text-white"
        title="Temporary Chapter Skip"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
        <span className="hidden sm:inline">⚡ Skip to Ch ▾</span>
        <span className="sm:hidden">⚡ Skip ▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl text-slate-200">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              ⚡ Dev Chapter Skip
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
              BYPASS ALL
            </span>
          </div>

          <div className="py-1 space-y-1">
            {DEV_CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  executeChapterJump(ch.id, onSelectChapter);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{ch.icon}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono tracking-tight text-white group-hover:text-amber-300">
                        {ch.label}
                      </span>
                      <span
                        className="text-[9px] font-mono uppercase px-1 rounded font-bold"
                        style={{ backgroundColor: `${ch.color}25`, color: ch.color }}
                      >
                        {ch.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {ch.title}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
