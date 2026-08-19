import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, Play, ChevronUp, ChevronDown
} from 'lucide-react';

interface CeraTerminalProps {
  logs: string[];
  isBuildFinished: boolean;
  isDevServerRunning: boolean;
  onStartDevServer: () => void;
  onOpenPreview: () => void;
}

export const CeraTerminal: React.FC<CeraTerminalProps> = ({
  logs,
  isBuildFinished,
  isDevServerRunning,
  onStartDevServer,
  onOpenPreview,
}) => {
  const [terminalTab, setTerminalTab] = useState<'terminal' | 'output' | 'problems'>('terminal');
  const [inputVal, setInputVal] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isDevServerRunning]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = inputVal.trim();
      if (trimmed === 'npm run dev' || trimmed === 'npm dev' || trimmed === 'npm start' || trimmed === 'vite') {
        setInputVal('');
        onStartDevServer();
      } else if (trimmed) {
        setInputVal('');
      }
    }
  };

  return (
    <div className={`bg-[#0a0b12] border-t border-white/10 flex flex-col font-mono text-xs z-20 shrink-0 transition-all ${
      isMinimized ? 'h-9' : 'h-52'
    }`}>
      {/* Terminal Header */}
      <div className="h-8 px-4 bg-[#10121d] border-b border-white/10 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTerminalTab('terminal')}
            className={`flex items-center space-x-1.5 py-1 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              terminalTab === 'terminal' ? 'text-pink-400 border-pink-500' : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>TERMINAL</span>
          </button>
          <button
            onClick={() => setTerminalTab('output')}
            className={`flex items-center space-x-1.5 py-1 text-xs transition-colors cursor-pointer border-b-2 ${
              terminalTab === 'output' ? 'text-pink-400 border-pink-500' : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span>OUTPUT</span>
          </button>
          <button
            onClick={() => setTerminalTab('problems')}
            className={`flex items-center space-x-1.5 py-1 text-xs transition-colors cursor-pointer border-b-2 ${
              terminalTab === 'problems' ? 'text-pink-400 border-pink-500' : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span>PROBLEMS (0)</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 text-slate-400">
          {/* Quick Start Server button when build complete */}
          {isBuildFinished && !isDevServerRunning && (
            <button
              onClick={onStartDevServer}
              className="px-2.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>npm run dev</span>
            </button>
          )}

          {isDevServerRunning && (
            <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Vite Server Active (5173)</span>
            </span>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:text-white transition-colors cursor-pointer p-0.5"
            title={isMinimized ? 'Expand Terminal' : 'Collapse Terminal'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      {!isMinimized && (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1 leading-relaxed bg-[#07080f]">
          {/* Output Logs */}
          {logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {log.includes('http://localhost:5173') ? (
                <span>
                  {log.split('http://localhost:5173')[0]}
                  <button
                    onClick={onOpenPreview}
                    className="text-pink-400 underline font-bold hover:text-pink-300 cursor-pointer inline-flex items-center space-x-1 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/30"
                  >
                    <span>http://localhost:5173</span>
                  </button>
                  {log.split('http://localhost:5173')[1]}
                </span>
              ) : log.includes('✔') ? (
                <span className="text-emerald-400">{log}</span>
              ) : log.includes('Installing') || log.includes('npm install') ? (
                <span className="text-sky-300">{log}</span>
              ) : (
                <span>{log}</span>
              )}
            </div>
          ))}

          {/* Dev Server Output stream */}
          {isDevServerRunning && (
            <div className="space-y-1 text-emerald-300 pt-2 border-t border-white/10">
              <div className="text-slate-400">&gt; npm run dev</div>
              <div className="font-bold">Starting development server...</div>
              <div className="text-pink-400 font-bold">VITE v7.0.2  ready in 1438 ms</div>
              <div className="pt-1 flex items-center space-x-2">
                <span className="text-slate-400">➜ Local:</span>
                <button
                  onClick={onOpenPreview}
                  className="text-emerald-300 font-bold underline hover:text-white cursor-pointer bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40"
                >
                  http://localhost:5173/
                </button>
              </div>
              <div className="text-slate-400">➜ Network: use --host to expose</div>
              <div className="text-slate-500">Watching for file changes...</div>
            </div>
          )}

          {/* Interactive Command Line Input */}
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-pink-400 font-bold">cera@enterprise-hr-portal %</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isBuildFinished && !isDevServerRunning ? "Type 'npm run dev' and press Enter..." : ""}
              className="flex-1 bg-transparent text-white focus:outline-none font-mono text-[11px] placeholder-slate-600"
            />
            {/* Blinking Cursor */}
            <span className="w-2 h-4 bg-pink-400 animate-pulse shrink-0" />
          </div>

          <div ref={terminalEndRef} />
        </div>
      )}
    </div>
  );
};
