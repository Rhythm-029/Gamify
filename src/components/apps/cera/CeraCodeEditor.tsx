import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Copy, Check, Sparkles, Send, Code, Terminal, Monitor, ArrowRight
} from 'lucide-react';
import { STARTER_PROMPTS, type VirtualFile } from './ceraSimulationData';
import { BrainedLogoIcon } from '../../common/BrainedLogoIcon';

interface CeraCodeEditorProps {
  openFiles: VirtualFile[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onSubmitPrompt: (promptText: string) => void;
  isAiBuilding: boolean;
  onOpenPreview?: () => void;
}

export const CeraCodeEditor: React.FC<CeraCodeEditorProps> = ({
  openFiles,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onSubmitPrompt,
  isAiBuilding,
  onOpenPreview,
}) => {
  const [promptInput, setPromptInput] = useState(STARTER_PROMPTS[0]);
  const [copied, setCopied] = useState(false);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isAiBuilding) return;
    onSubmitPrompt(promptInput.trim());
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0c16] h-full overflow-hidden relative font-sans">
      {/* TABS BAR (When files are opened) */}
      {openFiles.length > 0 && (
        <div className="flex items-center bg-[#111322] border-b border-white/10 overflow-x-auto text-xs select-none scrollbar-none shrink-0">
          {openFiles.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <div
                key={file.id}
                onClick={() => onSelectTab(file.id)}
                className={`group flex items-center space-x-2 px-3 py-2 border-r border-white/10 cursor-pointer transition-colors whitespace-nowrap min-w-32 max-w-48 ${
                  isActive
                    ? 'bg-[#0b0c16] text-pink-300 font-semibold border-t-2 border-t-pink-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/20 text-slate-400 hover:text-white transition-opacity ml-auto"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Quick Preview Button in Tab Bar */}
          {onOpenPreview && (
            <button
              onClick={onOpenPreview}
              className="ml-auto mr-3 px-3 py-1 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          )}
        </div>
      )}

      {/* HERO / PROMPT INITIAL STATE (When no active file selected) */}
      {!activeFile ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full overflow-y-auto">
          {/* Logo & Headline */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-4 mb-8"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-3.5 shadow-2xl shadow-pink-500/30 border border-white/20 flex items-center justify-center animate-pulse">
                <BrainedLogoIcon className="w-full h-full object-contain filter drop-shadow-xl" />
              </div>
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-white/30 shadow-md">
                CERA 4.0 ULTRA
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Cera <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">AI Engineer</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Delegate enterprise development to your autonomous AI Software Engineer.
              </p>
            </div>
          </motion.div>

          {/* Prompt Form */}
          <motion.form
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="w-full bg-[#131525] border border-pink-500/30 hover:border-pink-500/50 transition-colors p-4 rounded-3xl shadow-2xl text-left space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2 font-mono text-pink-400">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">Prompt Cera IDE</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Simulated AI Engine</span>
            </div>

            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Describe what you'd like me to build..."
              disabled={isAiBuilding}
              className="w-full bg-transparent text-white text-sm focus:outline-none resize-none h-28 font-sans placeholder-slate-500"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Auto-generates full stack application architecture</span>
              </div>

              <button
                type="submit"
                disabled={isAiBuilding || !promptInput.trim()}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer ${
                  isAiBuilding || !promptInput.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-pink-500/25 border border-white/20 hover:scale-105 active:scale-95'
                }`}
              >
                {isAiBuilding ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>AI Engineering...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Application</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Starter Prompts */}
          <div className="w-full mt-6 space-y-2">
            <div className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sample Enterprise Requirements
            </div>
            <div className="grid grid-cols-1 gap-2 text-left">
              {STARTER_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptInput(promptText)}
                  disabled={isAiBuilding}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 rounded-2xl text-xs text-slate-300 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-4">{promptText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE FILE EDITOR VIEW */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File Header Breadcrumb */}
          <div className="px-4 py-2 bg-[#111322] border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2 font-mono">
              <span className="text-slate-500">enterprise-hr-portal</span>
              <span>/</span>
              <span className="text-pink-400 font-semibold">{activeFile.path}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/15 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-[#080911] leading-relaxed flex">
            {/* Line Numbers */}
            <div className="select-none text-slate-600 text-right pr-4 border-r border-white/10 space-y-1 font-mono text-[11px]">
              {activeFile.content.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Lines */}
            <pre className="pl-4 overflow-x-auto space-y-1 w-full text-slate-200 font-mono text-[12px]">
              {activeFile.content.split('\n').map((line, idx) => {
                // Simple highlight syntax simulation
                let highlightedLine: React.ReactNode = line;
                if (line.includes('import ') || line.includes('export ') || line.includes('function ') || line.includes('const ')) {
                  highlightedLine = (
                    <span>
                      {line.replace(/(import|export|function|const|let|var|return|if|from)/g, '🔑 $1')}
                    </span>
                  );
                }
                return (
                  <div key={idx} className="whitespace-pre">
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
