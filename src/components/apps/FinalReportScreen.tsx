/**
 * FinalReportScreen — narrative outcome report.
 *
 * Shown after evaluation completes (GameContext.phase === 'report').
 * No score is shown on screen. The player sees:
 * - Overall outcome narrative
 * - Strengths
 * - Areas to develop
 * - Stakeholder feedback quotes
 * - Requirement coverage
 * - Communication analysis
 * - Timeline review
 * - Certificate + Return to Dashboard
 *
 * The report data comes from the backend (POST /api/game/session/:id/report).
 * If backend is unavailable, a local report is generated from GameContext signals.
 *
 * Score is embedded in the report data but NOT rendered as a number.
 * The narrative framing communicates quality without a visible number.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
  Award, Download, ArrowRight, Users, FileText,
  Shield, Layers, MessageSquare, Clock
} from 'lucide-react';
import { useGame, API_BASE } from '../../context/GameContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DimensionResult {
  name: string;
  icon: React.FC<{ className?: string }>;
  outcome: 'strong' | 'good' | 'needs_work' | 'missed';
  summary: string;
}

interface StakeholderFeedback {
  character: string;
  avatar: string;
  quote: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface ReportData {
  outcomeTitle: string;
  outcomeNarrative: string;
  overallOutcome: 'excellent' | 'strong' | 'developing' | 'needs_improvement';
  dimensions: DimensionResult[];
  strengths: string[];
  areasToGrow: string[];
  stakeholderFeedback: StakeholderFeedback[];
  requirementCoverage: { id: string; label: string; included: boolean; discovered: boolean }[];
  timelineNarrative: string;
  certificateUnlocked: boolean;
}

// ── Local report generator (offline fallback) ─────────────────────────────────

function buildLocalReport(state: ReturnType<typeof useGame>['state']): ReportData {
  const signals = state.signals;
  const sum = (dim: string) =>
    signals.filter((s) => s.dimension === dim).reduce((a, b) => a + b.value, 0);

  const reqScore = sum('requirement_management');
  const commsScore = sum('communication');
  const docScore = sum('documentation');
  const deliveryScore = sum('delivery_management');
  const secScore = sum('security_awareness');
  const bizScore = sum('business_understanding');
  const stakScore = sum('stakeholder_management');

  const totalSignalScore = reqScore + commsScore + docScore + deliveryScore + secScore + bizScore + stakScore;

  const outcome: ReportData['overallOutcome'] =
    totalSignalScore > 100 ? 'excellent'
    : totalSignalScore > 60 ? 'strong'
    : totalSignalScore > 30 ? 'developing'
    : 'needs_improvement';

  const outcomeMap = {
    excellent: {
      title: 'Outstanding Transformation Delivery',
      narrative: `You approached Project Titan with the discipline and mindset of an experienced Digital Transformation Consultant. You discovered requirements proactively, communicated clearly with all stakeholders, built a prototype that reflected what the business actually needed, and delivered a coherent final presentation. Titan Manufacturing has a strong foundation for their HR transformation.`,
    },
    strong: {
      title: 'Solid Consulting Engagement',
      narrative: `You managed the Titan HR Portal engagement competently. You covered the core requirements and communicated well with most stakeholders. There were some gaps — a few requirements were missed, and some stakeholders felt under-informed — but the overall delivery demonstrates solid consulting fundamentals. With experience, this performance will become consistent.`,
    },
    developing: {
      title: 'A Work in Progress',
      narrative: `You engaged with the simulation but several important elements were missed or handled reactively rather than proactively. Requirements surfaced late, some stakeholders weren't engaged, and the final presentation lacked depth in some areas. This is a realistic reflection of early-career consulting — the instincts are there, but the structure and discipline need development.`,
    },
    needs_improvement: {
      title: 'Significant Gaps Identified',
      narrative: `The engagement had fundamental gaps in requirement discovery, stakeholder communication, and documentation. A consulting engagement of this nature requires active management — requirements don't surface themselves, stakeholders don't stay aligned without contact, and documentation is how a consultant demonstrates competence. This report identifies the specific areas to focus on.`,
    },
  };

  const prototypeFeatures = state.prototypeFeatures;
  const included = prototypeFeatures.filter((f) => f.included);
  const discovered = prototypeFeatures.filter((f) => f.discovered);

  const dimensions: DimensionResult[] = [
    {
      name: 'Requirement Management',
      icon: FileText,
      outcome: reqScore > 20 ? 'strong' : reqScore > 8 ? 'good' : 'needs_work',
      summary: discovered.length >= 10
        ? 'Discovered all major requirements including hidden ones. Prototype reflected the full scope.'
        : discovered.length >= 8
        ? 'Covered core requirements. Some hidden requirements were not uncovered.'
        : 'Several important requirements were missed. Hidden requirements were not discovered.',
    },
    {
      name: 'Communication',
      icon: MessageSquare,
      outcome: commsScore > 15 ? 'strong' : commsScore > 5 ? 'good' : 'needs_work',
      summary: state.meetingState.kickoffCameraOn
        ? 'Maintained camera presence in meetings. Professional communication approach.'
        : 'Camera was off during key meetings. Non-verbal presence matters in consulting.',
    },
    {
      name: 'Stakeholder Management',
      icon: Users,
      outcome: stakScore > 25 ? 'strong' : stakScore > 10 ? 'good' : 'needs_work',
      summary: Object.values(state.stakeholderContacted).filter(Boolean).length >= 4
        ? 'Engaged all key stakeholders. Relationship management was proactive.'
        : 'Some stakeholders were not contacted. Gaps in stakeholder coverage affect trust.',
    },
    {
      name: 'Documentation',
      icon: FileText,
      outcome: state.meetingState.momSubmitted
        ? (state.meetingState.momText.length > 200 ? 'strong' : 'good')
        : 'needs_work',
      summary: state.meetingState.momSubmitted
        ? state.meetingState.momText.length > 200
          ? 'Meeting minutes were comprehensive and well-structured.'
          : 'Meeting minutes were submitted but lacked depth.'
        : 'No meeting minutes were submitted. Documentation is a core consulting discipline.',
    },
    {
      name: 'Security Awareness',
      icon: Shield,
      outcome: state.stakeholderContacted['daniel']
        ? (secScore > 10 ? 'strong' : 'good')
        : 'needs_work',
      summary: state.stakeholderContacted['daniel']
        ? 'Engaged Daniel (Technical Lead) on security architecture. Authentication, RBAC, and audit requirements were discussed.'
        : 'Security and compliance requirements were not addressed proactively. Daniel raised architecture concerns late that should have been captured earlier.',
    },
    {
      name: 'Delivery Management',
      icon: Layers,
      outcome: state.prototypeBuilt
        ? (deliveryScore > 20 ? 'strong' : 'good')
        : 'missed',
      summary: state.prototypeBuilt
        ? `Prototype built with ${included.length} feature${included.length !== 1 ? 's' : ''}. Demonstrated tangible delivery.`
        : 'No prototype was built. The engagement lacked any tangible deliverable.',
    },
  ];

  const strengths: string[] = [];
  const areasToGrow: string[] = [];

  if (state.meetingState.kickoffCameraOn) strengths.push('Maintained professional video presence in the kickoff meeting.');
  if (state.meetingState.momSubmitted && state.meetingState.momText.length > 200) strengths.push('Wrote thorough meeting minutes that captured the key outcomes.');
  if (state.prototypeBuilt && included.length >= 6) strengths.push('Built a substantive prototype covering the major employee workflows.');
  if (state.stakeholderContacted['daniel']) strengths.push('Proactively engaged the Technical Lead on security and architecture — a sign of maturity in a consultant.');
  if (discovered.some((f) => f.id === 'req_document_upload')) strengths.push('Discovered the document upload requirement without being told directly.');
  if (discovered.some((f) => f.id === 'req_payroll')) strengths.push('Identified the payroll integration constraint early, avoiding overcommitment.');
  if (Object.values(state.stakeholderContacted).filter(Boolean).length >= 3) strengths.push('Engaged the full stakeholder map — demonstrated enterprise communication skills.');

  if (!state.meetingState.momSubmitted) areasToGrow.push('Document meetings formally. MOM writing is a non-negotiable consultant habit.');
  if (!state.prototypeBuilt) areasToGrow.push('Deliver tangibles. A consultant without a deliverable has nothing to show for the engagement.');
  if (!state.stakeholderContacted['daniel']) areasToGrow.push('Engage the technical lead on security requirements early. Architecture decisions made without security review create risk.');
  if (!discovered.some((f) => f.id === 'req_document_upload')) areasToGrow.push('Discover requirements proactively. Read between the lines of stakeholder communication.');
  if (!state.meetingState.kickoffCameraOn) areasToGrow.push('Keep your camera on in meetings. Virtual presence is a professional signal.');
  if (Object.values(state.stakeholderContacted).filter(Boolean).length < 2) areasToGrow.push('Invest in stakeholder relationships. Consulting is as much about people as it is about process.');

  if (strengths.length === 0) strengths.push('Completed the simulation end-to-end — a foundation to build from.');
  if (areasToGrow.length === 0) areasToGrow.push('Continue pushing the depth of requirement discovery in future scenarios.');

  const stakeholderFeedback: StakeholderFeedback[] = [
    {
      character: 'Marcus Reed (CTO)',
      avatar: '/character/marcus_reed/MarcusDP.png',
      quote: state.prototypeBuilt
        ? "The prototype showed some solid thinking. I'd have liked stronger architecture documentation, but the direction was right."
        : "There was no prototype. That's a fundamental miss for an engagement of this scope.",
      sentiment: state.prototypeBuilt ? 'positive' : 'negative',
    },
    {
      character: 'Emma Carter (HR Specialist & Client Lead)',
      avatar: '/character/Emma_Carter/EmmaDP.png',
      quote: discovered.some((f) => f.id === 'req_document_upload')
        ? "I appreciated that the document upload requirement was captured — that came from listening carefully to the plant HR team, not from the brief. That's good consulting."
        : "The portal misses something the Titan HR team flagged quite early. Document upload for HR requests was important and it wasn't captured in the prototype.",
      sentiment: discovered.some((f) => f.id === 'req_document_upload') ? 'positive' : 'neutral',
    },
    {
      character: 'Daniel Brooks (PM & Technical Lead)',
      avatar: '/character/Daniel_Brooks/DanielDP.png',
      quote: state.meetingState.momSubmitted
        ? (state.stakeholderContacted['daniel']
          ? "Good instinct to document the kickoff and to loop in on architecture early. That's the right professional posture."
          : "Meeting notes were submitted — good. The security architecture conversation happened a bit late though.")
        : "The absence of meeting notes is a concern. In a real engagement, that creates misalignment and risk.",
      sentiment: state.meetingState.momSubmitted ? 'positive' : 'negative',
    },
    {
      character: 'Aarav Kapoor (Senior Advisor)',
      avatar: '/character/AaravDP.png',
      quote: state.prototypeBuilt && state.meetingState.momSubmitted
        ? "Solid fundamentals. You built something tangible and documented it. Keep developing the instinct to explore requirements beyond the brief."
        : "The instincts are developing. The next step is building the discipline — always deliver something tangible, always document.",
      sentiment: state.prototypeBuilt && state.meetingState.momSubmitted ? 'positive' : 'neutral',
    },
  ];

  const requirementCoverage = prototypeFeatures.map((f) => ({
    id: f.id,
    label: f.label,
    included: f.included,
    discovered: f.discovered,
  }));

  const timelineNarrative = state.clock.day <= 7
    ? 'The engagement moved quickly. Most deliverables were completed well within the available timeline.'
    : state.clock.day <= 12
    ? 'The timeline was manageable. Some tasks were completed under pressure, but the deadline was met.'
    : 'The final days of the engagement were rushed. Better pacing earlier would have allowed a stronger finish.';

  return {
    outcomeTitle: outcomeMap[outcome].title,
    outcomeNarrative: outcomeMap[outcome].narrative,
    overallOutcome: outcome,
    dimensions,
    strengths,
    areasToGrow,
    stakeholderFeedback,
    requirementCoverage,
    timelineNarrative,
    certificateUnlocked: outcome !== 'needs_improvement',
  };
}

// ── Outcome color ─────────────────────────────────────────────────────────────

const OUTCOME_STYLES = {
  excellent: { from: 'from-emerald-500', to: 'to-cyan-500', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  strong: { from: 'from-sky-500', to: 'to-indigo-500', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  developing: { from: 'from-amber-500', to: 'to-orange-500', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  needs_improvement: { from: 'from-red-500', to: 'to-rose-600', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

const OUTCOME_ICON = {
  excellent: <Award className="w-10 h-10 text-emerald-400" />,
  strong: <CheckCircle2 className="w-10 h-10 text-sky-400" />,
  developing: <TrendingUp className="w-10 h-10 text-amber-400" />,
  needs_improvement: <AlertTriangle className="w-10 h-10 text-red-400" />,
};

const DIMENSION_OUTCOME_COLORS = {
  strong: 'text-emerald-400',
  good: 'text-sky-400',
  needs_work: 'text-amber-400',
  missed: 'text-red-400',
};

// ── Main component ────────────────────────────────────────────────────────────

interface FinalReportScreenProps {
  onReturnToDashboard?: () => void;
}

export const FinalReportScreen: React.FC<FinalReportScreenProps> = ({ onReturnToDashboard }) => {
  const { state } = useGame();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'dimensions' | 'stakeholders' | 'requirements'>('overview');

  useEffect(() => {
    const sid = localStorage.getItem('brained_session_id');
    if (sid && !sid.startsWith('local_')) {
      // Try to get server-generated report
      fetch(`${API_BASE}/api/game/session/${sid}/report`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.report) {
            // Server report available — could map to ReportData
            // For now, fall through to local generation enhanced by server data
          }
          throw new Error('no_server_report');
        })
        .catch(() => {
          setReport(buildLocalReport(state));
        })
        .finally(() => setLoading(false));
    } else {
      // Local session — generate from signals
      setTimeout(() => {
        setReport(buildLocalReport(state));
        setLoading(false);
      }, 1200);
    }
  }, []); // eslint-disable-line

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#070913] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Layers className="w-8 h-8 text-purple-400" />
            </motion.div>
          </div>
          <p className="text-white font-bold text-lg">Generating your Executive Report…</p>
          <p className="text-slate-400 text-sm">Evaluating decisions, communications, and delivery.</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const style = OUTCOME_STYLES[report.overallOutcome];
  const navItems: Array<{ id: typeof activeSection; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'dimensions', label: 'Dimensions' },
    { id: 'stakeholders', label: 'Stakeholder Feedback' },
    { id: 'requirements', label: 'Requirements' },
  ];

  return (
    <div className="w-full h-screen bg-[#070913] text-white flex flex-col overflow-hidden">
      {/* Hero header */}
      <div className={`shrink-0 bg-gradient-to-r ${style.from} ${style.to} px-8 py-6 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {OUTCOME_ICON[report.overallOutcome]}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold">Project Titan — Final Report</p>
              <h1 className="text-xl font-black text-white leading-tight">{report.outcomeTitle}</h1>
            </div>
          </div>
          {report.certificateUnlocked && (
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-xl border border-white/30">
              <Award className="w-5 h-5 text-white" />
              <span className="text-xs font-bold text-white">Certificate Unlocked</span>
            </div>
          )}
        </div>
      </div>

      {/* Section nav */}
      <div className="shrink-0 border-b border-white/10 bg-slate-900/60 flex items-center px-6 space-x-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`px-4 py-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
              activeSection === item.id
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-500 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-4xl mx-auto space-y-6"
          >

            {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
            {activeSection === 'overview' && (
              <>
                {/* Narrative */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-white mb-3">Engagement Summary</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{report.outcomeNarrative}</p>
                </div>

                {/* Strengths / Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-500/8 border border-amber-500/25 rounded-2xl p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingDown className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Areas to Develop</h3>
                    </div>
                    <ul className="space-y-2">
                      {report.areasToGrow.map((a, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timeline narrative */}
                <div className="bg-slate-900/40 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-bold text-white">Timeline Review</h3>
                  </div>
                  <p className="text-sm text-slate-300">{report.timelineNarrative}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4 pt-2">
                  {report.certificateUnlocked && (
                    <button className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm cursor-pointer hover:from-purple-500 hover:to-indigo-500">
                      <Download className="w-4 h-4" />
                      <span>Download Certificate</span>
                    </button>
                  )}
                  {onReturnToDashboard && (
                    <button
                      onClick={onReturnToDashboard}
                      className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/12 text-white font-semibold text-sm cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Return to Dashboard</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ── DIMENSIONS ──────────────────────────────────────────────────── */}
            {activeSection === 'dimensions' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Performance across each consulting dimension. No scores — only narrative outcome.</p>
                {report.dimensions.map((dim) => {
                  const Icon = dim.icon;
                  return (
                    <div key={dim.name} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <h3 className="text-sm font-bold text-white">{dim.name}</h3>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          dim.outcome === 'strong' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : dim.outcome === 'good' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          : dim.outcome === 'needs_work' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {dim.outcome === 'strong' ? 'Strong' : dim.outcome === 'good' ? 'Good' : dim.outcome === 'needs_work' ? 'Needs Work' : 'Missed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{dim.summary}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── STAKEHOLDERS ──────────────────────────────────────────────── */}
            {activeSection === 'stakeholders' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">How each stakeholder reflects on the engagement.</p>
                {report.stakeholderFeedback.map((fb) => (
                  <div key={fb.character} className={`bg-slate-900/60 border rounded-2xl p-5 ${
                    fb.sentiment === 'positive' ? 'border-emerald-500/25'
                    : fb.sentiment === 'negative' ? 'border-red-500/25'
                    : 'border-white/10'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <img src={fb.avatar} alt={fb.character} className="w-9 h-9 rounded-full object-cover border border-white/15" />
                      <div>
                        <p className="text-xs font-bold text-white">{fb.character}</p>
                        <p className={`text-[10px] font-semibold ${
                          fb.sentiment === 'positive' ? 'text-emerald-400'
                          : fb.sentiment === 'negative' ? 'text-red-400'
                          : 'text-slate-400'
                        }`}>
                          {fb.sentiment === 'positive' ? 'Satisfied' : fb.sentiment === 'negative' ? 'Concerned' : 'Neutral'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 italic leading-relaxed">"{fb.quote}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── REQUIREMENTS ──────────────────────────────────────────────── */}
            {activeSection === 'requirements' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Requirements discovered and included in the prototype.</p>
                <div className="space-y-2">
                  {report.requirementCoverage.map((req) => (
                    <div key={req.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                      req.included ? 'bg-emerald-500/8 border-emerald-500/25'
                      : req.discovered ? 'bg-amber-500/8 border-amber-500/25'
                      : 'bg-red-500/8 border-red-500/15'
                    }`}>
                      <span className="text-sm text-white">{req.label}</span>
                      <div className="flex items-center space-x-2">
                        {req.discovered && (
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">Discovered</span>
                        )}
                        {req.included ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">Included</span>
                        ) : req.discovered ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">Not included</span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/30">Not discovered</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
