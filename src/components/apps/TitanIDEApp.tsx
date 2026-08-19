/**
 * TitanIDEApp — Deterministic HR Portal Prototype Builder.
 *
 * NO LLM. NO code generation.
 * The player selects/deselects features they have discovered.
 * Building the prototype shows a simulated build log.
 * The preview renders a live HR Portal with only the selected features.
 * The prototype state feeds into the evaluation system.
 *
 * Feature visibility is controlled by GameContext.discoveredRequirements.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Check, AlertCircle, ChevronRight,
  Layers, Eye, Terminal as TerminalIcon,
  RotateCw, Shield, Database, Users, FileText,
  CreditCard, ClipboardList, Upload
} from 'lucide-react';
import { useGame, type RequirementId } from '../../context/GameContext';

// ── Feature icons ─────────────────────────────────────────────────────────────

const FEATURE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  req_login: Shield,
  req_dashboard: Layers,
  req_directory: Users,
  req_leave: FileText,
  req_attendance: ClipboardList,
  req_approval_workflow: ChevronRight,
  req_hr_dashboard: Database,
  req_rbac: Shield,
  req_document_upload: Upload,
  req_payroll: CreditCard,
  req_audit_logs: ClipboardList,
  req_bulk_import: Users,
};

// ── Build log messages ────────────────────────────────────────────────────────

function getBuildLog(features: string[]): string[] {
  const log: string[] = [
    '> Initializing Titan HR Portal project...',
    '> Configuring Next.js 14 + TypeScript workspace',
    '> Installing @titan/design-system@2.1.4',
    '> Installing @brained/auth-adapter@1.0.2',
  ];
  if (features.includes('req_login')) log.push('> Scaffolding secure employee login (OAuth2 / SSO)');
  if (features.includes('req_dashboard')) log.push('> Building Employee Dashboard component');
  if (features.includes('req_directory')) log.push('> Generating Employee Directory with search & filter');
  if (features.includes('req_leave')) log.push('> Implementing Leave Management module');
  if (features.includes('req_attendance')) log.push('> Building Attendance Tracker with clock-in/out');
  if (features.includes('req_approval_workflow')) log.push('> Creating Manager Approval Workflow engine');
  if (features.includes('req_hr_dashboard')) log.push('> Scaffolding HR Admin Dashboard + reporting');
  if (features.includes('req_rbac')) log.push('> Configuring Role-Based Access Control (Employee / Manager / HR / Admin)');
  if (features.includes('req_document_upload')) log.push('> Adding Employee Document Upload service (S3-backed)');
  if (features.includes('req_payroll')) log.push('> Integrating Payroll API adapter (dependency validation pending)');
  if (features.includes('req_audit_logs')) log.push('> Enabling Audit Logging middleware (GDPR-compliant)');
  if (features.includes('req_bulk_import')) log.push('> Building CSV Bulk Employee Import pipeline');
  log.push('> Compiling TypeScript... ✓');
  log.push('> Running ESLint... ✓');
  log.push('> Building production bundle...');
  log.push('> Bundle size: ' + (80 + features.length * 12) + 'KB (gzipped)');
  log.push('✓ Prototype build complete. Starting dev server on :3001...');
  return log;
}

// ── Prototype Preview ─────────────────────────────────────────────────────────

const PREVIEW_SCREENS: Record<RequirementId, React.FC> = {
  req_login: () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="w-16 h-16 rounded-2xl bg-sky-600/30 border border-sky-500/50 flex items-center justify-center">
        <Shield className="w-8 h-8 text-sky-400" />
      </div>
      <h2 className="text-lg font-bold text-white">Titan HR Portal</h2>
      <div className="w-full max-w-xs space-y-3">
        <input className="w-full bg-slate-700/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400" placeholder="employee@titan.com" />
        <input className="w-full bg-slate-700/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400" type="password" placeholder="Password" />
        <button className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-sm">Sign In with SSO</button>
      </div>
    </div>
  ),
  req_dashboard: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3 overflow-auto">
      <h2 className="text-sm font-bold text-white">My Dashboard</h2>
      <div className="grid grid-cols-3 gap-2">
        {['Leave Balance: 12d', 'Pending Requests: 2', 'This Month: 21 days'].map((s) => (
          <div key={s} className="bg-slate-800/80 rounded-xl p-3 text-xs text-slate-300">{s}</div>
        ))}
      </div>
      <div className="bg-slate-800/60 rounded-xl p-3">
        <p className="text-xs text-slate-400 font-semibold mb-2">Recent Activity</p>
        <div className="space-y-1.5 text-[11px] text-slate-300">
          <div className="flex justify-between"><span>Leave request #042</span><span className="text-amber-400">Pending</span></div>
          <div className="flex justify-between"><span>Payslip — July</span><span className="text-emerald-400">Available</span></div>
          <div className="flex justify-between"><span>Training — Safety</span><span className="text-sky-400">Scheduled</span></div>
        </div>
      </div>
    </div>
  ),
  req_directory: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <h2 className="text-sm font-bold text-white">Employee Directory</h2>
        <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-400">1,247 employees</span>
      </div>
      <input className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400" placeholder="Search by name, department, role…" />
      <div className="space-y-2">
        {['Priya Sharma — Plant Manager — Operations', 'Raj Kumar — Assembly Lead — Production', 'Ana Ferreira — HR Coordinator — HR'].map((e) => {
          const [name, role, dept] = e.split(' — ');
          return (
            <div key={e} className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/60">
              <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs font-bold text-indigo-300">{name[0]}</div>
              <div><p className="text-xs font-semibold text-white">{name}</p><p className="text-[10px] text-slate-400">{role} · {dept}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  ),
  req_leave: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">Leave Management</h2>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-400">Annual Leave</p><p className="text-2xl font-bold text-sky-400">12</p><p className="text-slate-500">days remaining</p></div>
        <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-400">Medical Leave</p><p className="text-2xl font-bold text-emerald-400">7</p><p className="text-slate-500">days remaining</p></div>
      </div>
      <button className="w-full py-2.5 rounded-xl bg-sky-600/80 border border-sky-500/40 text-white text-xs font-bold">+ Apply for Leave</button>
      <div className="text-[11px] text-slate-400 space-y-1.5">
        <div className="flex justify-between"><span>Leave #041 — 3d Annual</span><span className="text-amber-400">Pending Approval</span></div>
        <div className="flex justify-between"><span>Leave #038 — 1d Medical</span><span className="text-emerald-400">Approved</span></div>
      </div>
    </div>
  ),
  req_attendance: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">My Attendance</h2>
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center space-x-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-300 font-semibold">Clocked In — 09:02 AM</span>
      </div>
      <div className="grid grid-cols-5 gap-1 text-[9px] text-center text-slate-400">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
          <div key={d} className="space-y-1">
            <div className="font-bold">{d}</div>
            <div className="bg-emerald-500/20 text-emerald-400 py-1 rounded-lg">✓</div>
          </div>
        ))}
      </div>
    </div>
  ),
  req_approval_workflow: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">Team Leave Requests</h2>
      <div className="space-y-2">
        {['Priya Sharma — Annual 3d — 15 Aug', 'Raj Kumar — Medical 1d — 18 Aug'].map((r) => {
          const [name, type, date] = r.split(' — ');
          return (
            <div key={r} className="p-3 bg-slate-800/70 rounded-xl flex items-center justify-between">
              <div className="text-xs"><p className="text-white font-semibold">{name}</p><p className="text-slate-400">{type} · {date}</p></div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-emerald-600/80 text-white text-[10px] rounded-lg font-bold cursor-pointer">Approve</button>
                <button className="px-3 py-1 bg-slate-700/60 text-slate-300 text-[10px] rounded-lg font-bold cursor-pointer">Decline</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
  req_hr_dashboard: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">HR Overview</h2>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[['1,247', 'Total Employees', 'text-sky-400'], ['23', 'Pending Leave', 'text-amber-400'], ['4', 'Open Issues', 'text-red-400']].map(([v, l, c]) => (
          <div key={l} className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${c}`}>{v}</p>
            <p className="text-slate-400 text-[10px] mt-1">{l}</p>
          </div>
        ))}
      </div>
    </div>
  ),
  req_rbac: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">Access Model</h2>
      <div className="space-y-2 text-xs">
        {[
          ['Employee', ['View own records', 'Apply for leave', 'View attendance'], 'bg-sky-500/20 text-sky-400'],
          ['Manager', ['+ Team leave requests', '+ Approve / Reject leave'], 'bg-amber-500/20 text-amber-400'],
          ['HR Admin', ['+ All employees', '+ Override actions', '+ Reports'], 'bg-purple-500/20 text-purple-400'],
        ].map(([role, perms, style]) => (
          <div key={role as string} className={`p-3 rounded-xl border ${style} border-current/30`}>
            <p className="font-bold mb-1.5">{role as string}</p>
            <ul className="space-y-0.5 text-[10px] opacity-80">
              {(perms as string[]).map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  ),
  req_document_upload: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">Document Upload</h2>
      <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center space-y-3 text-slate-400">
        <Upload className="w-10 h-10 text-sky-400" />
        <p className="text-sm font-semibold text-white">Attach supporting documents</p>
        <p className="text-xs text-slate-500">Medical certificates, proof of leave reason, etc.</p>
        <button className="px-4 py-2 rounded-xl bg-sky-600/60 border border-sky-500/40 text-white text-xs font-bold cursor-pointer">Choose Files</button>
      </div>
    </div>
  ),
  req_payroll: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">Payroll Integration</h2>
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
        ⚠ Payroll API integration requires external dependency validation. Status: Pending sign-off.
      </div>
      <div className="bg-slate-800/60 rounded-xl p-3 text-xs text-slate-300 space-y-2">
        <div className="flex justify-between"><span>Current Payroll System</span><span className="text-slate-400">SAP HCM (external)</span></div>
        <div className="flex justify-between"><span>Integration Type</span><span className="text-slate-400">REST API (v3)</span></div>
        <div className="flex justify-between"><span>Status</span><span className="text-amber-400">Dependency unresolved</span></div>
      </div>
    </div>
  ),
  req_audit_logs: () => (
    <div className="h-full bg-slate-900 p-4 space-y-2">
      <h2 className="text-sm font-bold text-white">Audit Logs</h2>
      <div className="space-y-1 font-mono text-[10px] text-slate-300">
        {['2024-08-19 09:14:22 · USER:u001 · VIEWED own_leave_balance', '2024-08-19 09:12:11 · MGR:m003 · APPROVED leave#041', '2024-08-19 09:08:55 · HR:h001 · EXPORTED employee_report'].map((l) => (
          <div key={l} className="p-2 bg-slate-800/60 rounded-lg">{l}</div>
        ))}
      </div>
    </div>
  ),
  req_bulk_import: () => (
    <div className="h-full bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-bold text-white">Bulk Employee Import</h2>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center space-y-2 text-slate-400">
        <Users className="w-8 h-8 text-indigo-400" />
        <p className="text-sm font-semibold text-white">Upload Employee CSV</p>
        <p className="text-xs">Supports up to 10,000 employees per import</p>
        <button className="px-4 py-2 rounded-xl bg-indigo-600/60 border border-indigo-500/40 text-white text-xs font-bold cursor-pointer">Select CSV File</button>
      </div>
    </div>
  ),
};

// ── Main component ────────────────────────────────────────────────────────────

export const TitanIDEApp: React.FC = () => {
  const { state, togglePrototypeFeature, buildPrototype, addSignal } = useGame();
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'terminal'>('builder');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildDone, setBuildDone] = useState(state.prototypeBuilt);
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [logIdx, setLogIdx] = useState(0);
  const [activeScreen, setActiveScreen] = useState<RequirementId>('req_login');
  const logRef = useRef<HTMLDivElement>(null);

  const discoveredFeatures = state.prototypeFeatures.filter((f) => f.discovered);
  const selectedFeatures = state.prototypeFeatures.filter((f) => f.included);

  // Track IDE open as signal
  useEffect(() => {
    addSignal('delivery_management', 'Opened the prototype IDE', 5);
  }, []); // eslint-disable-line

  // Build log animation
  useEffect(() => {
    if (!isBuilding || logIdx >= buildLog.length) return;
    const timer = setTimeout(() => {
      setLogIdx((i) => i + 1);
      logRef.current?.scrollTo({ top: 99999, behavior: 'smooth' });
    }, 120);
    return () => clearTimeout(timer);
  }, [isBuilding, logIdx, buildLog]);

  // Build complete
  useEffect(() => {
    if (isBuilding && logIdx >= buildLog.length && buildLog.length > 0) {
      const timer = setTimeout(() => {
        setIsBuilding(false);
        setBuildDone(true);
        buildPrototype();
        setActiveTab('preview');
        setActiveScreen(selectedFeatures[0]?.id ?? 'req_login');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isBuilding, logIdx, buildLog, buildPrototype, selectedFeatures]);

  const handleBuild = () => {
    if (selectedFeatures.length === 0) return;
    const log = getBuildLog(selectedFeatures.map((f) => f.id));
    setBuildLog(log);
    setLogIdx(0);
    setIsBuilding(true);
    setActiveTab('terminal');
    addSignal('delivery_management', `Built prototype with ${selectedFeatures.length} features`, 12);
  };

  const PreviewScreen = PREVIEW_SCREENS[activeScreen];

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] text-white font-sans text-xs overflow-hidden">
      {/* IDE header */}
      <div className="h-9 bg-[#161b22] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-slate-400 font-mono text-[10px]">titan-hr-portal/</span>
        </div>
        <div className="flex items-center space-x-1">
          {(['builder', 'preview', 'terminal'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold capitalize transition-colors cursor-pointer ${
                activeTab === tab ? 'bg-sky-600/30 text-sky-300 border border-sky-500/30' : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab === 'builder' ? <><Layers className="w-3 h-3 inline mr-1" />Builder</>
               : tab === 'preview' ? <><Eye className="w-3 h-3 inline mr-1" />Preview {buildDone && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-1" />}</>
               : <><TerminalIcon className="w-3 h-3 inline mr-1" />Terminal</>}
            </button>
          ))}
        </div>
        <button
          onClick={handleBuild}
          disabled={isBuilding || selectedFeatures.length === 0}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
            isBuilding || selectedFeatures.length === 0
              ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isBuilding ? <RotateCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          <span>{isBuilding ? 'Building…' : 'Build Prototype'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Feature panel (always visible) */}
        <div className="w-64 border-r border-white/10 bg-[#0d1117] flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Features</p>
            <p className="text-[9px] text-slate-600">Select what to include in the prototype</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Core features */}
            <p className="text-[9px] text-slate-500 uppercase px-2 py-1 font-bold">Core Requirements</p>
            {discoveredFeatures.filter(f => !['req_document_upload','req_payroll','req_audit_logs','req_bulk_import'].includes(f.id)).map((feature) => {
              const Icon = FEATURE_ICONS[feature.id] ?? Layers;
              return (
                <button
                  key={feature.id}
                  onClick={() => togglePrototypeFeature(feature.id as RequirementId)}
                  className={`w-full flex items-center space-x-2 px-2 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    feature.included ? 'bg-sky-500/15 border border-sky-500/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${feature.included ? 'bg-sky-500/30' : 'bg-white/5'}`}>
                    {feature.included
                      ? <Check className="w-3 h-3 text-sky-400" />
                      : <Icon className="w-3 h-3 text-slate-500" />}
                  </div>
                  <span className={`text-[11px] font-semibold ${feature.included ? 'text-white' : 'text-slate-400'}`}>{feature.label}</span>
                </button>
              );
            })}

            {/* Discovered hidden features */}
            {discoveredFeatures.some(f => ['req_document_upload','req_payroll','req_audit_logs','req_bulk_import'].includes(f.id)) && (
              <>
                <p className="text-[9px] text-slate-500 uppercase px-2 py-1 font-bold mt-2">Additional Requirements</p>
                {discoveredFeatures.filter(f => ['req_document_upload','req_payroll','req_audit_logs','req_bulk_import'].includes(f.id)).map((feature) => {
                  const Icon = FEATURE_ICONS[feature.id] ?? Layers;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => togglePrototypeFeature(feature.id as RequirementId)}
                      className={`w-full flex items-center space-x-2 px-2 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        feature.included ? 'bg-purple-500/15 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${feature.included ? 'bg-purple-500/30' : 'bg-white/5'}`}>
                        {feature.included
                          ? <Check className="w-3 h-3 text-purple-400" />
                          : <Icon className="w-3 h-3 text-slate-500" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[11px] font-semibold ${feature.included ? 'text-white' : 'text-slate-400'}`}>{feature.label}</span>
                        <p className="text-[9px] text-purple-400 font-semibold">Discovered</p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* Undiscovered hint */}
            {state.prototypeFeatures.some(f => !f.discovered && !['req_document_upload','req_payroll','req_audit_logs','req_bulk_import'].some(id => id === f.id)) && (
              <div className="px-2 py-3 mt-2 border border-dashed border-white/10 rounded-xl text-center">
                <AlertCircle className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <p className="text-[9px] text-slate-600">Some requirements are still undiscovered. Communicate with stakeholders to find them.</p>
              </div>
            )}
          </div>

          {/* Selected count */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">{selectedFeatures.length} features selected</span>
              {buildDone && <span className="text-emerald-400 font-semibold flex items-center space-x-1"><Check className="w-3 h-3" /><span>Built</span></span>}
            </div>
          </div>
        </div>

        {/* Right: Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* Builder tab */}
          {activeTab === 'builder' && (
            <div className="flex-1 flex items-center justify-center p-8">
              {selectedFeatures.length === 0 ? (
                <div className="text-center space-y-3 max-w-sm">
                  <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No features selected</p>
                  <p className="text-xs text-slate-600">Select the requirements to include from the panel on the left, then click <strong className="text-white">Build Prototype</strong>.</p>
                </div>
              ) : (
                <div className="text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto">
                    <Layers className="w-8 h-8 text-sky-400" />
                  </div>
                  <p className="text-base font-bold text-white">Titan HR Portal</p>
                  <p className="text-xs text-slate-400">{selectedFeatures.length} module{selectedFeatures.length !== 1 ? 's' : ''} selected</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {selectedFeatures.map((f) => (
                      <span key={f.id} className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] font-semibold">{f.screen}</span>
                    ))}
                  </div>
                  <button
                    onClick={handleBuild}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center space-x-2 mx-auto cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Build Prototype</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Terminal tab */}
          {activeTab === 'terminal' && (
            <div className="flex-1 bg-[#0a0a12] p-4 overflow-y-auto font-mono text-[11px]" ref={logRef}>
              {buildLog.slice(0, logIdx).map((line, i) => (
                <div key={i} className={`mb-0.5 ${line.startsWith('✓') ? 'text-emerald-400 font-bold' : line.startsWith('> Error') ? 'text-red-400' : 'text-slate-300'}`}>
                  {line}
                </div>
              ))}
              {isBuilding && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="text-sky-400"
                >
                  █
                </motion.span>
              )}
            </div>
          )}

          {/* Preview tab */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex overflow-hidden">
              {!buildDone ? (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  <div className="text-center space-y-2">
                    <Eye className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-xs">Build the prototype first to preview it</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Screen navigation */}
                  <div className="w-36 border-r border-white/10 bg-[#0d1117] p-2 space-y-1 overflow-y-auto shrink-0">
                    <p className="text-[9px] text-slate-500 uppercase px-2 py-1 font-bold">Screens</p>
                    {selectedFeatures.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setActiveScreen(f.id as RequirementId)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors ${
                          activeScreen === f.id
                            ? 'bg-sky-500/20 text-sky-300 font-bold'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {f.screen}
                      </button>
                    ))}
                  </div>

                  {/* Simulated browser chrome + screen */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="h-8 bg-slate-800/60 border-b border-white/10 flex items-center px-3 space-x-2 shrink-0">
                      <div className="flex-1 bg-slate-700/50 rounded-full px-3 py-0.5 text-[10px] text-slate-400 font-mono">
                        https://titan-hr-portal.dev/{activeScreen.replace('req_', '')}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeScreen}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                          {PreviewScreen && <PreviewScreen />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
