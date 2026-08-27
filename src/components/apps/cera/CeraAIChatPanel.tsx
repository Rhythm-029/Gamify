import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, Clock, Zap, 
  Bot, RefreshCw, Check, Send, CheckSquare
} from 'lucide-react';
import type { BuildTimelineStep } from './ceraSimulationData';
import type { InteractivePrompt } from './ceraStore';
import { BrainedLogoIcon } from '../../common/BrainedLogoIcon';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface CeraAIChatPanelProps {
  currentStatus: string;
  timelineSteps: BuildTimelineStep[];
  chatMessages: ChatMessage[];
  isBuilding: boolean;
  isComplete: boolean;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  onReset: () => void;
  interactivePrompt?: InteractivePrompt | null;
  onSubmitOption?: (selectedOptionId: string) => void;
}

export const CeraAIChatPanel: React.FC<CeraAIChatPanelProps> = ({
  currentStatus,
  timelineSteps,
  chatMessages,
  isBuilding,
  isComplete,
  speedMultiplier,
  setSpeedMultiplier,
  onReset,
  interactivePrompt,
  onSubmitOption,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [selectedOptId, setSelectedOptId] = React.useState<string>('');

  useEffect(() => {
    if (interactivePrompt && interactivePrompt.options && interactivePrompt.options.length > 0) {
      setSelectedOptId(interactivePrompt.selectedId || interactivePrompt.options[0]?.id || '');
    }
  }, [interactivePrompt?.stepId, interactivePrompt?.selectedId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, currentStatus, interactivePrompt]);

  return (
    <aside className="w-80 bg-[#121422] border-l border-white/10 flex flex-col h-full select-none shrink-0 font-sans z-10">
      {/* Panel Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#151728]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center p-0.5">
            <BrainedLogoIcon className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Cera AI</span>
              <span className="bg-pink-500/20 text-pink-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-pink-500/40 uppercase">
                Agent
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Autonomous Engineer</div>
          </div>
        </div>

        {/* Speed Multiplier & Reset */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              if (speedMultiplier === 1) setSpeedMultiplier(2);
              else if (speedMultiplier === 2) setSpeedMultiplier(4);
              else setSpeedMultiplier(1);
            }}
            className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-pink-300 flex items-center space-x-1 cursor-pointer transition-colors"
            title="Adjust Simulation Speed"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{speedMultiplier}x Speed</span>
          </button>
          {isComplete && (
            <button
              onClick={onReset}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
              title="Reset Simulation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live AI Status Bar */}
      <div className="px-3 py-2 bg-[#181a2e] border-b border-white/10 flex items-center space-x-2 text-xs">
        {isBuilding ? (
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin shrink-0" />
        ) : isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <Bot className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <div className="truncate font-semibold text-slate-200 text-[11px]">
          {currentStatus || 'Waiting for instructions...'}
        </div>
      </div>

      {/* Build Progress Timeline Widget */}
      <div className="p-3 border-b border-white/10 bg-[#0f111d]/70 text-xs">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
          <span>Build Timeline</span>
          <span className="text-pink-400 font-mono text-[9px]">
            {isComplete ? '100% DONE' : isBuilding ? (interactivePrompt ? 'CHOICE WAITING' : 'IN PROGRESS') : 'READY'}
          </span>
        </div>

        <div className="space-y-1.5">
          {(timelineSteps || []).map((step) => {
            if (!step) return null;
            const isDone = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';

            return (
              <div key={step.id} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isInProgress ? (
                    <Clock className="w-3.5 h-3.5 text-pink-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  )}
                  <span className={isDone ? 'text-slate-300' : isInProgress ? 'text-pink-300 font-bold' : 'text-slate-500'}>
                    {step.title}
                  </span>
                </div>

                <span className={`text-[10px] font-mono font-bold ${
                  isDone ? 'text-emerald-400' : isInProgress ? 'text-pink-400' : 'text-slate-600'
                }`}>
                  {isDone ? '✓' : isInProgress ? '⟳' : 'Waiting'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Messages Chat Log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs bg-[#0b0c16]">
        {(!chatMessages || chatMessages.length === 0) ? (
          <div className="text-center text-slate-500 text-[11px] py-8 italic font-mono">
            No agent activity logged yet.
          </div>
        ) : (
          (chatMessages || []).map((msg) => {
            if (!msg) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
              className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                msg.sender === 'ai'
                  ? 'bg-[#15182a] border-pink-500/20 text-slate-200'
                  : 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border-pink-500/40 text-white ml-4'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-bold flex items-center space-x-1">
                  {msg.sender === 'ai' ? (
                    <>
                      <Sparkles className="w-3 h-3 text-pink-400" />
                      <span className="text-pink-300">Cera AI</span>
                    </>
                  ) : (
                    <span>You</span>
                  )}
                </span>
                <span className="font-mono text-[9px]">{msg.timestamp}</span>
              </div>
              <div className="whitespace-pre-line font-sans">{msg.text}</div>
            </motion.div>
          );
        }))}

        {/* Antigravity-style Interactive Submit Option Card */}
        {interactivePrompt && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-[#1a122e] via-[#161224] to-[#0d0d1a] border-2 border-pink-500/60 rounded-2xl space-y-3 text-xs shadow-2xl ring-2 ring-pink-500/20 relative"
          >
            <div className="flex items-center space-x-2 text-pink-300 font-extrabold text-xs">
              <CheckSquare className="w-4 h-4 text-pink-400" />
              <span>{interactivePrompt.title}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {interactivePrompt.subtitle}
            </p>

            <div className="space-y-2 pt-1">
              {interactivePrompt.options.map((opt) => {
                const isSelected = selectedOptId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptId(opt.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500/20 border-pink-400 text-white font-semibold shadow-md ring-1 ring-pink-400/40'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs text-pink-200">
                      <span>{opt.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'border-pink-400 bg-pink-500 text-white' : 'border-slate-500'
                      }`}>
                        {isSelected && '✓'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-normal leading-normal">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onSubmitOption && onSubmitOption(selectedOptId)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-pink-500/30 border border-pink-400/40 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Choice & Continue</span>
            </button>
          </motion.div>
        )}

        {/* Build Completed Summary Banner */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/60 rounded-2xl space-y-3 text-xs shadow-2xl ring-2 ring-emerald-500/20"
          >
            <div className="flex items-center space-x-2 text-emerald-300 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Website Prototype Ready! 🎉</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Full-stack Enterprise HR Portal is built and running on <code className="text-pink-300 font-mono">http://localhost:5173</code>.
            </p>
            <button
              onClick={() => {
                if (onSubmitOption) onSubmitOption('open_preview');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/30 border border-emerald-300 flex items-center justify-center space-x-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span>🌐 Open Live Website (http://localhost:5173)</span>
            </button>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>
    </aside>
  );
};

