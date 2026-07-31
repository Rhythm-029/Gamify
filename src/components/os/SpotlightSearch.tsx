import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Mail, X, ArrowRight } from 'lucide-react';
import { OS_MAILS, OS_FINDER_FILES } from '../../data/brainedOSData';
import { STAKEHOLDERS } from '../../data/simulationData';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (appId: string) => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  isOpen,
  onClose,
  onSelectApp,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMails = OS_MAILS.filter((m) =>
    m.subject.toLowerCase().includes(query.toLowerCase()) || m.sender.toLowerCase().includes(query.toLowerCase())
  );

  const filteredFiles = OS_FINDER_FILES.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStakeholders = STAKEHOLDERS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) || s.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/90"
        >
          {/* Spotlight Input Header */}
          <div className="p-4 border-b border-white/10 flex items-center space-x-3">
            <Search className="w-5 h-5 text-purple-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Spotlight Search Brained OS (e.g. Knox, Charter, Security, Mail)..."
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 font-sans"
              autoFocus
            />
            <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Stakeholders */}
            {filteredStakeholders.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                  Stakeholders & People
                </span>
                <div className="space-y-1">
                  {filteredStakeholders.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => { onSelectApp('stakeholders'); onClose(); }}
                      className="p-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between cursor-pointer text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div className="font-semibold text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-400">{s.role}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mails */}
            {filteredMails.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                  Outlook Emails
                </span>
                <div className="space-y-1">
                  {filteredMails.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => { onSelectApp('inbox'); onClose(); }}
                      className="p-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between cursor-pointer text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-sky-400" />
                        <div>
                          <div className="font-semibold text-white">{m.subject}</div>
                          <div className="text-[10px] text-slate-400">From: {m.sender}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {filteredFiles.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                  Finder Files
                </span>
                <div className="space-y-1">
                  {filteredFiles.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => { onSelectApp('finder'); onClose(); }}
                      className="p-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between cursor-pointer text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-semibold text-white">{f.name}</div>
                          <div className="text-[10px] text-slate-400">{f.path} • {f.size}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
