import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Database, Layout, Link, Shield, Cloud, Settings, Brain, CheckCircle2, Plus, Rocket, Mic, ShieldCheck, TrendingUp, Zap, Lock } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { updateCeraState } from './cera/ceraStore';
import { analyzeRequirement } from '../../services/impactAnalysisService';

interface IdeateImpactAppProps {
  onLaunchApp?: (appId: string) => void;
}

const AVAILABLE_CONNECTORS = [
  { id: 'sso_okta', name: 'Okta SSO', icon: Lock, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { id: 'workday_core', name: 'Workday HR', icon: Database, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { id: 'whisper_ai', name: 'Whisper AI', icon: Mic, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  { id: 'infosec_guard', name: 'SOC2 Shield', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { id: 'powerbi_analytics', name: 'PowerBI', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  { id: 'servicenow_bot', name: 'ServiceNow ITSM', icon: Zap, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
];

const LAUNCH_STEPS = [
  "Initializing AI Architect Engine...",
  "Binding Enterprise Connectors...",
  "Provisioning Database Nodes...",
  "Injecting Workflow Agents...",
  "Deploying React Fiber UI...",
  "Running Zero-Trust Security Checks...",
  "Finalizing Project Titan Blueprint..."
];

export const IdeateImpactApp: React.FC<IdeateImpactAppProps> = ({ onLaunchApp }) => {
  const { buildPrototype, addSignal, state } = useGame();
  const [requirement, setRequirement] = useState('');
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [impactData, setImpactData] = useState<any>(null);
  
  const [isFinalized, setIsFinalized] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);

  const toggleConnector = (id: string) => {
    setSelectedConnectors(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async () => {
    if (!requirement.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeRequirement(requirement, selectedConnectors);
      setImpactData(data);
      setIsFinalized(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddRecommendation = (rec: string) => {
    setRequirement((prev) => prev + (prev.trim().endsWith('.') ? ' ' : '. ') + rec);
  };

  const handleFinalize = () => {
    setIsLaunching(true);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < LAUNCH_STEPS.length) {
        setLaunchStep(step);
      } else {
        clearInterval(interval);
        completeLaunch();
      }
    }, 600); // Wait 600ms per fake loading step
  };

  const completeLaunch = () => {
    if (!state.prototypeBuilt) {
      buildPrototype();
      updateCeraState({
        isBuildFinished: true,
        isAiBuilding: false,
        currentStatus: 'Impact Prototype Built & Active',
        generatedFiles: [
          { id: 'f1', name: 'App.tsx', content: '// Titan HR Transformation Solution Built', language: 'typescript' },
        ],
      });
      addSignal('delivery_management', 'Launched & Built Digital Transformation Prototype in Ideate & Impact Studio', 25);
    }
    
    setIsLaunching(false);
    setIsFinalized(true);
    
    setTimeout(() => {
      if (onLaunchApp) {
        onLaunchApp('browser');
      }
    }, 1500); // Wait 1.5s on the success screen before launching the actual browser
  };

  const Section = ({ title, icon: Icon, items, colorClass }: { title: string, icon: any, items: string[], colorClass: string }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="bg-[#12184A] border border-white/5 rounded-xl p-4 transition-all hover:border-white/10">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${colorClass}`} />
          <span>{title}</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-full bg-[#0D113D] border border-white/10 text-[11px] font-semibold text-white/80">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#080B27] text-white flex flex-col font-sans select-none overflow-hidden border border-white/10 rounded-xl shadow-2xl relative">
      {/* Header */}
      <header className="h-14 bg-[#0D113D]/90 border-b border-white/10 px-5 flex items-center justify-between shrink-0 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7A39D8] to-[#FF4FA3] flex items-center justify-center p-2 shadow-lg shadow-[#FF4FA3]/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Ideate & Impact Analysis
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] text-[10px] font-bold border border-[#00F0FF]/30">
                AI Architect Node
              </span>
            </div>
            <p className="text-[11px] text-white/40">
              Map system-wide blast radius & bind integrations.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        
        {/* Connectors Panel */}
        <div className="bg-[#12184A] p-5 rounded-2xl border border-white/10 shadow-lg">
          <label className="block text-sm font-bold text-white/80 mb-3 flex items-center space-x-2">
            <Link className="w-4 h-4 text-[#00F0FF]" />
            <span>Enterprise Connectors</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {AVAILABLE_CONNECTORS.map((conn) => {
              const isSelected = selectedConnectors.includes(conn.id);
              const Icon = conn.icon;
              return (
                <button
                  key={conn.id}
                  onClick={() => toggleConnector(conn.id)}
                  disabled={isFinalized || isLaunching}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    isSelected 
                      ? `${conn.bg} ${conn.border} shadow-lg shadow-${conn.color.replace('text-', '')}/20 scale-105` 
                      : 'bg-[#0D113D] border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? conn.color : 'text-white/40'}`} />
                  <span className={`text-[10px] font-bold text-center ${isSelected ? 'text-white' : 'text-white/40'}`}>
                    {conn.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Panel */}
        <div className="bg-[#12184A] p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
          <label className="block text-sm font-bold text-white/80">Business Requirement / Feature Request</label>
          <div className="relative">
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              disabled={isFinalized || isLaunching}
              placeholder="Describe the new feature, business rule, or product enhancement..."
              className="w-full h-32 bg-[#0D113D] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#FF4FA3] focus:ring-1 focus:ring-[#FF4FA3]/30 transition-all resize-none disabled:opacity-50"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#0D113D]/80 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center border border-[#7A39D8]/50">
                <Brain className="w-8 h-8 text-[#FF4FA3] animate-pulse mb-2" />
                <span className="text-xs font-bold text-white/80 animate-pulse tracking-widest uppercase">
                  AI Architect Thinking...
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !requirement.trim() || isFinalized || isLaunching}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7A39D8] via-[#B637BF] to-[#E238A7] text-white font-black text-sm shadow-lg shadow-[#E238A7]/20 hover:shadow-[#E238A7]/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className="w-4 h-4" />
            <span>{impactData ? 'Re-Analyze Architecture' : 'Analyze Architecture'}</span>
          </button>
        </div>

        {/* AI Recommendations Layer */}
        <AnimatePresence>
          {impactData && impactData.recommendations && impactData.recommendations.length > 0 && !isFinalized && !isLaunching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-[#7A39D8]/10 to-[#FF4FA3]/10 border border-[#7A39D8]/30 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center space-x-2 text-[#FF4FA3]">
                <Brain className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-sm">AI Layer Recommendations</h3>
              </div>
              <div className="space-y-2">
                {impactData.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start justify-between bg-[#0D113D]/60 p-3 rounded-lg border border-white/5">
                    <p className="text-[13px] text-white/80 pr-4">{rec}</p>
                    <button
                      onClick={() => handleAddRecommendation(rec)}
                      className="shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-[#7A39D8]/20 hover:bg-[#7A39D8]/40 border border-[#7A39D8]/50 text-[#FF4FA3] rounded-lg text-[11px] font-bold transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Accept</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Impact Visualizer */}
        <AnimatePresence>
          {impactData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`space-y-6 ${(isFinalized || isLaunching) ? 'opacity-30 pointer-events-none' : ''}`}
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#12184A] border border-white/5 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FFC700]" />
                  <div className="text-[11px] text-white/40 uppercase font-bold">Estimated Effort</div>
                  <div className="text-2xl font-black text-[#FFC700] mt-1">{impactData.estimatedHours} hrs</div>
                </div>
                <div className="bg-[#12184A] border border-white/5 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FF4FA3]" />
                  <div className="text-[11px] text-white/40 uppercase font-bold">Risk Level</div>
                  <div className="text-2xl font-black text-[#FF4FA3] mt-1 capitalize">{impactData.riskLevel}</div>
                </div>
                <div className="bg-[#12184A] border border-white/5 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00F0FF]" />
                  <div className="text-[11px] text-white/40 uppercase font-bold">Business Value</div>
                  <div className="text-2xl font-black text-[#00F0FF] mt-1 capitalize">{impactData.businessValue}</div>
                </div>
                <div className="bg-[#12184A] border border-white/5 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#7A39D8]" />
                  <div className="text-[11px] text-white/40 uppercase font-bold">Complexity</div>
                  <div className="text-2xl font-black text-[#7A39D8] mt-1 capitalize">{impactData.implementationComplexity}</div>
                </div>
              </div>

              {/* AI Verdict */}
              <div className="bg-[#12184A] border-l-4 border-[#FF4FA3] p-4 rounded-r-xl text-sm text-white/80 italic flex items-start space-x-3">
                <Brain className="w-5 h-5 text-[#FF4FA3] shrink-0 mt-0.5" />
                <span>"{impactData.aiVerdict}"</span>
              </div>

              {/* Impact Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section 
                  title="Database Impact 🛢️" 
                  icon={Database} 
                  colorClass="text-[#00F0FF]"
                  items={[
                    ...(impactData.datasetImpact?.newTables?.map((t: string) => `New Table: ${t}`) || []),
                    ...(impactData.datasetImpact?.modifiedTables?.map((t: string) => `Mod Table: ${t}`) || []),
                    ...(impactData.datasetImpact?.fields?.map((f: string) => `Field: ${f}`) || [])
                  ]} 
                />
                <Section 
                  title="UI / Structure Impact 💻" 
                  icon={Layout} 
                  colorClass="text-[#FFC700]"
                  items={[
                    ...(impactData.structureImpact?.pages?.map((p: string) => `Page: ${p}`) || []),
                    ...(impactData.structureImpact?.sections?.map((s: string) => `Section: ${s}`) || [])
                  ]} 
                />
                <Section 
                  title="API & Logic 🔌" 
                  icon={Settings} 
                  colorClass="text-[#7A39D8]"
                  items={[
                    ...(impactData.businessLogicImpact?.apis?.map((a: string) => `API: ${a}`) || []),
                    ...(impactData.businessLogicImpact?.workflows?.map((w: string) => `Workflow: ${w}`) || [])
                  ]} 
                />
                <Section 
                  title="Security & Roles 🛡️" 
                  icon={Shield} 
                  colorClass="text-[#FF4FA3]"
                  items={[
                    ...(impactData.securityImpact?.roles?.map((r: string) => `Role: ${r}`) || []),
                    ...(impactData.securityImpact?.permissions?.map((p: string) => `Perm: ${p}`) || [])
                  ]} 
                />
                <Section 
                  title="Integrations 🔗" 
                  icon={Link} 
                  colorClass="text-[#00F0FF]"
                  items={[
                    ...(impactData.integrationImpact?.newIntegrations?.map((i: string) => `New: ${i}`) || []),
                    ...(impactData.integrationImpact?.existingIntegrations?.map((i: string) => `Mod: ${i}`) || [])
                  ]} 
                />
                <Section 
                  title="Deployment & Infra ☁️" 
                  icon={Cloud} 
                  colorClass="text-[#FFC700]"
                  items={[
                    ...(impactData.deploymentImpact?.infrastructure?.map((i: string) => `Infra: ${i}`) || []),
                    ...(impactData.deploymentImpact?.pipelines?.map((p: string) => `Pipeline: ${p}`) || [])
                  ]} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Finalize Action Inline */}
        <AnimatePresence>
          {impactData && !isFinalized && !isLaunching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-end pt-4 pb-8"
            >
              <button
                onClick={handleFinalize}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#7A39D8] text-[#080B27] font-black text-sm shadow-xl shadow-[#00F0FF]/30 hover:scale-105 transition-all flex items-center space-x-3"
              >
                <Rocket className="w-5 h-5" />
                <span>Finalize & Launch Project</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Launching Animation Sequence */}
      <AnimatePresence>
        {isLaunching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#080B27]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-8"
          >
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-[#00F0FF]/20 rounded-full animate-ping" />
              <div className="absolute inset-2 border-4 border-[#7A39D8]/40 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-4 border-4 border-[#FF4FA3]/60 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Rocket className="w-10 h-10 text-[#00F0FF] animate-pulse" />
              </div>
            </div>
            
            <div className="h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={launchStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-mono font-bold text-[#00F0FF] tracking-widest uppercase text-center"
                >
                  {LAUNCH_STEPS[launchStep]}
                </motion.h3>
              </AnimatePresence>
            </div>
            
            <div className="w-64 h-1.5 bg-[#12184A] rounded-full mt-6 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00F0FF] via-[#7A39D8] to-[#FF4FA3]"
                initial={{ width: '0%' }}
                animate={{ width: `${(launchStep / (LAUNCH_STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finalized Overlay */}
      <AnimatePresence>
        {isFinalized && !isLaunching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-[#080B27]/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 rounded-full bg-[#00F0FF]/20 flex items-center justify-center mb-6 shadow-[0_0_80px_rgba(0,240,255,0.4)] border-2 border-[#00F0FF]"
            >
              <CheckCircle2 className="w-12 h-12 text-[#00F0FF]" />
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Project Successfully Deployed</h2>
            <p className="text-white/70 max-w-md mb-8">
              The architecture impact has been finalized. System nodes are actively spinning up the prototype workspace.
            </p>
            <div className="flex items-center space-x-2 text-[#00F0FF] text-sm font-bold animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Redirecting to Live Prototype...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
