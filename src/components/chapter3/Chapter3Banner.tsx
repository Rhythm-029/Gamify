import React from 'react';
import { motion } from 'framer-motion';
import { Video, Layers, Lock } from 'lucide-react';

interface Chapter3BannerProps {
  onOpenMeeting?: () => void;
  onOpenWorkspace?: () => void;
  portalUnlocked?: boolean;
}

export const Chapter3Banner: React.FC<Chapter3BannerProps> = ({
  onOpenMeeting,
  onOpenWorkspace,
  portalUnlocked = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-sky-700/60 shadow-xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Video className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400">
                PROJECT AMIGO — THE INTEGRATION TRAP
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Chapter 3 Active
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-1.5">
              <span>Core Banking APIs · SOAP/REST Protocol Mismatch & LDAP Blocker</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenMeeting && (
            <button
              onClick={onOpenMeeting}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Video className="w-3 h-3 text-indigo-400" />
              <span>Teams Meeting</span>
            </button>
          )}

          {portalUnlocked && onOpenWorkspace && (
            <button
              onClick={onOpenWorkspace}
              className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Layers className="w-3 h-3 text-sky-400" />
              <span>Integration Triage</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
