import React, { useState } from 'react';
import { 
  Globe, RotateCw, ArrowLeft, ArrowRight, Monitor, Smartphone, Tablet, 
  ShieldCheck, Sparkles, ExternalLink, CheckCircle2
} from 'lucide-react';
import { Dashboard } from './previewViews/DashboardView';
import { LeaveManagement } from './previewViews/LeaveView';
import { PayrollPage } from './previewViews/PayrollView';

interface CeraPreviewWindowProps {
  isDevServerRunning: boolean;
  onStartDevServer?: () => void;
}

export const CeraPreviewWindow: React.FC<CeraPreviewWindowProps> = ({
  isDevServerRunning,
  onStartDevServer,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leave' | 'payroll'>('dashboard');

  return (
    <div className="flex-1 flex flex-col bg-[#0d0e19] h-full overflow-hidden font-sans select-none">
      {/* Top Browser URL Bar */}
      <div className="h-11 px-4 bg-[#141626] border-b border-white/10 flex items-center justify-between text-xs select-none">
        {/* Navigation & Address */}
        <div className="flex items-center space-x-3 flex-1 max-w-xl">
          <div className="flex items-center space-x-1 text-slate-400">
            <button className="p-1 hover:text-white rounded transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-white rounded transition-colors"><ArrowRight className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-white rounded transition-colors"><RotateCw className="w-3.5 h-3.5" /></button>
          </div>

          <div className="flex-1 bg-[#0b0c16] border border-white/10 rounded-xl px-3 py-1 flex items-center space-x-2 text-slate-300 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">http://localhost:5173</span>
            <span className="ml-auto text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
              VITE 7.0.2
            </span>
          </div>
        </div>

        {/* Device Mode Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#0b0c16] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                deviceMode === 'desktop' ? 'bg-pink-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                deviceMode === 'tablet' ? 'bg-pink-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                deviceMode === 'mobile' ? 'bg-pink-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 bg-slate-950 overflow-y-auto p-4 flex justify-center items-start">
        <div className={`w-full transition-all duration-300 ${
          deviceMode === 'mobile' ? 'max-w-sm border-4 border-slate-800 rounded-3xl shadow-2xl overflow-hidden' :
          deviceMode === 'tablet' ? 'max-w-2xl border-4 border-slate-800 rounded-2xl shadow-2xl overflow-hidden' :
          'w-full'
        }`}>
          {!isDevServerRunning ? (
            /* DEV SERVER NOT RUNNING PLACEHOLDER */
            <div className="min-h-[480px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-900/80 rounded-2xl border border-white/10">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xl">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-xl font-bold text-white">Application Preview — Enterprise HR Portal</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The local development server is waiting to launch. Run <code className="text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 font-mono">npm run dev</code> in the terminal to activate live hot-reload preview.
                </p>
              </div>

              {onStartDevServer && (
                <button
                  onClick={onStartDevServer}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/25 border border-white/20 transition-all cursor-pointer hover:scale-105"
                >
                  Start Dev Server (npm run dev)
                </button>
              )}
            </div>
          ) : (
            /* LIVE GENERATED APPLICATION INTERACTIVE PREVIEW */
            <div className="bg-slate-950 text-white min-h-[550px] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
              {/* App Navbar */}
              <header className="bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold text-xs">
                    HR
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-white">Enterprise HR Portal</span>
                </div>

                {/* Subtabs */}
                <nav className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeTab === 'dashboard' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('leave')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeTab === 'leave' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Leave Management
                  </button>
                  <button
                    onClick={() => setActiveTab('payroll')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeTab === 'payroll' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Payroll Engine
                  </button>
                </nav>
              </header>

              {/* View Content */}
              <div className="p-6 flex-1 bg-slate-950">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'leave' && <LeaveManagement />}
                {activeTab === 'payroll' && <PayrollPage />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
