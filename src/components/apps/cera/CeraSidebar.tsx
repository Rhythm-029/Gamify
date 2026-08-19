import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronDown, Folder, FileCode, FileText, 
  FileJson, Sparkles, Plus, RefreshCw, Layers
} from 'lucide-react';
import type { VirtualFile } from './ceraSimulationData';

interface CeraSidebarProps {
  activeTab: string;
  projectName: string | null;
  generatedFiles: VirtualFile[];
  activeFileId: string | null;
  onSelectFile: (file: VirtualFile) => void;
  isAiBuilding: boolean;
  onNewPromptClick?: () => void;
}

export const CeraSidebar: React.FC<CeraSidebarProps> = ({
  activeTab: _activeTab,
  projectName,
  generatedFiles,
  activeFileId,
  onSelectFile,
  isAiBuilding,
  onNewPromptClick,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/pages': true,
    'src/components': true,
    'src/services': true,
    'src/contexts': true,
    'server': true,
  });

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    if (fileName.endsWith('.md')) return <FileText className="w-4 h-4 text-sky-400 shrink-0" />;
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    if (fileName.endsWith('.css')) return <FileCode className="w-4 h-4 text-pink-400 shrink-0" />;
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  // Group files into folder tree
  const rootFiles = generatedFiles.filter((f) => !f.path.includes('/'));
  const srcFiles = generatedFiles.filter((f) => f.path.startsWith('src/') && f.path.split('/').length === 2);
  const pagesFiles = generatedFiles.filter((f) => f.path.startsWith('src/pages/'));
  const contextsFiles = generatedFiles.filter((f) => f.path.startsWith('src/contexts/'));
  const servicesFiles = generatedFiles.filter((f) => f.path.startsWith('src/services/'));
  const serverFiles = generatedFiles.filter((f) => f.path.startsWith('server/'));

  return (
    <aside className="w-64 bg-[#141624] border-r border-white/10 flex flex-col h-full select-none shrink-0 font-sans">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Explorer</span>
        </div>
        <div className="flex items-center space-x-1">
          {onNewPromptClick && (
            <button
              onClick={onNewPromptClick}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="New Project Prompt"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          {isAiBuilding && (
            <RefreshCw className="w-3.5 h-3.5 text-pink-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2 text-xs text-slate-300">
        {/* BEFORE PROMPT STATE */}
        {!projectName && generatedFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-white text-xs tracking-wider">CERA IDE</div>
              <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
                No project loaded.
              </div>
              <div className="text-[11px] text-slate-500 italic mt-2">
                Describe what you&apos;d like me to build...
              </div>
            </div>
          </div>
        ) : (
          /* AFTER PROMPT / DYNAMIC EXPLORER TREE */
          <div className="space-y-1">
            {/* Project Root Folder */}
            <div className="flex items-center space-x-1 py-1 px-1 text-white font-bold text-xs uppercase tracking-wider">
              <Folder className="w-4 h-4 text-pink-400 fill-pink-400/20" />
              <span>{projectName || 'Project Titan'}</span>
            </div>

            {/* Folder: src */}
            {(srcFiles.length > 0 || pagesFiles.length > 0 || servicesFiles.length > 0 || contextsFiles.length > 0) && (
              <div className="pl-2">
                <button
                  onClick={() => toggleFolder('src')}
                  className="w-full flex items-center space-x-1.5 py-1 px-1.5 rounded hover:bg-white/5 text-slate-200 cursor-pointer"
                >
                  {expandedFolders['src'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  <Folder className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                  <span className="font-semibold">src</span>
                </button>

                <AnimatePresence>
                  {expandedFolders['src'] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-0.5 border-l border-white/10 ml-3 my-0.5"
                    >
                      {/* Subfolder: pages */}
                      {pagesFiles.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleFolder('src/pages')}
                            className="w-full flex items-center space-x-1.5 py-1 px-1.5 rounded hover:bg-white/5 text-slate-300 cursor-pointer"
                          >
                            {expandedFolders['src/pages'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            <Folder className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                            <span>pages</span>
                          </button>
                          {expandedFolders['src/pages'] && (
                            <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                              {pagesFiles.map((file) => (
                                <motion.div
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={file.id}
                                  onClick={() => onSelectFile(file)}
                                  className={`flex items-center space-x-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors ${
                                    activeFileId === file.id ? 'bg-pink-500/20 text-pink-300 font-semibold border-l-2 border-pink-400' : 'hover:bg-white/5 text-slate-300'
                                  }`}
                                >
                                  {getFileIcon(file.name)}
                                  <span className="truncate">{file.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Subfolder: contexts */}
                      {contextsFiles.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleFolder('src/contexts')}
                            className="w-full flex items-center space-x-1.5 py-1 px-1.5 rounded hover:bg-white/5 text-slate-300 cursor-pointer"
                          >
                            {expandedFolders['src/contexts'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            <Folder className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
                            <span>contexts</span>
                          </button>
                          {expandedFolders['src/contexts'] && (
                            <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                              {contextsFiles.map((file) => (
                                <motion.div
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={file.id}
                                  onClick={() => onSelectFile(file)}
                                  className={`flex items-center space-x-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors ${
                                    activeFileId === file.id ? 'bg-pink-500/20 text-pink-300 font-semibold border-l-2 border-pink-400' : 'hover:bg-white/5 text-slate-300'
                                  }`}
                                >
                                  {getFileIcon(file.name)}
                                  <span className="truncate">{file.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Subfolder: services */}
                      {servicesFiles.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleFolder('src/services')}
                            className="w-full flex items-center space-x-1.5 py-1 px-1.5 rounded hover:bg-white/5 text-slate-300 cursor-pointer"
                          >
                            {expandedFolders['src/services'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            <Folder className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                            <span>services</span>
                          </button>
                          {expandedFolders['src/services'] && (
                            <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                              {servicesFiles.map((file) => (
                                <motion.div
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={file.id}
                                  onClick={() => onSelectFile(file)}
                                  className={`flex items-center space-x-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors ${
                                    activeFileId === file.id ? 'bg-pink-500/20 text-pink-300 font-semibold border-l-2 border-pink-400' : 'hover:bg-white/5 text-slate-300'
                                  }`}
                                >
                                  {getFileIcon(file.name)}
                                  <span className="truncate">{file.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Root src files (App.tsx, main.tsx) */}
                      {srcFiles.map((file) => (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={file.id}
                          onClick={() => onSelectFile(file)}
                          className={`flex items-center space-x-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors ${
                            activeFileId === file.id ? 'bg-pink-500/20 text-pink-300 font-semibold border-l-2 border-pink-400' : 'hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          {getFileIcon(file.name)}
                          <span className="truncate">{file.name}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Folder: server */}
            {serverFiles.length > 0 && (
              <div className="pl-2">
                <button
                  onClick={() => toggleFolder('server')}
                  className="w-full flex items-center space-x-1.5 py-1 px-1.5 rounded hover:bg-white/5 text-slate-200 cursor-pointer"
                >
                  {expandedFolders['server'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  <Folder className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                  <span className="font-semibold">server</span>
                </button>
                {expandedFolders['server'] && (
                  <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                    {serverFiles.map((file) => (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={file.id}
                        onClick={() => onSelectFile(file)}
                        className={`flex items-center space-x-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors ${
                          activeFileId === file.id ? 'bg-pink-500/20 text-pink-300 font-semibold border-l-2 border-pink-400' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        {getFileIcon(file.name)}
                        <span className="truncate">{file.name}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Top Root Files (package.json, README.md, vite.config.ts) */}
            {rootFiles.map((file) => (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`flex items-center space-x-1.5 py-1 px-2.5 rounded cursor-pointer transition-colors ${
                  activeFileId === file.id ? 'bg-pink-500/20 text-pink-300 font-semibold border-l-2 border-pink-400' : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                {getFileIcon(file.name)}
                <span className="truncate">{file.name}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-2.5 border-t border-white/10 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Vite + React 19</span>
        <span className="text-emerald-400 font-mono">v1.0.0</span>
      </div>
    </aside>
  );
};
