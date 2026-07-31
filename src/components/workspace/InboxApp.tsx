import React, { useState } from 'react';
import { Search, Paperclip, Send, AlertCircle, Filter, Plus } from 'lucide-react';
import { EMAILS } from '../../data/simulationData';
import type { Email } from '../../data/simulationData';

export const InboxApp: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>(EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<Email>(EMAILS[0]);
  const [replyText, setReplyText] = useState('');

  const handleSelect = (email: Email) => {
    setSelectedEmail(email);
    setEmails((prev) =>
      prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
    );
  };

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Outlook Top Toolbar */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => alert("New mail modal opened")}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Mail</span>
          </button>
          <span className="text-slate-500">|</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Outlook mail..."
              className="bg-slate-950/80 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-48 sm:w-64"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter: All Mails</span>
        </div>
      </div>

      {/* Main Inbox Layout: List + Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List Column */}
        <div className="w-72 sm:w-80 border-r border-white/10 overflow-y-auto divide-y divide-white/5">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => handleSelect(email)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedEmail.id === email.id
                  ? 'bg-blue-600/20 border-l-4 border-blue-500'
                  : email.read
                  ? 'bg-transparent hover:bg-white/5 opacity-80'
                  : 'bg-slate-900/40 hover:bg-white/5 font-semibold'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <img src={email.senderAvatar} alt={email.sender} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs text-white truncate max-w-[120px]">{email.sender}</span>
                </div>
                <span className="text-[10px] text-slate-400">{email.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 truncate mb-1">{email.subject}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{email.snippet}</p>
              {email.priority === 'High' && (
                <div className="mt-2 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[9px] font-bold">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span>High Priority</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Email Detail View */}
        <div className="flex-1 flex flex-col bg-slate-950/40 overflow-y-auto p-6">
          <div className="pb-4 border-b border-white/10 mb-6">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-lg font-bold text-white">{selectedEmail.subject}</h2>
              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                {selectedEmail.category}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <img src={selectedEmail.senderAvatar} alt={selectedEmail.sender} className="w-10 h-10 rounded-full object-cover border border-white/10" />
              <div>
                <div className="text-sm font-semibold text-white">{selectedEmail.sender}</div>
                <div className="text-xs text-slate-400">{selectedEmail.senderRole} • To: You (Lead Transformer)</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed space-y-4 mb-6">
            {selectedEmail.body}
          </div>

          {selectedEmail.attachment && (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 flex items-center justify-between max-w-sm mb-6">
              <div className="flex items-center space-x-2 text-xs">
                <Paperclip className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">{selectedEmail.attachment}</span>
              </div>
              <button className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded font-semibold">
                Download
              </button>
            </div>
          )}

          {/* Quick Reply Composer */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Quick Reply</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${selectedEmail.sender}...`}
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={() => { setReplyText(''); alert('Reply sent! Stakeholder trust updated.'); }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
