import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Clock,
  Layers,
  Send,
  Building2,
  Server,
  Lock,
  FileText,
  Activity,
  Check,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import type {
  Chapter8State,
  Chapter8ConsoleTabId,
  ThreatTypeId,
  TargetSystemId,
  TrafficSourceId,
  SecurityAuthorityId,
  SecurityReadinessChecklist,
} from '../../types/chapter8';
import {
  CHAPTER8_TITLE,
  CHAPTER8_SUBTITLE,
  CHAPTER8_PROJECT_NAME,
  CHAPTER8_USP,
  CHAPTER8_KEY_TAKEAWAY,
  CHAPTER8_CHARACTERS,
  THREAT_TYPE_OPTIONS,
  TARGET_SYSTEM_OPTIONS,
  TRAFFIC_SOURCE_OPTIONS,
  SECURITY_AUTHORITY_OPTIONS,
  SECURITY_CONTROLS_SPEC,
  READINESS_CHECKLIST_ITEMS,
  CLOSING_SEQUENCE_CONFIRMATIONS,
  evaluateThreatInvestigation,
  evaluateSecurityControls,
  evaluateReadinessValidation,
  computeChapter8Score,
} from '../../data/chapter8Data';
import { sound } from '../onboarding/SoundEngine';

interface ReleaseHandoverDeskAppProps {
  chapter8State: Chapter8State;
  onUpdateState: (updater: Partial<Chapter8State> | ((prev: Chapter8State) => Chapter8State)) => void;
  onOpenScorecard?: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

export const ReleaseHandoverDeskApp: React.FC<ReleaseHandoverDeskAppProps> = ({
  chapter8State,
  onUpdateState,
  onOpenScorecard,
  onNotifyDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<Chapter8ConsoleTabId>(
    chapter8State.activeTab || 'investigate'
  );
  const [showClosingModal, setShowClosingModal] = useState<boolean>(
    Boolean(
      chapter8State.closingConfirmed &&
      chapter8State.validationCompleted &&
      chapter8State.controlsValidated &&
      !chapter8State.scorecard.shown
    )
  );

  const handleTabChange = (tab: Chapter8ConsoleTabId) => {
    sound.playClick();
    setActiveTab(tab);
    onUpdateState({ activeTab: tab });
  };

  // ── ACTIVITY 1: THREAT INVESTIGATION HANDLERS ──
  const handleSelectThreatType = (id: ThreatTypeId) => {
    sound.playClick();
    onUpdateState({ selectedThreatType: id, investigationValidated: false });
  };

  const handleSelectTargetSystem = (id: TargetSystemId) => {
    sound.playClick();
    onUpdateState({ selectedTargetSystem: id, investigationValidated: false });
  };

  const handleSelectTrafficSource = (id: TrafficSourceId) => {
    sound.playClick();
    onUpdateState({ selectedTrafficSource: id, investigationValidated: false });
  };

  const handleSelectSecurityAuthority = (id: SecurityAuthorityId) => {
    sound.playClick();
    onUpdateState({ selectedSecurityAuthority: id, investigationValidated: false });
  };

  const handleValidateInvestigation = () => {
    sound.playClick();
    const result = evaluateThreatInvestigation(
      chapter8State.selectedThreatType,
      chapter8State.selectedTargetSystem,
      chapter8State.selectedTrafficSource,
      chapter8State.selectedSecurityAuthority
    );

    onUpdateState((prev) => {
      const next: Chapter8State = {
        ...prev,
        investigationValidated: result.isComplete,
        investigationAttempts: prev.investigationAttempts + 1,
        investigationFeedback: result.feedback,
      };
      return {
        ...next,
        scorecard: computeChapter8Score(next),
      };
    });

    if (result.isComplete) {
      sound.playSystemClearance();
      onNotifyDesktop?.(
        'Threat Identified',
        'Credential-stuffing attack on the Employee Login Gateway verified. Proceed to configure controls.'
      );
    } else {
      sound.playMessagePing();
    }
  };

  // ── ACTIVITY 2: SECURITY CONTROLS HANDLERS ──
  const handleToggleWaf = () => {
    sound.playClick();
    onUpdateState((prev) => ({
      ...prev,
      wafBotMitigationEnabled: !prev.wafBotMitigationEnabled,
      controlsValidated: false,
    }));
  };

  const handleToggleMfa = () => {
    sound.playClick();
    onUpdateState((prev) => ({
      ...prev,
      mfaRateLimitingEnforced: !prev.mfaRateLimitingEnforced,
      controlsValidated: false,
    }));
  };

  const handleValidateControls = () => {
    sound.playClick();
    const result = evaluateSecurityControls(
      chapter8State.wafBotMitigationEnabled,
      chapter8State.mfaRateLimitingEnforced
    );

    onUpdateState((prev) => {
      const next: Chapter8State = {
        ...prev,
        controlsValidated: result.isComplete,
        controlsAttempts: prev.controlsAttempts + 1,
        controlsFeedback: result.feedback,
      };
      return {
        ...next,
        scorecard: computeChapter8Score(next),
      };
    });

    if (result.isComplete) {
      sound.playSystemClearance();
      onNotifyDesktop?.(
        'Security Controls Active',
        'WAF bot mitigation rules and strict MFA rate-limiting are active and compliant.'
      );
    } else {
      sound.playMessagePing();
    }
  };

  // ── ACTIVITY 3: READINESS CHECKLIST HANDLERS ──
  const handleToggleChecklistItem = (item: keyof SecurityReadinessChecklist) => {
    sound.playClick();
    onUpdateState((prev) => ({
      ...prev,
      readinessChecklist: {
        ...prev.readinessChecklist,
        [item]: !prev.readinessChecklist[item],
      },
      validationCompleted: false,
    }));
  };

  const handleValidateReadiness = () => {
    sound.playClick();
    const result = evaluateReadinessValidation(
      chapter8State.readinessChecklist,
      chapter8State.wafBotMitigationEnabled,
      chapter8State.mfaRateLimitingEnforced
    );

    if (result.isComplete) {
      sound.playSystemClearance();
      onUpdateState((prev) => {
        const next: Chapter8State = {
          ...prev,
          validationCompleted: true,
          validationAttempts: prev.validationAttempts + 1,
          validationFeedback: result.feedback,
          closingConfirmed: true,
          completed: true,
        };
        const finalScore = computeChapter8Score(next);
        return {
          ...next,
          scorecard: finalScore,
        };
      });

      setShowClosingModal(true);
      onNotifyDesktop?.(
        'Compliance Verification Successful',
        'Security response confirmed by Bank CISO. Portal suspension averted.'
      );
    } else {
      sound.playMessagePing();
      onUpdateState((prev) => ({
        ...prev,
        validationCompleted: false,
        validationAttempts: prev.validationAttempts + 1,
        validationFeedback: result.feedback,
      }));
    }
  };

  const currentScorecard = computeChapter8Score(chapter8State);

  return (
    <div className="h-full flex flex-col bg-[#060a12] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Console Navigation Bar */}
      <header className="px-5 py-3 border-b border-slate-800 bg-[#09101d]/90 backdrop-blur flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
                SECURITY RESPONSE CONSOLE · CHAPTER 8
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                COMPLIANCE ENFORCEMENT
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{CHAPTER8_TITLE}</span>
              <span className="text-slate-400 text-xs font-normal">· {CHAPTER8_PROJECT_NAME}</span>
            </h1>
          </div>
        </div>

        {/* Live Metrics Summary */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
              <span className="text-slate-400">Risk:</span>
              <span className="font-bold text-emerald-400">{currentScorecard.riskScore}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
              <span className="text-slate-400">Governance:</span>
              <span className="font-bold text-emerald-400">{currentScorecard.governanceScore}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-cyan-400">{currentScorecard.totalScore}/100</span>
            </div>
          </div>

          {chapter8State.completed && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-md hover:brightness-110"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </header>

      {/* Stage Tab Navigation */}
      <div className="px-5 py-2.5 bg-[#090d16] border-b border-slate-800/80 flex items-center space-x-2 shrink-0">
        <button
          onClick={() => handleTabChange('investigate')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'investigate'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            chapter8State.investigationValidated ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
          }`} />
          <span>Stage 1: Investigate Threat</span>
          {chapter8State.investigationValidated && <Check className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={() => handleTabChange('configure')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'configure'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            chapter8State.controlsValidated ? 'bg-emerald-400' : 'bg-slate-600'
          }`} />
          <span>Stage 2: Configure Security Response</span>
          {chapter8State.controlsValidated && <Check className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={() => handleTabChange('validate')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'validate'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            chapter8State.validationCompleted ? 'bg-emerald-400' : 'bg-slate-600'
          }`} />
          <span>Stage 3: Validate Security Readiness</span>
          {chapter8State.validationCompleted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* ── TAB 1: INVESTIGATE THREAT ── */}
        {activeTab === 'investigate' && (
          <div className="space-y-6">
            {/* Incident Brief Card */}
            <div className="p-5 rounded-2xl bg-[#0e1626] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  Security Incident Overview · SOC Threat Feed
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Authority: Bank CISO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Automated threat intelligence has flagged an active attack vector against enterprise infrastructure. Under bank cybersecurity policies and IT acts, you must accurately classify the threat vector, affected target, source pattern, and mandating authority to formulate an appropriate mitigation response.
              </p>
            </div>

            {/* Classification Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Threat Type */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono flex items-center justify-center font-bold">1</span>
                  <span>Identify the Attack Threat Type</span>
                </label>
                <div className="space-y-2">
                  {THREAT_TYPE_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectThreatType(opt.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        chapter8State.selectedThreatType === opt.id
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-[#0d1424] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {chapter8State.selectedThreatType === opt.id && (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Target System */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono flex items-center justify-center font-bold">2</span>
                  <span>Identify the Affected Target System</span>
                </label>
                <div className="space-y-2">
                  {TARGET_SYSTEM_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectTargetSystem(opt.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        chapter8State.selectedTargetSystem === opt.id
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-[#0d1424] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {chapter8State.selectedTargetSystem === opt.id && (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Traffic Source */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono flex items-center justify-center font-bold">3</span>
                  <span>Identify the Traffic Source & Pattern</span>
                </label>
                <div className="space-y-2">
                  {TRAFFIC_SOURCE_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectTrafficSource(opt.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        chapter8State.selectedTrafficSource === opt.id
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-[#0d1424] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {chapter8State.selectedTrafficSource === opt.id && (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Security Authority */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono flex items-center justify-center font-bold">4</span>
                  <span>Identify the Security Authority & Policy Mandate</span>
                </label>
                <div className="space-y-2">
                  {SECURITY_AUTHORITY_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectSecurityAuthority(opt.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        chapter8State.selectedSecurityAuthority === opt.id
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-[#0d1424] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {chapter8State.selectedSecurityAuthority === opt.id && (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Feedback Banner */}
            {chapter8State.investigationFeedback && (
              <div className="p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 bg-[#0d1526] border-slate-700 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{chapter8State.investigationFeedback}</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400">
                Evaluation: 25 points maximum
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleValidateInvestigation}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow cursor-pointer"
                >
                  Validate Incident Classification
                </button>
                {chapter8State.investigationValidated && (
                  <button
                    onClick={() => handleTabChange('configure')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <span>Proceed to Stage 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: CONFIGURE SECURITY RESPONSE ── */}
        {activeTab === 'configure' && (
          <div className="space-y-6">
            {/* Header Directive */}
            <div className="p-5 rounded-2xl bg-[#0e172a] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Mandatory Security Controls Configuration
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  Both Controls Mandatory
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Institutional cybersecurity compliance is non-negotiable. To mitigate the credential-stuffing attack on the employee login gateway without compromising security, you must implement both the perimeter Web Application Firewall (WAF) bot mitigation rules and the strict Multi-Factor Authentication (MFA) rate-limiting control.
              </p>
            </div>

            {/* Interactive Security Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Control 1: WAF Bot Mitigation */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                chapter8State.wafBotMitigationEnabled
                  ? 'bg-[#0f1f2e] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                  : 'bg-[#0e1424] border-slate-800'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-cyan-400" />
                      Perimeter Defense
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      chapter8State.wafBotMitigationEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {chapter8State.wafBotMitigationEnabled ? 'ACTIVE & FILTERING' : 'DISABLED'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {SECURITY_CONTROLS_SPEC.waf.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {SECURITY_CONTROLS_SPEC.waf.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Mandate:</span> {SECURITY_CONTROLS_SPEC.waf.mandatoryReason}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Control 1 of 2
                  </span>
                  <button
                    onClick={handleToggleWaf}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      chapter8State.wafBotMitigationEnabled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {chapter8State.wafBotMitigationEnabled ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Bot Mitigation Enabled</span>
                      </>
                    ) : (
                      <span>Enable WAF Bot Mitigation</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Control 2: MFA Rate-Limiting */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                chapter8State.mfaRateLimitingEnforced
                  ? 'bg-[#0f1f2e] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                  : 'bg-[#0e1424] border-slate-800'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      Authentication Defense
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      chapter8State.mfaRateLimitingEnforced
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {chapter8State.mfaRateLimitingEnforced ? 'ENFORCED' : 'UNRESTRICTED'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {SECURITY_CONTROLS_SPEC.mfa.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {SECURITY_CONTROLS_SPEC.mfa.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Mandate:</span> {SECURITY_CONTROLS_SPEC.mfa.mandatoryReason}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Control 2 of 2
                  </span>
                  <button
                    onClick={handleToggleMfa}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      chapter8State.mfaRateLimitingEnforced
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {chapter8State.mfaRateLimitingEnforced ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>MFA Rate-Limiting Enforced</span>
                      </>
                    ) : (
                      <span>Enforce MFA Rate-Limiting</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Feedback Banner */}
            {chapter8State.controlsFeedback && (
              <div className="p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 bg-[#0d1526] border-slate-700 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{chapter8State.controlsFeedback}</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400">
                Evaluation: 50 points maximum (25 WAF + 25 MFA)
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleValidateControls}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow cursor-pointer"
                >
                  Deploy Security Controls
                </button>
                {chapter8State.controlsValidated && (
                  <button
                    onClick={() => handleTabChange('validate')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <span>Proceed to Stage 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: VALIDATE SECURITY READINESS ── */}
        {activeTab === 'validate' && (
          <div className="space-y-6">
            {/* Header Checklist Directive */}
            <div className="p-5 rounded-2xl bg-[#0e172a] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Security Posture & Compliance Audit Checklist
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Pre-Submission Review
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review and confirm the resulting security posture. The Bank CISO requires formal verification that WAF bot mitigation is active, MFA rate-limiting is enforced, legitimate employee access remains operational, and the security response is documented for institutional compliance.
              </p>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {READINESS_CHECKLIST_ITEMS.map((item) => {
                const isChecked = Boolean(chapter8State.readinessChecklist?.[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-3.5 ${
                      isChecked
                        ? 'bg-[#0f1f2e] border-emerald-500/50 text-white shadow-sm'
                        : 'bg-[#0e1424] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-sm text-slate-100">{item.label}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Validation Feedback Banner */}
            {chapter8State.validationFeedback && (
              <div className="p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 bg-[#0d1526] border-slate-700 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{chapter8State.validationFeedback}</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400">
                Evaluation: 25 points maximum
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleValidateReadiness}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                  <span>Transmit Compliance Verification to Bank CISO</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CLOSING SEQUENCE MODAL ── */}
      <AnimatePresence>
        {showClosingModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="max-w-xl w-full bg-[#0a1220] border border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.2)] space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Incident Response Completed · Compliance Confirmed</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">BANK SOC CLOSING</span>
              </div>

              {/* Confirmations Sequence */}
              <div className="space-y-3.5">
                {CLOSING_SEQUENCE_CONFIRMATIONS.map((dialogue, idx) => {
                  const char = CHAPTER8_CHARACTERS[dialogue.speaker as keyof typeof CHAPTER8_CHARACTERS];
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#0e1829] border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={char.avatar}
                          alt={dialogue.name}
                          className="w-6 h-6 rounded-md object-cover border border-slate-700"
                        />
                        <span className="font-bold text-xs text-white">{dialogue.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({dialogue.role})</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-8">
                        "{dialogue.text}"
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Key Takeaway Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 italic leading-relaxed">
                "{CHAPTER8_KEY_TAKEAWAY}"
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setShowClosingModal(false);
                    onOpenScorecard?.();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>View Final Evaluation Scorecard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
