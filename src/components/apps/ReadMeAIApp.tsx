import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
  Shield, Send, Clock, Edit3, Lightbulb, BarChart3, Check,
  AlertTriangle, X, RefreshCw
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { updateChapterStatus } from '../../data/chaptersData';

interface ReadMeAIAppProps {
  onDone?: () => void;
  onReturnToChapterSelect?: () => void;
}

const INITIAL_MOM_DRAFT = `ReadMe AI
Project Amigo · Kickoff Minutes

Draft

Meeting summary
Project Amigo will deliver an HRMS for 80,000 ICICI Bank employees across India. The business expects readiness before the appraisal cycle in 90 days. The team discussed technical feasibility and the risks associated with the existing legacy architecture.

Key decisions
- Validate technical feasibility before committing to delivery.
- Account for the business deadline and system requirements.

Risks and dependencies
- The legacy architecture may not support the expected appraisal-period demand.

Action items
- Validate architecture and performance assumptions — Marcus.
- Review delivery feasibility and dependencies — Aarav and Daniel.`;

export const ReadMeAIApp: React.FC<ReadMeAIAppProps> = ({ onDone, onReturnToChapterSelect }) => {
  const { submitMOM, addSignal } = useGame();
  const [docContent, setDocContent] = useState<string>(INITIAL_MOM_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMomSentToast, setShowMomSentToast] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [evaluation, setEvaluation] = useState<{
    hasFact1: boolean; // 30k peak logins
    hasFact2: boolean; // LDAP credentials
    score: number;
    feedback: string;
    xp: number;
  }>({
    hasFact1: false,
    hasFact2: false,
    score: 80,
    feedback: '',
    xp: 250,
  });

  // Evaluator recognizes sensible paraphrases and semantic intent
  const evaluateMOM = (text: string) => {
    const lower = text.toLowerCase();

    // Fact 1: Marcus's estimate of 30,000 simultaneous logins during peak appraisal traffic
    const has30kNumber = lower.includes('30,000') || lower.includes('30000') || lower.includes('30k') || lower.includes('thirty thousand');
    const hasPeakOrTraffic = lower.includes('peak') || lower.includes('concurrent') || lower.includes('simultaneous') || lower.includes('traffic') || lower.includes('login') || lower.includes('users') || lower.includes('load');
    const hasFact1 = has30kNumber && hasPeakOrTraffic;

    // Fact 2: Unavailable LDAP sandbox credentials that prevent end-to-end SSO validation
    const hasLdapOrSso = lower.includes('ldap') || lower.includes('sso') || lower.includes('single sign-on') || lower.includes('single sign on');
    const hasSandboxOrCreds = lower.includes('sandbox') || lower.includes('credential') || lower.includes('credentials') || lower.includes('access') || lower.includes('dependency') || lower.includes('lack');
    const hasFact2 = hasLdapOrSso && hasSandboxOrCreds;

    let xp = 100;
    let score = 70;
    let feedback = '';

    if (hasFact1 && hasFact2) {
      xp = 350;
      score = 98;
      feedback = 'Outstanding executive record. You successfully identified both critical risks: the 30,000 peak concurrent logins and the missing LDAP sandbox credentials.';
    } else if (hasFact1 && !hasFact2) {
      xp = 220;
      score = 84;
      feedback = 'Solid catch on Marcus’s 30,000 peak concurrency warning. However, Daniel’s blocker regarding missing LDAP sandbox credentials was omitted.';
    } else if (!hasFact1 && hasFact2) {
      xp = 220;
      score = 84;
      feedback = 'Good catch noting the LDAP sandbox credentials blocker for SSO. However, Marcus’s estimate of 30,000 simultaneous logins was missed.';
    } else {
      xp = 150;
      score = 75;
      feedback = 'You submitted the initial draft. In future chapters, be sure to actively capture and add technical dependencies voiced during calls.';
    }

    return { hasFact1, hasFact2, score, feedback, xp };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = evaluateMOM(docContent);
    setEvaluation(result);

    // Call GameContext submitMOM
    await submitMOM(docContent);
    addSignal(
      result.hasFact1 && result.hasFact2 ? 'Complete Kickoff MoM' : 'Kickoff MoM Submitted',
      'documentation',
      result.hasFact1 && result.hasFact2 ? 25 : 10
    );

    setTimeout(() => {
      setIsSubmitting(false);
      // Step 1: Pop up "MOM sent" toast
      setShowMomSentToast(true);

      // Step 2: Show Chapter 01 Complete modal shortly after
      setTimeout(() => {
        setShowMomSentToast(false);
        setShowCompletionModal(true);
      }, 1200);
    }, 600);
  };

  const handleFinishChapter = () => {
    // Mark Chapter 1 completed and Chapter 2 unlocked in persistent storage
    updateChapterStatus(1, 'completed');
    updateChapterStatus(2, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '2');

    setShowCompletionModal(false);
    if (onReturnToChapterSelect) {
      onReturnToChapterSelect();
    } else if (onDone) {
      onDone();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f131f] text-slate-100 font-sans overflow-hidden select-text relative">
      
      {/* ── TOP APPLICATION HEADER ── */}
      <div className="h-14 px-6 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-wider text-white">ReadMe AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                AI MOM ASSISTANT
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Project Amigo · Kickoff Minutes of Meeting</p>
          </div>
        </div>

        {/* Action button */}
        {!showCompletionModal && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting to Steering Committee...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Official Record</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* ── INSTRUCTION / CONSULTANT BRIEF BANNER ── */}
      <div className="px-6 py-2.5 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-purple-950/40 border-b border-white/5 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-2 text-slate-300">
          <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Aarav’s Directive:</strong> "DT, review ReadMe AI's minutes, correct what it missed, and submit the official record before we commit to a plan."
          </span>
        </div>
        <div className="text-[11px] font-mono text-amber-400/90 font-bold">
          2 DELIBERATE OMISSIONS TO CAPTURE
        </div>
      </div>

      {/* ── MAIN WORKSPACE / EDITOR CANVAS ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Document Editor */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col bg-slate-900/70 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs text-slate-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Drafted: Today at Kickoff Conclusion</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                Awaiting Consultant Review
              </span>
            </div>

            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full flex-1 bg-transparent text-slate-200 text-sm font-sans leading-relaxed resize-none focus:outline-none focus:ring-0 placeholder-slate-600"
              style={{ minHeight: '380px' }}
              placeholder="Edit the Minutes of Meeting here..."
            />
          </div>
        </div>

        {/* Right Sidebar: Steering Context & Guide */}
        <div className="w-80 border-l border-white/10 bg-slate-950/50 p-5 flex flex-col justify-between hidden lg:flex shrink-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>MoM Verification Protocol</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-slate-300 space-y-2">
              <div className="text-[11px] font-bold text-amber-300">Review Checklist</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ReadMe AI captured the high-level business goals, but missed two technical risk factors voiced during the call:
              </p>
              <ul className="text-[11px] space-y-1 text-slate-400 list-disc list-inside">
                <li>Marcus's warning on simultaneous login spike</li>
                <li>Daniel's blocker on single sign-on sandbox credentials</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-blue-200">
              <span className="font-bold text-blue-300">Why this matters:</span> If these omissions go unrecorded, the team will commit to an unfeasible 90-day plan without executive safety buffers.
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-600 text-center">
            BRAINED OS · ENTERPRISE RECORD SYSTEM
          </div>
        </div>
      </div>

      {/* ── STEP 1: "MOM SENT" POPUP TOAST ── */}
      <AnimatePresence>
        {showMomSentToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3.5 rounded-2xl bg-emerald-950/95 border border-emerald-400/50 text-white shadow-[0_0_35px_rgba(16,185,129,0.4)] flex items-center space-x-3 backdrop-blur-xl"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">MOM Sent</div>
              <div className="text-[11px] text-emerald-200">Minutes of Meeting officially delivered to Steering Committee.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          STEP 2: CHAPTER 01 COMPLETE MODAL (MATCHING REFERENCE IMAGE)
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-[#0c101c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 relative overflow-hidden"
              style={{
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.1)',
              }}
            >
              {/* Close Button on Top Right */}
              <button
                onClick={handleFinishChapter}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* ── HEADER WITH CITY VIEW & QUOTE TAG ── */}
              <div className="flex items-start justify-between pr-8">
                <div className="max-w-md">
                  <div className="text-[10px] font-mono tracking-[0.22em] text-amber-400 font-bold uppercase mb-1">
                    CHAPTER 01 COMPLETE
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
                    The Requirement Storm
                  </h2>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">
                    Project Amigo
                  </div>
                  <p className="text-xs text-slate-300/90 leading-relaxed mt-2 font-normal">
                    You handled a high-pressure kickoff, balanced multiple viewpoints and captured the critical details before committing to a plan.
                  </p>
                </div>

                {/* Right Top Thumbnail with Diagonal Quote Tag */}
                <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 hidden sm:block shadow-lg">
                  <img
                    src="/assets/executive_skyline_bg.jpg"
                    alt="City Skyline"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-2 select-none">
                    <div className="text-[8px] font-mono font-bold tracking-wider text-slate-200 leading-tight italic">
                      “CLEARER CONVERSATIONS STRONGER OUTCOMES.”
                    </div>
                    <div className="w-6 h-[1.5px] bg-amber-400 mt-1" />
                  </div>
                </div>
              </div>

              {/* ── CARD 1: KEY TAKEAWAY (GOLDEN PILL CARD) ── */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-[#1a1710] to-[#121622] border border-amber-500/40 flex items-center space-x-4 shadow-sm">
                <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-mono tracking-[0.2em] text-amber-400 font-bold uppercase">
                    KEY TAKEAWAY
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    A deadline is a target, not a delivery plan.
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5 leading-tight">
                    Validate scope, capacity and dependencies before making a commitment.
                  </div>
                </div>
              </div>

              {/* ── CARDS 2 & 3: TWO SIDE-BY-SIDE CARDS (WHAT YOU CAPTURED / WHAT YOU MISSED) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Left Card: What You Captured (Peak-load risk) */}
                <div className="rounded-2xl p-4 bg-[#0a1b18] border border-emerald-500/35 flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono tracking-[0.18em] text-emerald-400 font-bold uppercase">
                      WHAT YOU CAPTURED
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      Peak-load risk
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                      30,000 simultaneous logins during appraisal period need validation.
                    </div>
                  </div>
                </div>

                {/* Right Card: What You Missed (LDAP dependency) */}
                <div className={`rounded-2xl p-4 border flex items-start space-x-3.5 ${
                  evaluation.hasFact2 
                    ? 'bg-[#0a1b18] border-emerald-500/35' 
                    : 'bg-[#1e0e14] border-rose-500/35'
                }`}>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    evaluation.hasFact2
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                      : 'bg-rose-500/20 border-rose-400/50 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                  }`}>
                    {evaluation.hasFact2 ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <div className={`text-[9px] font-mono tracking-[0.18em] font-bold uppercase ${
                      evaluation.hasFact2 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {evaluation.hasFact2 ? 'WHAT YOU CAPTURED' : 'WHAT YOU MISSED'}
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      LDAP dependency
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                      LDAP sandbox credentials are unavailable, blocking end-to-end SSO validation.
                    </div>
                  </div>
                </div>

              </div>

              {/* ── CARD 4: YOUR STRENGTH THIS CHAPTER (BLUE CARD) ── */}
              <div className="rounded-2xl p-4 bg-[#0d1629] border border-blue-500/30 flex items-center space-x-3.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.25)]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] font-mono tracking-[0.18em] text-blue-400 font-bold uppercase">
                    YOUR STRENGTH THIS CHAPTER
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    Risk-aware decision making
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    You questioned the deadline and focused on understanding the real constraints.
                  </div>
                </div>
              </div>

              {/* ── FOOTER ACTIONS ── */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  onClick={handleFinishChapter}
                  className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Back to Journey
                </button>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(245,158,11,0.6)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinishChapter}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(245,158,11,0.45)] cursor-pointer transition-all"
                >
                  <span>Continue to Chapter 2</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
