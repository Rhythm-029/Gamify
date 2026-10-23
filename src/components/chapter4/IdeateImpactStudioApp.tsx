import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  BarChart3,
  GitBranch,
  FileCheck2,
  Plus,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Home,
  Mail,
  Users,
  FolderGit2,
  HelpCircle,
  Calculator,
  Languages,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight,
  Shield,
  Send,
  Loader2,
} from 'lucide-react';
import type {
  Chapter4State,
  Chapter4ReleasePhase,
  Chapter4ScheduleAssessment,
  Chapter4TechnicalDependency,
  Chapter4SecurityAssessment,
  Chapter4BusinessValueAssessment,
  Chapter4ApprovalAssessment,
  Chapter4FinalRecommendation,
} from '../../types/chapter4';
import {
  CHANGE_REQUESTS_LIST,
  INITIAL_RELEASE_FEATURES,
  SCHEDULE_ASSESSMENT_OPTIONS,
  TECHNICAL_DEPENDENCY_OPTIONS,
  SECURITY_ASSESSMENT_OPTIONS,
  BUSINESS_VALUE_OPTIONS,
  APPROVAL_ASSESSMENT_OPTIONS,
  FINAL_RECOMMENDATION_OPTIONS,
  computeChapter4Score,
} from '../../data/chapter4Data';
import { sound } from '../onboarding/SoundEngine';

interface IdeateImpactStudioAppProps {
  chapter4State: Chapter4State;
  onUpdateState: (updater: Partial<Chapter4State> | ((prev: Chapter4State) => Chapter4State)) => void;
  onReturnToMeeting: () => void;
  onSubmitCompleteAnalysis: () => void;
}

