import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  FileCode,
  GitBranch,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Terminal,
  BookOpen,
  ArrowRight,
  Database,
  Server,
  Code2,
  Tag,
  Award,
  Trash2,
  Eye,
  Archive,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';
import type {
  Chapter10State,
  Chapter10PortalTab,
  Chapter10DecisionChoice,
  SemVerChoice,
  RepoFileItem,
} from '../../types/chapter10';
import {
  CHAPTER10_TITLE,
  CHAPTER10_SUBTITLE,
  CHAPTER10_PROJECT_NAME,
  CHAPTER10_LOCATION,
  REPO_FILES_MANIFEST,
  AUTHORITATIVE_REPO_FILE_IDS,
  SCRATCH_DUPLICATE_FILE_IDS,
  SEMVER_OPTIONS,
  ENTERPRISE_CATALOG_SECTIONS,
  CHAPTER10_DECISION_OPTIONS,
  computeChapter10Score,
} from '../../data/chapter10Data';
import { sound } from '../onboarding/SoundEngine';

interface EngineeringReleasePortalAppProps {
  chapter10State: Chapter10State;
  onUpdateState: (updater: Partial<Chapter10State> | ((prev: Chapter10State) => Chapter10State)) => void;
  onOpenScorecard: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

export const EngineeringReleasePortalApp: React.FC<EngineeringReleasePortalAppProps> = ({
  chapter10State,
  onUpdateState,
  onOpenScorecard,
  onNotifyDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<Chapter10PortalTab>(
    chapter10State.selectedTab || 'repo_audit'
  );

  // Tab 1: Repo Audit state
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<RepoFileItem>(
    REPO_FILES_MANIFEST[0]
  );
  const [selectedFilesToRetain, setSelectedFilesToRetain] = useState<string[]>(
    chapter10State.selectedRepoFiles || AUTHORITATIVE_REPO_FILE_IDS
  );
  const [auditSubmitted, setAuditSubmitted] = useState<boolean>(
    Boolean(chapter10State.repoAuditCompleted)
  );

  // Tab 2: SemVer choice state
  const [chosenVersion, setChosenVersion] = useState<SemVerChoice | null>(
    chapter10State.selectedVersion || 'v1.0.0'
  );
  const [versionConfirmed, setVersionConfirmed] = useState<boolean>(
    Boolean(chapter10State.versionConfirmed)
  );

  // Tab 3: Catalog Publication state
  const [selectedDocSections, setSelectedDocSections] = useState<string[]>(
    chapter10State.selectedDocSections || ENTERPRISE_CATALOG_SECTIONS.map((s) => s.id)
  );
  const [catalogPublished, setCatalogPublished] = useState<boolean>(
    Boolean(chapter10State.catalogPublished)
  );

  // Tab 4: Final Governance Decision
  const [selectedDecision, setSelectedDecision] = useState<Chapter10DecisionChoice | null>(
    chapter10State.decisionChosen || 'choice_b'
  );
  const [decisionCommitted, setDecisionCommitted] = useState<boolean>(
    Boolean(chapter10State.completed)
  );

  // Calculation of Doc Coverage
  const docCoveragePct = Math.round(
    (selectedDocSections.length / ENTERPRISE_CATALOG_SECTIONS.length) * 100
  );

  // Handle Tab Change
  const handleTabChange = (tab: Chapter10PortalTab) => {
    sound.playClick();
    setActiveTab(tab);
    onUpdateState({ selectedTab: tab });
  };

  // Toggle file retention in Task 1
  const handleToggleFileRetention = (fileId: string) => {
    sound.playClick();
    setSelectedFilesToRetain((prev) => {
      const next = prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId];
      onUpdateState({ selectedRepoFiles: next });
      return next;
    });
  };

  // Submit Repo Audit
  const handleSubmitAudit = () => {
    sound.playSystemClearance();
    setAuditSubmitted(true);
    onUpdateState({
      repoAuditCompleted: true,
      selectedRepoFiles: selectedFilesToRetain,
    });
    if (onNotifyDesktop) {
      onNotifyDesktop(
        'Repository Audit Completed',
        'Authoritative documentation baseline established. Single source of truth locked.'
      );
    }
  };

  // Confirm SemVer
  const handleConfirmVersion = () => {
    if (!chosenVersion) return;
    sound.playSystemClearance();
    setVersionConfirmed(true);
    onUpdateState({
      selectedVersion: chosenVersion,
      versionConfirmed: true,
    });
    if (onNotifyDesktop) {
      onNotifyDesktop(
        `Version Tagged: ${chosenVersion}`,
        chosenVersion === 'v1.0.0'
          ? 'First formal stable release approved under Semantic Versioning rules.'
          : 'Version tag recorded in repository release manifest.'
      );
    }
  };

  // Toggle Doc Section
  const handleToggleDocSection = (sectionId: string) => {
    sound.playClick();
    setSelectedDocSections((prev) => {
      const next = prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId];
      onUpdateState({
        selectedDocSections: next,
        documentationCoveragePct: Math.round((next.length / ENTERPRISE_CATALOG_SECTIONS.length) * 100),
      });
      return next;
    });
  };

