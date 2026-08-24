/**
 * Leaderboard — real-time top players component.
 * Fetches live from /api/game/leaderboard every 30s.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Medal, Star, Flame, TrendingUp, RefreshCw } from 'lucide-react';

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

const RANK_CONFIG: Record<number, { bg: string; border: string; icon: React.ReactNode }> = {
  1: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', icon: <Trophy className="w-3.5 h-3.5 text-amber-400" /> },
  2: { bg: 'bg-slate-400/10', border: 'border-slate-400/30', icon: <Medal className="w-3.5 h-3.5 text-slate-400" /> },
  3: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: <Medal className="w-3.5 h-3.5 text-orange-400" /> },
};

const OUTCOME_BADGE: Record<LeaderboardEntry['outcome'], { label: string; color: string }> = {
  excellent:         { label: 'Outstanding', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  strong:            { label: 'Strong',       color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
  developing:        { label: 'Developing',   color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  needs_improvement: { label: 'In Progress',  color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
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
      <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-[11px] text-slate-500">Loading leaderboard…</p>
      </div>
    );
  }

  if (error || entries.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-10 ${className}`}>
        <Star className="w-8 h-8 text-slate-700" />
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          {error ? 'Leaderboard temporarily unavailable.' : 'No completions yet — be the first!'}<br />
          <span className="text-slate-600">Complete Project Titan to appear here.</span>
        </p>
        {error && (
          <button onClick={() => fetchLeaderboard()} className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Global Leaderboard</span>
            {refreshing && <RefreshCw className="w-3 h-3 text-slate-500 animate-spin" />}
          </div>
          {lastUpdated && (
            <span className="text-[10px] text-slate-600">
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
        </div>
      )}

      {highlightedEntry && (
        <div className="mb-3 px-3 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-black text-white">
            #{highlightedEntry.rank}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">Your rank: #{highlightedEntry.rank} of {entries.length}</p>
            <p className="text-[10px] text-purple-300">Score: {highlightedEntry.score}/100</p>
          </div>
          <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
        </div>
      )}

      <div className="space-y-1.5 overflow-y-auto pr-0.5">
        {entries.map((entry) => {
          const rankStyle = RANK_CONFIG[entry.rank];
          const badge = OUTCOME_BADGE[entry.outcome];
          const isHighlighted = entry.id === highlightSessionId;

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                isHighlighted
                  ? 'bg-purple-500/20 border-purple-500/50 ring-1 ring-purple-500/30'
                  : rankStyle
                  ? `${rankStyle.bg} ${rankStyle.border}`
                  : 'bg-slate-900/50 border-white/6 hover:bg-slate-900/70'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                rankStyle ? `${rankStyle.bg} border ${rankStyle.border}` : 'bg-slate-800 border border-white/8'
              }`}>
                {rankStyle
                  ? rankStyle.icon
                  : <span className="text-[9px] font-black text-slate-500">{entry.rank}</span>
                }
              </div>

              <img
                src={entry.avatar}
                alt={entry.name}
                className="w-7 h-7 rounded-full flex-shrink-0 object-cover border border-white/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(entry.name)}&backgroundColor=8b5cf6`;
                }}
              />

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${isHighlighted ? 'text-purple-200' : 'text-white'}`}>
                  {entry.name}
                  {isHighlighted && <span className="ml-1 text-[9px] text-purple-400">(You)</span>}
                </p>
                {!compact && entry.company && (
                  <p className="text-[10px] text-slate-500 truncate">{entry.company}</p>
                )}
              </div>

              {!compact && (
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0 w-16">
                  <div className="w-full h-1 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${entry.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-white">{entry.score}<span className="text-slate-500 text-[8px]">/100</span></span>
                </div>
              )}

              <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border flex-shrink-0 hidden sm:inline ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
