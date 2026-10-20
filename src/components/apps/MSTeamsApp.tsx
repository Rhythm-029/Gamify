import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video, Users, MonitorUp, MessageSquare, Calendar,
  Phone, Search, Paperclip, Send, FileText, Sparkles, ArrowRight, Volume2
} from 'lucide-react';
import type { ScopeAssignmentResult } from './ProjectAmigoScopeAssignment';
import { getSessionAssignmentResult } from '../../data/chaptersData';

import type { Chapter2State } from '../../types/chapter2';

interface MSTeamsAppProps {
  onPenalty?: (trustDelta: number, xpDelta: number) => void;
  onOpenAssignment?: () => void;
  onOpenBrief?: () => void;
  onOpenChapterCompletion?: () => void;
  hasReadBrief?: boolean;
  initialChatId?: 'aarav' | 'marcus' | 'sophia' | 'daniel' | 'amigo-dev-ops';
  activeChapter?: number;
  chapter2State?: Chapter2State;
  onOpenIncidentPanel?: () => void;
  onOpenCommunicationSetup?: () => void;
  onOpenDesignReview?: () => void;
  onOpenSprintReadiness?: () => void;
}

interface ChatContact {
  id: 'aarav' | 'marcus' | 'sophia' | 'daniel' | 'amigo-dev-ops';
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  online: boolean;
  isChannel?: boolean;
}

const CANONICAL_CHAPTER1_RESULT: ScopeAssignmentResult = {
  priorities: ['Performance Appraisals', 'Attendance Tracking', 'Leave Management'],
  dependencyChoice: 'B',
  validations: ['Staging LDAP Sandbox Access', 'Port 443 & Proxy Rules', 'Concurrent User Performance Audit'],
  evaluation: {
    score: 95,
    scheduleScore: 90,
    riskScore: 95,
    governanceScore: 100,
    efficiencyScore: 95,
    aaravResponse: "Solid breakdown. Prioritizing Appraisals, Attendance, and Leave hits the critical path for ICICI's upcoming cycle, and treating LDAP as an explicit prerequisite prevents premature development blockages.",
    isStrong: true,
    feedbackItems: [
      "Prioritized core appraisal, leave, and attendance workflows",
      "Identified LDAP sandbox as non-negotiable prerequisite",
      "Avoided committing unvalidated modules to the 90-day window"
    ],
  }
};

interface CustomMessage {
  sender: 'player' | 'contact';
  text: string;
  time: string;
}

