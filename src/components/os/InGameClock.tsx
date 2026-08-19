/**
 * InGameClock — always-visible PROJECT DAY / time display.
 * Sits in the menu bar area of the OS desktop.
 * Reads from GameContext — always in sync with the simulation engine.
 */

import React from 'react';
import { useGame } from '../../context/GameContext';

export const InGameClock: React.FC = () => {
  const { clock } = useGame();

  const hh = String(clock.hour).padStart(2, '0');
  const mm = String(clock.minute).padStart(2, '0');

  const urgency = clock.day >= 13
    ? 'text-red-400 border-red-500/40 bg-red-500/10'
    : clock.day >= 7
    ? 'text-amber-300 border-amber-500/30 bg-amber-500/8'
    : 'text-sky-300 border-sky-500/30 bg-sky-500/8';

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border text-[10px] font-mono select-none ${urgency}`}>
      <div className="flex flex-col items-center leading-none">
        <span className="text-[8px] uppercase tracking-widest opacity-70 font-bold">Project</span>
        <span className="font-extrabold text-[11px]">Day {clock.day}</span>
      </div>
      <div className="w-px h-5 bg-current opacity-20" />
      <div className="flex flex-col items-center leading-none">
        <span className="font-extrabold text-[12px] tabular-nums">{hh}:{mm}</span>
        {clock.paused && (
          <span className="text-[7px] uppercase tracking-widest opacity-60">Paused</span>
        )}
      </div>
      {clock.day >= 14 && (
        <div className="animate-pulse text-red-400 text-[8px] font-bold uppercase tracking-wider">
          DEADLINE
        </div>
      )}
    </div>
  );
};
