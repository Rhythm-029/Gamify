import React from 'react';
import { Calendar as CalendarIcon, Users, Video, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarAppProps {
  onJoinMeeting: () => void;
}

export const CalendarApp: React.FC<CalendarAppProps> = ({ onJoinMeeting }) => {
  const meetings = [
    {
      time: "09:00 AM - 09:30 AM",
      title: "Steering Committee Daily Standup",
      attendees: ["Marcus Boss (CTO)", "Elena Marshal (CHRO)", "David Knox (CISO)"],
      type: "Executive",
      urgent: true,
    },
    {
      time: "11:30 AM - 12:15 PM",
      title: "InfoSec Zero-Trust OAuth Architecture Gate",
      attendees: ["David Knox (CISO)", "Tariq Dev"],
      type: "Security",
      urgent: false,
    },
    {
      time: "02:00 PM - 03:00 PM",
      title: "Payroll Microservice API Review & MOM Signoff",
      attendees: ["Missy Chen (CFO)", "Tariq Dev"],
      type: "Engineering",
      urgent: false,
    },
  ];

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Calendar Header */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white">Executive Schedule — Week 1</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 rounded bg-white/10 text-white font-semibold hover:bg-white/20">
            Today
          </button>
          <div className="flex items-center space-x-1 text-slate-400">
            <button className="p-1 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <button className="p-1 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Main Schedule Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Next Urgent Meeting Alert Banner */}
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-600/20 to-purple-600/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Upcoming Meeting • Starts in 10 mins</div>
              <h3 className="text-base font-bold text-white">Steering Committee Daily Standup</h3>
              <p className="text-xs text-slate-300">CTO Marcus Boss & CHRO Elena Marshal waiting in Teams Lobby</p>
            </div>
          </div>

          <button
            onClick={onJoinMeeting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center space-x-2 animate-bounce"
          >
            <Video className="w-4 h-4" />
            <span>Join Teams Meeting</span>
          </button>
        </div>

        {/* Schedule List */}
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Today's Agenda</h3>
          <div className="space-y-4">
            {meetings.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
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

                <button 
                  onClick={onJoinMeeting}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  Join Call
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
