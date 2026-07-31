import React from 'react';
import { 
  Flame, Award, CheckCircle2, AlertTriangle, Mail, ArrowRight, Clock, Users
} from 'lucide-react';
import { INITIAL_PLAYER_STATE, STAKEHOLDERS, TASKS, EMAILS } from '../../data/simulationData';

interface DashboardHomeProps {
  playerState: typeof INITIAL_PLAYER_STATE;
  onSelectApp: (appId: string) => void;
  onOpenEventModal: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  playerState,
  onSelectApp,
  onOpenEventModal,
}) => {
  const missionTimeline = [
    { day: "Day 1", title: "Kickoff Mandate", done: true },
    { day: "Day 2", title: "Requirements & SRS", done: true },
    { day: "Day 3", title: "Planning & Architecture", current: true },
    { day: "Day 4", title: "InfoSec Audit", done: false },
    { day: "Day 5", title: "Security Gate", done: false },
    { day: "Day 6", title: "Change Requests", done: false },
    { day: "Day 7", title: "UAT Testing", done: false },
    { day: "Day 8", title: "Staging Deployment", done: false },
    { day: "Day 9", title: "Go / No-Go", done: false },
    { day: "Day 10", title: "90 Days Outcome", done: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-6">
      {/* HERO COMMAND CENTER BANNER */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Mandate Active: Enterprise HR Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back, {playerState.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            You are leading the 6-week digital transformation. Align C-Suite stakeholders, pass InfoSec gates, and maintain your streak.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 relative z-10 shrink-0">
          <button 
            onClick={onOpenEventModal}
            className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Simulate Crisis</span>
          </button>
          <button 
            onClick={() => onSelectApp('tasks')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center space-x-2"
          >
            <span>Open Kanban Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DUOLINGO STREAK & PROGRESS METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Flame Streak Card */}
        <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Daily Streak</span>
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-bounce" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{playerState.streakDays} Days</div>
          <p className="text-[11px] text-slate-400 mt-1">Consistency Meter: <span className="text-orange-400 font-bold">{playerState.consistencyMeter}%</span></p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full w-[92%]" />
          </div>
        </div>

        {/* Transformation XP Card */}
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Transformation XP</span>
            <Award className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{playerState.transformationXP} XP</div>
          <p className="text-[11px] text-slate-400 mt-1">Rank: <span className="text-blue-300 font-bold">{playerState.rank}</span></p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full w-[78%]" />
          </div>
        </div>

        {/* Stakeholder Trust Meter */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Executive Trust</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{playerState.trustScore}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Status: <span className="text-emerald-300 font-bold">Highly Trusted</span></p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[84%]" />
          </div>
        </div>

        {/* Attendance Score */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Attendance & ROI</span>
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{playerState.attendanceScore}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Eligibility: <span className="text-purple-300 font-bold">100% Certified</span></p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-full rounded-full w-[98%]" />
          </div>
        </div>
      </div>

      {/* HORIZONTAL MISSION TIMELINE */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-white">10-Day Simulation Sprint Journey</h3>
            <p className="text-xs text-slate-400">Track your progress from kickoff to executive signoff.</p>
          </div>
          <button 
            onClick={() => onSelectApp('timeline')}
            className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Full Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {missionTimeline.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                item.current
                  ? 'bg-blue-600/30 border-blue-500 text-white ring-2 ring-blue-500/50 shadow-lg'
                  : item.done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900/40 border-white/5 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase">{item.day}</div>
              <div className="text-xs font-semibold mt-1 truncate">{item.title}</div>
              <div className="mt-2 flex justify-center">
                {item.done && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {item.current && <span className="w-3 h-3 rounded-full bg-blue-400 animate-ping inline-block" />}
                {!item.done && !item.current && <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stakeholder Moods & Unread Inbox */}
        <div className="space-y-6">
          {/* Stakeholders Quick Status */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Executive Council</span>
              </h3>
              <button 
                onClick={() => onSelectApp('stakeholders')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {STAKEHOLDERS.slice(0, 3).map((stk) => (
                <div key={stk.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex items-center space-x-3">
                    <img src={stk.avatar} alt={stk.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-white">{stk.name}</div>
                      <div className="text-[10px] text-slate-400">{stk.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">{stk.trustLevel}%</div>
                    <div className="text-[9px] text-amber-300">{stk.mood}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Priority Tasks & Inbox */}
        <div className="md:col-span-2 space-y-6">
          {/* Priority Tasks */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Today's Action Items</span>
              </h3>
              <button 
                onClick={() => onSelectApp('tasks')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Open Kanban
              </button>
            </div>

            <div className="space-y-3">
              {TASKS.slice(0, 3).map((task) => (
                <div key={task.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${
                      task.priority === 'Critical' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <div className="text-xs font-semibold text-white">{task.title}</div>
                      <div className="text-[10px] text-slate-400">{task.description}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    task.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Unread Inbox Snapshot */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Outlook Priority Inbox</span>
              </h3>
              <button 
                onClick={() => onSelectApp('inbox')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Go to Inbox
              </button>
            </div>

            <div className="space-y-3">
              {EMAILS.map((email) => (
                <div 
                  key={email.id}
                  onClick={() => onSelectApp('inbox')}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img src={email.senderAvatar} alt={email.sender} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-white">{email.subject}</div>
                      <div className="text-[10px] text-slate-400">{email.sender} • {email.timestamp}</div>
                    </div>
                  </div>
                  {email.priority === 'High' && (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">High</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
