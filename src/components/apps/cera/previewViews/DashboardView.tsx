import React from 'react';
import { Users, Calendar, DollarSign, ShieldCheck, TrendingUp } from 'lucide-react';
import { mockEmployees, mockPayroll } from '../ceraSimulationData';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-blue-600/20 border border-pink-500/30 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise HR Command Center</h1>
          <p className="text-slate-400 text-xs mt-1">Real-time headcount, leave approvals & payroll dispatch telemetry.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RBAC Guard: Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Total Active Employees</div>
            <div className="text-2xl font-extrabold text-white mt-1">1,248</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +4.2% this month
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Pending Leave Requests</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">12</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Requires HR Approval</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Monthly Payroll Dispatch</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">${mockPayroll.totalGross.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">Period: August 2026</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">System Compliance</div>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">100%</div>
            <div className="text-[11px] text-purple-300 font-medium mt-1">SOC-2 & GDPR Verified</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
        <h2 className="text-base font-bold text-white mb-3">Key Personnel Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase bg-slate-800/80 text-slate-400 border-b border-white/10">
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
                <tr key={emp.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{emp.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{emp.name}</td>
                  <td className="py-2.5 px-3">{emp.role}</td>
                  <td className="py-2.5 px-3">{emp.department}</td>
                  <td className="py-2.5 px-3 font-mono">${emp.salary.toLocaleString()}</td>
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
