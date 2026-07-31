import React, { useState } from 'react';
import { Folder, Download } from 'lucide-react';
import { DOCUMENTS } from '../../data/simulationData';
import type { DocItem } from '../../data/simulationData';

export const DocumentsApp: React.FC = () => {
  const [docs] = useState<DocItem[]>(DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<DocItem>(DOCUMENTS[0]);

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Folder className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Enterprise Artifact Hub & Governance</span>
        </div>
        <span className="text-slate-400">3 Approved Documents • 1 In Review</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Document Cards Sidebar */}
        <div className="w-72 sm:w-80 border-r border-white/10 p-4 space-y-3 overflow-y-auto shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Project Documents</span>
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedDoc.id === doc.id
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                  : 'bg-slate-900/60 border-white/5 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {doc.category}
                </span>
                <span className={`text-[10px] font-bold ${
                  doc.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {doc.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate mb-1">{doc.title}</h4>
              <p className="text-[10px] text-slate-400">Modified {doc.lastModified}</p>
            </div>
          ))}
        </div>

        {/* Document Viewer Screen */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950/40">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h1 className="text-xl font-bold text-white">{selectedDoc.title}</h1>
                <p className="text-xs text-slate-400 mt-1">Author: {selectedDoc.author} • Category: {selectedDoc.category}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 text-sm font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedDoc.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