export const IdeateImpactStudioApp: React.FC<IdeateImpactStudioAppProps> = ({
  chapter4State,
  onUpdateState,
  onReturnToMeeting,
  onSubmitCompleteAnalysis,
}) => {
  // Top nav tabs
  const [activeTab, setActiveTab] = useState<'change_requests' | 'release_plan' | 'impact_analysis' | 'dependencies' | 'summary'>(
    'change_requests'
  );

  // Left CR list filter
  const [crFilter, setCrFilter] = useState<'all' | 'new' | 'under_review'>('all');

  // Active CR selection (default CR-017)
  const selectedCrId = chapter4State.selectedChangeRequestId || 'CR-017';
  const selectedCr = CHANGE_REQUESTS_LIST.find((c) => c.id === selectedCrId) || CHANGE_REQUESTS_LIST[0];

  // Drag and drop state
  const [draggedFeatureId, setDraggedFeatureId] = useState<string | null>(null);

  // Submission review modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Dropdown open states for the 5 Impact Analysis areas
  const [openDropdown, setOpenDropdown] = useState<
    'timeline' | 'dependencies' | 'security' | 'business_value' | 'approval' | null
  >(null);

  // Current feature placements
  const featurePlacement = chapter4State.featurePlacement || {};

  // Features in Phase 1
  const phase1Features = INITIAL_RELEASE_FEATURES.filter(
    (f) => (featurePlacement[f.id] || f.defaultPhase) === 'phase_1'
  );

  // Features in Phase 2
  const phase2Features = INITIAL_RELEASE_FEATURES.filter(
    (f) => (featurePlacement[f.id] || f.defaultPhase) === 'phase_2'
  );

  // Features Unscheduled
  const unscheduledFeatures = INITIAL_RELEASE_FEATURES.filter(
    (f) => (featurePlacement[f.id] || f.defaultPhase) === 'unscheduled'
  );

  // Move feature handler
  const moveFeature = (featureId: string, targetPhase: Chapter4ReleasePhase) => {
    sound.playClick();
    const updated = { ...featurePlacement, [featureId]: targetPhase };
    onUpdateState({
      featurePlacement: updated,
      task1Complete: true,
    });
  };

  // Reset Plan handler
  const handleResetPlan = () => {
    sound.playClick();
    const resetPlacements: Record<string, Chapter4ReleasePhase> = {};
    INITIAL_RELEASE_FEATURES.forEach((f) => {
      resetPlacements[f.id] = f.defaultPhase;
    });
    onUpdateState({
      featurePlacement: resetPlacements,
      task1Complete: false,
    });
  };

  // Toggle Technical Dependency (multi-select)
  const handleToggleDependency = (depId: Chapter4TechnicalDependency) => {
    sound.playClick();
    const current = chapter4State.assessmentDependencies || [];
    const updated = current.includes(depId)
      ? current.filter((d) => d !== depId)
      : [...current, depId];
    onUpdateState({
      assessmentDependencies: updated,
    });
  };

  // Check if all 5 assessments are completed
  const isAssessmentComplete =
    chapter4State.assessmentSchedule !== null &&
    chapter4State.assessmentDependencies.length > 0 &&
    chapter4State.assessmentSecurity !== null &&
    chapter4State.assessmentBusinessValue !== null &&
    chapter4State.assessmentApproval !== null;

  // Open submission modal
  const handleOpenSubmissionModal = () => {
    sound.playClick();
    setShowSubmitModal(true);
  };

  // Submit Final Recommendation
  const handleConfirmSubmit = async () => {
    if (!chapter4State.finalRecommendation) {
      setSubmissionError('Please select a final recommendation before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      sound.playSystemClearance();
    } catch {
      // Sound failure should never block submission
    }

    try {
      // Precompute local deterministic scorecard as immediate reliable baseline
      let evaluationResult = computeChapter4Score(chapter4State);

      // Attempt backend evaluation with an AbortController timeout of 2.5s
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch('/api/game/chapter4/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            session_id: 'current_session',
            sessionId: 'current_session',
            state: {
              featurePlacement: chapter4State.featurePlacement,
              assessmentSchedule: chapter4State.assessmentSchedule,
              assessmentDependencies: chapter4State.assessmentDependencies,
              assessmentSecurity: chapter4State.assessmentSecurity,
              assessmentBusinessValue: chapter4State.assessmentBusinessValue,
              assessmentApproval: chapter4State.assessmentApproval,
              finalRecommendation: chapter4State.finalRecommendation,
              writtenJustification: chapter4State.writtenJustification,
            },
          }),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data?.scorecard) {
            evaluationResult = data.scorecard;
          }
        }
      } catch (netErr) {
        // Backend timeout or offline — continue seamlessly with local evaluation
        console.warn('Backend evaluation call timed out or failed, using deterministic evaluation:', netErr);
      }

      // Update state
      onUpdateState({
        submitted: true,
        completed: true,
        cr017Status:
          evaluationResult.outcomeType === 'strong'
            ? 'Impact Assessment in Progress'
            : evaluationResult.outcomeType === 'mixed'
            ? 'Further Assessment Required'
            : 'Assessment Incomplete',
        scorecard: {
          ...evaluationResult,
          shown: true,
        },
      });

      setIsSubmitting(false);
      setShowSubmitModal(false);

      // Return to Teams meeting where Aarav, Sophia, and Daniel give their reactions
      onSubmitCompleteAnalysis();
      onReturnToMeeting();
    } catch (err) {
      console.error('Fatal submission error:', err);
      // Fallback deterministic calculation if any unexpected error occurs
      const localResult = computeChapter4Score(chapter4State);
      onUpdateState({
        submitted: true,
        completed: true,
        cr017Status:
          localResult.outcomeType === 'strong'
            ? 'Impact Assessment in Progress'
            : localResult.outcomeType === 'mixed'
            ? 'Further Assessment Required'
            : 'Assessment Incomplete',
        scorecard: {
          ...localResult,
          shown: true,
        },
      });
      setIsSubmitting(false);
      setShowSubmitModal(false);
      onSubmitCompleteAnalysis();
      onReturnToMeeting();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper labels for pills
  const getTimelineLabel = () => {
    const val = chapter4State.assessmentSchedule;
    if (!val) return 'Needs validation';
    const opt = SCHEDULE_ASSESSMENT_OPTIONS.find((o) => o.id === val);
    return opt?.label || 'Needs validation';
  };

  const getDependenciesLabel = () => {
    const deps = chapter4State.assessmentDependencies || [];
    if (deps.length === 0) return 'Needs validation';
    return `${deps.length} selected`;
  };

  const getSecurityLabel = () => {
    const val = chapter4State.assessmentSecurity;
    if (!val) return 'Needs validation';
    const opt = SECURITY_ASSESSMENT_OPTIONS.find((o) => o.id === val);
    return opt?.label.slice(0, 18) + '...' || 'Needs validation';
  };

  const getBusinessValueLabel = () => {
    const val = chapter4State.assessmentBusinessValue;
    if (!val) return 'High';
    if (val === 'balance_and_evaluate') return 'High (Balanced)';
    if (val === 'accept_immediately') return 'High (Unchecked)';
    if (val === 'reject_outright') return 'Low (Rejected)';
    return 'High';
  };

  const getApprovalLabel = () => {
    const val = chapter4State.assessmentApproval;
    if (!val) return 'Pending';
    if (val === 'record_cr_and_validate') return 'Gate Required';
    if (val === 'verbal_request_final') return 'Verbal Only';
    return 'Pending';
  };

  return (
    <div className="flex h-full w-full bg-[#f8fafc] text-slate-800 font-sans select-none overflow-hidden">
      {/* ── LEFT DARK NAVIGATION SIDEBAR (Replicating Reference Screenshot) ── */}
      <div className="w-[72px] bg-[#0f172a] text-slate-400 flex flex-col items-center py-4 justify-between shrink-0 border-r border-slate-800">
        <div className="flex flex-col items-center space-y-6 w-full">
          {/* App Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col items-center space-y-3 w-full">
            <button
              title="Home"
              onClick={() => sound.playClick()}
              className="w-12 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
            >
              <Home className="w-4 h-4" />
              <span className="scale-90 mt-0.5">Home</span>
            </button>

            <button
              title="Mail"
              onClick={() => sound.playClick()}
              className="w-12 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
            >
              <Mail className="w-4 h-4" />
              <span className="scale-90 mt-0.5">Mail</span>
            </button>

            <button
              title="Teams"
              onClick={onReturnToMeeting}
              className="w-12 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
            >
              <Users className="w-4 h-4" />
              <span className="scale-90 mt-0.5">Teams</span>
            </button>

            <button
              title="Calendar"
              onClick={() => sound.playClick()}
              className="w-12 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
            >
              <Calendar className="w-4 h-4" />
              <span className="scale-90 mt-0.5">Calendar</span>
            </button>

            {/* Ideate & Impact Studio Active Item */}
            <div
              title="Ideate & Impact Studio"
              className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex flex-col items-center justify-center text-indigo-300 shadow-sm cursor-pointer text-[9px] font-semibold text-center leading-tight p-1"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 mb-0.5" />
              <span>Studio</span>
            </div>

            <button
              title="Project Hub"
              onClick={() => sound.playClick()}
              className="w-12 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
            >
              <FolderGit2 className="w-4 h-4" />
              <span className="scale-90 mt-0.5 text-center leading-none">Hub</span>
            </button>

            <button
              title="Reports"
              onClick={() => sound.playClick()}
              className="w-12 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="scale-90 mt-0.5">Reports</span>
            </button>
          </div>
        </div>

        {/* Help button */}
        <button
          title="Help"
          onClick={() => sound.playClick()}
          className="w-12 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="scale-90 mt-0.5">Help</span>
        </button>
      </div>

      {/* ── MAIN WORKSPACE AREA ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Header Bar (Matching screenshot) */}
        <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Ideate & Impact Studio</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <span className="text-slate-800 font-semibold">Project Amigo</span>
              <span>|</span>
              <span>HRMS Transformation</span>
              <span>|</span>
              <span className="font-semibold text-slate-700">ICICI Bank</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-300">
              JD
            </div>
          </div>
        </div>

        {/* Top Horizontal Tabs */}
        <div className="h-11 bg-white border-b border-slate-200 px-6 flex items-center space-x-6 shrink-0 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('change_requests')}
            className={`h-full flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'change_requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Change Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('release_plan')}
            className={`h-full flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'release_plan'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Release Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('impact_analysis')}
            className={`h-full flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'impact_analysis'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Impact Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('dependencies')}
            className={`h-full flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'dependencies'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Dependencies</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`h-full flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>
        </div>

        {/* ── 3-COLUMN MAIN WORKSPACE (Exact visual match to screenshot) ── */}
        <div className="flex-1 p-5 grid grid-cols-12 gap-5 min-h-0 overflow-y-auto">
          {/* ════════ COLUMN 1: CHANGE REQUESTS (Span 4) ════════ */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Change Requests</h2>
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
              </div>

              <button
                onClick={() => sound.playClick()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Request</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 mb-3.5 shrink-0 text-xs">
              <button
                onClick={() => setCrFilter('all')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  crFilter === 'all'
                    ? 'bg-slate-200/80 text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All <span className="text-[10px] opacity-75">3</span>
              </button>
              <button
                onClick={() => setCrFilter('new')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  crFilter === 'new'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                New <span className="text-[10px] opacity-75">2</span>
              </button>
              <button
                onClick={() => setCrFilter('under_review')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  crFilter === 'under_review'
                    ? 'bg-slate-200 text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Under Review <span className="text-[10px] opacity-75">1</span>
              </button>
            </div>

            {/* CR Cards List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {CHANGE_REQUESTS_LIST.filter((cr) => {
                if (crFilter === 'new') return cr.badge === 'NEW';
                if (crFilter === 'under_review') return cr.badge === 'UNDER REVIEW';
                return true;
              }).map((cr) => {
                const isSelected = cr.id === selectedCrId;
                return (
                  <div
                    key={cr.id}
                    onClick={() => {
                      sound.playClick();
                      onUpdateState({ selectedChangeRequestId: cr.id });
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-400/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-700">
                        {cr.iconType === 'calculator' && <Calculator className="w-5 h-5 text-indigo-600" />}
                        {cr.iconType === 'language' && <Languages className="w-5 h-5 text-amber-600" />}
                        {cr.iconType === 'upload' && <UploadCloud className="w-5 h-5 text-indigo-500" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{cr.id}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${cr.badgeColor}`}
                          >
                            {cr.badge}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                          {cr.title}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                          {cr.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
                          <span>Requested by: {cr.requestedBy}</span>
                          <span>{cr.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════════ COLUMN 2: RELEASE PLAN (Span 4) ════════ */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Release Plan</h2>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Go-live target:</span>
                <span className="text-slate-900 font-bold">90 days</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3 shrink-0">
              Drag and drop features into the release phases
            </p>

            {/* Unscheduled Banner (if CR-017 is not yet placed) */}
            {unscheduledFeatures.length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Unscheduled Changes
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200/60 text-purple-800">
                    Action Required
                  </span>
                </div>
                {unscheduledFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    className="p-2.5 rounded-lg bg-white border border-purple-200 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Calculator className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{feat.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                          {feat.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => moveFeature(feat.id, 'phase_1')}
                        className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                        title="Add to Phase 1"
                      >
                        + Phase 1
                      </button>
                      <button
                        onClick={() => moveFeature(feat.id, 'phase_2')}
                        className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                        title="Add to Phase 2"
                      >
                        + Phase 2
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Release Columns Split */}
            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0 overflow-y-auto">
              {/* PHASE 1: 90 Day Release */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedFeatureId) moveFeature(draggedFeatureId, 'phase_1');
                }}
                className="flex flex-col rounded-xl bg-slate-50/70 border border-slate-200 p-2.5 h-full overflow-hidden"
              >
                <div className="mb-2 shrink-0">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Phase 1 — 90 Day Release
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Current Sprint
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {phase1Features.length} items
                    </span>
                  </div>
                </div>

                {/* Items Container */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                  {phase1Features.map((feat) => (
                    <div
                      key={feat.id}
                      draggable={feat.id === 'CR-017'}
                      onDragStart={() => setDraggedFeatureId(feat.id)}
                      className={`p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm transition-all ${
                        feat.id === 'CR-017'
                          ? 'border-indigo-400 ring-1 ring-indigo-300 cursor-grab active:cursor-grabbing bg-indigo-50/30'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                          {feat.icon === 'appraisals' && <Users className="w-3.5 h-3.5" />}
                          {feat.icon === 'attendance' && <Calendar className="w-3.5 h-3.5" />}
                          {feat.icon === 'calculator' && <Calculator className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{feat.title}</span>
                            {feat.id === 'CR-017' && (
                              <button
                                onClick={() => moveFeature(feat.id, 'phase_2')}
                                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                              >
                                Move to P2
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Drop zone placeholder */}
                  <div
                    onClick={() => moveFeature('CR-017', 'phase_1')}
                    className="p-3 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50/20 text-center flex flex-col items-center justify-center hover:bg-indigo-50/50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-indigo-500 mb-0.5" />
                    <span className="text-[11px] font-bold text-indigo-700 leading-tight">
                      Drag feature here
                    </span>
                    <span className="text-[10px] text-indigo-500">Add to Phase 1</span>
                  </div>
                </div>
              </div>

              {/* PHASE 2: Future Release */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedFeatureId) moveFeature(draggedFeatureId, 'phase_2');
                }}
                className="flex flex-col rounded-xl bg-slate-50/70 border border-slate-200 p-2.5 h-full overflow-hidden"
              >
                <div className="mb-2 shrink-0">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Phase 2 — Future Release
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {phase2Features.length} items
                    </span>
                  </div>
                </div>

                {/* Items Container */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                  {phase2Features.map((feat) => (
                    <div
                      key={feat.id}
                      draggable={feat.id === 'CR-017'}
                      onDragStart={() => setDraggedFeatureId(feat.id)}
                      className={`p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm transition-all ${
                        feat.id === 'CR-017'
                          ? 'border-indigo-400 ring-1 ring-indigo-300 cursor-grab active:cursor-grabbing bg-indigo-50/30'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                          {feat.icon === 'form16' && <FileText className="w-3.5 h-3.5" />}
                          {feat.icon === 'calculator' && <Calculator className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{feat.title}</span>
                            {feat.id === 'CR-017' && (
                              <button
                                onClick={() => moveFeature(feat.id, 'phase_1')}
                                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                              >
                                Move to P1
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Drop zone placeholder */}
                  <div
                    onClick={() => moveFeature('CR-017', 'phase_2')}
                    className="p-3 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50/20 text-center flex flex-col items-center justify-center hover:bg-indigo-50/50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-indigo-500 mb-0.5" />
                    <span className="text-[11px] font-bold text-indigo-700 leading-tight">
                      Drag feature here
                    </span>
                    <span className="text-[10px] text-indigo-500">Add to Phase 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════════ COLUMN 3: IMPACT ANALYSIS (Span 4) ════════ */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Impact Analysis</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  CR-017 Selected
                </span>
              </div>
            </div>

            {/* Selected CR Summary Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start space-x-3 mb-3.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">Dynamic Bonus Calculator</div>
                <div className="text-[11px] text-slate-500">CR-017 • Requested by Sophia</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Calculate proposed bonus based on appraisal rating with regional rules.
                </p>
              </div>
            </div>

            {/* Assess Key Areas List */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-bold text-slate-700">Assess key areas</span>
              {isAssessmentComplete ? (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Complete
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-600">
                  Assess all 5 areas
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {/* 1. Timeline */}
              <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                <div
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'timeline' ? null : 'timeline')
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Timeline</div>
                      <div className="text-[10px] text-slate-500">Impact on 90-day go-live</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {getTimelineLabel()}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {openDropdown === 'timeline' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      Can we commit to delivering within the existing 90-day deadline?
                    </div>
                    {SCHEDULE_ASSESSMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ assessmentSchedule: opt.id as Chapter4ScheduleAssessment });
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          chapter4State.assessmentSchedule === opt.id
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                      >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Dependencies (Multi-select) */}
              <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                <div
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'dependencies' ? null : 'dependencies')
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <GitBranch className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Dependencies</div>
                      <div className="text-[10px] text-slate-500">Payroll integration, regional rules</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {getDependenciesLabel()}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {openDropdown === 'dependencies' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      What must be clarified before estimating this feature? (Select all that apply)
                    </div>
                    {TECHNICAL_DEPENDENCY_OPTIONS.map((opt) => {
                      const isChecked = (chapter4State.assessmentDependencies || []).includes(
                        opt.id as Chapter4TechnicalDependency
                      );
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleToggleDependency(opt.id as Chapter4TechnicalDependency)}
                          className={`p-2 rounded-lg text-xs transition-colors cursor-pointer flex items-start space-x-2 ${
                            isChecked
                              ? 'bg-indigo-50 border border-indigo-300 text-indigo-900'
                              : 'hover:bg-slate-50 border border-transparent text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-indigo-600 pointer-events-none"
                          />
                          <div className="flex-1">
                            <span className="font-semibold">{opt.label}</span>
                            {opt.isRisky && (
                              <span className="ml-1 text-[9px] text-rose-600 font-bold">(Risky)</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Security & Compliance */}
              <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                <div
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'security' ? null : 'security')
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Security & Compliance</div>
                      <div className="text-[10px] text-slate-500">Access control, compensation data</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {getSecurityLabel()}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {openDropdown === 'security' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      What should happen before the feature handles compensation data?
                    </div>
                    {SECURITY_ASSESSMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ assessmentSecurity: opt.id as Chapter4SecurityAssessment });
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          chapter4State.assessmentSecurity === opt.id
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                      >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Business Value */}
              <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                <div
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'business_value' ? null : 'business_value')
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Business Value</div>
                      <div className="text-[10px] text-slate-500">Value for HR and employees</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {getBusinessValueLabel()}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {openDropdown === 'business_value' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      How should the team treat the client's request?
                    </div>
                    {BUSINESS_VALUE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ assessmentBusinessValue: opt.id as Chapter4BusinessValueAssessment });
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          chapter4State.assessmentBusinessValue === opt.id
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                      >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Approval & Governance */}
              <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                <div
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'approval' ? null : 'approval')
                  }
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Approval</div>
                      <div className="text-[10px] text-slate-500">Business + IT approval</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {getApprovalLabel()}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {openDropdown === 'approval' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      What is the appropriate next step before committing to the release?
                    </div>
                    {APPROVAL_ASSESSMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ assessmentApproval: opt.id as Chapter4ApprovalAssessment });
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          chapter4State.assessmentApproval === opt.id
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                      >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Effort Card (Matching reference image) */}
            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center space-x-3 my-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                  Estimated effort
                </div>
                <div className="text-sm font-black text-slate-900 leading-tight">3 – 5 weeks</div>
                <div className="text-[10px] text-slate-500">Actual effort to be confirmed by engineering</div>
              </div>
            </div>

            {/* Bottom Action Buttons (Reset Plan + Run Impact Analysis) */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 shrink-0">
              <button
                onClick={handleResetPlan}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Plan</span>
              </button>

              <button
                onClick={handleOpenSubmissionModal}
                disabled={!isAssessmentComplete}
                className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                  isAssessmentComplete
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Impact Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL SUBMISSION & JUSTIFICATION MODAL ── */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 text-slate-900 font-sans"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">
                    TASK 3: FINAL RECOMMENDATION
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Submit Release Recommendation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Based on your assessment, what should the team communicate to Sophia?
                  </p>
                </div>
              </div>

              {/* Recommendation Options */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {FINAL_RECOMMENDATION_OPTIONS.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      sound.playClick();
                      onUpdateState({ finalRecommendation: rec.id as Chapter4FinalRecommendation });
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      chapter4State.finalRecommendation === rec.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="radio"
                        checked={chapter4State.finalRecommendation === rec.id}
                        onChange={() => {}}
                        className="mt-0.5 text-indigo-600 pointer-events-none"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {rec.letter}. {rec.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{rec.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Justification Text Field (Part 7: Why is this the right decision?) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Why is this the right decision?
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {chapter4State.writtenJustification.length}/400
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Explain your recommendation in one or two sentences. Consider the client's needs, the 90-day deadline, and the unresolved technical dependencies.
                </p>
                <textarea
                  value={chapter4State.writtenJustification}
                  maxLength={400}
                  onChange={(e) => onUpdateState({ writtenJustification: e.target.value })}
                  placeholder="e.g. CR-017 has business value, but we cannot promise Phase 1 delivery until development estimates effort and validates regional bonus rules..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-slate-800 bg-white"
                />
              </div>

              {/* Error Message */}
              {submissionError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{submissionError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Impact Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Confirm & Evaluate</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
