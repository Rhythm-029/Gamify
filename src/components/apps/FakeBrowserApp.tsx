import React, { useState, useEffect } from 'react';
import { Globe, Lock, ArrowLeft, ArrowRight, RotateCw, ExternalLink } from 'lucide-react';
import { OS_BROWSER_TABS } from '../../data/brainedOSData';
import type { BrowserTab } from '../../data/brainedOSData';
import { useSyncExternalStore } from 'react';
import { getCeraState, subscribeCeraState } from './cera/ceraStore';
import { CeraPreviewWindow } from './cera/CeraPreviewWindow';

const PROTOTYPE_TAB_ID = 'tab-prototype-5173';

export const FakeBrowserApp: React.FC = () => {
  const cera = useSyncExternalStore(subscribeCeraState, getCeraState);
  const isPrototypeLive = cera.isBuildFinished || cera.isDevServerRunning;

  const allTabs: BrowserTab[] = isPrototypeLive
    ? [
        {
          id: PROTOTYPE_TAB_ID,
          title: 'Enterprise HR Portal — localhost:5173',
          url: 'http://localhost:5173',
          icon: 'Globe',
          content: {
            heading: 'Enterprise HR Portal',
            subheading: 'Live Prototype — Vite 7 + React 19',
            body: '',
          },
        },
        ...OS_BROWSER_TABS,
      ]
    : OS_BROWSER_TABS;

  const [activeTabId, setActiveTabId] = useState<string>(isPrototypeLive ? PROTOTYPE_TAB_ID : OS_BROWSER_TABS[0].id);

  // When prototype becomes live, switch to it
  React.useEffect(() => {
    if (isPrototypeLive) {
      setActiveTabId(PROTOTYPE_TAB_ID);
    }
  }, [isPrototypeLive]);

  const activeTab = allTabs.find((t) => t.id === activeTabId) || allTabs[0];
  const isPrototypeTab = activeTab?.id === PROTOTYPE_TAB_ID;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white font-sans text-xs overflow-hidden">
      {/* Browser Tab Bar */}
      <div className="h-10 bg-[#0f111d] border-b border-white/10 px-3 flex items-center space-x-1 select-none overflow-x-auto">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-semibold flex items-center space-x-2 border-t border-x transition-colors max-w-xs truncate cursor-pointer shrink-0 ${
              activeTabId === tab.id
                ? tab.id === PROTOTYPE_TAB_ID
                  ? 'bg-slate-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-950 text-white border-white/20'
                : 'bg-[#0f111d]/60 text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 shrink-0 ${tab.id === PROTOTYPE_TAB_ID ? 'text-emerald-400' : 'text-purple-400'}`} />
            <span className="truncate max-w-[160px]">{tab.title.split(' — ')[0]}</span>
            {tab.id === PROTOTYPE_TAB_ID && (
              <span className="ml-1 bg-emerald-500/20 text-emerald-300 text-[9px] px-1 py-0.2 rounded font-bold border border-emerald-500/30">LIVE</span>
            )}
          </button>
        ))}
      </div>

      {/* Address Bar */}
      <div className="h-10 bg-[#0d0e19] border-b border-white/10 px-4 flex items-center space-x-3 text-slate-400">
        <div className="flex items-center space-x-2">
          <ArrowLeft className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          <ArrowRight className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          <RotateCw className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
        </div>

        <div className={`flex-1 border rounded-xl px-3 py-1 text-xs flex items-center space-x-2 font-mono ${
          isPrototypeTab ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-white/10 text-slate-300'
        }`}>
          <Lock className={`w-3 h-3 shrink-0 ${isPrototypeTab ? 'text-emerald-400' : 'text-emerald-400'}`} />
          <span className="truncate text-[11px]">{activeTab?.url}</span>
          {isPrototypeTab && (
            <span className="ml-auto text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0">
              VITE 7.0.2
            </span>
          )}
        </div>

        {isPrototypeTab && (
          <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold shrink-0">
            <ExternalLink className="w-3 h-3" />
            <span>LIVE</span>
          </div>
        )}
      </div>

      {/* Webpage Content Canvas */}
      {isPrototypeTab ? (
        /* ─── LIVE PROTOTYPE VIEW ─── */
        <div className="flex-1 overflow-hidden">
          <CeraPreviewWindow isDevServerRunning={true} />
        </div>
      ) : (
        /* ─── NORMAL BROWSER TAB CONTENT ─── */
        <div className="flex-1 p-8 overflow-y-auto bg-slate-950/60">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h1 className="text-xl font-bold text-white">{activeTab?.content.heading}</h1>
              <p className="text-xs text-purple-300 mt-1">{activeTab?.content.subheading}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {activeTab?.content.body}
            </div>

            {activeTab?.content.metrics && (
              <div className="grid grid-cols-3 gap-4 pt-4">
                {activeTab.content.metrics.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl text-center border border-white/10 bg-slate-900/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">{m.label}</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
