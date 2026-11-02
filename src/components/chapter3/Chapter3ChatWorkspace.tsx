import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  FileText,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { Chapter3State, Chapter3UatDocument } from '../../types/chapter3';
import {
  DANIEL_UAT_REQUEST_MESSAGE,
  SOPHIA_FOLLOWUP_DRAFT,
  computeChapter3Score,
} from '../../data/chapter3Data';
import { requestChapterAIEvaluation } from '../../services/aiEvaluationService';
import { UatDocumentViewer } from './UatDocumentViewer';
import { sound } from '../onboarding/SoundEngine';

interface Chapter3ChatWorkspaceProps {
  activeContact: 'daniel' | 'sophia';
  onSwitchContact: (contact: 'daniel' | 'sophia') => void;
  chapter3State: Chapter3State;
  onUpdateState: (
    updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)
  ) => void;
  onOpenEmailClient: () => void;
  onOpenScorecard: () => void;
}

export const Chapter3ChatWorkspace: React.FC<Chapter3ChatWorkspaceProps> = ({
  activeContact,
  onSwitchContact,
  chapter3State,
  onUpdateState,
  onOpenEmailClient,
  onOpenScorecard,
}) => {
  const [isComposingFollowUp, setIsComposingFollowUp] = useState(
    chapter3State.step === 'asking_sophia_more'
  );
  const [followUpText, setFollowUpText] = useState(
    chapter3State.playerFollowUpMessage || SOPHIA_FOLLOWUP_DRAFT
  );
  const [isForwarding, setIsForwarding] = useState(false);

  // ── BRANCH A: Player asks Sophia for more details ──
  const handleOpenFollowUpComposer = () => {
    sound.playClick();
    setIsComposingFollowUp(true);
    onUpdateState({ step: 'asking_sophia_more' });
  };

  const handleSendFollowUpToSophia = () => {
    sound.playClick();
    const text = followUpText.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const identifiesNetwork =
      lower.includes('network') ||
      lower.includes('firewall') ||
      lower.includes('proxy') ||
      lower.includes('allowlist') ||
      lower.includes('port');

    // If player previously sent v1 to Daniel, this is recovery. Otherwise full credit.
    const path: 'full_credit' | 'recovery' = chapter3State.sentV1ToDaniel
      ? 'recovery'
      : 'full_credit';

    setIsComposingFollowUp(false);
    onUpdateState({
      playerFollowUpMessage: text,
      playerFollowUpSent: true,
      playerIdentifiedNetworkGap: identifiesNetwork,
      pathTaken: path,
      sophiaTyping: true,
      step: 'sophia_typing_v2',
    });

    // Simulate realistic typing delay from Sophia (~2.2s)
    setTimeout(() => {
      sound.playMessagePing();
      onUpdateState({
        sophiaTyping: false,
        v2Delivered: true,
        step: 'sophia_v2_delivered',
      });
    }, 2200);
  };

  // ── BRANCH B: Player forwards v1 directly to Daniel ──
  const handleSendV1ToDaniel = () => {
    setIsForwarding(true);
    sound.playClick();

    setTimeout(() => {
      sound.playMessagePing();
      setIsForwarding(false);
      onUpdateState({
        sentV1ToDaniel: true,
        firstForwardTarget: 'daniel',
        pathTaken: 'incomplete', // default until/if recovered
        danielPromptedForNetwork: true,
        activeChatRecipient: 'daniel',
        step: 'v1_sent_to_daniel',
      });
      onSwitchContact('daniel');
    }, 600);
  };

  // ── Forward v2 (Complete Details) to Daniel ──
  const handleSendV2ToDaniel = () => {
    setIsForwarding(true);
    sound.playClick();

    setTimeout(() => {
      sound.playSystemClearance();
      setIsForwarding(false);

      const path = chapter3State.pathTaken || 'full_credit';
      const updatedState: Chapter3State = {
        ...chapter3State,
        v2SentToDaniel: true,
        danielFinalConfirmed: true,
        aaravSummaryGiven: true,
        pathTaken: path,
        activeChatRecipient: 'daniel',
        step: 'v2_sent_to_daniel',
      };

      const scorecard = computeChapter3Score(updatedState);
      onUpdateState({
        ...updatedState,
        scorecard,
        completed: true,
        step: 'assignment_completed',
      });

      // Trigger Grok AI Evaluation
      requestChapterAIEvaluation(3, {
        pathTaken: path,
        playerIdentifiedNetworkGap: updatedState.playerIdentifiedNetworkGap,
        v2SentToDaniel: true,
        firstForwardTarget: updatedState.firstForwardTarget,
      }, {
        ...scorecard,
        totalScore: scorecard.totalScore,
        outcomeType: (scorecard.outcomeType === 'partial' ? 'mixed' : scorecard.outcomeType === 'poor' ? 'incomplete' : 'strong'),
        whatYouDidWell: [scorecard.outcomeText],
        whatToImprove: [scorecard.personalizedTakeaway],
      }).then((aiScorecard) => {
        onUpdateState((prev) => ({
          ...prev,
          scorecard: {
            ...prev.scorecard,
            scheduleScore: aiScorecard.scheduleScore,
            riskScore: aiScorecard.riskScore,
            governanceScore: aiScorecard.governanceScore,
            efficiencyScore: aiScorecard.efficiencyScore,
            totalScore: aiScorecard.totalScore,
            outcomeType: (aiScorecard.outcomeType === 'mixed' ? 'partial' : aiScorecard.outcomeType) as any,
            outcomeTitle: aiScorecard.outcomeTitle,
            outcomeText: aiScorecard.outcomeText,
            executiveSummary: aiScorecard.executiveSummary,
            strengths: aiScorecard.strengths,
            improvements: aiScorecard.improvements,
            leadershipCoaching: aiScorecard.leadershipCoaching,
            aiEvaluated: aiScorecard.aiEvaluated,
            explanations: aiScorecard.explanations,
          },
        }));
      }).catch(console.warn);

      onSwitchContact('daniel');
    }, 700);
  };

  // ── Finish Assignment without following up (Branch B ending) ──
  const handleFinishIncomplete = () => {
    sound.playClick();
    const updatedState: Chapter3State = {
      ...chapter3State,
      pathTaken: 'incomplete',
      aaravSummaryGiven: true,
      step: 'assignment_completed',
      completed: true,
    };
    const scorecard = computeChapter3Score(updatedState);
    onUpdateState({
      ...updatedState,
      scorecard,
    });

    requestChapterAIEvaluation(3, {
      pathTaken: 'incomplete',
      playerIdentifiedNetworkGap: false,
      v2SentToDaniel: false,
    }, {
      ...scorecard,
      totalScore: scorecard.totalScore,
      outcomeType: 'incomplete',
      whatYouDidWell: [scorecard.outcomeText],
      whatToImprove: [scorecard.personalizedTakeaway],
    }).then((aiScorecard) => {
      onUpdateState((prev) => ({
        ...prev,
        scorecard: {
          ...prev.scorecard,
          scheduleScore: aiScorecard.scheduleScore,
          riskScore: aiScorecard.riskScore,
          governanceScore: aiScorecard.governanceScore,
          efficiencyScore: aiScorecard.efficiencyScore,
          totalScore: aiScorecard.totalScore,
          outcomeType: 'poor',
          outcomeTitle: aiScorecard.outcomeTitle,
          outcomeText: aiScorecard.outcomeText,
          executiveSummary: aiScorecard.executiveSummary,
          strengths: aiScorecard.strengths,
          improvements: aiScorecard.improvements,
          leadershipCoaching: aiScorecard.leadershipCoaching,
          aiEvaluated: aiScorecard.aiEvaluated,
          explanations: aiScorecard.explanations,
        },
      }));
    }).catch(console.warn);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* ────────────────────────────────────────────────────────── */}
      {/* ── CONVERSATION WITH DANIEL BROOKS ──                      */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeContact === 'daniel' && (
        <div className="space-y-5">
          {/* Header Time Tag */}
          <div className="flex justify-center">
            <span className="text-[10px] font-mono text-orange-400/90 bg-orange-500/10 px-3.5 py-1 rounded-full border border-orange-500/25">
              Today · 09:30 AM · Project Amigo UAT Prerequisites
            </span>
          </div>

          {/* Message 1: Daniel's 5-point request */}
          <div className="flex items-start space-x-3">
            <img
              src="/character/Daniel_Brooks/DanielDP.png"
              alt="Daniel"
              className="w-9 h-9 rounded-full object-cover border border-orange-400/50 shrink-0 mt-1 shadow-md"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-white">Daniel Brooks</span>
                <span className="text-[10px] font-mono text-orange-400">
                  Lead Developer · 09:30 AM
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl rounded-tl-sm bg-[#181d33] border border-white/10 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed whitespace-pre-line font-sans">
                {DANIEL_UAT_REQUEST_MESSAGE}
              </div>
            </div>
          </div>

          {/* Action 1: Email the Client Button (Visible before email is sent) */}
          {!chapter3State.emailSentAt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pl-12 pt-1"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block">
                    Action Required: Coordinate with Client Sponsor
                  </span>
                  <span>
                    Daniel needs five specific UAT parameters confirmed before configuring the environment.
                  </span>
                </div>
                <button
                  onClick={onOpenEmailClient}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/30 cursor-pointer transition-all shrink-0"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email the Client</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Email Sent Confirmation Badge */}
          {chapter3State.emailSentAt && !chapter3State.sentV1ToDaniel && !chapter3State.v2SentToDaniel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pl-12 space-y-2"
            >
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Email sent to Sophia Bennett. Check your conversation with Sophia for the client deliverable.
                  </span>
                </div>
                <button
                  onClick={() => onSwitchContact('sophia')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <span>Open Sophia's Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── BRANCH B: Forwarded v1 to Daniel ── */}
          {chapter3State.sentV1ToDaniel && (
            <>
              {/* Player Forwarded v1 message */}
              <div className="flex items-start justify-end space-x-3 pt-2">
                <div className="space-y-1.5 max-w-lg text-right">
                  <div className="text-[10px] font-mono text-slate-400">
                    You · Project Manager
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tr-sm bg-indigo-600/30 border border-indigo-400/40 text-xs text-indigo-100 shadow-md text-left space-y-1.5">
                    <div className="flex items-center space-x-2 font-bold text-white text-xs">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>Forwarded: Project_Amigo_UAT_Details_v1.pdf</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Forwarded client configuration items (4 items confirmed).
                    </p>
                  </div>
                </div>
              </div>

              {/* Daniel's Response to v1 */}
              <div className="flex items-start space-x-3 pt-2">
                <img
                  src="/character/Daniel_Brooks/DanielDP.png"
                  alt="Daniel"
                  className="w-9 h-9 rounded-full object-cover border border-orange-400/50 shrink-0 mt-1 shadow-md"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">Daniel Brooks</span>
                    <span className="text-[10px] font-mono text-orange-400">
                      Developer · Just now
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-[#181d33] border border-amber-500/30 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed space-y-2">
                    <p>
                      "Thanks, I've received the details. I can prepare the server and API configuration, but I still need confirmation of the network access requirements before I can complete the connectivity setup. Could you follow up with Sophia?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompt to follow up with Sophia or finish */}
              {!chapter3State.v2SentToDaniel && (
                <div className="pl-12 pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      onSwitchContact('sophia');
                      setIsComposingFollowUp(true);
                      onUpdateState({ step: 'asking_sophia_more' });
                    }}
                    className="px-4.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg cursor-pointer transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Follow up with Sophia</span>
                  </button>

                  <button
                    onClick={handleFinishIncomplete}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <span>Finish Assignment (Proceed with v1)</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── COMPLETE: Forwarded v2 to Daniel ── */}
          {chapter3State.v2SentToDaniel && (
            <>
              {/* Player Forwarded v2 message */}
              <div className="flex items-start justify-end space-x-3 pt-2">
                <div className="space-y-1.5 max-w-lg text-right">
                  <div className="text-[10px] font-mono text-slate-400">
                    You · Project Manager
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tr-sm bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-100 shadow-md text-left space-y-1.5">
                    <div className="flex items-center space-x-2 font-bold text-white text-xs">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Forwarded: Project_Amigo_UAT_Details_v2.pdf</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Forwarded updated package with all 5 prerequisites and network access approval dependency.
                    </p>
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified & Delivered to Engineering Core</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daniel's Final Confirmation */}
              <div className="flex items-start space-x-3 pt-2">
                <img
                  src="/character/Daniel_Brooks/DanielDP.png"
                  alt="Daniel"
                  className="w-9 h-9 rounded-full object-cover border border-emerald-400/50 shrink-0 mt-1 shadow-md"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-emerald-300">Daniel Brooks</span>
                    <span className="text-[10px] font-mono text-slate-400">Developer · Just now</span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-[#121c2e] border border-emerald-500/30 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed space-y-1">
                    <p>
                      "Perfect, thanks for following up. I have all five prerequisites now. I'll prepare the configuration using the confirmed details and wait for IT's network-access clearance before testing connectivity."
                    </p>
                  </div>
                </div>
              </div>

              {/* Aarav's Wrap-Up Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start space-x-3 pt-3"
              >
                <img
                  src="/character/AaravDP.png"
                  alt="Aarav"
                  className="w-9 h-9 rounded-full object-cover border border-sky-400/50 shrink-0 mt-1 shadow-md"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-sky-300">Aarav Kapoor</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Senior Consultant · Project Manager
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed space-y-3">
                    <p>
                      "Good work coordinating the UAT setup. We've gathered the required configuration details and identified the dependency that needs IT clearance. Daniel can prepare the confirmed settings while we wait for network access approval."
                    </p>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono text-sky-300">
                        Chapter 3 Assignment Completed
                      </span>
                      <button
                        onClick={onOpenScorecard}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>View Chapter 3 Scorecard</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Incomplete Ending when player proceeds without follow-up */}
          {chapter3State.completed && !chapter3State.v2SentToDaniel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3 pt-3"
            >
              <img
                src="/character/AaravDP.png"
                alt="Aarav"
                className="w-9 h-9 rounded-full object-cover border border-amber-400/50 shrink-0 mt-1 shadow-md"
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-amber-300">Aarav Kapoor</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Senior Consultant · Project Manager
                  </span>
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-amber-500/30 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed space-y-3">
                  <p>
                    "We've delivered the initial 4 configuration items to Daniel, but network access and firewall approvals remain unconfirmed. Let's review the governance implications in the chapter scorecard."
                  </p>
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <button
                      onClick={onOpenScorecard}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>View Chapter 3 Scorecard</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── CONVERSATION WITH SOPHIA BENNETT ──                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeContact === 'sophia' && (
        <div className="space-y-5">
          {/* Header Time Tag */}
          <div className="flex justify-center">
            <span className="text-[10px] font-mono text-purple-400/90 bg-purple-500/10 px-3.5 py-1 rounded-full border border-purple-500/25">
              Today · 09:35 AM · UAT Environment Coordination
            </span>
          </div>

          {/* If email not sent yet */}
          {!chapter3State.emailSentAt && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-3">
              <Mail className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active messages with Sophia yet. Review Daniel's 5 prerequisites in his chat and click "Email the Client" to initiate the request.
              </p>
              <button
                onClick={() => onSwitchContact('daniel')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Go to Daniel's Chat
              </button>
            </div>
          )}

          {/* If email sent */}
          {chapter3State.emailSentAt && (
            <>
              {/* Player Email Outreach Summary Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white text-xs block">
                      Email Sent: Project Amigo — UAT Setup Details
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Requested server, API, authentication, test accounts, and network access requirements.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  Delivered
                </span>
              </div>

              {/* Sophia Typing Indicator (Initial Response) */}
              {chapter3State.sophiaTyping && !chapter3State.v1Delivered && (
                <div className="flex items-center space-x-3 text-xs text-purple-300 bg-purple-950/20 p-3 rounded-xl border border-purple-500/20 max-w-sm">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-medium text-[11px]">Sophia is typing...</span>
                </div>
              )}

              {/* Sophia Message 1 & v1 Document */}
              {chapter3State.v1Delivered && (
                <div className="space-y-4">
                  {/* Sophia's message */}
                  <div className="flex items-start space-x-3">
                    <img
                      src="/character/Sophia_bennett/SophiaDP.png"
                      alt="Sophia"
                      className="w-9 h-9 rounded-full object-cover border border-purple-400/50 shrink-0 mt-1 shadow-md"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-purple-300">Sophia Bennett</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Head of HR · Client
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1c182c] border border-white/10 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed">
                        "Hey! Yes, sure. I've got the details our IT team shared. Let me send them over."
                      </div>
                    </div>
                  </div>

                  {/* Clean Document Viewer: Project_Amigo_UAT_Details_v1.pdf */}
                  <div className="pl-12">
                    <UatDocumentViewer
                      document={chapter3State.v1Document}
                      onAskSophiaMore={handleOpenFollowUpComposer}
                      onSendToDaniel={handleSendV1ToDaniel}
                      showV1Actions={
                        !chapter3State.playerFollowUpSent &&
                        !chapter3State.sentV1ToDaniel &&
                        !isComposingFollowUp
                      }
                      isSending={isForwarding}
                    />
                  </div>

                  {/* Sophia's Follow-up Message */}
                  <div className="flex items-start space-x-3 pt-1">
                    <img
                      src="/character/Sophia_bennett/SophiaDP.png"
                      alt="Sophia"
                      className="w-9 h-9 rounded-full object-cover border border-purple-400/50 shrink-0 mt-1 shadow-md"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-purple-300">Sophia Bennett</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Head of HR · Client
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1c182c] border border-white/10 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed">
                        "Have a look and see if this covers what your developer needs. If there's anything else you need, let me know and I'll check with IT."
                      </div>
                    </div>
                  </div>

                  {/* Message Composer Box when player clicks "Ask Sophia for More Details" */}
                  {isComposingFollowUp && !chapter3State.playerFollowUpSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pl-12 pt-2"
                    >
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#14182a] border border-sky-500/40 shadow-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-sky-400" />
                            Compose Follow-up to Sophia Bennett
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Draft Message
                          </span>
                        </div>

                        <textarea
                          rows={3}
                          value={followUpText}
                          onChange={(e) => setFollowUpText(e.target.value)}
                          className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-xs sm:text-[13px] text-slate-100 focus:outline-none focus:border-sky-500/60 leading-relaxed font-sans"
                          placeholder="Write your follow-up message..."
                        />

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setIsComposingFollowUp(false)}
                            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendFollowUpToSophia}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-sky-600/30 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Message</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Player's Sent Follow-Up Message */}
                  {chapter3State.playerFollowUpSent && (
                    <div className="flex items-start justify-end space-x-3 pt-2">
                      <div className="space-y-1.5 max-w-lg text-right">
                        <div className="text-[10px] font-mono text-slate-400">
                          You · Project Manager
                        </div>
                        <div className="p-4 rounded-2xl rounded-tr-sm bg-indigo-600/30 border border-indigo-400/40 text-xs sm:text-[13px] text-indigo-100 shadow-md text-left leading-relaxed">
                          "{chapter3State.playerFollowUpMessage}"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sophia Typing Indicator (v2 Response) */}
                  {chapter3State.sophiaTyping && chapter3State.playerFollowUpSent && (
                    <div className="flex items-center space-x-3 text-xs text-purple-300 bg-purple-950/20 p-3 rounded-xl border border-purple-500/20 max-w-sm">
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="font-medium text-[11px]">Sophia is typing...</span>
                    </div>
                  )}

                  {/* Sophia Reply 2 & v2 Document */}
                  {chapter3State.v2Delivered && (
                    <>
                      <div className="flex items-start space-x-3 pt-2">
                        <img
                          src="/character/Sophia_bennett/SophiaDP.png"
                          alt="Sophia"
                          className="w-9 h-9 rounded-full object-cover border border-purple-400/50 shrink-0 mt-1 shadow-md"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-purple-300">Sophia Bennett</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Head of HR · Client
                            </span>
                          </div>
                          <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1c182c] border border-white/10 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed">
                            "Good catch! That wasn't included in the first document. I've checked with IT, and here's the additional information."
                          </div>
                        </div>
                      </div>

                      {/* Clean Document Viewer: Project_Amigo_UAT_Details_v2.pdf */}
                      <div className="pl-12">
                        <UatDocumentViewer
                          document={chapter3State.v2Document}
                          onSendV2ToDaniel={handleSendV2ToDaniel}
                          showV2Actions={!chapter3State.v2SentToDaniel}
                          isSending={isForwarding}
                        />
                      </div>

                      {/* Sophia's concluding note */}
                      <div className="flex items-start space-x-3 pt-1">
                        <img
                          src="/character/Sophia_bennett/SophiaDP.png"
                          alt="Sophia"
                          className="w-9 h-9 rounded-full object-cover border border-purple-400/50 shrink-0 mt-1 shadow-md"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-purple-300">Sophia Bennett</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Head of HR · Client
                            </span>
                          </div>
                          <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1c182c] border border-white/10 text-xs sm:text-[13px] text-slate-100 shadow-xl leading-relaxed">
                            "That's the complete set of setup details currently available. IT will confirm when the network access configuration is ready."
                          </div>
                        </div>
                      </div>

                      {chapter3State.v2SentToDaniel && (
                        <div className="pl-12">
                          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Forwarded complete details to Daniel Brooks
                            </span>
                            <button
                              onClick={() => onSwitchContact('daniel')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <span>View Daniel's Confirmation</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
