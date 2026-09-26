import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Zap, ShieldCheck, Database, Layers,
  Plus, CheckCircle2, MessageSquare, ArrowRight,
  TrendingUp, Users, RefreshCw, Sliders, Play, Settings, Check, Lock, Cpu, Globe, Mic, Rocket, ExternalLink
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { STAKEHOLDERS } from '../../data/simulationData';
import { updateCeraState } from './cera/ceraStore';

interface Connector {
  id: string;
  name: string;
  category: 'Identity' | 'Core HR' | 'Analytics' | 'Security' | 'AI Suite' | 'Workflow';
  icon: string;
  status: 'Connected' | 'Available' | 'Pending Approval';
  impactText: string;
  trustBonus: number;
  velocityBonus: number;
  description: string;
}

const INITIAL_CONNECTORS: Connector[] = [
  {
    id: 'sso_okta',
    name: 'Okta / Azure AD Zero-Trust SSO',
    category: 'Identity',
    icon: 'Lock',
    status: 'Connected',
    impactText: '+15% InfoSec Trust & Zero Password Reset',
    trustBonus: 15,
    velocityBonus: 20,
    description: 'Enterprise single sign-on with token rotation for plant shift workers.',
  },
  {
    id: 'workday_core',
    name: 'Workday & SAP Payroll Engine',
    category: 'Core HR',
    icon: 'Database',
    status: 'Connected',
    impactText: 'Automated 1-click monthly payroll payload',
    trustBonus: 12,
    velocityBonus: 25,
    description: 'Real-time synchronization for employee roster, salaries, and tax codes.',
  },
  {
    id: 'whisper_ai',
    name: 'Whisper AI Real-time Voice & Transcription',
    category: 'AI Suite',
    icon: 'Mic',
    status: 'Connected',
    impactText: 'Live meeting subtitles & automatic transcript summarization',
    trustBonus: 18,
    velocityBonus: 30,
    description: 'OpenAI Whisper integration for prototype meetings and stakeholder speech recognition.',
  },
  {
    id: 'infosec_guard',
    name: 'InfoSec SOC2 Audit Shield',
    category: 'Security',
    icon: 'ShieldCheck',
    status: 'Connected',
    impactText: 'Full audit log trail & GDPR compliance guard',
    trustBonus: 20,
    velocityBonus: 15,
    description: 'Monitors VPC network requests and encrypts sensitive employee PII payload.',
  },
  {
    id: 'powerbi_analytics',
    name: 'Executive PowerBI Dashboard Stream',
    category: 'Analytics',
    icon: 'TrendingUp',
    status: 'Available',
    impactText: 'Real-time attrition & leave analytics feed for CTO',
    trustBonus: 10,
    velocityBonus: 10,
    description: 'Visual analytics pipelines for C-Suite steering committee reports.',
  },
  {
    id: 'servicenow_bot',
    name: 'ServiceNow Automated Ticket Handler',
    category: 'Workflow',
    icon: 'Zap',
    status: 'Available',
    impactText: '80% reduction in HR service desk response times',
    trustBonus: 14,
    velocityBonus: 18,
    description: 'Automates employee onboarding ticket routing and asset provisioning.',
  },
];

interface CustomRequirement {
  id: string;
  title: string;
  department: string;
  owner: string;
  priority: 'P0 - Critical' | 'P1 - High' | 'P2 - Medium';
  status: 'In Scope' | 'Proposed' | 'Deferred';
  stakeholderQuote: string;
}

const INITIAL_REQUIREMENTS: CustomRequirement[] = [
  {
    id: 'req_sso',
    title: 'Zero-Trust Single Sign-On & Shift Terminal Switch',
    department: 'Cyber Security',
    owner: 'Marcus Reed (CTO) & David Knox (CISO)',
    priority: 'P0 - Critical',
    status: 'In Scope',
    stakeholderQuote: '"No worker on the plant floor should be locked out by complex passwords."',
  },
  {
    id: 'req_leave_approval',
    title: '1-Click Shift Manager Leave Approvals',
    department: 'Human Resources',
    owner: 'Emma Carter (HR Lead)',
    priority: 'P0 - Critical',
    status: 'In Scope',
    stakeholderQuote: '"Shift supervisors need instant 1-click approvals on mobile terminals."',
  },
  {
    id: 'req_doc_upload',
    title: 'Supporting Document & Certificate Upload',
    department: 'Plant Operations',
    owner: 'Daniel Brooks (PM)',
    priority: 'P1 - High',
    status: 'In Scope',
    stakeholderQuote: '"Employees need to upload medical certificates directly instead of emailing attachments."',
  },
  {
    id: 'req_payroll_calc',
    title: 'August 2026 Payroll Calculation Dispatch',
    department: 'Finance & HR',
    owner: 'Missy Chen (Finance VP)',
    priority: 'P1 - High',
    status: 'In Scope',
    stakeholderQuote: '"Payload format must match SAP legacy specs strictly by Day 10."',
  },
];

