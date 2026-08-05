import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Terminal as TerminalIcon, Monitor, Play, RotateCw, CheckCircle2, Zap
} from 'lucide-react';
import { CeraActivityBar, type ActivityTab } from './cera/CeraActivityBar';
import { CeraSidebar } from './cera/CeraSidebar';
import { CeraCodeEditor } from './cera/CeraCodeEditor';
import { CeraAIChatPanel } from './cera/CeraAIChatPanel';
import { CeraTerminal } from './cera/CeraTerminal';
import { CeraPreviewWindow } from './cera/CeraPreviewWindow';
import { 
  INITIAL_TIMELINE_STEPS, SIMULATION_PHASES,
  type VirtualFile, type BuildTimelineStep, type SimulationPhase 
} from './cera/ceraSimulationData';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const CeraIDEApp: React.FC = () => {
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityTab>('explorer');
  const [projectName, setProjectName] = useState<string | null>(null);
  
  // File State
  const [generatedFiles, setGeneratedFiles] = useState<VirtualFile[]>([]);
  const [openFiles, setOpenFiles] = useState<VirtualFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Simulation Timeline State
  const [isAiBuilding, setIsAiBuilding] = useState(false);
  const [isBuildFinished, setIsBuildFinished] = useState(false);
  const [isDevServerRunning, setIsDevServerRunning] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [timelineSteps, setTimelineSteps] = useState<BuildTimelineStep[]>(INITIAL_TIMELINE_STEPS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    };
  }, []);

  const handleSelectFile = (file: VirtualFile) => {
    if (!openFiles.some((f) => f.id === file.id)) {
      setOpenFiles((prev) => [...prev, file]);
    }
    setActiveFileId(file.id);
    if (activeActivityTab === 'preview') {
      setActiveActivityTab('explorer');
    }
  };

  const handleCloseTab = (fileId: string) => {
    const nextOpen = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(nextOpen);
    if (activeFileId === fileId) {
      setActiveFileId(nextOpen.length > 0 ? nextOpen[nextOpen.length - 1].id : null);
    }
  };

  const handleResetSimulation = () => {
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    setProjectName(null);
    setGeneratedFiles([]);
    setOpenFiles([]);
    setActiveFileId(null);
    setIsAiBuilding(false);
    setIsBuildFinished(false);
    setIsDevServerRunning(false);
    setCurrentStatus('');
    setTimelineSteps(INITIAL_TIMELINE_STEPS.map((s) => ({ ...s, status: 'pending' })));
    setChatMessages([]);
    setTerminalLogs([]);
  };

  const handleSubmitPrompt = (promptText: string) => {
    handleResetSimulation();
    setProjectName('Project Titan');
    setIsAiBuilding(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // User initial message
    setChatMessages([
      {
        id: 'msg-user-1',
        sender: 'user',
        text: promptText,
        timestamp: now,
      },
    ]);

    setTerminalLogs(['Initializing Cera AI Engine (Enterprise Simulation)...']);

    // Run multi-stage choreographed timeline simulation
    let phaseIdx = 0;

    const runNextPhase = () => {
      if (phaseIdx >= SIMULATION_PHASES.length) {
        setIsAiBuilding(false);
        setIsBuildFinished(true);
        setCurrentStatus('Project ready.');
        return;
      }

      const phase = SIMULATION_PHASES[phaseIdx];
      setCurrentStatus(phase.statusText);

      // Update timeline checklist step status
      if (phase.activeStepId) {
        setTimelineSteps((prev) =>
          prev.map((step) => {
            if (step.id === phase.activeStepId) {
              return { ...step, status: 'in_progress' };
            }
            // Mark previous steps as completed
            const stepOrder = ['requirements', 'architecture', 'setup', 'backend', 'frontend', 'testing'];
            const currentIdx = stepOrder.indexOf(phase.activeStepId || '');
            const stepIdx = stepOrder.indexOf(step.id);
            if (stepIdx < currentIdx) {
              return { ...step, status: 'completed' };
            }
            return step;
          })
        );
      }

      // Add AI chat comment
      if (phase.chatMessage) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${phase.id}`,
            sender: 'ai',
            text: phase.chatMessage!,
            timestamp: timeStr,
          },
        ]);
      }

      // Append terminal log
      if (phase.terminalLog) {
        setTerminalLogs((prev) => [...prev, phase.terminalLog!]);
      }

      // Add new file to Explorer & Editor
      if (phase.newFile) {
        setGeneratedFiles((prev) => {
          if (!prev.some((f) => f.id === phase.newFile!.id)) {
            return [...prev, phase.newFile!];
          }
          return prev;
        });

        setOpenFiles((prev) => {
          if (!prev.some((f) => f.id === phase.newFile!.id)) {
            return [...prev, phase.newFile!];
          }
          return prev;
        });

        setActiveFileId(phase.newFile.id);
      }

      phaseIdx++;

      // Adjust duration based on speedMultiplier
      const adjustedDuration = Math.max(300, phase.durationMs / speedMultiplier);
      simulationTimerRef.current = setTimeout(runNextPhase, adjustedDuration);
    };

    runNextPhase();
  };

  const handleStartDevServer = () => {
    setIsDevServerRunning(true);
    setTerminalLogs((prev) => [
      ...prev,
      '$ npm run dev',
      'Starting development server...',
      'VITE v7.0.2  ready in 1438 ms',
      '➜  Local:   http://localhost:5173/',
      '➜  Network: use --host to expose',
      'Watching for file changes...',
    ]);
  };

  return (
    <div className="w-full h-full bg-[#080911] text-white flex flex-col font-sans select-none overflow-hidden relative border border-white/10 rounded-xl shadow-2xl">
      {/* IDE Top Bar Header */}
      <header className="h-10 bg-[#0f111d] border-b border-white/10 px-3 flex items-center justify-between text-xs select-none shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center p-0.5">
              <BrainedLogoIcon className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-white text-xs tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              Cera IDE
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <span className="text-slate-300 font-mono text-[11px]">
            {projectName ? `${projectName} — enterprise-hr-portal` : 'Cera AI Workspace (No project loaded)'}
          </span>
        </div>

        {/* Status Pill & Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {isAiBuilding && (
            <div className="flex items-center space-x-1.5 bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 rounded-full text-pink-300 text-[11px] font-semibold animate-pulse">
              <Sparkles className="w-3 h-3 text-pink-400 animate-spin" />
              <span>{currentStatus || 'Building...'}</span>
            </div>
          )}

          {isBuildFinished && (
            <div className="flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-emerald-300 text-[11px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Build Complete</span>
            </div>
          )}

          {/* Quick Speed Switcher */}
          <button
            onClick={() => {
              if (speedMultiplier === 1) setSpeedMultiplier(2);
              else if (speedMultiplier === 2) setSpeedMultiplier(4);
              else setSpeedMultiplier(1);
            }}
            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-pink-300 font-mono text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{speedMultiplier}x Speed</span>
          </button>

          {/* Reset Button */}
          {(projectName || generatedFiles.length > 0) && (
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
          isAiBuilding={isAiBuilding}
        />

        {/* Sidebar (Explorer / Drawer) */}
        {activeActivityTab === 'explorer' && (
          <CeraSidebar
            activeTab={activeActivityTab}
            projectName={projectName}
            generatedFiles={generatedFiles}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            isAiBuilding={isAiBuilding}
            onNewPromptClick={handleResetSimulation}
          />
        )}

        {/* Central Editor & Terminal Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top View: Code Editor OR Live Preview Window */}
          {activeActivityTab === 'preview' ? (
            <CeraPreviewWindow
              isDevServerRunning={isDevServerRunning}
              onStartDevServer={handleStartDevServer}
            />
          ) : (
            <CeraCodeEditor
              openFiles={openFiles}
              activeFileId={activeFileId}
              onSelectTab={(id) => setActiveFileId(id)}
              onCloseTab={handleCloseTab}
              onSubmitPrompt={handleSubmitPrompt}
              isAiBuilding={isAiBuilding}
              onOpenPreview={() => setActiveActivityTab('preview')}
            />
          )}

          {/* Bottom Interactive Terminal */}
          <CeraTerminal
            logs={terminalLogs}
            isBuildFinished={isBuildFinished}
            isDevServerRunning={isDevServerRunning}
            onStartDevServer={handleStartDevServer}
            onOpenPreview={() => setActiveActivityTab('preview')}
          />
        </div>

        {/* Right Cera AI Chat Panel */}
        <CeraAIChatPanel
          currentStatus={currentStatus}
          timelineSteps={timelineSteps}
          chatMessages={chatMessages}
          isBuilding={isAiBuilding}
          isComplete={isBuildFinished}
          speedMultiplier={speedMultiplier}
          setSpeedMultiplier={setSpeedMultiplier}
          onReset={handleResetSimulation}
        />
      </div>
    </div>
  );
};
