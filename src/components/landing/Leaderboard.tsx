/**
 * Leaderboard — real-time top players component with ultra-premium UI.
 * Features a Top 3 Podium spotlight, metallic rank badges, and live updates.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Medal, Star, Flame, RefreshCw, ShieldCheck, Sparkles, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  outcome: 'excellent' | 'strong' | 'developing' | 'needs_improvement';
  score: number;
  completedAt: string;
  company?: string;
  requirementsDiscovered: number;
  totalRequirements: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const OUTCOME_BADGE: Record<LeaderboardEntry['outcome'], { label: string; color: string; border: string; bg: string }> = {
  excellent: { label: 'Outstanding', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  strong: { label: 'Strong', color: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/10' },
  developing: { label: 'Developing', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
  needs_improvement: { label: 'In Progress', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
};

interface LeaderboardProps {
  highlightSessionId?: string;
  compact?: boolean;
  limit?: number;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  highlightSessionId,
  compact = false,
  limit = 15,
  className = '',
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE}/api/game/leaderboard`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setEntries(data.leaderboard.slice(0, limit));
        setLastUpdated(new Date());
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(() => fetchLeaderboard(true), 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const highlightedEntry = entries.find((e) => e.id === highlightSessionId);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-slate-400 tracking-wider">FETCHING GLOBAL CONSULTANT RANKINGS…</p>
      </div>
    );
  }

  if (error || entries.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Star className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-xs text-slate-400 text-center leading-relaxed font-medium">
          {error ? 'Leaderboard service synchronizing…' : 'No completed evaluations yet.'}<br />
          <span className="text-slate-500 text-[11px]">Complete Project Titan to claim your rank.</span>
        </p>
        {error && (
          <button
            onClick={() => fetchLeaderboard()}
            className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-xs border border-amber-500/40 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(compact ? 0 : 3);

  return (
    <div className={`flex flex-col select-none ${className}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white tracking-wide">Global Transformation Leaderboard</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  LIVE Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Verified scores from Brained Digital Transformation engagements</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {refreshing && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            {lastUpdated && (
              <span className="text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                Updated {timeAgo(lastUpdated.toISOString())}
              </span>
            )}
          </div>
        </div>
      )}

      {/* TOP 3 PODIUM SPOTLIGHT (Shown when not compact) */}
      {!compact && top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6 items-end">
          {/* 2ND PLACE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-4 rounded-2xl border border-slate-400/30 bg-gradient-to-b from-slate-800/40 via-slate-900/60 to-slate-950 flex flex-col items-center text-center relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-400/20 border border-slate-400/30 font-black text-[10px] text-slate-300">
              #2 SILVER
            </div>
            <div className="relative mb-2 mt-2">
              <img
                src={top3[1].avatar}
                alt={top3[1].name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-300 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(top3[1].name)}`;
                }}
              />
              <Medal className="w-5 h-5 text-slate-300 absolute -bottom-1 -right-1 drop-shadow-md" />
            </div>
            <span className="font-bold text-xs text-white truncate max-w-full">{top3[1].name}</span>
            <span className="text-[10px] text-slate-400 truncate max-w-full mb-2">{top3[1].company || 'Consultant'}</span>
            <div className="w-full bg-slate-400/10 border border-slate-400/20 py-1.5 rounded-xl font-mono font-black text-sm text-slate-200">
              {top3[1].score} <span className="text-[9px] text-slate-400 font-normal">/100</span>
            </div>
          </motion.div>

          {/* 1ST PLACE GOLD (ELEVATED CENTER) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="glass-panel p-5 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-slate-950 flex flex-col items-center text-center relative overflow-hidden shadow-2xl shadow-amber-500/20 -translate-y-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />
            <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-amber-500/30 border border-amber-400/50 font-black text-[10px] text-amber-300 flex items-center space-x-1">
              <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>#1 CHAMPION</span>
            </div>
            <div className="relative mb-2 mt-3">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse opacity-75 blur-xs" />
              <img
                src={top3[0].avatar}
                alt={top3[0].name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-300 shadow-xl relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(top3[0].name)}`;
                }}
              />
              <Trophy className="w-6 h-6 text-amber-300 absolute -bottom-1 -right-1 drop-shadow-lg z-20" />
            </div>
            <span className="font-extrabold text-sm text-white truncate max-w-full">{top3[0].name}</span>
            <span className="text-[10px] text-amber-300/80 truncate max-w-full mb-3">{top3[0].company || 'Senior Director'}</span>
            <div className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 py-2 rounded-xl font-mono font-black text-base text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-1">
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{top3[0].score}</span>
              <span className="text-[10px] text-slate-900 font-bold">/100</span>
            </div>
          </motion.div>

          {/* 3RD PLACE BRONZE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-4 rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-950/20 via-slate-900/60 to-slate-950 flex flex-col items-center text-center relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/30 font-black text-[10px] text-orange-300">
              #3 BRONZE
            </div>
            <div className="relative mb-2 mt-2">
              <img
                src={top3[2].avatar}
                alt={top3[2].name}
                className="w-14 h-14 rounded-full object-cover border-2 border-orange-400 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(top3[2].name)}`;
                }}
              />
              <Medal className="w-5 h-5 text-orange-400 absolute -bottom-1 -right-1 drop-shadow-md" />
            </div>
            <span className="font-bold text-xs text-white truncate max-w-full">{top3[2].name}</span>
            <span className="text-[10px] text-slate-400 truncate max-w-full mb-2">{top3[2].company || 'Consultant'}</span>
            <div className="w-full bg-orange-500/10 border border-orange-500/20 py-1.5 rounded-xl font-mono font-black text-sm text-orange-200">
              {top3[2].score} <span className="text-[9px] text-slate-400 font-normal">/100</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* HIGHLIGHTED PLAYER CARD (If current session is present) */}
      {highlightedEntry && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border-2 border-purple-500/60 shadow-2xl flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-lg border border-purple-400/50">
              #{highlightedEntry.rank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">{highlightedEntry.name}</span>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/30 px-2 py-0.5 rounded-md border border-purple-400/40">YOU</span>
              </div>
              <p className="text-[11px] text-purple-200/80">Ranked #{highlightedEntry.rank} globally across all active sessions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 z-10">
            <div className="text-right">
              <span className="font-mono font-black text-xl text-amber-300">{highlightedEntry.score}</span>
              <span className="text-[10px] text-slate-400 block font-mono">SCORE</span>
            </div>
            <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
          </div>
        </div>
      )}

      {/* LIST OF RANKINGS */}
      <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
        {remaining.map((entry) => {
          const badge = OUTCOME_BADGE[entry.outcome];
          const isHighlighted = entry.id === highlightSessionId;

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                isHighlighted
                  ? 'bg-purple-900/40 border-purple-500/60 shadow-lg'
                  : entry.rank <= 3
                  ? 'bg-slate-900/80 border-amber-500/30'
                  : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                    entry.rank === 1
                      ? 'bg-amber-500 text-slate-950'
                      : entry.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : entry.rank === 3
                      ? 'bg-orange-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-white/10'
                  }`}
                >
                  {entry.rank}
                </div>

                <img
                  src={entry.avatar}
                  alt={entry.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(entry.name)}`;
                  }}
                />

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white truncate">{entry.name}</span>
                    {isHighlighted && (
                      <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-400/30">You</span>
                    )}
                  </div>
                  {entry.company && (
                    <span className="text-[10px] text-slate-400 truncate block">{entry.company}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border hidden sm:inline-block ${badge.bg} ${badge.color} ${badge.border}`}>
                  {badge.label}
                </span>

                <div className="flex items-center space-x-2 text-right">
                  <div className="w-16 h-1.5 rounded-full bg-slate-800 hidden md:block overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                      style={{ width: `${entry.score}%` }}
                    />
                  </div>
                  <span className="font-mono font-black text-sm text-white w-9 text-right">{entry.score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
