import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import type { Chapter3UatDocument } from '../../types/chapter3';

interface UatDocumentViewerProps {
  document: Chapter3UatDocument;
  onAskSophiaMore?: () => void;
  onSendToDaniel?: () => void;
  onSendV2ToDaniel?: () => void;
  showV1Actions?: boolean;
  showV2Actions?: boolean;
  isSending?: boolean;
}

export const UatDocumentViewer: React.FC<UatDocumentViewerProps> = ({
  document,
  onAskSophiaMore,
  onSendToDaniel,
  onSendV2ToDaniel,
  showV1Actions = false,
  showV2Actions = false,
  isSending = false,
}) => {
  return (
    <div className="w-full bg-[#0a0d18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans select-none">
      {/* ── PDF Top Chrome Bar ── */}
      <div className="px-4 py-2.5 bg-[#141829] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-md bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-xs">{document.filename}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Official Document
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              PDF Preview · Page 1 of 1 · 142 KB
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <button
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── PDF Paper Sheet ── */}
      <div className="p-5 sm:p-7 bg-[#0d1122] overflow-x-auto space-y-5">
        {/* Document Header */}
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold">
              ICICI BANK · ENTERPRISE HRMS TRANSFORMATION
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide mt-0.5 uppercase">
              {document.title}
            </h1>
            <p className="text-xs text-slate-300 italic mt-0.5">
              Prepared by: {document.preparedBy}
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-[10px] text-slate-400 space-y-0.5 bg-black/40 p-2.5 rounded-lg border border-white/5 shrink-0">
            <div>Document Ref: <span className="text-slate-200">ICICI-UAT-CONF-0{document.version === 'v2' ? '2' : '1'}</span></div>
            <div>Classification: <span className="text-amber-300 font-bold">Confidential / Project Amigo</span></div>
            <div>Status: <span className="text-emerald-400 font-bold">Delivered</span></div>
          </div>
        </div>

        {/* Configuration Items Table */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171b30] text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No.</th>
                <th className="py-2.5 px-4 w-44 sm:w-52">Configuration item</th>
                <th className="py-2.5 px-4">Confirmed details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {document.items.map((row) => (
                <tr key={row.no} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-mono text-center text-slate-400 text-xs">
                    {row.no}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {row.item}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-sky-200 leading-relaxed">
                    {row.confirmedDetails.startsWith('http') || row.confirmedDetails.startsWith('10.') || row.confirmedDetails.startsWith('POST') ? (
                      <span className="px-2 py-0.5 rounded bg-black/50 border border-sky-500/30 text-sky-300 inline-block font-mono">
                        {row.confirmedDetails}
                      </span>
                    ) : (
                      <span>{row.confirmedDetails}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 leading-relaxed flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase text-[10px] tracking-wider block font-mono">
              Security & Environment Notice
            </span>
            <p className="mt-0.5 text-slate-300 text-xs">{document.note}</p>
          </div>
        </div>
      </div>

      {/* ── Action Buttons Bar ── */}
      {showV1Actions && (
        <div className="p-4 bg-[#111424] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-slate-300">Action Required:</span> Decide how to proceed with this configuration package.
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {onAskSophiaMore && (
              <button
                onClick={onAskSophiaMore}
                disabled={isSending}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-100 hover:text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Ask Sophia for More Details</span>
              </button>
            )}

            {onSendToDaniel && (
              <button
                onClick={onSendToDaniel}
                disabled={isSending}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-100 hover:text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
              >
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Send Details to Daniel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {showV2Actions && onSendV2ToDaniel && (
        <div className="p-4 bg-[#111424] border-t border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Updated v2 specification received with all 5 prerequisites included.</span>
          </div>

          <button
            onClick={onSendV2ToDaniel}
            disabled={isSending}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <span>Send Complete Details to Daniel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
