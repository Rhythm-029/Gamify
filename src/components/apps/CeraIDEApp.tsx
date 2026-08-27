import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { 
  Sparkles, RotateCw, CheckCircle2, Zap, Download, Code2, Globe
} from 'lucide-react';
import JSZip from 'jszip';
import { CeraActivityBar, type ActivityTab } from './cera/CeraActivityBar';
import { CeraSidebar } from './cera/CeraSidebar';
import { CeraCodeEditor } from './cera/CeraCodeEditor';
import { CeraAIChatPanel } from './cera/CeraAIChatPanel';
import { CeraTerminal } from './cera/CeraTerminal';
import { CeraPreviewWindow } from './cera/CeraPreviewWindow';
import { 
  type VirtualFile
} from './cera/ceraSimulationData';
import { 
  getCeraState, 
  updateCeraState, 
  subscribeCeraState, 
  resetCeraSimulationState,
  startCeraVibeCoding,
  submitInteractiveChoice,
  setPrototypeBuiltCallback
} from './cera/ceraStore';
import { useGame } from '../../context/GameContext';

class CeraErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('[CERA IDE ErrorBoundary Caught Error]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-[#080911] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-3xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 shadow-xl">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Cera AI Workspace</h3>
          <p className="text-slate-400 text-xs max-w-xs mb-4">Click below to open Cera IDE workspace.</p>
          <button
            onClick={() => {
              resetCeraSimulationState();
              this.setState({ hasError: false });
            }}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg rounded-xl transition-all cursor-pointer"
          >
            Launch Cera Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const CeraIDEApp: React.FC = () => {
  return (
    <CeraErrorBoundary>
      <CeraIDEContent />
    </CeraErrorBoundary>
  );
};

const CeraIDEContent: React.FC = () => {
  const { buildPrototype, addSignal } = useGame();
  const cera = useSyncExternalStore(subscribeCeraState, getCeraState);

  const [activeActivityTab, setActiveActivityTab] = useState<ActivityTab>('explorer');

  useEffect(() => {
    setPrototypeBuiltCallback(() => {
      buildPrototype();
    });
  }, [buildPrototype]);

  const handleOpenLiveWebsite = () => {
    // Switch to in-app live preview tab
    setActiveActivityTab('preview');
    addSignal('delivery_management', 'Opened live prototype preview (http://localhost:5173)', 8);
  };


  const handleSelectFile = (file: VirtualFile) => {
    const isAlreadyOpen = (cera.openFiles || []).some((f) => f && f.id === file.id);
    const nextOpen = isAlreadyOpen ? (cera.openFiles || []) : [...(cera.openFiles || []), file];
    updateCeraState({ openFiles: nextOpen, activeFileId: file.id });
    if (activeActivityTab === 'preview') {
      setActiveActivityTab('explorer');
    }
  };

  const handleCloseTab = (fileId: string) => {
    const nextOpen = (cera.openFiles || []).filter((f) => f && f.id !== fileId);
    const nextActive = cera.activeFileId === fileId 
      ? (nextOpen.length > 0 ? nextOpen[nextOpen.length - 1].id : null)
      : cera.activeFileId;
    updateCeraState({ openFiles: nextOpen, activeFileId: nextActive });
  };

  const handleResetSimulation = () => {
    resetCeraSimulationState();
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder('titan-hr-portal-prototype');
      if (!folder) return;

      (cera.generatedFiles || []).forEach((file) => {
        if (file && file.name && file.content) {
          folder.file(file.name, file.content);
        }
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'titan-hr-portal-prototype.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addSignal('delivery_management', 'Downloaded Cera IDE project codebase folder zip', 10);
    } catch (err) {
      console.error('Failed to generate zip download:', err);
    }
  };

  const handleStartDevServer = () => {
    updateCeraState((prev) => ({
      isDevServerRunning: true,
      terminalLogs: [
        ...(prev.terminalLogs || []),
        '$ npm run dev',
        'Starting development server...',
        'VITE v7.0.2  ready in 1438 ms',
        '➜  Local:   http://localhost:5173/',
        '➜  Network: use --host to expose',
        'Watching for file changes...',
      ],
    }));
  };

  const handleSubmitPrompt = (promptText: string) => {
    buildPrototype();
    startCeraVibeCoding(promptText);
    addSignal('delivery_management', 'Started Cera AI feature framing wizard', 5);
  };

  const handleInteractiveSubmitOption = (selectedOptionId: string) => {
    if (selectedOptionId === 'open_preview') {
      setActiveActivityTab('preview');
      return;
    }

    const prompt = cera.currentInteractivePrompt;
    const chosen = prompt?.options.find((o: any) => o.id === selectedOptionId) || prompt?.options[0];
    const marks = (chosen as any)?.marks ?? (
      selectedOptionId === 'opt_sso' || selectedOptionId === 'opt_hr_escalate' || selectedOptionId === 'opt_payroll_dashboard' || selectedOptionId === 'opt_doc_upload' ? 15 : 0
    );

    submitInteractiveChoice(selectedOptionId);

    if (marks > 0) {
      addSignal('requirement_management', `Correct feature framing choice: ${chosen?.label || selectedOptionId}`, marks);
    } else {
      addSignal('requirement_management', `Incorrect feature framing (unapproved choice): ${chosen?.label || selectedOptionId}`, 0);
    }
  };

  const safeGeneratedCount = cera.generatedFiles?.length || 0;

  return (
    <div className="w-full h-full bg-[#080911] text-white flex flex-col font-sans select-none overflow-hidden relative border border-white/10 rounded-xl shadow-2xl">
      {/* IDE Top Bar Header */}
      <header className="h-10 bg-[#0f111d] border-b border-white/10 px-3 flex items-center justify-between text-xs select-none shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 border border-pink-500/40 flex items-center justify-center p-1 shadow-md">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-xs tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              Cera IDE
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <span className="text-slate-300 font-mono text-[11px]">
            {cera.projectName ? `${cera.projectName} — enterprise-hr-portal` : 'Cera AI Workspace (No project loaded)'}
          </span>
        </div>

        {/* Status Pill & Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {safeGeneratedCount > 0 && (
            <button
              onClick={handleDownloadZip}
              className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 border border-pink-400/40 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
              title="Download full project source code as .zip folder"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Folder (.zip)</span>
            </button>
          )}

          {cera.isAiBuilding && (
            <div className="flex items-center space-x-1.5 bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 rounded-full text-pink-300 text-[11px] font-semibold animate-pulse">
              <Sparkles className="w-3 h-3 text-pink-400 animate-spin" />
              <span>{cera.currentStatus || 'Building...'}</span>
            </div>
          )}

          {cera.isBuildFinished && (
            <button
              onClick={handleOpenLiveWebsite}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 border border-emerald-300 text-slate-950 rounded-lg font-extrabold text-[11px] flex items-center space-x-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 animate-pulse"
              title="Open Live App Preview (http://localhost:5173)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-950" />
              <span>Open Live Website (localhost:5173)</span>
            </button>
          )}

          {/* Quick Speed Switcher */}
          <button
            onClick={() => {
              const nextSpeed = cera.speedMultiplier === 1 ? 2 : cera.speedMultiplier === 2 ? 4 : 1;
              updateCeraState({ speedMultiplier: nextSpeed });
            }}
            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-pink-300 font-mono text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{cera.speedMultiplier || 1}x Speed</span>
          </button>

          {/* Reset Button */}
          {(cera.projectName || safeGeneratedCount > 0) && (
            <button
              onClick={handleResetSimulation}
              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
              title="Reset IDE Project"
            >
              <RotateCw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </header>

      {/* Main IDE Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Bar */}
        <CeraActivityBar
          activeTab={activeActivityTab}
          setActiveTab={setActiveActivityTab}
          isAiBuilding={cera.isAiBuilding}
        />

        {/* Sidebar (Explorer / Drawer) */}
        {activeActivityTab !== 'preview' && (
          <CeraSidebar
            activeTab={activeActivityTab}
            projectName={cera.projectName}
            generatedFiles={cera.generatedFiles}
            activeFileId={cera.activeFileId}
            onSelectFile={handleSelectFile}
            isAiBuilding={cera.isAiBuilding}
            onNewPromptClick={handleResetSimulation}
          />
        )}

        {/* Central Editor & Terminal Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top View: Code Editor OR Live Preview Window */}
          {activeActivityTab === 'preview' ? (
            <CeraPreviewWindow
              isDevServerRunning={cera.isDevServerRunning}
              onStartDevServer={handleStartDevServer}
            />
          ) : (
            <CeraCodeEditor
              openFiles={cera.openFiles}
              activeFileId={cera.activeFileId}
              onSelectTab={(id) => updateCeraState({ activeFileId: id })}
              onCloseTab={handleCloseTab}
              onSubmitPrompt={handleSubmitPrompt}
              isAiBuilding={cera.isAiBuilding}
              hasInteractivePrompt={!!cera.currentInteractivePrompt}
              onOpenPreview={() => setActiveActivityTab('preview')}
            />
          )}

          {/* Bottom Interactive Terminal */}
          <CeraTerminal
            logs={cera.terminalLogs}
            isBuildFinished={cera.isBuildFinished}
            isDevServerRunning={cera.isDevServerRunning}
            onStartDevServer={handleStartDevServer}
            onOpenPreview={() => setActiveActivityTab('preview')}
          />
        </div>

        {/* Right Cera AI Chat Panel */}
        <CeraAIChatPanel
          currentStatus={cera.currentStatus}
          timelineSteps={cera.timelineSteps}
          chatMessages={cera.chatMessages}
          isBuilding={cera.isAiBuilding}
          isComplete={cera.isBuildFinished}
          speedMultiplier={cera.speedMultiplier}
          setSpeedMultiplier={(s) => updateCeraState({ speedMultiplier: s })}
          onReset={handleResetSimulation}
          interactivePrompt={cera.currentInteractivePrompt}
          onSubmitOption={handleInteractiveSubmitOption}
        />
      </div>
    </div>
  );
};
