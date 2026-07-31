import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, X, Maximize2, Minimize2 } from 'lucide-react';

interface BrainedWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  isFocused: boolean;
  onClose: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

export const BrainedWindow: React.FC<BrainedWindowProps> = ({
  title,
  icon,
  isOpen,
  isFocused,
  onClose,
  onFocus,
  children,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 15 }}
      transition={{ type: "spring", damping: 25, stiffness: 320 }}
      onClick={onFocus}
      className={`absolute transition-all duration-200 apple-glass rounded-2xl border flex flex-col overflow-hidden apple-window-shadow ${
        isMaximized 
          ? 'inset-3 z-40 rounded-xl' 
          : 'top-12 bottom-20 left-4 right-4 md:left-16 md:right-16 lg:left-24 lg:right-24 z-30'
      } ${
        isFocused 
          ? 'border-white/20 ring-1 ring-white/15 shadow-2xl' 
          : 'border-white/10 opacity-95'
      }`}
    >
      {/* WINDOW TITLE BAR */}
      <div 
        className="h-10 bg-[#1E1E24]/90 backdrop-blur-2xl border-b border-white/10 px-4 flex items-center justify-between select-none shrink-0"
      >
        {/* Authentic Apple Traffic Lights */}
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] hover:bg-[#E0443E] flex items-center justify-center text-slate-950 group transition-all cursor-pointer shadow-inner"
            title="Close"
          >
            <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 font-extrabold text-black" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] hover:bg-[#DEA123] flex items-center justify-center text-slate-950 group transition-all cursor-pointer shadow-inner"
            title="Minimize"
          >
            <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 font-extrabold text-black" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
            className="w-3.5 h-3.5 rounded-full bg-[#27C93F] hover:bg-[#1AAB29] flex items-center justify-center text-slate-950 group transition-all cursor-pointer shadow-inner"
            title="Maximize"
          >
            {isMaximized ? (
              <Minimize2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 font-extrabold text-black" />
            ) : (
              <Maximize2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 font-extrabold text-black" />
            )}
          </button>
        </div>

        {/* Center: Title & App Icon */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-white/90 truncate max-w-md">
          {icon}
          <span className="truncate tracking-tight">{title}</span>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Active App</span>
        </div>
      </div>

      {/* WINDOW BODY CANVAS */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#1C1C1E]/95 backdrop-blur-3xl">
        {children}
      </div>
    </motion.div>
  );
};
