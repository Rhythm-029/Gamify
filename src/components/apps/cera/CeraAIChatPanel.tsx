import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, Clock, Zap, 
  Bot, RefreshCw, Check
} from 'lucide-react';
import type { BuildTimelineStep } from './ceraSimulationData';
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
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, currentStatus]);

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
            {isComplete ? '100% DONE' : isBuilding ? 'IN PROGRESS' : 'READY'}
          </span>
        </div>

        <div className="space-y-1.5">
          {timelineSteps.map((step) => {
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
        {chatMessages.length === 0 ? (
          <div className="text-center text-slate-500 text-[11px] py-8 italic font-mono">
            No agent activity logged yet.
          </div>
        ) : (
          chatMessages.map((msg) => (
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
          ))
        )}

        {/* Build Completed Summary Banner */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl space-y-2 text-xs"
          >
            <div className="flex items-center space-x-2 text-emerald-400 font-extrabold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Project Successfully Generated</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 font-mono">
              <div className="flex items-center space-x-1 text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" /> <span>Frontend</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" /> <span>Backend</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" /> <span>REST API</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" /> <span>Authentication</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" /> <span>Config Files</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" /> <span>Testing Complete</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>
    </aside>
  );
};
