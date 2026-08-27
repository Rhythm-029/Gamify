import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, AlertCircle, X, ArrowRight } from 'lucide-react';

interface CeraBottomNotificationProps {
  visible: boolean;
  /** The title of the trigger step that needs input */
  inputTitle: string;
  onOpenCera: () => void;
  onDismiss: () => void;
}

export const CeraBottomNotification: React.FC<CeraBottomNotificationProps> = ({
  visible,
  inputTitle,
  onOpenCera,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -120, opacity: 0, scale: 0.92 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -120, opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed bottom-24 left-5 z-[120] w-80 backdrop-blur-2xl rounded-2xl shadow-2xl pointer-events-auto border border-pink-500/70 bg-slate-950/95 ring-2 ring-pink-500/25 overflow-hidden"
        >
          {/* Subtle gradient shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/8 via-purple-500/8 to-transparent pointer-events-none" />

          <div className="relative z-10 p-4">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-orange-500 border border-pink-400/60 flex items-center justify-center shadow-lg shrink-0">
                  <AlertCircle className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <span className="font-extrabold text-xs text-white">Cera AI</span>
                    <span className="px-1.5 py-px rounded text-[9px] font-mono font-extrabold bg-pink-500/30 text-pink-200 border border-pink-400/50 uppercase tracking-wide">
                      Input Needed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug font-medium">
                    {inputTitle || 'Cera needs your input to continue'}
                  </p>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CTA Button */}
            <button
              onClick={onOpenCera}
              className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 border border-pink-400/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <Code2 className="w-3.5 h-3.5 text-pink-200" />
                <span>Open Cera & Submit</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-pink-200 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Persistent orange pulse bar at bottom — stays until dismissed */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-orange-400 to-pink-500">
            <motion.div
              className="h-full w-1/3 bg-white/50"
              animate={{ x: ['0%', '200%', '0%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
