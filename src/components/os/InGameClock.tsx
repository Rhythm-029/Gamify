import React, { useState, useEffect } from 'react';

export const InGameClock: React.FC = () => {
  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-[11px] font-mono select-none text-slate-200">
      <span className="opacity-80">{dateStr}</span>
      <span className="font-bold text-white">{timeStr}</span>
    </div>
  );
};
