import React, { useState, useEffect } from 'react';
import { Flame, Calendar, CloudSun, Clock, MapPin } from 'lucide-react';
import { INITIAL_OS_STATE, OS_CALENDAR_EVENTS } from '../../data/brainedOSData';

interface DesktopWidgetsProps {
  osState: typeof INITIAL_OS_STATE;
  onOpenApp: (appId: string) => void;
}

export const DesktopWidgets: React.FC<DesktopWidgetsProps> = ({ osState, onOpenApp }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="absolute top-16 left-6 right-6 z-10 flex flex-col md:flex-row justify-between items-start pointer-events-none select-none">
      {/* TOP-LEFT: PROMINENT MACOS CLOCK & WORKSTATION WIDGET */}
      <div className="glass-panel p-5 rounded-3xl border border-white/20 bg-slate-900/50 backdrop-blur-2xl shadow-2xl pointer-events-auto max-w-sm w-full mb-4 md:mb-0">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>BRAINED WORKSTATION</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>HQ Online</span>
          </div>
        </div>

        {/* Big Time readout */}
        <div className="text-4xl font-extrabold text-white font-mono tracking-tight drop-shadow-md flex items-baseline space-x-3">
          <span>{timeStr}</span>
        </div>
        <div className="text-sm font-semibold text-sky-300 mt-1">
          {dateStr}
        </div>

        {/* Status Sub-row */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center space-x-2">
            <CloudSun className="w-5 h-5 text-amber-400" />
            <span className="font-bold">Transformation Studio</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            System Ready
          </span>
        </div>
      </div>

      {/* TOP-RIGHT: STREAK & PROJECT WIDGETS */}
      <div className="flex flex-col space-y-3 max-w-xs w-full pointer-events-auto">
        {/* WIDGET 1: TRANSFORMATION STREAK & XP WIDGET */}
        <div 
          onClick={() => onOpenApp('dashboard')}
          className="glass-panel p-4 rounded-2xl border border-orange-500/40 bg-slate-900/60 hover:bg-slate-900/80 cursor-pointer hover:border-orange-500/70 transition-all shadow-xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-orange-400 tracking-wider">Transformation Streak</span>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{osState.streakDays} Days Active</div>
          <div className="text-xs text-slate-300 mt-1 flex justify-between">
            <span>XP: <strong className="text-blue-400">{osState.xp}</strong></span>
            <span>Trust: <strong className="text-emerald-400">{osState.trustScore}%</strong></span>
          </div>
        </div>

        {/* WIDGET 2: CHAPTER & CALENDAR OVERVIEW */}
        <div 
          onClick={() => onOpenApp('calendar')}
          className="glass-panel p-4 rounded-2xl border border-blue-500/30 bg-slate-900/60 hover:bg-slate-900/80 cursor-pointer hover:border-blue-500/60 transition-all shadow-xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold text-blue-400 tracking-wider">Workspace Calendar</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-2 text-xs">
            {OS_CALENDAR_EVENTS.slice(0, 1).map((evt) => (
              <div key={evt.id} className="p-2 rounded-xl bg-slate-800/80 border border-white/10">
                <div className="text-[10px] font-mono text-purple-300">{evt.time}</div>
                <div className="font-bold text-white truncate">{evt.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
