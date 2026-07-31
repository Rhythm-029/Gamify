import React, { useState } from 'react';
import { Hash, Send, Smile } from 'lucide-react';
import { SLACK_CHANNELS, STAKEHOLDERS } from '../../data/simulationData';
import type { SlackChannel, SlackMessage } from '../../data/simulationData';

export const SlackApp: React.FC = () => {
  const [channels, setChannels] = useState<SlackChannel[]>(SLACK_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>(SLACK_CHANNELS[0].id);
  const [messageText, setMessageText] = useState('');

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg: SlackMessage = {
      id: `m-${Date.now()}`,
      senderId: 'user',
      senderName: 'Alex Vance (You)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      content: messageText,
      timestamp: 'Just now',
    };

    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId ? { ...c, messages: [...c.messages, newMsg] } : c
      )
    );
    setMessageText('');
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== activeChannelId) return ch;
        return {
          ...ch,
          messages: ch.messages.map((msg) => {
            if (msg.id !== msgId) return msg;
            const existing = msg.reactions?.find((r) => r.emoji === emoji);
            const updatedReactions = existing
              ? msg.reactions?.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
              : [...(msg.reactions || []), { emoji, count: 1, reacted: true }];
            return { ...msg, reactions: updatedReactions };
          }),
        };
      })
    );
  };

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-row overflow-hidden">
      {/* Slack Sidebar */}
      <div className="w-56 bg-slate-950/70 border-r border-white/10 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-2 px-2 py-2 mb-4 border-b border-white/10">
            <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-xs text-white">
              S
            </div>
            <span className="font-bold text-sm text-white tracking-tight">Apex Slack HQ</span>
          </div>

          {/* Channels */}
          <div className="space-y-1 mb-6">
            <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Channels</span>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeChannelId === ch.id ? 'bg-purple-600/30 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{ch.name}</span>
                </div>
                {ch.unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
            ))}
          </div>

          {/* Direct Messages */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Direct Messages</span>
            {STAKEHOLDERS.slice(0, 4).map((stk) => (
              <div key={stk.id} className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-white/5 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="truncate">{stk.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slack Main Chat Screen */}
      <div className="flex-1 flex flex-col bg-slate-950/40 overflow-hidden">
        {/* Top Channel Header */}
        <div className="h-12 border-b border-white/10 px-6 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 font-bold text-white">
            <Hash className="w-4 h-4 text-purple-400" />
            <span>{activeChannel.name}</span>
          </div>
          <span className="text-[10px] text-slate-400">4 Stakeholders Online</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeChannel.messages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3 group">
              <img src={msg.senderAvatar} alt={msg.senderName} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold text-white">{msg.senderName}</span>
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                </div>
                <div className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-2xl border border-white/5 inline-block max-w-xl leading-relaxed">
                  {msg.content}
                </div>

                {/* Reactions */}
                <div className="flex items-center space-x-2 mt-2">
                  {msg.reactions?.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleReaction(msg.id, r.emoji)}
                      className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center space-x-1 ${
                        r.reacted ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-slate-900 border-white/10 text-slate-400'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => handleReaction(msg.id, '👍')}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 hover:text-white px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 transition-opacity"
                  >
                    + React
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Simulated Typing Indicator */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 italic">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Tariq Dev is typing a response...</span>
          </div>
        </div>

        {/* Input Field */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-900/80">
          <div className="flex items-center bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Send message to #${activeChannel.name}...`}
              className="flex-1 bg-transparent text-white focus:outline-none"
            />
            <div className="flex items-center space-x-2 text-slate-400">
              <Smile className="w-4 h-4 cursor-pointer hover:text-white" />
              <button type="submit" className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
