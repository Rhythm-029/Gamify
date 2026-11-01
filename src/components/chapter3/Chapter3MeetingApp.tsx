import React from 'react';
import { MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Chapter3State } from '../../types/chapter3';

interface Chapter3MeetingAppProps {
  chapter3State: Chapter3State;
  onUpdateState: (
    updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)
  ) => void;
  onOpenPortal?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter3MeetingApp: React.FC<Chapter3MeetingAppProps> = ({
  chapter3State,
  onOpenScorecard,
}) => {
  return (
    <div className="w-full h-full bg-[#0a0d18] text-white flex flex-col items-center justify-center p-8 select-none">
      <div className="max-w-md w-full bg-[#141829] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">
          UAT Coordination Active in Messages
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Daniel and Sophia are communicating asynchronously in the Messages app. Review Daniel's five prerequisites and coordinate the UAT setup with Sophia.
        </p>

        {chapter3State.step === 'assignment_completed' && onOpenScorecard && (
          <button
            onClick={onOpenScorecard}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View Chapter 3 Scorecard</span>
          </button>
        )}
      </div>
    </div>
  );
};
