import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';
import { mockLeaveRequests, type LeaveRequest } from '../ceraSimulationData';

export const LeaveManagement: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(mockLeaveRequests);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Leave & Attendance Management</h1>
          <p className="text-slate-400 text-xs mt-1">Review PTO, parental leave, and automated quota deductions.</p>
        </div>
        <button className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>New Leave Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {requests.map((req) => (
          <div key={req.id} className="bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{req.employeeName}</span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-white/10">{req.type}</span>
                </div>
                <div className="text-slate-400 text-xs mt-0.5">
                  Dates: {req.startDate} to {req.endDate} ({req.days} days)
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {req.status === 'Pending' ? (
                <>
                  <button onClick={() => handleApprove(req.id)} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approve</span>
                  </button>
                  <button onClick={() => handleReject(req.id)} className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer">
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Reject</span>
                  </button>
                </>
              ) : (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {req.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
