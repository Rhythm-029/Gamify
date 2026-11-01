import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Wrench } from 'lucide-react';
import { INCIDENT_ID, INCIDENT_SEVERITY } from '../../data/chapter7Data';

interface Chapter7BannerProps {
  onOpenMeeting?: () => void;
  onOpenStudio?: () => void;
  studioUnlocked?: boolean;
}

export const Chapter7Banner: React.FC<Chapter7BannerProps> = ({
  onOpenMeeting,
  onOpenStudio,
  studioUnlocked = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#140e1b]/95 backdrop-blur-md border border-rose-500/50 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-inner">
            <AlertCircle className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                PROD INCIDENT #{INCIDENT_ID} — ATTENDANCE SYNC 504 TIMEOUTS
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                &lt;{INCIDENT_SEVERITY}&gt;
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-2">
              <span>12 Branch Officers Affected · Memory Leak & RCA Studio</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenMeeting && (
            <button
              onClick={onOpenMeeting}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Clock className="w-3 h-3 text-rose-400" />
              <span>Incident Call</span>
            </button>
          )}

          {studioUnlocked && onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 border border-rose-400/50 text-white font-extrabold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.35)]"
            >
              <Wrench className="w-3.5 h-3.5 text-rose-200" />
              <span>Incident Response Studio</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
