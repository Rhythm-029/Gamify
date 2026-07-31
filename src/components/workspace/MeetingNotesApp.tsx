import React, { useState } from 'react';
import { FileText, Sparkles, Clock, Users, Save } from 'lucide-react';

export const MeetingNotesApp: React.FC = () => {
  const [momContent, setMomContent] = useState(`Executive Steering Meeting — Minutes of Meeting (MOM)

Date: Day 3 of 10
Chair: Alex Vance (Lead Transformer)
Attendees: Marcus Boss (CTO), Elena Marshal (CHRO), David Knox (CISO), Missy Chen (VP Finance)

Key Decisions:
1. Approved modular microservice framework for HR Portal backend.
2. Agreed to 15-minute OAuth JWT token expiry to satisfy CISO zero-trust mandate.
3. Postponed live streaming welcome video hub to V2 release window.

Action Items:
- [ ] Alex Vance: Publish final RACI governance matrix in Notion docs.
- [ ] Tariq Dev: Submit zero-trust encryption schema to CISO Knox by EOD.
- [ ] Elena Marshal: Schedule UAT testing scenarios with regional HR leads.`);

  const [aiPrompt, setAiPrompt] = useState(false);

  const handleGenerateAI = () => {
    setMomContent((prev) => prev + `\n\n[AI SUGGESTION ADDED]: Auto-generated risk mitigation clause for CISO Knox - "All API keys rotated via Vault KMS automatically."`);
    setAiPrompt(true);
  };

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Top Editor Toolbar */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white">Notion Executive MOM & Notes Editor</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateAI}
            className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 font-semibold flex items-center space-x-1.5 accent-glow-purple cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI MOM Auto-Enhance</span>
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1 cursor-pointer">
            <Save className="w-3.5 h-3.5" />
            <span>Publish to Board</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center space-x-3 text-xs text-slate-400 border-b border-white/10 pb-4">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Last modified 5 minutes ago by Alex Vance</span>
          <span>•</span>
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Shared with Executive Steering Committee</span>
        </div>

        {/* MOM Text Editor Area */}
        <textarea
          value={momContent}
          onChange={(e) => setMomContent(e.target.value)}
          className="w-full h-96 bg-slate-950/60 border border-white/10 rounded-2xl p-6 text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
        />

        {aiPrompt && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start space-x-3 text-xs text-purple-200">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white mb-1">AI Director Suggestion Applied!</div>
              <p>MOM expanded with InfoSec compliance clause. Stakeholder trust for CISO David Knox increased by +5%.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