  // Publish Catalog
  const handlePublishCatalog = () => {
    sound.playSystemClearance();
    setCatalogPublished(true);
    onUpdateState({
      catalogPublished: true,
      selectedDocSections,
      documentationCoveragePct: docCoveragePct,
    });
    if (onNotifyDesktop) {
      onNotifyDesktop(
        'Developer Portal Catalog Published',
        `Enterprise documentation package live with ${docCoveragePct}% coverage across APIs, schemas, and runbooks.`
      );
    }
  };

  // Final Governance Decision Submit
  const handleCommitFinalDecision = () => {
    if (!selectedDecision) return;
    sound.playSystemClearance();
    setDecisionCommitted(true);

    const scorecard = computeChapter10Score({
      ...chapter10State,
      decisionChosen: selectedDecision,
      repoAuditCompleted: auditSubmitted,
      selectedRepoFiles: selectedFilesToRetain,
      selectedVersion: chosenVersion,
      versionConfirmed,
      selectedDocSections,
      catalogPublished,
      documentationCoveragePct: docCoveragePct,
      completed: true,
    });

    onUpdateState({
      decisionChosen: selectedDecision,
      completed: true,
      scorecard,
      timelineTimestamp: '27:00',
    });

    if (onNotifyDesktop) {
      onNotifyDesktop(
        selectedDecision === 'choice_b'
          ? 'Release Governance Approved!'
          : 'Technical Debt Warning',
        selectedDecision === 'choice_b'
          ? 'Release v1.0.0 tagged and centralized in the developer portal. Release Architect achievement unlocked!'
          : 'Short-term feature shortcut selected. Knowledge silos remain unresolved.'
      );
    }

    onOpenScorecard();
  };

