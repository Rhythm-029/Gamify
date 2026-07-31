import React from 'react';
import { Calendar as CalendarIcon, Users, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { OS_CALENDAR_EVENTS } from '../../data/brainedOSData';

export const AppleCalendarApp: React.FC = () => {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden bg-slate-950/80 text-white font-sans text-xs">
      <div className="h-10 bg-slate-900 border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-4 h-4 text-rose-400" />
          <span className="font-bold text-white">Apple Calendar — Workstation Schedule</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded bg-white/10 text-white font-semibold">Today</button>
          <div className="flex items-center space-x-1 text-slate-400">
            <button className="p-1 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <button className="p-1 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-600/15 to-purple-600/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-bold">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Upcoming Meeting • Starts in 10 mins</div>
              <h3 className="text-base font-bold text-white">Steering Committee Standup</h3>
              <p className="text-xs text-slate-300">Organized by Marcus Boss (CTO)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Today's Schedule</h3>
          {OS_CALENDAR_EVENTS.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  {m.time}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>{m.attendees.join(", ")}</span>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded bg-white/10 text-white text-xs font-semibold">
                {m.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
