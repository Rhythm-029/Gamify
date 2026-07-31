import React, { useState } from 'react';

export const TerminalApp: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    "Brained OS v3.2 (x86_64-apple-darwin22.0)",
    "Workstation: Alex's MacBook Pro",
    "Type 'help' or 'status' to audit transformation services...",
    ""
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const cmd = inputVal.trim().toLowerCase();
    let response = "";

    if (cmd === 'help') {
      response = "Available commands: status, infosec, tasks, trust, clear";
    } else if (cmd === 'status') {
      response = "PROJECT TITAN STATUS: ACTIVE | Sprint 1 Day 3 | Executive Trust: 84% | Zero-Trust SOC2: Pending Gate";
    } else if (cmd === 'infosec') {
      response = "CISO David Knox Audit: OAuth Token Expiry flag raised. Vault KMS payload encryption required.";
    } else if (cmd === 'trust') {
      response = "STAKEHOLDER TRUST METRIC: Boss (78%), Marshal (88%), Knox (62%), Missy (70%), Tariq (92%)";
    } else if (cmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else {
      response = `zsh: command not found: ${cmd}. Type 'help' for available commands.`;
    }

    setLogs((prev) => [...prev, `alex@macbook ~ % ${inputVal}`, response, ""]);
    setInputVal('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 text-emerald-400 font-mono text-xs overflow-hidden select-text">
      <div className="flex-1 overflow-y-auto space-y-1">
        {logs.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="flex items-center space-x-2 pt-2 border-t border-slate-800">
        <span className="text-slate-400">alex@macbook ~ %</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent text-emerald-400 focus:outline-none"
          autoFocus
        />
      </form>
    </div>
  );
};
