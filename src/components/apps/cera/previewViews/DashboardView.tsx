import React from 'react';
import { Users, Calendar, DollarSign, ShieldCheck, TrendingUp, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { mockEmployees, mockPayroll } from '../ceraSimulationData';

export const Dashboard: React.FC = () => {
  const scopeItems = [
    { name: 'Employee Single Sign-On (SSO)', status: 'Active', included: true },
    { name: 'Executive & Employee Dashboard', status: 'Active', included: true },
    { name: 'Employee Directory & Roster', status: 'Active', included: true },
    { name: 'Leave Management & Requests', status: 'Active', included: true },
    { name: 'Attendance Tracking & Clocking', status: 'Active', included: true },
    { name: 'Manager Approval Workflow', status: 'Active', included: true },
    { name: 'Role-Based Access Control (RBAC)', status: 'Active', included: true },
    { name: 'Payroll Integration Engine', status: 'Active', included: true },
    { name: 'Employee Document Upload', status: 'Deferred to Sprint 2', included: false },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-blue-600/30 border border-pink-500/40 p-5 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-white tracking-tight">Project Titan — Enterprise HR Portal</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-500/30 text-pink-200 border border-pink-400/40 font-bold">
              v1.0.4 Prototype
            </span>
          </div>
          <p className="text-slate-300 text-xs mt-1">Real-time headcount telemetry, leave approvals, RBAC & payroll dispatch.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-extrabold shadow-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SSO & RBAC Guard: Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl hover:border-pink-500/40 transition-colors">
          <div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Active Workforce</div>
            <div className="text-2xl font-black text-white mt-1">1,248</div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +4.2% this month
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl hover:border-amber-500/40 transition-colors">
          <div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending Leave Requests</div>
            <div className="text-2xl font-black text-amber-400 mt-1">12</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Requires HR Approval</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Calendar className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl hover:border-emerald-500/40 transition-colors">
          <div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Monthly Payroll Dispatch</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">${mockPayroll.totalGross.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1">Period: August 2026</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl hover:border-purple-500/40 transition-colors">
          <div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">System Compliance</div>
            <div className="text-2xl font-black text-purple-400 mt-1">100%</div>
            <div className="text-[11px] text-purple-300 font-bold mt-1">SOC-2 & GDPR Verified</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Feature Verification Scope Matrix */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Approved Feature Scope & Prototype Verification</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">8 / 9 Features Built (1 Deferred)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scopeItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                item.included
                  ? 'bg-slate-950/70 border-emerald-500/30 text-slate-200'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-300 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                {item.included ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                item.included ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {item.included ? '✅ ACTIVE' : '⚠️ DEFERRED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-3">Key Personnel Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase bg-slate-800/80 text-slate-400 border-b border-white/10 font-mono">
              <tr>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Salary</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{emp.id}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{emp.name}</td>
                  <td className="py-2.5 px-3">{emp.role}</td>
                  <td className="py-2.5 px-3">{emp.department}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">${emp.salary.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
