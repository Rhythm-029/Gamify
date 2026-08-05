import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { mockPayroll } from '../ceraSimulationData';

export const PayrollPage: React.FC = () => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Payroll & Compensation Engine</h1>
        <p className="text-slate-400 text-xs mt-1">Direct deposit disbursements, tax withholdings, and audit logs.</p>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Active Disbursement Cycle</div>
            <div className="text-lg font-bold text-white mt-0.5">{mockPayroll.period}</div>
          </div>
          <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dispatched</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
            <div className="text-slate-400 text-xs font-semibold">Total Gross Payroll</div>
            <div className="text-xl font-extrabold text-white mt-1">${mockPayroll.totalGross.toLocaleString()}</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
            <div className="text-slate-400 text-xs font-semibold">Statutory Tax Withholdings</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">${mockPayroll.taxDeductions.toLocaleString()}</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
            <div className="text-slate-400 text-xs font-semibold">Net Employee Dispatched</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">${mockPayroll.netPayout.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
