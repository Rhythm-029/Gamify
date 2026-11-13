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

// ── File icon helper ──────────────────────────────────────────────────────────
function FileIcon({ category, className = 'w-4 h-4' }: { category: string; className?: string }) {
  const map: Record<string, React.ReactNode> = {
    api: <Code2 className={`${className} text-blue-400`} />,
    architecture: <Server className={`${className} text-purple-400`} />,
    database: <Database className={`${className} text-orange-400`} />,
    ops: <Terminal className={`${className} text-emerald-400`} />,
    scratchpad: <FileText className={`${className} text-slate-400`} />,
  };
  return <>{map[category] ?? <FileText className={`${className} text-slate-400`} />}</>;
}

// ── Status badge helper ───────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  duplicate_candidate: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  obsolete_candidate: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  unverified: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  needs_review: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  needs_versioning: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
};

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

  // ── Tab definitions ──────────────────────────────────────────────────────────
  const tabs: Array<{
    id: Chapter10PortalTab;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    done: boolean;
    accent: string;
    activeBg: string;
    activeBorder: string;
    activeText: string;
  }> = [
    {
      id: 'repo_audit',
      label: '1. Repository Audit',
      shortLabel: 'Repo Audit',
      icon: <FolderGit2 className="w-4 h-4" />,
      done: auditSubmitted,
      accent: 'cyan',
      activeBg: 'bg-cyan-500/10',
      activeBorder: 'border-b-2 border-cyan-400',
      activeText: 'text-cyan-300',
    },
    {
      id: 'versioning',
      label: '2. Semantic Versioning',
      shortLabel: 'Versioning',
      icon: <GitBranch className="w-4 h-4" />,
      done: versionConfirmed,
      accent: 'purple',
      activeBg: 'bg-purple-500/10',
      activeBorder: 'border-b-2 border-purple-400',
      activeText: 'text-purple-300',
    },
    {
      id: 'catalog',
      label: '3. Developer Portal',
      shortLabel: 'Catalog',
      icon: <BookOpen className="w-4 h-4" />,
      done: catalogPublished,
      accent: 'teal',
      activeBg: 'bg-teal-500/10',
      activeBorder: 'border-b-2 border-teal-400',
      activeText: 'text-teal-300',
    },
    {
      id: 'governance',
      label: '4. Release Governance',
      shortLabel: 'Governance',
      icon: <ShieldCheck className="w-4 h-4" />,
      done: decisionCommitted,
      accent: 'amber',
      activeBg: 'bg-amber-500/10',
      activeBorder: 'border-b-2 border-amber-400',
      activeText: 'text-amber-300',
    },
  ];

  const activeTabDef = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="h-full flex flex-col bg-[#07090f] text-slate-100 font-sans select-none overflow-hidden">

      {/* ── TOP HEADER ───────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-5 py-2.5 bg-[#0c1120] border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a2540] border border-slate-700 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
              Internal Developer Portal · Backstage Catalog
            </div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              {CHAPTER10_PROJECT_NAME} — Engineering Release &amp; Documentation Suite
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Version badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111b2e] border border-slate-700 font-mono text-slate-300 text-[11px]">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>{chosenVersion || 'untagged'}</span>
          </div>

          {/* Timeline */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111b2e] border border-slate-700 text-slate-400 text-[11px] font-mono">
            <Clock className="w-3 h-3" />
            <span>25:00–27:00</span>
          </div>

          {/* Coverage */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111b2e] border border-slate-700 text-slate-400 text-[11px] font-mono">
            <Layers className="w-3 h-3 text-teal-400" />
            <span>Coverage: {docCoveragePct}%</span>
          </div>

          {chapter10State.completed && (
            <button
              onClick={onOpenScorecard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </header>

      {/* ── TAB NAVIGATION ───────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#0a0e1a] border-b border-slate-800 flex items-stretch justify-between">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all cursor-pointer border-b-2
                  ${isActive
                    ? `${tab.activeText} border-current bg-[#0d1526]`
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/40'
                  }
                `}
              >
                <span className={isActive ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.done && (
                  <span className="ml-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right status pill */}
        <div className="hidden md:flex items-center px-4 gap-1.5 text-[11px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Single Source of Truth Mandate</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: REPOSITORY AUDIT                                             */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'repo_audit' && (
          <div className="h-full flex flex-col">
            {/* Assignment banner */}
            <div className="shrink-0 px-5 py-3 bg-[#0c1526] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 uppercase tracking-wide">
                    Assignment 1 · Repository Audit
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">+5 Bonus</span>
                </div>
                <h2 className="text-sm font-semibold text-white">
                  Audit the Engineering Repository &amp; Isolate Authoritative Documentation
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Review each file, inspect the content snippets, and select which must be retained as the single source of truth vs. deprecated.
                </p>
              </div>
              <button
                onClick={handleSubmitAudit}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer border ${
                  auditSubmitted
                    ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300'
                    : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{auditSubmitted ? 'Audit Submitted (+5 Bonus)' : 'Submit Repository Audit'}</span>
              </button>
            </div>

            {/* Split: file list + preview */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">

              {/* LEFT: file tree */}
              <div className="overflow-y-auto">
                {/* Tree header */}
                <div className="sticky top-0 z-10 px-4 py-2 bg-[#0a0e1a] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>project-amigo / docs</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedFilesToRetain.length}/{REPO_FILES_MANIFEST.length} retained
                  </span>
                </div>

                {/* File rows */}
                <div className="py-1">
                  {REPO_FILES_MANIFEST.map((file, idx) => {
                    const isSelected = selectedFilesToRetain.includes(file.id);
                    const isPreviewed = selectedFileForPreview.id === file.id;
                    const statusStyle = STATUS_STYLES[file.status] ?? 'bg-slate-700/40 text-slate-400 border-slate-700';

                    return (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFileForPreview(file)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-l-2 transition-all group ${
                          isPreviewed
                            ? 'bg-[#0f1d35] border-cyan-400'
                            : 'border-transparent hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Retain checkbox */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleFileRetention(file.id); }}
                          className="shrink-0 cursor-pointer"
                          title={isSelected ? 'Remove from release' : 'Include in release'}
                        >
                          {isSelected
                            ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                            : <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                          }
                        </button>

                        {/* File icon */}
                        <div className="shrink-0">
                          <FileIcon category={file.category} className="w-4 h-4" />
                        </div>

                        {/* Name + path */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-mono font-medium truncate ${isPreviewed ? 'text-white' : 'text-slate-200'}`}>
                              {file.name}
                            </span>
                            {/* Warning badge for problem files */}
                            {(file.status === 'duplicate_candidate' || file.status === 'obsolete_candidate' || file.status === 'unverified') && (
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                            <span className={`px-1.5 py-px rounded text-[9px] font-mono font-semibold uppercase border ${statusStyle}`}>
                              {file.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                            {file.path}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="shrink-0 text-right text-[10px] font-mono text-slate-500 hidden sm:block">
                          <div>{file.size}</div>
                          <div>{file.lastModified}</div>
                        </div>

                        <ChevronRight className={`shrink-0 w-3.5 h-3.5 transition-colors ${isPreviewed ? 'text-cyan-400' : 'text-slate-700 group-hover:text-slate-500'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: file inspector */}
              <div className="overflow-y-auto bg-[#09111f]">
                {/* Inspector header */}
                <div className="sticky top-0 z-10 px-4 py-2.5 bg-[#0a0e1a] border-b border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileIcon category={selectedFileForPreview.category} className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-xs text-slate-300 truncate">
                      {selectedFileForPreview.path}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleFileRetention(selectedFileForPreview.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer border ${
                      selectedFilesToRetain.includes(selectedFileForPreview.id)
                        ? 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50 hover:bg-cyan-900/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {selectedFilesToRetain.includes(selectedFileForPreview.id)
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /><span>Included</span></>
                      : <><span>+ Include in Release</span></>
                    }
                  </button>
                </div>

                {/* Metadata */}
                <div className="px-4 py-3 border-b border-slate-800/60 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Author', value: `@${selectedFileForPreview.author}`, cls: 'text-slate-200' },
                    {
                      label: 'Recommended',
                      value: selectedFileForPreview.recommendedAction,
                      cls: selectedFileForPreview.recommendedAction === 'retain' ? 'text-emerald-400' : 'text-amber-400',
                    },
                    { label: 'Category', value: selectedFileForPreview.category.toUpperCase(), cls: 'text-sky-300' },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="p-2.5 rounded bg-[#0d1526] border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-500 mb-1">{label}</div>
                      <div className={`text-xs font-semibold font-mono capitalize ${cls}`}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="px-4 py-3 border-b border-slate-800/60">
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-1.5">Summary</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedFileForPreview.summary}</p>
                </div>

                {/* Code snippet */}
                <div className="px-4 py-3 border-b border-slate-800/60">
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-1.5">File Inspection Snippet</div>
                  <pre className="p-3.5 rounded bg-[#060a14] border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                    {selectedFileForPreview.contentSnippet}
                  </pre>
                </div>

                {/* Insight */}
                <div className="px-4 py-3">
                  <div className="p-3 rounded bg-cyan-950/20 border border-cyan-800/30 flex items-start gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <span className="text-cyan-300 font-semibold">PM Governance Rule: </span>
                      A filename alone cannot establish which document is authoritative. Review duplicates before deletion, merge valid deltas, and archive scratchpad tokens to prevent security leaks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SEMANTIC VERSIONING                                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'versioning' && (
          <div className="p-5 sm:p-6 space-y-5 max-w-5xl mx-auto w-full">
            {/* Assignment banner */}
            <div className="p-4 rounded-lg bg-[#120e22] border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25 uppercase tracking-wide">
                    Assignment 2 · Semantic Versioning
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">+5 Bonus</span>
                </div>
                <h2 className="text-sm font-semibold text-white">
                  Establish the Official Release Tag: v0.9.9, v1.0.0, or v2.0.0?
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Alex asks: <em>"We need to tag the repository before closing this sprint. Should we release as v0.9.9, v1.0.0, or v2.0.0?"</em> Software release numbers carry legal, contractual, and technical meaning.
                </p>
              </div>
              <button
                onClick={handleConfirmVersion}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer border ${
                  versionConfirmed
                    ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300'
                    : 'bg-purple-600 hover:bg-purple-500 border-purple-500 text-white shadow-sm'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>{versionConfirmed ? 'Version Confirmed (+5 Bonus)' : 'Confirm Release Version'}</span>
              </button>
            </div>

            {/* Version picker cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(SEMVER_OPTIONS) as SemVerChoice[]).map((key) => {
                const opt = SEMVER_OPTIONS[key];
                const isSelected = chosenVersion === key;

                return (
                  <div
                    key={key}
                    onClick={() => { sound.playClick(); setChosenVersion(key); onUpdateState({ selectedVersion: key }); }}
                    className={`relative p-5 rounded-lg border cursor-pointer transition-all flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-[#160f2a] border-purple-500 shadow-lg shadow-purple-950/40'
                        : 'bg-[#0d1120] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Selection radio indicator */}
                    <div className="absolute top-4 right-4">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-400' : 'border-slate-700'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                      </div>
                    </div>

                    <div className="space-y-1 pr-5">
                      <div className="text-2xl font-black text-white font-mono">{opt.version}</div>
                      <div className={`text-[10px] font-mono font-semibold uppercase tracking-wide ${isSelected ? 'text-purple-300' : 'text-slate-500'}`}>
                        {opt.type}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {opt.description}
                    </p>

                    {isSelected && (
                      <div className={`pt-3 border-t ${opt.isCorrect ? 'border-emerald-800/50' : 'border-amber-800/50'}`}>
                        <p className={`text-[11px] leading-relaxed ${opt.isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {opt.isCorrect
                            ? <><CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />{opt.critique}</>
                            : <><AlertTriangle className="inline w-3.5 h-3.5 mr-1" />{opt.critique}</>
                          }
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SemVer reference card */}
            <div className="p-4 rounded-lg bg-[#0d1120] border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  SemVer Framework: MAJOR . MINOR . PATCH
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'MAJOR (X.0.0)', badge: 'Breaking', color: 'purple', desc: 'Incompatible API changes. Clients must refactor integration code to upgrade.' },
                  { label: 'MINOR (1.X.0)', badge: 'Feature', color: 'sky', desc: 'Backward-compatible new functionality added (e.g. Phase 2 Bonus Calculator).' },
                  { label: 'PATCH (1.0.X)', badge: 'Bug Fix', color: 'emerald', desc: 'Backward-compatible bug fixes and security hotfixes.' },
                ].map(({ label, badge, color, desc }) => (
                  <div key={label} className="p-3 rounded bg-[#070b17] border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono font-bold text-${color}-300`}>{label}</span>
                      <span className={`px-1.5 py-px rounded text-[9px] font-mono bg-${color}-500/15 text-${color}-300 border border-${color}-500/20`}>
                        {badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: DEVELOPER PORTAL CATALOG                                     */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'catalog' && (
          <div className="p-5 sm:p-6 space-y-5 max-w-5xl mx-auto w-full">
            {/* Assignment banner */}
            <div className="p-4 rounded-lg bg-[#0b1a1a] border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/25 uppercase tracking-wide">
                    Assignment 3 · Knowledge Management
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">+5 Bonus</span>
                </div>
                <h2 className="text-sm font-semibold text-white">
                  Assemble the Enterprise Internal Developer Portal Package
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Alex asks: <em>"What exactly should we publish? Just the API specs, or the complete documentation?"</em> Build a catalog that enables any developer to maintain the system independently.
                </p>
              </div>
              <button
                onClick={handlePublishCatalog}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer border ${
                  catalogPublished
                    ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300'
                    : 'bg-teal-600 hover:bg-teal-500 border-teal-500 text-white shadow-sm'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{catalogPublished ? 'Catalog Published (+5 Bonus)' : 'Publish Documentation Package'}</span>
              </button>
            </div>

            {/* Coverage meter */}
            <div className="p-4 rounded-lg bg-[#0d1120] border border-slate-800 flex items-center gap-4">
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center rounded-full border-2 border-teal-600/50 bg-teal-950/30">
                <span className="text-sm font-black text-teal-300 font-mono leading-none">{docCoveragePct}%</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">Enterprise Documentation Coverage</span>
                  <span className="text-[11px] font-mono text-slate-500">{selectedDocSections.length}/{ENTERPRISE_CATALOG_SECTIONS.length} domains</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${docCoveragePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Catalog section checklist — two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ENTERPRISE_CATALOG_SECTIONS.map((sec) => {
                const isChecked = selectedDocSections.includes(sec.id);
                return (
                  <div
                    key={sec.id}
                    onClick={() => handleToggleDocSection(sec.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-[#0a1f1e] border-teal-700/60 shadow-sm'
                        : 'bg-[#0d1120] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="mt-0.5 shrink-0">
                      {isChecked
                        ? <CheckSquare className="w-4.5 h-4.5 text-teal-400" style={{ width: 18, height: 18 }} />
                        : <Square className="w-4.5 h-4.5 text-slate-600" style={{ width: 18, height: 18 }} />
                      }
                    </div>

                    {/* Content */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold leading-snug ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                          {sec.title}
                        </span>
                        <span className={`shrink-0 px-1.5 py-px rounded text-[9px] font-mono border ${
                          isChecked
                            ? 'bg-teal-900/40 text-teal-300 border-teal-700/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {sec.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {sec.description}
                      </p>
                      <div className="text-[10px] font-mono text-slate-600">{sec.docFormat}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Learning note */}
            <div className="p-3.5 rounded-lg bg-[#0d1120] border border-slate-800 flex items-start gap-2.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-teal-300 font-semibold">Senior PM Leadership Insight: </span>
                Technical documentation is not merely API endpoints. It must preserve architecture diagrams, DDL schemas, deployment runbooks, and Architecture Decision Records required to operate the system beyond the original delivery team.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: RELEASE GOVERNANCE GATE                                      */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'governance' && (
          <div className="p-5 sm:p-6 space-y-5 max-w-5xl mx-auto w-full">
            {/* Assignment banner */}
            <div className="p-4 rounded-lg bg-[#191208] border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase tracking-wide">
                    Scene 10.2 · Release Governance Gate
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Final Decision</span>
                </div>
                <h2 className="text-sm font-semibold text-white">
                  Alex's Final Dilemma: Shortcut or Formal Release Governance?
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Alex raises one final concern: <em>"Jane, publishing documentation and tagging the repository will take additional time. We could skip the formal process and move directly to the next feature sprint."</em>
                </p>
              </div>
              <button
                onClick={handleCommitFinalDecision}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm border border-emerald-500"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Finalize Release &amp; View Scorecard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Decision cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Choice A */}
              <div
                onClick={() => { sound.playClick(); setSelectedDecision('choice_a'); }}
                className={`relative p-5 rounded-lg border cursor-pointer transition-all flex flex-col gap-4 ${
                  selectedDecision === 'choice_a'
                    ? 'bg-[#1a0e10] border-rose-600/70 shadow-lg shadow-rose-950/30'
                    : 'bg-[#0d1120] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Radio */}
                <div className="absolute top-4 right-4">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedDecision === 'choice_a' ? 'border-rose-400' : 'border-slate-700'}`}>
                    {selectedDecision === 'choice_a' && <div className="w-2 h-2 rounded-full bg-rose-400" />}
                  </div>
                </div>

                <div className="space-y-1 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                      Option A
                    </span>
                    <span className="text-[11px] font-mono text-rose-400">Gov: −30 · Vel: −10</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{CHAPTER10_DECISION_OPTIONS.choice_a.title}</h3>
                </div>

                <blockquote className="pl-3 border-l-2 border-rose-600 text-xs text-slate-300 italic leading-relaxed">
                  {CHAPTER10_DECISION_OPTIONS.choice_a.quote}
                </blockquote>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Prioritizes immediate sprint velocity over long-term maintainability. Skips version tagging and leaves documentation scattered across scratchpads.
                </p>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-rose-300/80 leading-relaxed">
                  <span className="font-semibold text-rose-300">Consequence: </span>
                  Knowledge silos form. Future onboarding takes weeks, and original devs are interrupted constantly to explain undocumented code.
                </div>
              </div>

              {/* Choice B */}
              <div
                onClick={() => { sound.playClick(); setSelectedDecision('choice_b'); }}
                className={`relative p-5 rounded-lg border cursor-pointer transition-all flex flex-col gap-4 ${
                  selectedDecision === 'choice_b'
                    ? 'bg-[#081a14] border-emerald-600/70 shadow-lg shadow-emerald-950/30'
                    : 'bg-[#0d1120] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Radio */}
                <div className="absolute top-4 right-4">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedDecision === 'choice_b' ? 'border-emerald-400' : 'border-slate-700'}`}>
                    {selectedDecision === 'choice_b' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                </div>

                <div className="space-y-1 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 uppercase">
                      Option B · Recommended
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">Gov: +30 · Risk: +20</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{CHAPTER10_DECISION_OPTIONS.choice_b.title}</h3>
                </div>

                <blockquote className="pl-3 border-l-2 border-emerald-600 text-xs text-slate-300 italic leading-relaxed">
                  {CHAPTER10_DECISION_OPTIONS.choice_b.quote}
                </blockquote>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Tags release as v1.0.0, establishes authoritative single source of truth, and publishes a complete developer portal catalog to ensure product outlasts original team.
                </p>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-emerald-300/80 leading-relaxed">
                  <span className="font-semibold text-emerald-300">Consequence: </span>
                  Release v1.0.0 is officially tagged. Future teams onboard seamlessly, and institutional knowledge is permanently secured.
                </div>
              </div>
            </div>

            {/* Achievement preview */}
            <div className="p-4 rounded-lg bg-[#0d1120] border border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-white">Unlockable Achievement: Release Architect</span>
                  <span className="px-1.5 py-px rounded text-[9px] font-mono bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">+15 Bonus Available</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Awarded for establishing formal v1.0.0 release tagging, 100% developer portal coverage, and single-source-of-truth repo audit.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
