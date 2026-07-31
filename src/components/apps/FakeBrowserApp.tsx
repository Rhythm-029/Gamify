import React, { useState } from 'react';
import { Globe, Lock, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { OS_BROWSER_TABS } from '../../data/brainedOSData';
import type { BrowserTab } from '../../data/brainedOSData';

export const FakeBrowserApp: React.FC = () => {
  const [tabs] = useState<BrowserTab[]>(OS_BROWSER_TABS);
  const [activeTabId, setActiveTabId] = useState<string>(OS_BROWSER_TABS[0].id);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-950/90 text-white font-sans text-xs overflow-hidden">
      {/* Browser Tab Bar */}
      <div className="h-10 bg-slate-900 border-b border-white/10 px-3 flex items-center space-x-2 select-none overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-semibold flex items-center space-x-2 border-t border-x transition-colors max-w-xs truncate cursor-pointer ${
              activeTabId === tab.id
                ? 'bg-slate-950 text-white border-white/20'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">{tab.title.split(' — ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Address Bar */}
      <div className="h-10 bg-slate-900/80 border-b border-white/10 px-4 flex items-center space-x-3 text-slate-400">
        <div className="flex items-center space-x-2">
          <ArrowLeft className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          <ArrowRight className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          <RotateCw className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
        </div>

        <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1 text-xs text-slate-300 flex items-center space-x-2">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate font-mono text-[11px]">{activeTab.url}</span>
        </div>
      </div>

      {/* Webpage Content Canvas */}
      <div className="flex-1 p-8 overflow-y-auto bg-slate-950/60">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-xl font-bold text-white">{activeTab.content.heading}</h1>
            <p className="text-xs text-purple-300 mt-1">{activeTab.content.subheading}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
            {activeTab.content.body}
          </div>

          {activeTab.content.metrics && (
            <div className="grid grid-cols-3 gap-4 pt-4">
              {activeTab.content.metrics.map((m, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl text-center border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{m.label}</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
