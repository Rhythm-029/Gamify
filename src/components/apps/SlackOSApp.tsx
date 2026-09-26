/**
 * SlackOSApp — live Slack simulation.
 *
 * Characters: Daniel, Emma, Marcus, Aarav.
 * Sophia and Olivia do NOT appear here.
 *
 * Scheduled messages arrive from GameContext.deliveredSlackMessages
 * (fired at exact realElapsedMs offsets by the FrontendEventScheduler).
 *
 * Player can send DMs to any character; canned character replies return.
 * Reading Daniel's DM discovers req_payroll (if the message is present).
 * Reading Emma's DM discovers req_document_upload or req_bulk_import.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hash, Send, MessageSquare, ChevronDown } from 'lucide-react';
import { useGame, API_BASE } from '../../context/GameContext';
import type { ScheduledSlackMsg } from '../../context/GameContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocalMsg {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  channelId?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  characterId?: string;
}

// ── Characters (no Sophia, no Olivia) ────────────────────────────────────────

// ── Context-aware reply engine ────────────────────────────────────────────────
// Each character has keyword groups mapped to specific replies.
// Falls back to general replies when no keyword matches.

interface CharDef {
  name: string;
  avatar: string;
  replies: Array<{ keywords: string[]; response: string }>;
  fallbacks: string[];
}

function getCharReply(char: CharDef, playerMsg: string): string {
  const msg = playerMsg.toLowerCase();
  for (const entry of char.replies) {
    if (entry.keywords.some(kw => msg.includes(kw))) {
      return entry.response;
    }
  }
  // Fallback: rotate through general replies
  return char.fallbacks[Math.floor(Math.random() * char.fallbacks.length)];
}

const CHARS: Record<string, CharDef> = {
  daniel: {
    name: 'Daniel Brooks',
    avatar: '/character/Daniel_Brooks/DanielDP.png',
    replies: [
      { keywords: ['sso', 'single sign', 'auth', 'login', 'authentication'], response: "SSO is confirmed as the auth method. We're using the client's existing identity provider — do not reinvent this. Cera should generate the login scaffold, you just need to confirm the provider config." },
      { keywords: ['rbac', 'role', 'permission', 'access control', 'admin'], response: "Three roles: Employee, Manager, HR Admin. Employees see their own data. Managers see their team. HR Admin sees everything with audit trail. That is the access model — build to it." },
      { keywords: ['payroll', 'salary', 'vendor', 'api', 'integration'], response: "Payroll integration is in scope but flagged — the vendor API docs are outdated. Scope it as an integration layer for Phase 1, with the actual sync to be confirmed with the vendor before go-live." },
      { keywords: ['audit', 'log', 'trail', 'gdpr', 'compliance'], response: "Audit logging is a compliance requirement. Every access to employee personal data needs a full trail. This is non-negotiable for the board sign-off — get it in the prototype." },
      { keywords: ['document', 'upload', 'attach', 'file', 'emma'], response: "Emma's document upload request came in post-kickoff. It is a reasonable ask, but adding it to Phase 1 is a timeline risk. My recommendation: propose it for Phase 2 and document the decision." },
      { keywords: ['timeline', 'deadline', 'week', 'day', 'when', 'days left'], response: "Two weeks firm. Board review is locked. If scope is threatening the timeline, flag it now — not at Day 12." },
      { keywords: ['mom', 'minutes', 'notes', 'documentation', 'kickoff notes'], response: "MOM should already be on file for the kickoff. If it is not submitted yet, do it now — it is a process requirement and the board will ask." },
      { keywords: ['prototype', 'build', 'cera', 'ide', 'features'], response: "Core features need to be in: SSO, dashboard, directory, leave, attendance, RBAC. Hidden requirements that were surfaced should also be included. Do not build what was not agreed." },
      { keywords: ['marcus', 'cto', 'board', 'presentation', 'review'], response: "Marcus wants to see the architecture documented — not just screens. Roles, auth, data flow. Prepare for that before the board review." },
      { keywords: ['hi', 'hello', 'hey', 'morning', 'afternoon'], response: "Hi. What do you need?" },
      { keywords: ['thanks', 'thank you', 'great', 'good', 'perfect'], response: "Noted. Keep moving." },
      { keywords: ['stuck', 'blocked', 'issue', 'problem', 'help', 'confused'], response: "Tell me the specific blocker. Vague problems get vague answers. What exactly is stuck?" },
    ],
    fallbacks: [
      "Timeline is tight. What specifically do you need?",
      "Good question — but loop in the right person if it's out of my lane.",
      "Keep it documented. Undocumented decisions become undocumented risks.",
      "What is the decision you're trying to make? That will help me give you a useful answer.",
    ],
  },

  emma: {
    name: 'Emma Carter',
    avatar: '/character/Emma_Carter/EmmaDP.png',
    replies: [
      { keywords: ['leave', 'absence', 'holiday', 'vacation', 'time off'], response: "Leave management is one of the biggest pain points for Titan employees right now. Requests go through email and sometimes just get lost. The new system needs to make this dead simple — request, approval, done." },
      { keywords: ['attendance', 'clock', 'shift', 'check in', 'timesheet'], response: "Attendance tracking is tricky at Titan because some employees are on shift work. They need to be able to log in from shared terminals on the plant floor, not just from desks. Keep the UX very simple." },
      { keywords: ['directory', 'org chart', 'find', 'contact', 'employee search'], response: "The directory is actually one of the first things I'd show the board. Employees genuinely cannot find each other right now. If the search is good and the profiles are clean, that will make a real impression." },
      { keywords: ['document', 'upload', 'attach', 'certificate', 'medical', 'id proof'], response: "Yes — this came from the plant HR leads. Employees need to be able to attach things like ID proof and medical certificates directly when filing requests. It came up post-kickoff but it is a real need." },
      { keywords: ['adoption', 'training', 'simple', 'easy', 'ux', 'user'], response: "Employee adoption is everything. If the tool is not intuitive on first use, people will not switch. The plant floor workers especially are not comfortable with complex interfaces." },
      { keywords: ['dashboard', 'home', 'landing', 'welcome'], response: "The dashboard should feel like a home page — what matters to that employee on that day. Leave balance, upcoming requests, maybe a quick directory search. Keep it personal." },
      { keywords: ['payroll', 'salary', 'pay slip', 'payslip'], response: "Payslips being separate from the main HR portal is one of Titan's biggest frustrations. I know Daniel is handling the payroll vendor side — but from the employee perspective, having it in one place matters a lot." },
      { keywords: ['hi', 'hello', 'hey', 'morning', 'afternoon'], response: "Hi! What can I help with on the HR side?" },
      { keywords: ['thanks', 'thank you', 'great', 'helpful'], response: "Of course! Let me know if you need anything else from the employee experience angle." },
      { keywords: ['phase 2', 'later', 'defer', 'future', 'next phase'], response: "I understand if something needs to wait for Phase 2 — I just want to make sure it is logged so it does not get forgotten. Employees are counting on this." },
    ],
    fallbacks: [
      "From the employee perspective, what matters most is simplicity and reliability.",
      "The HR leads at the plant facilities have strong opinions on this — happy to share more context.",
      "I'd run that by Daniel for the technical side — I can only speak to what the employees need.",
      "Good question, actually. Let me think about how that would land with the HR teams.",
    ],
  },

  marcus: {
    name: 'Marcus Reed',
    avatar: '/character/marcus_reed/MarcusDP.png',
    replies: [
      { keywords: ['sso', 'auth', 'authentication', 'login', 'identity'], response: "SSO is non-negotiable. If the identity provider is not confirmed, nothing else matters. What provider is Titan using?" },
      { keywords: ['rbac', 'role', 'permission', 'access'], response: "RBAC is a compliance requirement, not a feature. Get the access model documented — employee, manager, HR admin. Three tiers minimum." },
      { keywords: ['audit', 'log', 'compliance', 'gdpr', 'security'], response: "Audit trail is mandatory. Every access to personal data needs to be logged. This is the board's first question and you need a clean answer." },
      { keywords: ['architecture', 'stack', 'tech', 'cera', 'build'], response: "Show me the architecture, not just the screens. Auth, roles, data model, integrations. That is what I need to sign off." },
      { keywords: ['timeline', 'deadline', 'week', 'days'], response: "Two weeks. I confirmed this at kickoff. If you are asking about the timeline, something is already going wrong." },
      { keywords: ['payroll', 'vendor', 'integration', 'api'], response: "Payroll integration strategy is yours to manage. The vendor API constraint is a risk — document it and set expectations with the client now." },
      { keywords: ['prototype', 'demo', 'board', 'presentation'], response: "The board wants to click through something real. Not wireframes, not slides. A working prototype with the core flows." },
      { keywords: ['hi', 'hello', 'hey', 'morning'], response: "What do you need?" },
      { keywords: ['thanks', 'thank', 'great', 'good'], response: "Keep moving." },
      { keywords: ['scope', 'add', 'feature', 'extra', 'new requirement'], response: "What is the timeline impact? Scope changes need to go through me and Daniel before anything is committed." },
    ],
    fallbacks: [
      "Not enough detail. Give me specifics.",
      "That is acceptable. Don't over-engineer it.",
      "Security review before production. Not optional.",
      "Document the decision. Whatever it is.",
    ],
  },

  aarav: {
    name: 'Aarav Kapoor',
    avatar: '/character/AaravDP.png',
    replies: [
      { keywords: ['mom', 'minutes', 'notes', 'document', 'kickoff'], response: "MOM is one of those things that feels admin but is actually strategy. If you have not filed it yet, do it now. What did you capture from the kickoff?" },
      { keywords: ['stuck', 'confused', 'blocked', 'not sure', 'help'], response: "Good that you're flagging it. What specifically are you unsure about — the technical side, the stakeholder side, or the scope?" },
      { keywords: ['emma', 'document upload', 'scope', 'phase 2', 'decline'], response: "Managing scope well is one of the clearest signals of consulting maturity. If the timeline cannot absorb it, say so clearly — but always offer a path forward. What is your plan?" },
      { keywords: ['marcus', 'cto', 'intimidating', 'nervous', 'scared'], response: "Marcus is direct, not hostile. Give him specifics and he respects you for it. Vague answers are what frustrate him. What are you going to say?" },
      { keywords: ['prototype', 'cera', 'ide', 'build', 'features'], response: "Before you run Cera, make sure you know what you are asking it to build. The requirements you have discovered so far — are they captured somewhere? Who have you talked to?" },
      { keywords: ['requirement', 'discover', 'find', 'missing', 'hidden'], response: "Good consultants earn requirements — they are not handed them. Who have you spoken to that is not on the obvious stakeholder list?" },
      { keywords: ['presentation', 'board', 'final', 'prepare', 'rehearse'], response: "The board wants the transformation story, not a feature list. Why did Titan need this, what did you build, what did you choose not to build, and what comes next. Can you answer those four?" },
      { keywords: ['hi', 'hello', 'hey', 'morning'], response: "Good to hear from you. How is the engagement going so far?" },
      { keywords: ['thanks', 'thank you', 'helpful', 'appreciate'], response: "Glad that helped. What is the next move?" },
      { keywords: ['audit', 'rbac', 'security', 'compliance'], response: "Those are compliance gates — if they are not in the prototype, the board cannot sign off. Have you had the architecture conversation with Daniel yet?" },
      { keywords: ['stakeholder', 'contact', 'reach out', 'who', 'client'], response: "Have you reached out to all four of them? Daniel, Emma, Marcus — and there is a fourth. Think about who is conspicuously quiet on this engagement." },
    ],
    fallbacks: [
      "What does your gut say? That is usually a good starting point.",
      "Who have you not spoken to yet on this engagement?",
      "Good consultants don't wait. They ask the question, document the answer, and move.",
      "The MOM — has it been filed? That is always my first question.",
    ],
  },
};

// ── Static channel definitions ────────────────────────────────────────────────

const CHANNEL_DEFS: SlackChannel[] = [
  { id: 'ch-general', name: 'general', type: 'channel' },
  { id: 'ch-titan', name: 'project-titan', type: 'channel' },
  { id: 'dm-daniel', name: 'Daniel Brooks', type: 'dm', characterId: 'daniel' },
  { id: 'dm-emma', name: 'Emma Carter', type: 'dm', characterId: 'emma' },
  { id: 'dm-marcus', name: 'Marcus Reed', type: 'dm', characterId: 'marcus' },
  { id: 'dm-aarav', name: 'Aarav Kapoor', type: 'dm', characterId: 'aarav' },
];

// ── Seed messages (shown from game start — static context, not timed) ─────────

const SEED_MESSAGES: LocalMsg[] = [
  {
    id: 'g1', channelId: 'ch-general',
    senderId: 'system', senderName: 'Brained', senderAvatar: '/brained_icon.png',
    content: "Welcome to Brained Consulting Slack. You've been added to Project Titan.",
    timestamp: 'Day 1 · 09:00',
  },
  {
    id: 'g2', channelId: 'ch-general',
    senderId: 'daniel', senderName: 'Daniel Brooks', senderAvatar: CHARS.daniel.avatar,
    content: '@channel — Project Titan is underway. Prototype review is Day 7. Keep the channel updated.',
    timestamp: 'Day 1 · 09:02',
  },
  {
    id: 't1', channelId: 'ch-titan',
    senderId: 'daniel', senderName: 'Daniel Brooks', senderAvatar: CHARS.daniel.avatar,
    content: "Quick reminder — document your requirements as you discover them. Don't rely on memory alone.",
    timestamp: 'Day 1 · 09:05',
  },
  {
    id: 't2', channelId: 'ch-titan',
    senderId: 'aarav', senderName: 'Aarav Kapoor', senderAvatar: CHARS.aarav.avatar,
    content: "All — for any blockers or questions, ping the relevant stakeholder directly. Daniel's right, keep it documented.",
    timestamp: 'Day 1 · 09:07',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const SlackOSApp: React.FC = () => {
  const { state, discoverRequirement, markStakeholderContacted, addSignal, markSlackRead } = useGame();

  const [activeId, setActiveId] = useState('ch-titan');
  const [playerMessages, setPlayerMessages] = useState<(LocalMsg & { channelId: string })[]>([]);
  const [charReplies, setCharReplies] = useState<(LocalMsg & { channelId: string })[]>([]);
  const [msgText, setMsgText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const replyIndexRef = useRef<Record<string, number>>({});

  // Delivered Slack messages from GameContext scheduler
  const scheduledMessages = state.deliveredSlackMessages;

  // Compute unread count per channel
  const unreadByChannel = useCallback(() => {
    const map: Record<string, number> = {};
    scheduledMessages.forEach((m) => {
      if (!m.read) {
        map[m.channel] = (map[m.channel] ?? 0) + 1;
      }
    });
    return map;
  }, [scheduledMessages]);

  const unread = unreadByChannel();
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  // Build messages for active channel
  const allMessagesForChannel = useCallback((channelId: string): LocalMsg[] => {
    const scheduled: LocalMsg[] = scheduledMessages
      .filter((m) => m.channel === channelId)
      .map((m) => ({
        id: m.id, senderId: m.characterId, senderName: m.senderName,
        senderAvatar: m.senderAvatar, content: m.content, timestamp: m.timestamp,
      }));
    const seeds = SEED_MESSAGES.filter((m) => m.channelId === channelId);
    const player = playerMessages.filter((m) => m.channelId === channelId);
    const replies = charReplies.filter((m) => m.channelId === channelId);
    // Merge: seeds first, then scheduled (by arrival), then player/replies interleaved
    return [...seeds, ...scheduled, ...player, ...replies];
  }, [scheduledMessages, playerMessages, charReplies]);

  const activeChannel = CHANNEL_DEFS.find((c) => c.id === activeId) ?? CHANNEL_DEFS[1];
  const activeMessages = allMessagesForChannel(activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const selectChannel = useCallback((id: string) => {
    setActiveId(id);
    markSlackRead(id as ScheduledSlackMsg['channel']);

    const ch = CHANNEL_DEFS.find((c) => c.id === id);
    if (!ch?.characterId) return;

    // Mark stakeholder contacted
    if (['daniel', 'emma', 'marcus', 'aarav'].includes(ch.characterId)) {
      markStakeholderContacted(ch.characterId as 'marcus' | 'daniel' | 'emma' | 'aarav');
    }

    // Trigger requirement discovery from scheduled messages in this DM
    const msgs = scheduledMessages.filter((m) => m.channel === id);
    msgs.forEach((m) => {
      if (m.discoversRequirement) {
        discoverRequirement(m.discoversRequirement);
      }
    });
  }, [scheduledMessages, markSlackRead, markStakeholderContacted, discoverRequirement]);

  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: LocalMsg & { channelId: string } = {
      id: `m-${Date.now()}`,
      channelId: activeId,
      senderId: 'player',
      senderName: 'You',
      senderAvatar: '',
      content: msgText.trim(),
      timestamp: now,
    };

    setPlayerMessages((prev) => [...prev, userMsg]);
    setMsgText('');

    // Score communication quality: DMs to characters = more valuable engagement
    if (activeChannel.type === 'dm' && activeChannel.characterId) {
      addSignal('communication', `Sent DM to ${activeChannel.name} on Slack`, 4);
    } else {
      addSignal('communication', `Posted message in #${activeChannel.name}`, 1);
    }

    // Mark stakeholder contacted when player sends a DM
    if (activeChannel.characterId && ['daniel', 'emma', 'marcus', 'aarav'].includes(activeChannel.characterId)) {
      markStakeholderContacted(activeChannel.characterId as 'marcus' | 'daniel' | 'emma' | 'aarav');
    }

    // Character AI reply call
    if (activeChannel.type === 'dm' && activeChannel.characterId) {
      const charId = activeChannel.characterId;
      const char = CHARS[charId];
      if (!char) return;

      setIsTyping(true);
      const sentText = msgText.trim();
      const currentChannelId = activeId;

      fetch(`${API_BASE}/api/game/character/${charId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: state.sessionId || localStorage.getItem('brained_session_id') || 'session_titan_default',
          message: sentText,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setIsTyping(false);
          const reply = data.replyText || data.text || getCharReply(char, sentText);

          setCharReplies((prev) => [
            ...prev,
            {
              id: `m-${Date.now()}-r`,
              channelId: currentChannelId,
              senderId: charId,
              senderName: char.name,
              senderAvatar: char.avatar,
              content: reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        })
        .catch((err) => {
          console.warn('[SLACK AI] Backend call failed, using fallback:', err);
          setIsTyping(false);
          const reply = getCharReply(char, sentText);

          setCharReplies((prev) => [
            ...prev,
            {
              id: `m-${Date.now()}-r`,
              channelId: currentChannelId,
              senderId: charId,
              senderName: char.name,
              senderAvatar: char.avatar,
              content: reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        });
    }
  }, [msgText, activeId, activeChannel, state.sessionId, addSignal, markStakeholderContacted]);

  return (
    <div className="flex-1 flex flex-row overflow-hidden bg-[#1a1d21] text-white font-sans text-xs">
      {/* Sidebar */}
      <div className="w-52 bg-[#19172a] border-r border-white/8 flex flex-col shrink-0">
        <div className="p-3 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center font-black text-xs">B</div>
            <span className="font-bold text-sm text-white">Brained</span>
          </div>
          {totalUnread > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{totalUnread}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="text-[9px] text-slate-500 uppercase px-2 py-1 font-bold flex items-center justify-between">
            Channels <ChevronDown className="w-3 h-3" />
          </p>
          {CHANNEL_DEFS.filter((c) => c.type === 'channel').map((ch) => (
            <button key={ch.id} onClick={() => selectChannel(ch.id)}
              className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${activeId === ch.id ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Hash className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1 truncate">{ch.name}</span>
              {(unread[ch.id] ?? 0) > 0 && <span className="text-[9px] bg-red-500 text-white rounded-full px-1.5">{unread[ch.id]}</span>}
            </button>
          ))}

          <p className="text-[9px] text-slate-500 uppercase px-2 py-1 font-bold mt-3 flex items-center justify-between">
            Direct Messages <ChevronDown className="w-3 h-3" />
          </p>
          {CHANNEL_DEFS.filter((c) => c.type === 'dm').map((ch) => {
            const char = ch.characterId ? CHARS[ch.characterId] : null;
            return (
              <button key={ch.id} onClick={() => selectChannel(ch.id)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${activeId === ch.id ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                {char?.avatar
                  ? <img src={char.avatar} alt={ch.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-5 h-5 rounded-full bg-slate-600 flex-shrink-0" />}
                <span className="flex-1 truncate text-[11px]">{ch.name}</span>
                {(unread[ch.id] ?? 0) > 0 && <span className="text-[9px] bg-red-500 text-white rounded-full px-1.5">{unread[ch.id]}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-10 border-b border-white/8 flex items-center px-4 space-x-2 shrink-0 bg-[#1a1d21]">
          {activeChannel.type === 'channel'
            ? <Hash className="w-4 h-4 text-slate-400" />
            : <MessageSquare className="w-4 h-4 text-slate-400" />}
          <span className="font-bold text-sm">{activeChannel.name}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeMessages.map((msg) => {
            const isPlayer = msg.senderId === 'player';
            return (
              <div key={msg.id} className="flex items-start space-x-3">
                {msg.senderAvatar
                  ? <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  : <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isPlayer ? 'bg-sky-600' : 'bg-slate-600'}`}>{(msg.senderName || '?')[0]}</div>}
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-[11px] font-bold ${isPlayer ? 'text-sky-300' : 'text-white'}`}>{msg.senderName}</span>
                    <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-500">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex-shrink-0" />
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {activeChannel.type === 'dm' ? (
          <form onSubmit={handleSend} className="p-3 border-t border-white/8 bg-[#1e2128]">
            <div className="flex items-center space-x-2 bg-[#2a2d36] rounded-xl border border-white/10 px-3 py-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder={`Message ${activeChannel.name}…`}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button type="submit" disabled={!msgText.trim()} className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 cursor-pointer">
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 border-t border-white/8 bg-[#1e2128]">
            <div className="flex items-center space-x-2 bg-[#2a2d36] rounded-xl border border-white/5 px-3 py-2 opacity-50">
              <input
                type="text"
                disabled
                placeholder={`#${activeChannel.name} is read-only — use Direct Messages to contact stakeholders`}
                className="flex-1 bg-transparent text-xs text-slate-500 placeholder-slate-600 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
