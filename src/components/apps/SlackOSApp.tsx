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
import { useGame } from '../../context/GameContext';
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

const CHARS: Record<string, { name: string; avatar: string; fallbacks: string[] }> = {
  daniel: {
    name: 'Daniel Brooks',
    avatar: '/character/Daniel_Brooks/DanielDP.png',
    fallbacks: [
      "Let me check on that and get back to you quickly.",
      "Good question. Keep this moving — prototype review is Day 7.",
      "I'll flag this with Marcus if needed. What's your current blockers?",
      "Timeline's tight. Prioritise the core workflow first, then layer in the additions.",
      "Thanks for the update. Keep communicating — no surprises at the review.",
    ],
  },
  emma: {
    name: 'Emma Carter',
    avatar: '/character/Emma_Carter/EmmaDP.png',
    fallbacks: [
      "Happy to help clarify the HR side of things!",
      "The employees at Titan are used to simple tools — keep the UX straightforward.",
      "From an HR process perspective, the approval flow should be seamless for managers.",
      "Some employees access HR from shared terminals on the plant floor — keep it simple.",
      "Employee adoption is the main concern. If it's not easy, they won't use it.",
    ],
  },
  marcus: {
    name: 'Marcus Reed',
    avatar: '/character/marcus_reed/MarcusDP.png',
    fallbacks: [
      "Need more detail on the architecture. Document it.",
      "That's acceptable. Keep it lean — we're solving a business problem, not building a platform.",
      "Security review before production. Non-negotiable.",
      "What's the access model? Don't assume everyone gets the same permissions.",
      "Good. Don't over-engineer it.",
    ],
  },
  aarav: {
    name: 'Aarav Kapoor',
    avatar: '/character/AaravDP.png',
    fallbacks: [
      "You're doing well. Think about what the client actually needs — not what's technically elegant.",
      "Prototype review is coming up — make sure you can explain the employee journey end-to-end.",
      "Good consultants discover requirements, they don't wait to be handed them.",
      "The hidden requirements are there for a reason. Keep exploring.",
      "How's the documentation coming along? The MOM matters.",
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
    addSignal('communication', `Sent Slack message to ${activeChannel.name}`, 2);

    // Mark stakeholder contacted when player sends a DM
    if (activeChannel.characterId && ['daniel', 'emma', 'marcus', 'aarav'].includes(activeChannel.characterId)) {
      markStakeholderContacted(activeChannel.characterId as 'marcus' | 'daniel' | 'emma' | 'aarav');
    }

    // Character reply
    if (activeChannel.type === 'dm' && activeChannel.characterId) {
      const charId = activeChannel.characterId;
      const char = CHARS[charId];
      if (!char) return;

      setIsTyping(true);
      const delay = 1500 + Math.random() * 2000;

      setTimeout(() => {
        setIsTyping(false);
        const idx = replyIndexRef.current[charId] ?? 0;
        const reply = char.fallbacks[idx % char.fallbacks.length];
        replyIndexRef.current[charId] = idx + 1;

        setCharReplies((prev) => [...prev, {
          id: `m-${Date.now()}-r`,
          channelId: activeId,
          senderId: charId,
          senderName: char.name,
          senderAvatar: char.avatar,
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }, delay);
    }
  }, [msgText, activeId, activeChannel, addSignal, markStakeholderContacted]);

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

        <form onSubmit={handleSend} className="p-3 border-t border-white/8 bg-[#1e2128]">
          <div className="flex items-center space-x-2 bg-[#2a2d36] rounded-xl border border-white/10 px-3 py-2">
            <input
              type="text"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder={`Message ${activeChannel.type === 'dm' ? activeChannel.name : '#' + activeChannel.name}`}
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button type="submit" disabled={!msgText.trim()} className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 cursor-pointer">
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
