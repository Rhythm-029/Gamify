import React, { useState } from 'react';
import { FileText, Sparkles, Pin, Plus, Folder, Search, Save } from 'lucide-react';
import { OS_NOTES } from '../../data/brainedOSData';
import type { NoteItem } from '../../data/brainedOSData';

export const AppleNotesApp: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(OS_NOTES);
  const [selectedNote, setSelectedNote] = useState<NoteItem>(OS_NOTES[0]);
  const [activeFolder, setActiveFolder] = useState<string>('All Notes');
  const [noteContent, setNoteContent] = useState<string>(OS_NOTES[0].content);
  const [aiApplied, setAiApplied] = useState(false);

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNote(note);
    setNoteContent(note.content);
    setAiApplied(false);
  };

  const handleCreateNewNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: "Untitled Strategic Note",
      folder: "All Notes",
      pinned: false,
      lastModified: "Just now",
      content: "# New Note\n\nType your corporate transformation notes here..."
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setNoteContent(newNote.content);
  };

  const handleApplyAI = () => {
    setNoteContent((prev) => prev + `\n\n--- AI EXECUTIVE DIRECTIVE ---\nAdded Zero-Trust OAuth compliance clause for CISO Knox: "Enforce Vault KMS token rotation every 15 mins."`);
    setAiApplied(true);
  };

  return (
    <div className="flex-1 flex flex-row overflow-hidden bg-slate-950/80 text-white font-sans text-xs">
      {/* PANEL 1: Folders */}
      <div className="w-48 bg-slate-950/90 border-r border-white/10 p-3 flex flex-col justify-between shrink-0 select-none">
        <div>
          <div className="flex items-center justify-between px-2 py-2 mb-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-sm text-white">Apple Notes</span>
            </div>
            <button 
              onClick={handleCreateNewNote}
              className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 cursor-pointer"
              title="New Note"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Folders</span>
            {['All Notes', 'MOM Archive', 'Project Titan', 'Ideas'].map((fld) => (
              <button
                key={fld}
                onClick={() => setActiveFolder(fld)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeFolder === fld ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-slate-400" />
                <span>{fld}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL 2: Notes List */}
      <div className="w-64 sm:w-72 border-r border-white/10 overflow-y-auto divide-y divide-white/5 bg-slate-900/40">
        <div className="p-3 border-b border-white/10 sticky top-0 bg-slate-950/90 backdrop-blur-md">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Notes..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleSelectNote(note)}
            className={`p-4 cursor-pointer transition-colors ${
              selectedNote.id === note.id
                ? 'bg-amber-500/20 border-l-4 border-amber-500'
                : 'bg-transparent hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-white truncate">{note.title}</h4>
              {note.pinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />}
            </div>
            <p className="text-[10px] text-slate-400">{note.lastModified}</p>
          </div>
        ))}
      </div>

      {/* PANEL 3: Note Editor */}
      <div className="flex-1 flex flex-col bg-slate-950/60 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="text-xs text-slate-400">Folder: <span className="text-amber-300 font-bold">{selectedNote.folder}</span></div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApplyAI}
              className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer accent-glow-purple"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Auto-Enhance</span>
            </button>
            <button 
              onClick={() => alert("Note saved successfully to Brained OS!")}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </div>

        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl p-6 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500 resize-none"
        />

        {aiApplied && (
          <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>AI Executive suggestion added! Stakeholder trust updated (+5%).</span>
          </div>
        )}
      </div>
    </div>
  );
};
