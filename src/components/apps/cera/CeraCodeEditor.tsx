import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Copy, Check, Sparkles, Send, Code, Terminal, Monitor, ArrowRight, Code2
} from 'lucide-react';
import { STARTER_PROMPTS, type VirtualFile } from './ceraSimulationData';

interface CeraCodeEditorProps {
  openFiles: VirtualFile[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onSubmitPrompt: (promptText: string) => void;
  isAiBuilding: boolean;
  hasInteractivePrompt?: boolean;
  onOpenPreview?: () => void;
}

export const CeraCodeEditor: React.FC<CeraCodeEditorProps> = ({
  openFiles,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onSubmitPrompt,
  isAiBuilding,
  hasInteractivePrompt,
  onOpenPreview,
}) => {
  const [promptInput, setPromptInput] = useState(STARTER_PROMPTS[0]);
  const [copied, setCopied] = useState(false);

  const safeOpenFiles = openFiles || [];
  const activeFile = safeOpenFiles.find((f) => f && f.id === activeFileId) || (safeOpenFiles.length > 0 ? safeOpenFiles[0] : undefined);

  const handleCopy = () => {
    if (activeFile && activeFile.content) {
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
      {safeOpenFiles.length > 0 && (
        <div className="flex items-center bg-[#111322] border-b border-white/10 overflow-x-auto text-xs select-none scrollbar-none shrink-0">
          {safeOpenFiles.map((file) => {
            if (!file) return null;
            const isActive = activeFile && file.id === activeFile.id;
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

      {/* WIZARD WAITING STATE — 4 questions being answered */}
      {!activeFile && hasInteractivePrompt && !isAiBuilding ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-600/30 via-purple-600/30 to-indigo-600/30 border-2 border-pink-500/40 p-4 shadow-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-pink-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">
            Feature Framing Wizard <span className="text-pink-400">Active</span>
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Please answer the 4 feature framing questions in the <strong className="text-pink-300">Cera AI Assistant panel</strong> on the right to align requirement specifications.
          </p>
          <div className="px-4 py-2 bg-pink-500/10 rounded-xl border border-pink-500/30 text-pink-300 text-xs font-mono font-bold animate-pulse">
            ➜ Complete 4 questions to launch 2.5-min background build
          </div>
        </div>
      ) : !activeFile && isAiBuilding ? (
        /* BUILDING STATE — continuous background build after 4 questions answered */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-4 rounded-full border-2 border-pink-500/20 animate-ping" />
            <div className="absolute -inset-8 rounded-full border border-purple-500/10 animate-pulse" />
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 p-5 shadow-2xl shadow-pink-500/40 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            Cera AI is <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">building your project</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
            Synthesizing enterprise codebase over 2.5 minutes (~2.5 days in-game). Build runs continuously even if Cera is minimized.
          </p>

          <div className="flex items-center space-x-2 mb-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            ))}
          </div>

          <div className="w-full max-w-md bg-[#080911] rounded-2xl border border-white/10 p-4 text-left font-mono text-[11px] text-slate-400 space-y-1.5 shadow-2xl">
            <div className="text-pink-400">$ cera build --project="Project Titan" --background</div>
            <div className="text-slate-400">Synthesizing full-stack modules...</div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <span>✓</span><span>4 Feature Framing Questions Verified</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 animate-pulse">
              <span className="text-pink-400">⟳</span><span>Generating files (2.5-min background run)...</span>
            </div>
          </div>
        </div>
      ) : !activeFile ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full overflow-y-auto">
          {/* Logo & Headline */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-4 mb-8"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-4 shadow-2xl shadow-pink-500/30 border border-white/20 flex items-center justify-center animate-pulse">
                <Code2 className="w-10 h-10 text-white drop-shadow-xl" />
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
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
                  onClick={() => {
                    setPromptInput(promptText);
                    if (!isAiBuilding) {
                      onSubmitPrompt(promptText);
                    }
                  }}
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
              {(activeFile.content || '').split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Lines */}
            <pre className="pl-4 overflow-x-auto space-y-1 w-full text-slate-200 font-mono text-[12px]">
              {(activeFile.content || '').split('\n').map((line, idx) => (
                <div key={idx} className="whitespace-pre">
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
