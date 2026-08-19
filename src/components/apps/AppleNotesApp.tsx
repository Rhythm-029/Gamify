/**
 * AppleNotesApp — wired to GameContext MOM submission.
 *
 * The MOM note is special:
 * - Player writes it manually (no AI assistance during writing)
 * - "Submit as MOM" button sends to backend MOM service
 * - All other notes work as scratchpad
 *
 * The AI-enhance button is REMOVED — per spec, no LLM during MOM writing.
 */

import React, { useState } from 'react';
import { FileText, Pin, Plus, Folder, Search, Send, Check } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface NoteItem {
  id: string;
  title: string;
  folder: string;
  pinned: boolean;
  lastModified: string;
  content: string;
  isMOM?: boolean;
}

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-mom',
    title: 'Meeting Notes — Titan Kickoff',
    folder: 'Project Titan',
    pinned: true,
    lastModified: 'Just now',
    isMOM: true,
    content: `# Project Titan — Kickoff Meeting Notes
## Date: Day 1

### Participants
- Marcus Reed (CTO)
- Daniel Brooks (Program Manager)
- Emma Carter (HR Transformation Specialist)
- Sophia Bennett (VP HR, Titan Manufacturing)
- [Your name] (Digital Transformation Consultant)

### Summary


### Requirements Discussed


### Action Items
- [ ] 
- [ ] 

### Timeline
- Day 7: Prototype Review
- Day 14: Board Presentation

### Risks & Concerns


### Open Questions

`,
  },
  {
    id: 'note-project',
    title: 'Project Titan — Working Notes',
    folder: 'Project Titan',
    pinned: false,
    lastModified: 'Now',
    content: '# Titan HR Portal\n\n## Architecture Notes\n\n\n## Decisions Made\n\n\n## Risks\n\n',
  },
  {
    id: 'note-scratch',
    title: 'Scratchpad',
    folder: 'All Notes',
    pinned: false,
    lastModified: 'Now',
    content: '',
  },
];

const FOLDERS = ['All Notes', 'Project Titan', 'MOM Archive'];

export const AppleNotesApp: React.FC = () => {
  const { submitMOM, state, addSignal } = useGame();

  const [notes, setNotes] = useState<NoteItem[]>(DEFAULT_NOTES);
  const [selectedId, setSelectedId] = useState(DEFAULT_NOTES[0].id);
  const [activeFolder, setActiveFolder] = useState('Project Titan');
  const [momSubmitted, setMomSubmitted] = useState(state.meetingState.momSubmitted);
  const [submitting, setSubmitting] = useState(false);

  const selected = notes.find((n) => n.id === selectedId) ?? notes[0];
  const currentContent = notes.find((n) => n.id === selectedId)?.content ?? '';

  const updateContent = (val: string) => {
    setNotes((prev) => prev.map((n) => n.id === selectedId ? { ...n, content: val } : n));
  };

  const handleCreateNote = () => {
    const note: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      folder: activeFolder,
      pinned: false,
      lastModified: 'Just now',
      content: '',
    };
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
    addSignal('documentation', 'Created a new note', 2);
  };

  const handleSubmitMOM = async () => {
    if (momSubmitted || !selected?.isMOM) return;
    setSubmitting(true);
    await submitMOM(currentContent);
    setMomSubmitted(true);
    setSubmitting(false);
    // Archive it
    setNotes((prev) => prev.map((n) => n.id === selected.id ? { ...n, folder: 'MOM Archive', lastModified: 'Submitted' } : n));
  };

  const filteredNotes = notes.filter((n) => activeFolder === 'All Notes' || n.folder === activeFolder);

  return (
    <div className="flex-1 flex flex-row overflow-hidden bg-slate-950/80 text-white font-sans text-xs">
      {/* PANEL 1: Folders */}
      <div className="w-44 bg-slate-950/90 border-r border-white/10 p-3 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-2 py-2 mb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-sm text-white">Notes</span>
          </div>
          <button onClick={handleCreateNote} className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-0.5">
          <span className="px-2 text-[9px] uppercase font-bold text-slate-500 tracking-wider">Folders</span>
          {FOLDERS.map((fld) => (
            <button
              key={fld}
              onClick={() => setActiveFolder(fld)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                activeFolder === fld ? 'bg-amber-500/25 text-amber-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-slate-400" />
              <span>{fld}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PANEL 2: Note list */}
      <div className="w-56 border-r border-white/10 overflow-y-auto divide-y divide-white/5 bg-slate-900/40">
        <div className="p-3 border-b border-white/10 sticky top-0 bg-slate-950/90">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input type="text" placeholder="Search…" className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
        </div>
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => setSelectedId(note.id)}
            className={`p-4 cursor-pointer transition-colors ${
              selectedId === note.id ? 'bg-amber-500/20 border-l-4 border-amber-500' : 'bg-transparent hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-white truncate max-w-[130px]">{note.title}</h4>
              {note.pinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
            </div>
            <p className="text-[10px] text-slate-400">{note.lastModified}</p>
            {note.isMOM && (
              <span className="mt-1 inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">MOM</span>
            )}
          </div>
        ))}
      </div>

      {/* PANEL 3: Editor */}
      <div className="flex-1 flex flex-col bg-slate-950/60 p-5 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="text-xs text-slate-400">
            {selected?.isMOM ? (
              <span className="text-amber-300 font-bold">Meeting Minutes — Document your MOM carefully. No AI assistance during writing.</span>
            ) : (
              <span>Folder: <strong className="text-white">{selected?.folder}</strong></span>
            )}
          </div>
          {selected?.isMOM && !momSubmitted && (
            <button
              onClick={handleSubmitMOM}
              disabled={submitting || currentContent.trim().length < 50}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors ${
                submitting || currentContent.trim().length < 50
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting…' : 'Submit as MOM'}</span>
            </button>
          )}
          {selected?.isMOM && momSubmitted && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>MOM Submitted — evaluation queued</span>
            </div>
          )}
        </div>

        <textarea
          value={currentContent}
          onChange={(e) => updateContent(e.target.value)}
          readOnly={selected?.isMOM && momSubmitted}
          className={`flex-1 bg-slate-950/80 border border-white/10 rounded-2xl p-5 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500 resize-none ${
            selected?.isMOM && momSubmitted ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          placeholder={selected?.isMOM ? 'Document what was discussed in the kickoff meeting…' : 'Type your notes here…'}
        />

        {selected?.isMOM && !momSubmitted && currentContent.trim().length < 50 && (
          <p className="mt-2 text-[10px] text-slate-500">Write at least 50 characters to submit your MOM.</p>
        )}
      </div>
    </div>
  );
};