  return (
    <div className="h-full flex flex-col bg-[#090d16] text-slate-100 font-sans select-none overflow-hidden">
      {/* ── TOP HEADER / PORTAL NAVIGATION BAR ── */}
      <header className="px-5 py-3 border-b border-slate-800 bg-[#0d1424]/90 backdrop-blur flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-lg border border-cyan-400/40">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                INTERNAL DEVELOPER PORTAL · BACKSTAGE CATALOG
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {chosenVersion || 'v1.0.0'}
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{CHAPTER10_PROJECT_NAME} — Engineering Release & Documentation Suite</span>
            </h1>
          </div>
        </div>

        {/* Global Progress & Actions */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">25:00–27:00 Post-Launch Stabilization</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
            <Layers className="w-3.5 h-3.5" />
            <span>Coverage: {docCoveragePct}%</span>
          </div>

          {chapter10State.completed && (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40 transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </header>

      {/* ── SUB-HEADER TABS (INSPIRED BY HARNESS DEVELOPER PORTAL) ── */}
      <div className="bg-[#0b101c] border-b border-slate-800/80 px-6 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => handleTabChange('repo_audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'repo_audit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>1. Repository Audit</span>
            {auditSubmitted && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />}
          </button>

          <button
            onClick={() => handleTabChange('versioning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'versioning'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>2. Semantic Versioning</span>
            {versionConfirmed && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />}
          </button>

          <button
            onClick={() => handleTabChange('catalog')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. Developer Portal Catalog</span>
            {catalogPublished && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />}
          </button>

          <button
            onClick={() => handleTabChange('governance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Release Governance Gate</span>
            {decisionCommitted && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Single Source of Truth Mandate</span>
        </div>
      </div>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: REPOSITORY AUDIT & CLEANUP                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'repo_audit' && (
          <div className="space-y-6">
            {/* Context Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#111927] to-[#142337] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    ASSIGNMENT 1 · REPOSITORY AUDIT (+5 BONUS)
                  </span>
                  <span className="text-xs text-slate-400">Task 1 · Identify Documentation Gaps</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  Audit the Engineering Repository & Isolate Authoritative Documentation
                </h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Alex's team rushed to meet release deadlines, creating duplicate specs, unversioned diagrams, and scratchpad notes. Review each file below, inspect the content snippets, and select which files must be retained as the single source of truth vs. deprecated.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleSubmitAudit}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-lg ${
                    auditSubmitted
                      ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-200'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 shadow-cyan-900/40'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{auditSubmitted ? 'Audit Re-verified (+5 Bonus)' : 'Submit Repository Audit'}</span>
                </button>
              </div>
            </div>

            {/* Split View: Left File List / Right File Content Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Repository File Table */}
              <div className="lg:col-span-6 space-y-2.5">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Repository Files ({REPO_FILES_MANIFEST.length} items)
                  </span>
                  <span className="text-xs text-slate-400">
                    Selected: <strong className="text-cyan-400 font-mono">{selectedFilesToRetain.length}</strong> / 8
                  </span>
                </div>

                <div className="space-y-2">
                  {REPO_FILES_MANIFEST.map((file) => {
                    const isSelected = selectedFilesToRetain.includes(file.id);
                    const isPreviewed = selectedFileForPreview.id === file.id;

                    return (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFileForPreview(file)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isPreviewed
                            ? 'bg-[#152238] border-cyan-400/70 shadow-md ring-1 ring-cyan-500/40'
                            : 'bg-[#0e1626]/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFileRetention(file.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white font-mono truncate">
                                {file.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                  file.status === 'duplicate_candidate'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : file.status === 'obsolete_candidate'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : file.status === 'unverified'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {file.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {file.summary}
                            </div>
                          </div>
                        </div>

                        <div className="text-right pl-3 shrink-0 text-[10px] font-mono text-slate-400">
                          <div>{file.size}</div>
                          <div className="text-slate-500">{file.lastModified}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Interactive File Content & Audit Inspector */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 rounded-2xl bg-[#0f1728] border border-cyan-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono text-xs font-bold text-white">
                        {selectedFileForPreview.path}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        onClick={() => handleToggleFileRetention(selectedFileForPreview.id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                          selectedFilesToRetain.includes(selectedFileForPreview.id)
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {selectedFilesToRetain.includes(selectedFileForPreview.id)
                          ? '✓ Included in Release'
                          : '+ Include in Release'}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Author:</span>
                      <div className="text-slate-200 font-bold truncate">@{selectedFileForPreview.author}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Action Guidance:</span>
                      <div
                        className={`font-bold capitalize ${
                          selectedFileForPreview.recommendedAction === 'retain'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {selectedFileForPreview.recommendedAction}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Category:</span>
                      <div className="text-cyan-300 font-bold uppercase text-[10px]">{selectedFileForPreview.category}</div>
                    </div>
                  </div>

                  {/* Content Snippet */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      File Inspection Snippet
                    </span>
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto shadow-inner">
                      {selectedFileForPreview.contentSnippet}
                    </pre>
                  </div>

                  {/* Senior PM Insight */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 font-mono text-[11px]">Senior PM Governance Rule:</strong>{' '}
                      A filename alone cannot establish which document is authoritative. Review duplicates before deletion, merge valid deltas, and archive scratchpad tokens to prevent security leaks.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SEMANTIC VERSIONING CONSOLE                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'versioning' && (
          <div className="space-y-6">
            {/* Context Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#161226] to-[#1f1938] border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    ASSIGNMENT 2 · VERSION CONTROL DECISION (+5 BONUS)
                  </span>
                  <span className="text-xs text-slate-400">Task 2 · Semantic Versioning Tag</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  Establish the Official Release Tag: v0.9.9, v1.0.0, or v2.0.0?
                </h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Alex asks: <span className="italic">"We need to tag the repository before closing this sprint. Should we release it as v0.9.9, v1.0.0, or v2.0.0?"</span> Software release numbers carry legal, contractual, and technical meaning across enterprise organizations.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleConfirmVersion}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-lg ${
                    versionConfirmed
                      ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-200'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 shadow-purple-900/40'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>{versionConfirmed ? 'Release Version Confirmed (+5 Bonus)' : 'Confirm Release Version'}</span>
                </button>
              </div>
            </div>

            {/* 3 Selectable Version Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(SEMVER_OPTIONS) as SemVerChoice[]).map((key) => {
                const opt = SEMVER_OPTIONS[key];
                const isSelected = chosenVersion === key;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      sound.playClick();
                      setChosenVersion(key);
                      onUpdateState({ selectedVersion: key });
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-[#1b1733] border-purple-400 shadow-xl ring-2 ring-purple-500/50'
                        : 'bg-[#0e1220]/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-white font-mono">
                          {opt.version}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {opt.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="pt-2 border-t border-purple-500/30 text-[11px] font-medium leading-relaxed">
                        <span className={opt.isCorrect ? 'text-emerald-300' : 'text-amber-300'}>
                          {opt.critique}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Semantic Versioning Principles Deep-Dive Card */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  The Semantic Versioning (SemVer) Framework: MAJOR . MINOR . PATCH
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-purple-300 font-bold font-mono">
                    <span>MAJOR (X.0.0)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20">Breaking</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Incompatible API changes. Clients must refactor integration code to upgrade.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-300 font-bold font-mono">
                    <span>MINOR (1.X.0)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20">Feature</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Backward-compatible new functionality added (e.g. Phase 2 Bonus Calculator).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-300 font-bold font-mono">
                    <span>PATCH (1.0.X)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20">Bug Fix</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Backward-compatible bug fixes and security hotfixes (e.g. Chapter 7 memory leak patch).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: ENTERPRISE DEVELOPER PORTAL (WIKI CATALOG)                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Context Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d1f1f] to-[#122e2b] border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                    ASSIGNMENT 3 · KNOWLEDGE MANAGEMENT (+5 BONUS)
                  </span>
                  <span className="text-xs text-slate-400">Task 3 · Centralized Catalog Publication</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  Assemble the Enterprise Internal Developer Portal Package
                </h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Alex asks: <span className="italic">"Jane, what exactly should we publish? Do we just upload the API specifications, or should we include the complete system documentation?"</span> Build a complete catalog that enables any developer to maintain the system independently.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handlePublishCatalog}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-lg ${
                    catalogPublished
                      ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-200'
                      : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white border border-teal-400/40 shadow-teal-900/40'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{catalogPublished ? 'Documentation Package Live (+5 Bonus)' : 'Publish Documentation Package'}</span>
                </button>
              </div>
            </div>

            {/* Coverage Meter Banner */}
            <div className="p-4 rounded-2xl bg-[#0e1624] border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-bold text-teal-300 font-mono text-sm">
                  {docCoveragePct}%
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Enterprise Documentation Coverage</div>
                  <div className="text-[11px] text-slate-400">
                    {selectedDocSections.length} of {ENTERPRISE_CATALOG_SECTIONS.length} essential knowledge domains selected
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${docCoveragePct}%` }}
                />
              </div>
            </div>

            {/* 6 Catalog Sections Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ENTERPRISE_CATALOG_SECTIONS.map((sec) => {
                const isChecked = selectedDocSections.includes(sec.id);

                return (
                  <div
                    key={sec.id}
                    onClick={() => handleToggleDocSection(sec.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      isChecked
                        ? 'bg-[#102426] border-teal-500/60 shadow-md ring-1 ring-teal-500/40'
                        : 'bg-[#0e1626]/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-teal-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white leading-snug">
                          {sec.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-teal-300 bg-teal-950/60 border border-teal-500/30 uppercase shrink-0 ml-2">
                          {sec.docFormat}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {sec.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Learning Note */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-300 font-mono text-[11px]">Senior PM Leadership Insight:</strong>{' '}
                Technical documentation is not merely API endpoints. It must preserve the architecture diagrams, DDL schemas, deployment runbooks, and Architecture Decision Records (ADRs) required to operate and maintain the system beyond the original delivery team.
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: FINAL RELEASE GOVERNANCE DECISION (SCENE 10.2)             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'governance' && (
          <div className="space-y-6">
            {/* Context Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#211b15] to-[#2d2218] border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    SCENE 10.2 · RELEASE GOVERNANCE GATE
                  </span>
                  <span className="text-xs text-slate-400">Final Leadership Decision</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  Alex's Final Dilemma: Shortcut or Formal Release Governance?
                </h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Alex raises one final concern: <span className="italic">"Jane, the documentation is almost ready. But publishing it and tagging the repository will take additional time. We could skip the formal process and move directly to the next feature sprint."</span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleCommitFinalDecision}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-950 border border-emerald-400/40"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Finalize Release & View Scorecard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2 Strategic Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Choice A */}
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedDecision('choice_a');
                }}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selectedDecision === 'choice_a'
                    ? 'bg-[#1f1618] border-rose-500/70 shadow-xl ring-2 ring-rose-500/50'
                    : 'bg-[#0f1422]/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      Option A · Feature Shortcut
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      Gov: -30 · Vel: -10
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {CHAPTER10_DECISION_OPTIONS.choice_a.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-rose-500 pl-3">
                    {CHAPTER10_DECISION_OPTIONS.choice_a.quote}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Prioritizes immediate sprint velocity over long-term maintainability. Skips version tagging and leaves documentation scattered across scratchpads.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-rose-300/90 leading-relaxed">
                  <strong>Consequence:</strong> Knowledge silos form. Future onboarding takes weeks, and original devs are interrupted constantly to explain undocumented code.
                </div>
              </div>

              {/* Choice B */}
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedDecision('choice_b');
                }}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selectedDecision === 'choice_b'
                    ? 'bg-[#102422] border-emerald-500/70 shadow-xl ring-2 ring-emerald-500/50'
                    : 'bg-[#0f1422]/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      Option B · Release Governance (Recommended)
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Gov: +30 · Risk: +20
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {CHAPTER10_DECISION_OPTIONS.choice_b.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                    {CHAPTER10_DECISION_OPTIONS.choice_b.quote}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tags release as v1.0.0, establishes authoritative single source of truth, and publishes a complete developer portal catalog to ensure product outlasts original team.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-emerald-300/90 leading-relaxed">
                  <strong>Consequence:</strong> Release v1.0.0 is officially tagged. Future teams onboard seamlessly, and institutional knowledge is permanently secured.
                </div>
              </div>
            </div>

            {/* Achievement Preview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow">
                  <Award className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Unlockable Achievement: Release Architect</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      +15 Bonus Available
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Awarded for establishing formal v1.0.0 release tagging, 100% developer portal coverage, and single-source-of-truth repo audit.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
