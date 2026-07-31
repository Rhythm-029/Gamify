import React, { useState } from 'react';
import { Mail, Search, Paperclip, Send, AlertCircle, Folder } from 'lucide-react';
import { OS_MAILS } from '../../data/brainedOSData';
import type { MailItem } from '../../data/brainedOSData';

export const AppleMailApp: React.FC = () => {
  const [mails, setMails] = useState<MailItem[]>(OS_MAILS);
  const [selectedMail, setSelectedMail] = useState<MailItem>(OS_MAILS[0]);
  const [activeFolder, setActiveFolder] = useState<string>('Inbox');
  const [replyText, setReplyText] = useState('');

  const handleSelect = (mail: MailItem) => {
    setSelectedMail(mail);
    setMails((prev) =>
      prev.map((m) => (m.id === mail.id ? { ...m, read: true } : m))
    );
  };

  const filteredMails = mails.filter((m) => m.folder === activeFolder);

  return (
    <div className="flex-1 flex flex-row overflow-hidden bg-slate-950/80 text-white font-sans text-xs">
      {/* PANEL 1: Apple Mail Sidebar */}
      <div className="w-48 bg-slate-950/90 border-r border-white/10 p-3 flex flex-col justify-between shrink-0 select-none">
        <div>
          <div className="flex items-center space-x-2 px-2 py-2 mb-4 border-b border-white/10">
            <Mail className="w-4 h-4 text-sky-400" />
            <span className="font-extrabold text-sm text-white">Apple Mail</span>
          </div>

          <div className="space-y-1">
            <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mailboxes</span>
            {['Inbox', 'Sent', 'Drafts', 'Archive'].map((fld) => (
              <button
                key={fld}
                onClick={() => setActiveFolder(fld)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeFolder === fld ? 'bg-sky-600/30 text-sky-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fld}</span>
                </div>
                {fld === 'Inbox' && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-bold">
                    {mails.filter((m) => !m.read).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL 2: Email List */}
      <div className="w-72 sm:w-80 border-r border-white/10 overflow-y-auto divide-y divide-white/5 bg-slate-900/40">
        <div className="p-3 border-b border-white/10 sticky top-0 bg-slate-950/90 backdrop-blur-md">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Mail..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {filteredMails.map((mail) => (
          <div
            key={mail.id}
            onClick={() => handleSelect(mail)}
            className={`p-4 cursor-pointer transition-colors ${
              selectedMail.id === mail.id
                ? 'bg-sky-600/20 border-l-4 border-sky-500'
                : mail.read
                ? 'bg-transparent hover:bg-white/5 opacity-80'
                : 'bg-slate-900/60 hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-white truncate max-w-[140px]">{mail.sender}</span>
              <span className="text-[10px] text-slate-400">{mail.timestamp}</span>
            </div>
            <h4 className="text-xs font-semibold text-slate-200 truncate mb-1">{mail.subject}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{mail.preview}</p>
            {mail.priority === 'High' && (
              <div className="mt-2 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[9px] font-bold">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>High Priority</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PANEL 3: Full Email Preview */}
      <div className="flex-1 flex flex-col bg-slate-950/60 overflow-y-auto p-6">
        <div className="pb-4 border-b border-white/10 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-white">{selectedMail.subject}</h2>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono">
              {selectedMail.priority} Priority
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <img src={selectedMail.senderAvatar} alt={selectedMail.sender} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <div>
              <div className="text-sm font-semibold text-white">{selectedMail.sender}</div>
              <div className="text-xs text-slate-400">{selectedMail.senderRole} • &lt;{selectedMail.email}&gt;</div>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="flex-1 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed space-y-4 mb-6">
          {selectedMail.body}
        </div>

        {/* Attachment Card */}
        {selectedMail.attachment && (
          <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 flex items-center justify-between max-w-sm mb-6">
            <div className="flex items-center space-x-2 text-xs">
              <Paperclip className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-white font-semibold block">{selectedMail.attachment.name}</span>
                <span className="text-[10px] text-slate-400">{selectedMail.attachment.size}</span>
              </div>
            </div>
            <button 
              onClick={() => alert(`Downloading attachment: ${selectedMail.attachment?.name}`)}
              className="text-[10px] bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg font-bold cursor-pointer"
            >
              Download
            </button>
          </div>
        )}

        {/* Quick Reply Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center space-x-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${selectedMail.sender}...`}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          />
          <button 
            onClick={() => { setReplyText(''); alert('Reply sent! Executive trust updated.'); }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
