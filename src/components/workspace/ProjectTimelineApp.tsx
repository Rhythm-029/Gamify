import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export const ProjectTimelineApp: React.FC = () => {
  const milestones = [
    { phase: "Phase 1: Foundation", startDay: 1, endDay: 3, name: "Architecture & SRS Signoff", status: "Completed", risk: "Low" },
    { phase: "Phase 2: Security Gate", startDay: 3, endDay: 5, name: "Zero-Trust OAuth & Audit", status: "In Progress", risk: "High (CISO Knox)" },
    { phase: "Phase 3: Integration", startDay: 5, endDay: 7, name: "Payroll & HR API Microservices", status: "Upcoming", risk: "Medium" },
    { phase: "Phase 4: UAT & Signoff", startDay: 7, endDay: 9, name: "Executive UAT & Go/No-Go", status: "Upcoming", risk: "Critical" },
    { phase: "Phase 5: Release", startDay: 9, endDay: 10, name: "Production Rollout & Outcome", status: "Upcoming", risk: "Low" },
  ];

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white">Gantt Milestone Roadmap & Critical Path</span>
        </div>
        <span className="text-slate-400 font-mono">Sprint Timeline: Day 1 to Day 10</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Milestone Cards Visualizer */}
        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold text-purple-400">{m.phase}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-mono">Day {m.startDay} - Day {m.endDay}</span>
                </div>
                <h3 className="text-base font-bold text-white">{m.name}</h3>
                <div className="mt-2 inline-flex items-center space-x-1.5 text-xs text-slate-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Risk Profile: <strong>{m.risk}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  m.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
