import React, { useState } from 'react';
import { Folder, FileText, Download, Code, Sparkles } from 'lucide-react';
import { OS_FINDER_FILES } from '../../data/brainedOSData';
import type { FinderFile } from '../../data/brainedOSData';
import { useGame } from '../../context/GameContext';

export const FinderApp: React.FC = () => {
  const { state: gameState } = useGame();
  const [files] = useState<FinderFile[]>(OS_FINDER_FILES);
  const [selectedFolder, setSelectedFolder] = useState<string>('Desktop');

  // Filter out project files until Cera IDE prompt build is executed
  const visibleFiles = files.filter((f) => {
    if (!gameState.prototypeBuilt && (f.id.startsWith('file-titan') || f.path.includes('titan-hr-portal'))) {
      return false;
    }
    return f.folder === selectedFolder;
  });

  const [selectedFile, setSelectedFile] = useState<FinderFile | null>(() => visibleFiles[0] || null);

  const handleDownloadFile = (file: FinderFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-row overflow-hidden bg-slate-950/85 text-white font-sans text-xs">
      {/* Sidebar Folders */}
      <div className="w-48 bg-slate-950/90 border-r border-white/10 p-3 select-none">
        <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Favorites</span>
        <div className="space-y-1 mt-2">
          {['Desktop', 'Documents', 'Downloads', 'Projects'].map((fld) => (
            <button
              key={fld}
              onClick={() => {
                setSelectedFolder(fld);
                const first = files.find((f) => f.folder === fld);
                if (first) setSelectedFile(first);
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                selectedFolder === fld ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>{fld}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File Grid */}
      <div className="w-72 border-r border-white/10 p-4 overflow-y-auto space-y-2 bg-slate-900/40">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Items in {selectedFolder}</span>
        {visibleFiles.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-slate-500 space-y-1">
            <Sparkles className="w-4 h-4 mx-auto text-pink-400 opacity-60" />
            <p className="text-[10px]">No generated project files yet.</p>
            <p className="text-[9px] text-slate-600">Submit prompt in Cera IDE to build project codebase.</p>
          </div>
        ) : (
          visibleFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedFile?.id === file.id
                  ? 'bg-blue-600/20 border-blue-500 shadow-md'
                  : 'bg-slate-900/60 border-white/5 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {file.name.endsWith('.zip') ? (
                  <Folder className="w-4 h-4 text-sky-400" />
                ) : file.name.endsWith('.tsx') || file.name.endsWith('.json') ? (
                  <Code className="w-4 h-4 text-emerald-400" />
                ) : (
                  <FileText className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-bold text-white truncate">{file.name}</span>
              </div>
              <div className="text-[10px] text-slate-400">{file.kind} • {file.size}</div>
            </div>
          ))
        )}
      </div>

      {/* File Preview */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 flex flex-col justify-between">
        {selectedFile ? (
          <>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="text-base font-bold text-white">{selectedFile.name}</h3>
                <span className="text-[10px] font-mono text-slate-400">{selectedFile.size}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap">
                {selectedFile.content}
              </div>
            </div>

            <button
              onClick={() => handleDownloadFile(selectedFile)}
              className="mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-500/30"
            >
              <Download className="w-4 h-4" />
              <span>Download {selectedFile.name}</span>
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No file selected</div>
        )}
      </div>
    </div>
  );
};

