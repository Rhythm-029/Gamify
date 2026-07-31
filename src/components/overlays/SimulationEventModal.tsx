import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, ArrowRight } from 'lucide-react';
import { SIMULATION_EVENTS } from '../../data/simulationData';

interface SimulationEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDecision: (trustDelta: number, xpDelta: number) => void;
}

export const SimulationEventModal: React.FC<SimulationEventModalProps> = ({
  isOpen,
  onClose,
  onApplyDecision,
}) => {
  const [eventIndex, setEventIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentEvent = SIMULATION_EVENTS[eventIndex % SIMULATION_EVENTS.length];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleConfirmDecision = () => {
    if (selectedOption === null) return;
    const option = currentEvent.options[selectedOption];
    onApplyDecision(option.trustDelta, option.xpDelta);
    alert(`Decision Applied!\n\nOutcome: ${option.consequence}\nTrust Change: ${option.trustDelta > 0 ? '+' : ''}${option.trustDelta}%\nXP Gained: +${option.xpDelta} XP`);
    setSelectedOption(null);
    setEventIndex((prev) => prev + 1);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl glass-panel rounded-3xl p-6 border border-red-500/40 shadow-2xl relative bg-slate-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center space-x-2 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-wider">Corporate Crisis Event Triggered</span>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Event Content */}
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-bold text-white leading-tight">{currentEvent.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-white/5">
              {currentEvent.description}
            </p>
            <div className="text-xs font-mono text-amber-300 font-bold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              {currentEvent.impactText}
            </div>
          </div>

          {/* Decision Options */}
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Strategic Action:</h4>
            {currentEvent.options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOption === idx
                    ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-slate-900/60 border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-bold text-white">{opt.label}</h5>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className={`font-bold ${opt.trustDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {opt.trustDelta >= 0 ? `+${opt.trustDelta}` : opt.trustDelta}% Trust
                    </span>
                    <span className="text-blue-400 font-bold">+{opt.xpDelta} XP</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{opt.description}</p>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-3 border-t border-white/10">
            <button
              disabled={selectedOption === null}
              onClick={handleConfirmDecision}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                selectedOption !== null
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Execute Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