export const IdeateImpactApp: React.FC = () => {
  const { state, buildPrototype, addSignal } = useGame();
  const [activeTab, setActiveTab] = useState<'canvas' | 'connectors' | 'requirements' | 'dialogues'>('canvas');
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [requirements, setRequirements] = useState<CustomRequirement[]>(INITIAL_REQUIREMENTS);
  const [selectedProject, setSelectedProject] = useState('Titan Enterprise HR Transformation');
  const [showAddReqModal, setShowAddReqModal] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqOwner, setNewReqOwner] = useState('Emma Carter');
  const [newReqPriority, setNewReqPriority] = useState<'P0 - Critical' | 'P1 - High' | 'P2 - Medium'>('P1 - High');
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuildPrototype = () => {
    setIsBuilding(true);
    buildPrototype();
    updateCeraState({
      isBuildFinished: true,
      isAiBuilding: false,
      currentStatus: 'Impact Prototype Built & Active',
      generatedFiles: [
        { id: 'f1', name: 'App.tsx', content: '// Titan HR Transformation Solution Built', language: 'typescript' },
      ],
    });
    addSignal('delivery_management', 'Launched & Built Digital Transformation Prototype in Ideate & Impact Studio', 25);
    setTimeout(() => {
      setIsBuilding(false);
    }, 1200);
  };

  const toggleConnectorStatus = (id: string) => {
    setConnectors((prev) =>
      prev.map((conn) => {
        if (conn.id === id) {
          const nextStatus = conn.status === 'Connected' ? 'Available' : 'Connected';
          if (nextStatus === 'Connected') {
            addSignal('transformation_velocity', `Added connector: ${conn.name}`, conn.velocityBonus);
          }
          return { ...conn, status: nextStatus };
        }
        return conn;
      })
    );
  };

  const toggleReqStatus = (id: string) => {
    setRequirements((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const nextStatus = req.status === 'In Scope' ? 'Deferred' : 'In Scope';
          addSignal('requirement_management', `Modified requirement '${req.title}' to ${nextStatus}`, 10);
          return { ...req, status: nextStatus };
        }
        return req;
      })
    );
  };

  const handleAddRequirement = () => {
    if (!newReqTitle.trim()) return;
    const newReq: CustomRequirement = {
      id: `req_custom_${Date.now()}`,
      title: newReqTitle,
      department: 'Digital Transformation',
      owner: newReqOwner,
      priority: newReqPriority,
      status: 'In Scope',
      stakeholderQuote: `"Added by Digital Transformer: ${newReqTitle}"`,
    };
    setRequirements((prev) => [newReq, ...prev]);
    addSignal('requirement_management', `Created project requirement: ${newReqTitle}`, 15);
    setNewReqTitle('');
    setShowAddReqModal(false);
  };

  const connectedCount = connectors.filter((c) => c.status === 'Connected').length;
  const inScopeCount = requirements.filter((r) => r.status === 'In Scope').length;

  return (
    <div className="w-full h-full bg-[#0a0c16] text-white flex flex-col font-sans select-none overflow-hidden border border-white/10 rounded-xl shadow-2xl">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#0f1222]/90 border-b border-white/10 px-5 flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-2 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Ideate & Impact Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Digital Transformer Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Architecting enterprise transformations, integrations & stakeholder requirements
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900/80 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'canvas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Impact Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'connectors' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Connectors ({connectedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'requirements' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Requirements ({inScopeCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('dialogues')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'dialogues' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Stakeholder Dialogues</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: CANVAS & PROJECT OVERVIEW */}
        {activeTab === 'canvas' && (
          <div className="space-y-6">
            {/* Project Banner Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Active Digital Transformation Blueprint</span>
                </div>
                <h1 className="text-2xl font-black text-white">{selectedProject}</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Transforming legacy HR operations into an AI-augmented, Zero-Trust digital portal with 1-click approvals & automatic payroll dispatch.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {state.prototypeBuilt ? (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Prototype Ready (http://localhost:5173)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleBuildPrototype}
                    disabled={isBuilding}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center space-x-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <Rocket className={`w-4 h-4 text-slate-950 ${isBuilding ? 'animate-spin' : 'animate-bounce'}`} />
                    <span>{isBuilding ? 'Building Solution...' : '🚀 Launch & Build Prototype'}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddReqModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Requirement</span>
                </button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/50">
                <div className="text-xs font-semibold text-slate-400">Connected Connectors</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{connectedCount} / {connectors.length}</div>
                <div className="text-[11px] text-emerald-300/80 mt-1">Zero-Trust & Whisper Active</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/50">
                <div className="text-xs font-semibold text-slate-400">Active Scope Items</div>
                <div className="text-2xl font-black text-indigo-400 mt-1">{inScopeCount} Requirements</div>
                <div className="text-[11px] text-indigo-300/80 mt-1">100% C-Suite Alignment</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/50">
                <div className="text-xs font-semibold text-slate-400">Target Velocity Gain</div>
                <div className="text-2xl font-black text-amber-400 mt-1">+94%</div>
                <div className="text-[11px] text-amber-300/80 mt-1">Onboarding time: 14d → 48h</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/50">
                <div className="text-xs font-semibold text-slate-400">Executive Trust Score</div>
                <div className="text-2xl font-black text-purple-400 mt-1">96 / 100</div>
                <div className="text-[11px] text-purple-300/80 mt-1">Ready for Day 7 Prototype</div>
              </div>
            </div>

            {/* Active Architecture Pipeline */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Enterprise Transformation Integration Pipeline</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectors.map((conn) => (
                  <div
                    key={conn.id}
                    className={`p-4 rounded-xl border transition-all ${
                      conn.status === 'Connected'
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                        : 'bg-slate-900/40 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase">{conn.category}</span>
                      <button
                        onClick={() => toggleConnectorStatus(conn.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          conn.status === 'Connected'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {conn.status}
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{conn.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{conn.description}</p>
                    <div className="mt-3 text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{conn.impactText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONNECTORS HUB */}
        {activeTab === 'connectors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise Connectors Library</h3>
                <p className="text-xs text-slate-400">Drag and toggle enterprise infrastructure integrations into Project Titan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectors.map((conn) => (
                <div key={conn.id} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {conn.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">{conn.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{conn.description}</p>
                    <div className="text-xs text-emerald-400 font-semibold pt-1">
                      Impact: {conn.impactText}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleConnectorStatus(conn.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      conn.status === 'Connected'
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {conn.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REQUIREMENTS MATRIX */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Project Scope & Requirement Matrix</h3>
                <p className="text-xs text-slate-400">Modify requirements, align stakeholder priorities, and set governance.</p>
              </div>
              <button
                onClick={() => setShowAddReqModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Requirement</span>
              </button>
            </div>

            <div className="space-y-3">
              {requirements.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.priority.startsWith('P0') ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {req.priority}
                      </span>
                      <h4 className="text-sm font-bold text-white">{req.title}</h4>
                    </div>
                    <div className="text-xs text-slate-400">
                      Owner: <span className="text-slate-200 font-semibold">{req.owner}</span> | Dept: {req.department}
                    </div>
                    <div className="text-xs italic text-slate-300 mt-1">
                      {req.stakeholderQuote}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReqStatus(req.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      req.status === 'In Scope'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-white/10'
                    }`}
                  >
                    {req.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STAKEHOLDER DIALOGUES */}
        {activeTab === 'dialogues' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Stakeholder Dialogue & Request Stream</h3>
              <p className="text-xs text-slate-400">Live requests, expectations, and quotes from executive leadership.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STAKEHOLDERS.map((stk) => (
                <div key={stk.id} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={stk.avatar} alt={stk.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                      <div>
                        <div className="text-sm font-bold text-white">{stk.name}</div>
                        <div className="text-xs text-slate-400">{stk.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{stk.trustLevel}% Trust</div>
                      <div className="text-[10px] text-amber-300">{stk.mood}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-indigo-400">Pending Request:</div>
                    <div>{stk.pendingRequest || 'Reviewing current project milestones.'}</div>
                  </div>

                  <div className="text-xs text-slate-400 italic">
                    "{stk.recentQuote}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Requirement Modal */}
      {showAddReqModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1222] border border-white/20 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Digital Transformation Requirement</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold">Requirement Title</label>
                <input
                  type="text"
                  value={newReqTitle}
                  onChange={(e) => setNewReqTitle(e.target.value)}
                  placeholder="e.g. Shared Terminal 1-Click Shift Clocking"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold">Owner / Stakeholder</label>
                <select
                  value={newReqOwner}
                  onChange={(e) => setNewReqOwner(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Emma Carter">Emma Carter (HR Lead)</option>
                  <option value="Marcus Reed">Marcus Reed (CTO)</option>
                  <option value="Daniel Brooks">Daniel Brooks (PM)</option>
                  <option value="David Knox">David Knox (CISO)</option>
                  <option value="Missy Chen">Missy Chen (Finance VP)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold">Priority Level</label>
                <select
                  value={newReqPriority}
                  onChange={(e) => setNewReqPriority(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="P0 - Critical">P0 - Critical</option>
                  <option value="P1 - High">P1 - High</option>
                  <option value="P2 - Medium">P2 - Medium</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowAddReqModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRequirement}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-indigo-500/30"
              >
                Save Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
