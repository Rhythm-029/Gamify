import React, { useState } from 'react';
import {
  Server, MessageSquare, FileText, ShieldCheck, Mail,
  CheckCircle2, Clock, AlertTriangle, ExternalLink, Download
} from 'lucide-react';
import type { Chapter2State } from '../../types/chapter2';
import {
  CHAPTER2_PROTOTYPES,
  EMAIL_INFRASTRUCTURE_PREREQ,
  EMAIL_UIUX_SIGNOFF,
  EMAIL_SPRINT1_GREENLIGHT
} from '../../data/chapter2Data';

interface ProjectAmigoWorkspaceAppProps {
  chapter2State: Chapter2State;
  onOpenApp?: (appId: string) => void;
}

export const ProjectAmigoWorkspaceApp: React.FC<ProjectAmigoWorkspaceAppProps> = ({
  chapter2State,
  onOpenApp,
}) => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'communication' | 'uiux' | 'sprint'>('infrastructure');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1d] text-slate-100 font-sans text-xs select-none">
      {/* Top Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span className="font-extrabold text-sm text-white">Project Amigo Workspace</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 ml-2">
            ICICI Bank HRMS · Sprint 1 Hub
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'infrastructure', label: 'Infrastructure', icon: Server },
            { id: 'communication', label: 'Communication', icon: MessageSquare },
            { id: 'uiux', label: 'UI/UX Baseline', icon: FileText },
            { id: 'sprint', label: 'Sprint 1', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#0a0f1d]">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* INFRASTRUCTURE TAB */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>Staging Environment Status</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    chapter2State.infrastructure.stagingVerified
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-300 border border-red-500/30'
                  }`}>
                    {chapter2State.infrastructure.stagingVerified ? 'VERIFIED ACTIVE' : 'PENDING ACTION'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Outbound Port 443</div>
                    <div className="font-bold text-white mt-0.5">
                      {chapter2State.infrastructure.bankITResolved ? 'Whitelisted ✓' : 'Blocked ✗'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Corporate Proxy Whitelist</div>
                    <div className="font-bold text-white mt-0.5">
                      {chapter2State.infrastructure.bankITResolved ? 'Configured ✓' : 'Not Configured ✗'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Staging LDAP Sandbox</div>
                    <div className="font-bold text-white mt-0.5">
                      {chapter2State.infrastructure.stagingVerified ? 'Access Verified ✓' : 'Unconfirmed ✗'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Staging Auth Integration</div>
                    <div className="font-bold text-white mt-0.5">
                      {chapter2State.infrastructure.stagingVerified ? 'Passed ✓' : 'Blocked ✗'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Artifact #2 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Official Email Artifact #2 — Infrastructure Prerequisites</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {chapter2State.infrastructure.requestSent ? 'Transmitted' : 'Draft'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {EMAIL_INFRASTRUCTURE_PREREQ.body}
                </div>
              </div>
            </div>
          )}

          {/* COMMUNICATION TAB */}
          {activeTab === 'communication' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Dual-Track Workspace Structure</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                      Dedicated Engineering Operations
                    </div>
                    <div className="text-white font-bold"># amigo-dev-ops</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Engineering updates, technical blockers, ticket status, integration discussions. Members: Daniel, Martha, Team, PM.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      Executive Reporting Route
                    </div>
                    <div className="text-white font-bold">Marcus Reed & Sophia Bennett</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Executive email briefings + weekly project dashboard. Prevents executive noise and preserves technical focus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UI/UX BASELINE TAB */}
          {activeTab === 'uiux' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CHAPTER2_PROTOTYPES.map((proto) => (
                  <div key={proto.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{proto.version}</span>
                      <span className="text-emerald-400 font-bold">
                        {chapter2State.uiux.approvalReceived ? 'Approved ✓' : 'In Review'}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{proto.title}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{proto.summary}</p>
                  </div>
                ))}
              </div>

              {/* Email Artifact #3 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Official Email Artifact #3 — UI/UX Formal Signoff</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {chapter2State.uiux.signoffSent ? 'Transmitted & Approved' : 'Draft'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {EMAIL_UIUX_SIGNOFF.body}
                </div>
              </div>
            </div>
          )}

          {/* SPRINT 1 TAB */}
          {activeTab === 'sprint' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Sprint 1 Readiness Checklist</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    chapter2State.sprint.greenlightIssued
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    {chapter2State.sprint.greenlightIssued ? 'GREENLIGHT ISSUED' : 'IN PROGRESS'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Gate 1: Infrastructure Prerequisites Verified</span>
                    <span className="text-emerald-400 font-bold">Passed ✓</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Gate 2: Dual-Track Communication Channel Configured</span>
                    <span className="text-emerald-400 font-bold">Passed ✓</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Gate 3: High-Fidelity UI/UX Baseline v1 Approved</span>
                    <span className="text-emerald-400 font-bold">Passed ✓</span>
                  </div>
                </div>
              </div>

              {/* Email Artifact #4 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official Email Artifact #4 — Sprint 1 Development Greenlight</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {chapter2State.sprint.greenlightIssued ? 'Sent to Engineering' : 'Pending Greenlight'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {EMAIL_SPRINT1_GREENLIGHT.body}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