export const MSTeamsApp: React.FC<MSTeamsAppProps> = ({
  onPenalty,
  onOpenAssignment,
  onOpenBrief,
  onOpenChapterCompletion,
  hasReadBrief = false,
  initialChatId = 'aarav',
  activeChapter,
  chapter2State,
  onOpenIncidentPanel,
  onOpenCommunicationSetup,
  onOpenDesignReview,
  onOpenSprintReadiness,
}) => {
  const isCh2 = (activeChapter ?? 1) >= 2;
  const [activeTab, setActiveTab] = useState<'chat' | 'calls' | 'teams'>('chat');
  const [activeChatId, setActiveChatId] = useState<'aarav' | 'marcus' | 'sophia' | 'daniel' | 'amigo-dev-ops'>(
    initialChatId || (isCh2 ? 'daniel' : 'aarav')
  );
  const [messageInput, setMessageInput] = useState('');
  const [customMessages, setCustomMessages] = useState<Record<string, CustomMessage[]>>({});

  // Keep activeChatId in sync if initialChatId changes
  useEffect(() => {
    setActiveChatId(initialChatId);
  }, [initialChatId]);

  // Chapter 1 Assignment State stored in session
  const [assignmentResult, setAssignmentResult] = useState<ScopeAssignmentResult | null>(() => {
    return getSessionAssignmentResult();
  });

  // Keep Teams in sync with session assignment state
  useEffect(() => {
    const checkState = () => {
      const res = getSessionAssignmentResult();
      if (res && (!assignmentResult || res.evaluation.score !== assignmentResult.evaluation.score)) {
        setAssignmentResult(res);
      }
    };
    checkState();
    const interval = setInterval(checkState, 500);
    return () => clearInterval(interval);
  }, [assignmentResult]);

  // In Chapter 2, if assignmentResult wasn't completed in this session, use canonical baseline so history is preserved
  const effectiveAssignmentResult = assignmentResult || (isCh2 ? CANONICAL_CHAPTER1_RESULT : null);

  // Dynamic Contacts List depending on Active Chapter
  const contactsList: ChatContact[] = isCh2
    ? [
        {
          id: 'daniel',
          name: 'Daniel Brooks',
          role: 'Lead Backend Developer · Brained',
          avatar: '/character/Daniel_Brooks/DanielDP.png',
          lastMessage: chapter2State?.infrastructure.bankITResolved
            ? "Environment is verified. Ready for sprint work."
            : "We can't connect to ICICI's staging environment. Port 443 blocked...",
          time: '09:30 AM',
          unread: !chapter2State?.infrastructure.bankITResolved,
          online: true,
        },
        ...(chapter2State?.communication.channelCreated
          ? [
              {
                id: 'amigo-dev-ops' as const,
                name: '# amigo-dev-ops',
                role: 'Engineering Operations Channel',
                avatar: '',
                lastMessage: chapter2State?.uiux.approvalReceived
                  ? 'Sprint 1 gates ready for authorization'
                  : 'Sprint 1 readiness checks and technical updates',
                time: '09:45 AM',
                unread: !chapter2State?.uiux.approvalReceived,
                online: true,
                isChannel: true,
              },
            ]
          : []),
        {
          id: 'aarav',
          name: 'Aarav Kapoor',
          role: 'Senior Consultant · Project Manager',
          avatar: '/character/AaravDP.png',
          lastMessage: 'Good morning! Martha and Daniel are coordinating technical prerequisites for Sprint 1.',
          time: '09:10 AM',
          unread: false,
          online: true,
        },
        {
          id: 'marcus',
          name: 'Marcus Reed',
          role: 'Chief Technology Officer · Brained',
          avatar: '/character/marcus_reed/MarcusDP.png',
          lastMessage: customMessages['marcus']?.length ? customMessages['marcus'][customMessages['marcus'].length - 1].text : 'No messages yet',
          time: customMessages['marcus']?.length ? 'Just now' : '',
          unread: false,
          online: true,
        },
        {
          id: 'sophia',
          name: 'Sophia Bennett',
          role: 'Head of HR Operations · ICICI Bank',
          avatar: '/character/Sophia_bennett/SophiaDP.png',
          lastMessage: customMessages['sophia']?.length ? customMessages['sophia'][customMessages['sophia'].length - 1].text : 'No messages yet',
          time: customMessages['sophia']?.length ? 'Just now' : '',
          unread: false,
          online: false,
        },
      ]
    : [
        {
          id: 'aarav',
          name: 'Aarav Kapoor',
          role: 'Senior Consultant · Project Manager',
          avatar: '/character/AaravDP.png',
          lastMessage: assignmentResult
            ? '✓ Assignment 01 Recommendation submitted'
            : "I've shared a short internal brief for you to review...",
          time: '09:15 AM',
          unread: !assignmentResult,
          online: true,
        },
        {
          id: 'daniel',
          name: 'Daniel Brooks',
          role: 'Lead Backend Developer · Brained',
          avatar: '/character/Daniel_Brooks/DanielDP.png',
          lastMessage: customMessages['daniel']?.length ? customMessages['daniel'][customMessages['daniel'].length - 1].text : 'No messages yet',
          time: customMessages['daniel']?.length ? 'Just now' : '',
          unread: false,
          online: true,
        },
        {
          id: 'marcus',
          name: 'Marcus Reed',
          role: 'Chief Technology Officer · Brained',
          avatar: '/character/marcus_reed/MarcusDP.png',
          lastMessage: customMessages['marcus']?.length ? customMessages['marcus'][customMessages['marcus'].length - 1].text : 'No messages yet',
          time: customMessages['marcus']?.length ? 'Just now' : '',
          unread: false,
          online: true,
        },
        {
          id: 'sophia',
          name: 'Sophia Bennett',
          role: 'Head of HR Operations · ICICI Bank',
          avatar: '/character/Sophia_bennett/SophiaDP.png',
          lastMessage: customMessages['sophia']?.length ? customMessages['sophia'][customMessages['sophia'].length - 1].text : 'No messages yet',
          time: customMessages['sophia']?.length ? 'Just now' : '',
          unread: false,
          online: false,
        },
      ];

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || messageInput.trim();
    if (!content) return;

    setCustomMessages((prev) => ({
      ...prev,
      [activeChatId]: [
        ...(prev[activeChatId] || []),
        { sender: 'player', text: content, time: 'Just now' },
      ],
    }));
    setMessageInput('');

    // Contextual automatic responses
    setTimeout(() => {
      let reply = '';
      if (activeChatId === 'daniel' && !isCh2) {
        reply = "Hey! Good to meet you. Still wrapping up kickoff notes with Marcus. Will ping you once we start provisioning staging.";
      } else if (activeChatId === 'marcus') {
        reply = "Hello. Let's keep direct chats reserved for key technical architecture and sprint gates. Route formal deliverables through email.";
      } else if (activeChatId === 'sophia') {
        reply = "Hello! Looking forward to modernizing our HRMS experience for the upcoming appraisal cycle.";
      } else if (activeChatId === 'aarav') {
        reply = isCh2
          ? "I'm monitoring Sprint 1 readiness checks right now. Make sure Daniel's firewall blocker is handled."
          : "Focus on understanding the client priorities in the brief first.";
      }

      if (reply) {
        setCustomMessages((prev) => ({
          ...prev,
          [activeChatId]: [
            ...(prev[activeChatId] || []),
            { sender: 'contact', text: reply, time: 'Just now' },
          ],
        }));
      }
    }, 600);
  };

  const activeContact = contactsList.find((c) => c.id === activeChatId) || contactsList[0];

  return (
    <div className="flex-1 flex flex-row bg-[#11131f] text-white font-sans overflow-hidden select-text relative">
      
      {/* ── LEFTMOST ICON RAIL (TEAMS APP SWITCHER) ── */}
      <div className="w-14 bg-[#1f2237] border-r border-white/10 flex flex-col items-center py-4 space-y-5 select-none shrink-0 z-20">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#464EB8] to-[#6264A7] flex items-center justify-center shadow-lg shadow-[#464EB8]/40 mb-2">
          <span className="font-black text-white text-base">T</span>
        </div>

        <button
          onClick={() => setActiveTab('chat')}
          className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white/15 text-white font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Chat"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'teams'
              ? 'bg-white/15 text-white font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Teams"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'calls'
              ? 'bg-white/15 text-white font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Calls"
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Calendar"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* ── CONVERSATION LIST (SIDEBAR) ── */}
      <div className="w-64 sm:w-72 bg-[#171a2b] border-r border-white/10 flex flex-col select-none shrink-0">
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white tracking-wide">Chats</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Project Amigo
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              readOnly
              value=""
              placeholder="Search people & messages..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contactsList.map((contact) => {
            const isSelected = activeChatId === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => setActiveChatId(contact.id)}
                className={`p-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#2b2f4c] text-white shadow-md border border-indigo-400/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {contact.isChannel ? (
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center font-mono font-bold text-sky-300 shrink-0">
                    #
                  </div>
                ) : (
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/15"
                    />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#171a2b]" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate text-white">
                      {contact.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {contact.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {contact.id === 'aarav' && assignmentResult
                      ? '✓ Assignment 01 Recommendation submitted'
                      : contact.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CHAT AREA (AARAV KAPOOR CONVERSATION) ── */}
      <div className="flex-1 flex flex-col bg-[#0f111d] min-w-0">
        {/* Chat Header */}
        <div className="h-14 bg-[#1a1d30] border-b border-white/10 px-6 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="w-9 h-9 rounded-full object-cover border border-white/20"
              />
              {activeContact.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1a1d30]" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm text-white">
                  {activeContact.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Available
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeContact.role} · Brained Consulting
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <button className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer" title="Video Call">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer" title="Audio Call">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer" title="Share Screen">
              <MonitorUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeChatId === 'aarav' ? (
            <>
              {/* If in Chapter 2, show yesterday's Chapter 1 history badge */}
              <div className="flex justify-center">
                <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-3.5 py-1 rounded-full border border-white/10">
                  {isCh2 ? 'Yesterday · Chapter 1: The Requirement Storm (Archived History)' : 'Today · Project Amigo Initial Briefing'}
                </span>
              </div>

              {/* Message 1 from Aarav Kapoor */}
              <div className="flex items-start space-x-3 max-w-2xl">
                <img
                  src="/character/AaravDP.png"
                  alt="Aarav"
                  className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0 mt-1"
                />
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-amber-300">Aarav Kapoor</span>
                    <span className="text-[10px] font-mono text-slate-400">Project Manager · 09:15 AM</span>
                  </div>

                  {/* Message Bubble with exact text */}
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 space-y-3 shadow-lg leading-relaxed">
                    <p>Good work getting the meeting documented.</p>
                    <p>
                      Before we start discussing delivery dates, I want you to understand what matters most to the business.
                    </p>
                    <p>
                      I've shared a short internal brief with some background on Project Amigo. Give it a read, then we'll work through the initial priorities together.
                    </p>
                    <p>
                      Don't worry about having all the answers yet. The idea is to identify what we know, what needs attention, and what we still need to clarify.
                    </p>

                    {/* Audio Voice Note Bar */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => {
                          const audio = new Audio('/audio/chapter1/08_aarav_teams_briefing.mp3');
                          audio.play().catch(() => {
                            if ('speechSynthesis' in window) {
                              const utter = new SpeechSynthesisUtterance("Good work getting the meeting documented. Before we start discussing delivery dates, I want you to understand what matters most to the business. I've shared a short internal brief with some background on Project Amigo. Give it a read, then we'll work through the initial priorities together.");
                              window.speechSynthesis.speak(utter);
                            }
                          });
                        }}
                        className="flex items-center space-x-2 text-[11px] text-amber-300 hover:text-amber-200 transition-colors cursor-pointer bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play Audio Note (0:14)</span>
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">Voicenote attached</span>
                    </div>
                  </div>

                  {/* ── ATTACHMENT CARD ── */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#181c30] border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-md">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>Project_Amigo_Internal_Brief.pdf</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            PDF
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          185 KB · Downloaded to /Downloads · Ready for Review
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onOpenBrief || onOpenAssignment}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-sky-600/30 cursor-pointer transition-all shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Project Brief</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Message 2 from Aarav (Context -> Assignment transition) ── */}
              {(hasReadBrief || effectiveAssignmentResult || isCh2) && (
                <div className="flex items-start space-x-3 max-w-2xl">
                  <img
                    src="/character/AaravDP.png"
                    alt="Aarav"
                    className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0 mt-1"
                  />
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-amber-300">Aarav Kapoor</span>
                      <span className="text-[10px] font-mono text-slate-400">Project Manager · 09:20 AM</span>
                    </div>

                    <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 space-y-2.5 shadow-lg leading-relaxed">
                      <p>That's the context. Now let's turn it into a starting point.</p>
                      <p>
                        I've put together a quick planning exercise. Make your choices based on what you've read, and flag anything that still needs to be confirmed.
                      </p>
                    </div>

                    {/* Interactive Assignment Card (Only in Chapter 1 before submission) */}
                    {!effectiveAssignmentResult && !isCh2 && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-[#181c30] border border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                        <div>
                          <div className="text-[10px] font-mono text-blue-400 uppercase font-bold tracking-wider">
                            INITIAL PLANNING · ASSIGNMENT 01
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            Define the Priorities (3 focused steps)
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Scope selection · Dependency strategy · Validation gates
                          </div>
                        </div>

                        <button
                          onClick={onOpenAssignment}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Start Assignment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Player Reply (submitted recommendation from session or canonical baseline) */}
              {effectiveAssignmentResult && (
                <div className="flex items-start justify-end space-x-3 max-w-2xl ml-auto">
                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-[10px] font-mono text-slate-400">You · Yesterday · 05:45 PM</span>
                      <span className="font-bold text-xs text-sky-400">Consultant Recommendation</span>
                    </div>

                    <div className="p-4 rounded-2xl rounded-tr-sm bg-gradient-to-r from-sky-900/60 to-indigo-900/60 border border-sky-400/40 text-xs text-slate-100 text-left space-y-2.5 shadow-xl">
                      <div className="font-bold text-white text-[11px] uppercase font-mono tracking-wider text-sky-300">
                        Initial Scope Planning Recommendation Submitted
                      </div>
                      <div>
                        <span className="text-slate-300 font-semibold">Prioritized Capabilities: </span>
                        <span className="text-white font-bold">
                          {effectiveAssignmentResult.priorities?.join(', ') || 'Performance Appraisals, Attendance Tracking, Leave Management'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-300 font-semibold">LDAP Dependency Strategy: </span>
                        <span className="text-amber-300 font-bold">
                          Record dependency & proceed with unblocked modules
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <span className="font-semibold">Validation Gates: </span>
                        {effectiveAssignmentResult.validations?.length || 3} critical gates mandated
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aarav's Follow-up Response (after assignment submission) */}
              {effectiveAssignmentResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3 max-w-2xl"
                >
                  <img
                    src="/character/AaravDP.png"
                    alt="Aarav"
                    className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0 mt-1"
                  />
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-amber-300">Aarav Kapoor</span>
                      <span className="text-[10px] font-mono text-slate-400">Project Manager · {isCh2 ? 'Yesterday' : 'Just now'}</span>
                    </div>

                    {/* Evaluated Response Bubble */}
                    <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-amber-500/30 text-xs text-slate-100 space-y-3 shadow-xl leading-relaxed">
                      <p className="whitespace-pre-wrap">{effectiveAssignmentResult.evaluation.aaravResponse}</p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <button
                          onClick={() => {
                            const audio = new Audio('/audio/chapter1/09_aarav_teams_feedback.mp3');
                            audio.play().catch(() => {
                              if ('speechSynthesis' in window) {
                                const utter = new SpeechSynthesisUtterance("Solid breakdown. Prioritizing Appraisals, Attendance, and Leave hits the critical path, and treating LDAP as an explicit dependency prevents premature blockages. You're ready to proceed to Chapter 2.");
                                window.speechSynthesis.speak(utter);
                              }
                            });
                          }}
                          className="flex items-center space-x-2 text-[11px] text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded-lg border border-emerald-500/30"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Play Evaluation Audio (0:12)</span>
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">Audio feedback</span>
                      </div>
                    </div>

                    {/* In Chapter 1: Show Completion Trigger Card */}
                    {!isCh2 ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1a1710] to-[#121622] border border-amber-500/40 flex items-center justify-between shadow-2xl">
                        <div>
                          <div className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">
                            CHAPTER 1 COMPLETE
                          </div>
                          <h4 className="text-xs font-bold text-white mt-0.5">
                            The Requirement Storm · Summary Ready
                          </h4>
                        </div>

                        <button
                          onClick={onOpenChapterCompletion}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer transition-all"
                        >
                          <span>View Takeaways & Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* In Chapter 2+: Show Archived Baseline Badge */
                      <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between shadow-lg">
                        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>Chapter 1 Initial Scoping Baseline Archived</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          Score: {effectiveAssignmentResult.evaluation.score}/100 · Completed
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── IN CHAPTER 2: AARAV'S CONTINUATION BRIEFING (TODAY) ── */}
              {isCh2 && (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-center">
                    <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/25">
                      Today · 09:10 AM · Sprint 1 Setup & Readiness
                    </span>
                  </div>

                  <div className="flex items-start space-x-3 max-w-2xl">
                    <img
                      src="/character/AaravDP.png"
                      alt="Aarav"
                      className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0 mt-1"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-amber-300">Aarav Kapoor</span>
                        <span className="text-[10px] font-mono text-slate-400">Project Manager · 09:10 AM</span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-amber-500/30 text-xs text-slate-100 shadow-md leading-relaxed space-y-2.5">
                        <p>Good morning. Today we're setting up the foundation for Sprint 1.</p>
                        <p>
                          Martha and Daniel are currently hitting network and environment gates on ICICI's staging servers. Work with Daniel in his chat to unblock infrastructure access, then coordinate with Martha on team communication and UI baseline signoffs.
                        </p>
                        <p>
                          Let's make sure all gates are cleared before issuing the development greenlight.
                        </p>
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => setActiveChatId('daniel')}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <span>Go to Daniel's Chat</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : activeChatId === 'daniel' && isCh2 ? (
            /* ── DANIEL BROOKS & MARTHA VANCE — CHAPTER 2 ENGINEERING CONVERSATION ── */
            <div className="space-y-4">
              <div className="flex justify-center">
                <span className="text-[10px] font-mono text-rose-400/90 bg-rose-500/10 px-3.5 py-1 rounded-full border border-rose-500/25">
                  Today · 09:30 AM · Project Amigo Infrastructure Blocker
                </span>
              </div>

              {/* Message 1: Daniel */}
              <div className="flex items-start space-x-3 max-w-2xl">
                <img
                  src="/character/Daniel_Brooks/DanielDP.png"
                  alt="Daniel"
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">Daniel Brooks</span>
                    <span className="text-[10px] font-mono text-slate-400">Lead Backend Developer · 09:30 AM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 shadow-md">
                    We can't connect to ICICI's staging environment. The connection keeps timing out.
                  </div>
                </div>
              </div>

              {/* Message 2: Martha */}
              <div className="flex items-start space-x-3 max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0 mt-1">
                  MV
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-purple-300">Martha Vance</span>
                    <span className="text-[10px] font-mono text-slate-400">Delivery Operations · 09:31 AM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 shadow-md leading-relaxed">
                    I've checked the support thread. Outbound port 443 is blocked, the proxy routes aren't configured, and access to the staging LDAP sandbox is still unconfirmed.
                  </div>
                </div>
              </div>

              {/* Message 3: Daniel */}
              <div className="flex items-start space-x-3 max-w-2xl">
                <img
                  src="/character/Daniel_Brooks/DanielDP.png"
                  alt="Daniel"
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">Daniel Brooks</span>
                    <span className="text-[10px] font-mono text-slate-400">Lead Backend Developer · 09:32 AM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 shadow-md leading-relaxed">
                    The team is ready to work. Can we use personal laptops, public Wi-Fi, and hardcoded mock credentials until IT fixes this?
                  </div>
                </div>
              </div>

              {/* Technical Status Panel */}
              <div className="p-4 rounded-2xl bg-[#171b30] border border-red-500/30 space-y-3 max-w-xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    STAGING CONNECTION CHECK
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    chapter2State?.infrastructure.stagingVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {chapter2State?.infrastructure.stagingVerified ? 'VERIFIED' : 'FAILED'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex justify-between">
                    <span className="text-slate-400">Connectivity</span>
                    <span className={chapter2State?.infrastructure.stagingVerified ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {chapter2State?.infrastructure.stagingVerified ? 'Connected' : 'Failed'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex justify-between">
                    <span className="text-slate-400">Port 443</span>
                    <span className={chapter2State?.infrastructure.bankITResolved ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {chapter2State?.infrastructure.bankITResolved ? 'Verified' : 'Blocked'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex justify-between">
                    <span className="text-slate-400">Proxy routes</span>
                    <span className={chapter2State?.infrastructure.bankITResolved ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {chapter2State?.infrastructure.bankITResolved ? 'Configured' : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex justify-between">
                    <span className="text-slate-400">LDAP Sandbox</span>
                    <span className={chapter2State?.infrastructure.stagingVerified ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {chapter2State?.infrastructure.stagingVerified ? 'Verified' : 'Unconfirmed'}
                    </span>
                  </div>
                </div>

                {!chapter2State?.infrastructure.requestSent && onOpenIncidentPanel && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onOpenIncidentPanel}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-red-600/30 transition-all"
                    >
                      <span>Resolve Infrastructure Blocker</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Messages after request sent */}
              {chapter2State?.infrastructure.requestSent && (
                <>
                  <div className="flex items-start space-x-3 max-w-2xl">
                    <img
                      src="/character/Daniel_Brooks/DanielDP.png"
                      alt="Daniel"
                      className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 mt-1"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-white">Daniel Brooks</span>
                        <span className="text-[10px] font-mono text-slate-400">09:35 AM</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 shadow-md leading-relaxed">
                        Understood. We'll keep the team working on isolated unit tests and local mocks while the staging dependencies are being resolved. We won't attempt to bypass the bank's network controls.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 max-w-2xl">
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0 mt-1">
                      MV
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-purple-300">Martha Vance</span>
                        <span className="text-[10px] font-mono text-slate-400">09:36 AM</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 shadow-md leading-relaxed">
                        Infrastructure request sent. I've recorded the network and LDAP dependencies in the project workspace so we can track them.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Scene 2.2 Communication Hook */}
              {chapter2State?.infrastructure.requestSent && !chapter2State?.communication.channelCreated && (
                <div className="p-4 rounded-2xl bg-[#1c223c] border border-sky-500/30 space-y-3 max-w-xl">
                  <div className="text-slate-200 text-xs leading-relaxed">
                    <strong className="text-white">Martha:</strong> “While that ticket is moving, I want to organize the Project Amigo workspace. Should I add Marcus, the stakeholders, and all 15 developers to one big group chat so everyone can see every update?”
                  </div>
                  {onOpenCommunicationSetup && (
                    <div className="flex justify-end">
                      <button
                        onClick={onOpenCommunicationSetup}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-blue-600/30 transition-all"
                      >
                        <span>Configure Communication Structure</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Scene 2.4 Resolution Messages */}
              {chapter2State?.infrastructure.bankITResolved && (
                <>
                  <div className="flex items-start space-x-3 max-w-2xl">
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0 mt-1">
                      MV
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-purple-300">Martha Vance</span>
                        <span className="text-[10px] font-mono text-slate-400">10:15 AM</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-900 border border-emerald-500/30 text-xs text-emerald-300 shadow-md leading-relaxed">
                        Bank IT has cleared the firewall request. Port 443 is open, the proxy routes are configured, and LDAP sandbox credentials are available.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 max-w-2xl">
                    <img
                      src="/character/Daniel_Brooks/DanielDP.png"
                      alt="Daniel"
                      className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 mt-1"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-white">Daniel Brooks</span>
                        <span className="text-[10px] font-mono text-slate-400">10:16 AM</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-900 border border-emerald-500/30 text-xs text-slate-200 shadow-md leading-relaxed">
                        I've verified the staging connection and authentication checks. The environment is ready for the approved development work.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeChatId === 'amigo-dev-ops' ? (
            /* ── AMIGO-DEV-OPS CHANNEL — ENGINEERING OPERATIONS ── */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 flex items-center justify-between">
                <span>Channel: <strong className="text-white"># amigo-dev-ops</strong> (Engineering Operations)</span>
                <span className="text-[10px] font-mono text-blue-400">Daniel, Martha, Team, PM</span>
              </div>

              <div className="flex items-start space-x-3 max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0 mt-1">
                  MV
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-purple-300">Martha Vance</span>
                    <span className="text-[10px] font-mono text-slate-400">09:45 AM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1e233d] border border-white/10 text-xs text-slate-100 shadow-md leading-relaxed">
                    There's good news on the design side. The designer has finished the high-fidelity prototypes for the Appraisal Dashboard, Leave Request Screen, and Form 16 Downloader.
                  </div>
                  {onOpenDesignReview && (
                    <button
                      onClick={onOpenDesignReview}
                      className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <span>Inspect UI/UX Prototypes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {chapter2State?.uiux.approvalReceived && onOpenSprintReadiness && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                      Sprint 1 Gates Ready
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      Prerequisites verified and design baseline locked.
                    </div>
                  </div>
                  <button
                    onClick={onOpenSprintReadiness}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    <span>Open Sprint 1 Readiness</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── EMPTY DM STATE (For contacts without active messages in the current chapter) ── */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none max-w-md mx-auto space-y-4 my-auto">
              <div className="relative">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-xl"
                />
                {activeContact.online && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0f111d]" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{activeContact.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeContact.role}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#171b30]/80 border border-white/10 text-xs text-slate-300 leading-relaxed shadow-lg space-y-2 text-left w-full">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct Message History</span>
                </div>
                <p>
                  This is the start of your 1:1 chat history with <strong className="text-white">{activeContact.name}</strong>.
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeContact.id === 'daniel'
                    ? 'Daniel is currently in the kickoff meeting debrief with Marcus. He will reach out once technical dependencies and staging environments are being configured.'
                    : activeContact.id === 'marcus'
                    ? 'Marcus prefers executive communications and architecture signoffs routed through formal channels and email. You can also review project deliverables with him in Design Review.'
                    : 'Sophia is the client stakeholder lead at ICICI Bank. Direct messages are reserved for milestone escalations and steerco announcements.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSendMessage(`Hi ${activeContact.name.split(' ')[0]}! Just wanted to connect regarding Project Amigo.`)}
                  className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  <span>Say hello 👋</span>
                </button>
              </div>
            </div>
          )}

          {/* ── USER SENT MESSAGES (Rendered across any chat) ── */}
          {customMessages[activeChatId]?.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 max-w-2xl ${msg.sender === 'player' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
            >
              {msg.sender === 'player' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white shrink-0 mt-1 shadow-md">
                  YOU
                </div>
              ) : (
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 mt-1"
                />
              )}
              <div className={`space-y-1 ${msg.sender === 'player' ? 'items-end' : ''}`}>
                <div className={`flex items-center space-x-2 ${msg.sender === 'player' ? 'justify-end' : ''}`}>
                  <span className="font-bold text-xs text-white">{msg.sender === 'player' ? 'You' : activeContact.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{msg.time}</span>
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                  msg.sender === 'player'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-[#1e233d] border border-white/10 text-slate-100 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 bg-[#141726] border-t border-white/10 select-none">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="bg-[#1e2238] border border-white/10 rounded-2xl p-2.5 flex items-center space-x-2"
          >
            <button type="button" className="p-1.5 text-slate-400 hover:text-white transition-all">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Reply to ${activeContact.name}...`}
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};
