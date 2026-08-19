/**
 * PostMeetingPrompt — "Would you like to document the meeting?" modal.
 * Appears 3 seconds after kickoff meeting ends.
 * No forced flow — player can dismiss it.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';

interface PostMeetingPromptProps {
  visible: boolean;
  onOpenNotes: () => void;
  onLater: () => void;
}

export const PostMeetingPrompt: React.FC<PostMeetingPromptProps> = ({
  visible, onOpenNotes, onLater,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="fixed bottom-28 right-6 z-[150] w-80 bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden"
        >
          <div className="p-4 border-b border-white/8 flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs font-bold text-white">Meeting Ended</p>
            </div>
            <button onClick={onLater} className="text-slate-500 hover:text-white cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              The conversation included several <strong className="text-amber-300">requirements and action items</strong>.
              Documenting the meeting now will help you track what was discussed.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={onOpenNotes}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
              >
                Open Notes
              </button>
              <button
                onClick={onLater}
                className="flex-1 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
