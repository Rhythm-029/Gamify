import React, { useEffect } from 'react';
import { FileText, Download, Printer, ZoomIn, ZoomOut, ArrowRight, ShieldCheck, Clock, Building2 } from 'lucide-react';

interface ProjectAmigoInternalBriefViewerProps {
  onOpenAssignment?: () => void;
  onOpenTeams?: () => void;
  onBriefRead?: () => void;
}

export const ProjectAmigoInternalBriefViewer: React.FC<ProjectAmigoInternalBriefViewerProps> = ({
  onOpenAssignment,
  onOpenTeams,
  onBriefRead,
}) => {
  useEffect(() => {
    if (onBriefRead) {
      onBriefRead();
    }
  }, [onBriefRead]);

  const handleDownload = () => {
    const text = `PROJECT AMIGO\nInternal Project Brief\n\nPrepared by: Aarav Kapoor, Project Manager\nProject: ICICI Bank HRMS Modernization\nDocument status: Internal — Initial Discovery\nDate: Project Day 1\n\n1. Business Context\nICICI Bank plans to modernize the HRMS experience for approximately 80,000 employees across India.\nThe initiative is expected to simplify everyday employee activities, reduce manual HR processes, and provide a more consistent digital experience across the organization.\nThe business is working towards a 90-day delivery window ahead of the annual appraisal cycle.\n\n2. What the Business Needs\nThe initial request covers multiple capabilities, including performance appraisals, attendance, leave management, employee tax documents, learning management, and digital employee profiles.\nThe business expects the solution to be useful during the appraisal period, when employees and managers will need reliable access to performance-related workflows.\nThe complete list of requested modules and detailed requirements will be shared separately.\n\n3. Points to Keep in Mind\nBusiness continuity\nThe appraisal cycle is a fixed business event. Delays affecting essential employee and manager workflows could have a direct business impact.\n\nExpected usage\nThe kickoff discussion raised the possibility of approximately 30,000 concurrent logins during peak periods. This estimate needs to be validated, and the technical approach must be assessed against the expected demand.\n\nSystem access\nThe team has not yet confirmed access to the LDAP sandbox. This may affect authentication integration and end-to-end testing.\n\n4. Before We Commit\nThe project team still needs to establish which capabilities deserve early attention, which technical dependencies require action, and whether the proposed delivery window is achievable.\nInitial priorities should reflect business needs, not simply the order in which requirements were received.\n\nInternal note: This brief captures the current understanding of the project. Scope, architecture, dependencies, and delivery dates remain subject to validation and stakeholder approval.\n\nProject Amigo | Internal Working Document`;
    const blob = new Blob([text], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Project_Amigo_Internal_Brief.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#e6ebf1] text-slate-800 font-sans overflow-hidden select-text relative">
      
      {/* ── TOP PDF TOOLBAR ── */}
      <div className="h-12 px-6 bg-[#1f2430] border-b border-white/10 flex items-center justify-between shrink-0 select-none shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-white tracking-wide">Project_Amigo_Internal_Brief.pdf</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">Page 1 of 1</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 mr-3 text-slate-400 bg-black/20 px-2 py-1 rounded border border-white/5 text-[11px] font-mono">
            <ZoomOut className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
            <span className="px-1.5 text-slate-300">100%</span>
            <ZoomIn className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {onOpenAssignment && (
            <button
              onClick={onOpenAssignment}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer ml-2"
            >
              <span>Start Assignment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenTeams && (
            <button
              onClick={onOpenTeams}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#464EB8] hover:bg-[#5B63D3] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Teams</span>
            </button>
          )}
        </div>
      </div>

      {/* ── VIEWER WORKSPACE (DESK CANVAS) ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#dbe2ea]">
        {/* The White One-Page Document Sheet */}
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl border border-slate-300/80 p-8 sm:p-12 text-slate-800 text-[13px] leading-relaxed flex flex-col justify-between min-h-[920px]">
          
          <div className="space-y-6">
            {/* Header Brand & Title */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-blue-700 font-bold mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Project Amigo · Digital Transformation</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900">
                  PROJECT AMIGO
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-0.5">
                  Internal Project Brief
                </p>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-500 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                <div><span className="font-semibold text-slate-700">Prepared by:</span> Aarav Kapoor, Project Manager</div>
                <div><span className="font-semibold text-slate-700">Project:</span> ICICI Bank HRMS Modernization</div>
                <div><span className="font-semibold text-slate-700">Document status:</span> Internal — Initial Discovery</div>
                <div><span className="font-semibold text-slate-700">Date:</span> Project Day 1</div>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2 border-l-2 border-blue-600 pl-2">
                <span>1. Business Context</span>
              </h2>
              <p className="text-slate-700">
                ICICI Bank plans to modernize the HRMS experience for approximately 80,000 employees across India.
              </p>
              <p className="text-slate-700">
                The initiative is expected to simplify everyday employee activities, reduce manual HR processes, and provide a more consistent digital experience across the organization.
              </p>
              <p className="text-slate-700">
                The business is working towards a 90-day delivery window ahead of the annual appraisal cycle.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2 border-l-2 border-blue-600 pl-2">
                <span>2. What the Business Needs</span>
              </h2>
              <p className="text-slate-700">
                The initial request covers multiple capabilities, including performance appraisals, attendance, leave management, employee tax documents, learning management, and digital employee profiles.
              </p>
              <p className="text-slate-700">
                The business expects the solution to be useful during the appraisal period, when employees and managers will need reliable access to performance-related workflows.
              </p>
              <p className="text-slate-600 italic text-[12px]">
                The complete list of requested modules and detailed requirements will be shared separately.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2 border-l-2 border-blue-600 pl-2">
                <span>3. Points to Keep in Mind</span>
              </h2>
              
              <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3.5 space-y-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Business continuity</span>
                  </h3>
                  <p className="text-slate-700 leading-normal">
                    The appraisal cycle is a fixed business event. Delays affecting essential employee and manager workflows could have a direct business impact.
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-2.5">
                  <h3 className="font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Expected usage</span>
                  </h3>
                  <p className="text-slate-700 leading-normal">
                    The kickoff discussion raised the possibility of approximately 30,000 concurrent logins during peak periods. This estimate needs to be validated, and the technical approach must be assessed against the expected demand.
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-2.5">
                  <h3 className="font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                    <span>System access</span>
                  </h3>
                  <p className="text-slate-700 leading-normal">
                    The team has not yet confirmed access to the LDAP sandbox. This may affect authentication integration and end-to-end testing.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2 border-l-2 border-blue-600 pl-2">
                <span>4. Before We Commit</span>
              </h2>
              <p className="text-slate-700">
                The project team still needs to establish which capabilities deserve early attention, which technical dependencies require action, and whether the proposed delivery window is achievable.
              </p>
              <p className="text-slate-700 font-medium">
                Initial priorities should reflect business needs, not simply the order in which requirements were received.
              </p>
            </div>

            {/* Internal Notice Callout */}
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-mono">
              <span className="font-bold">Internal note:</span> This brief captures the current understanding of the project. Scope, architecture, dependencies, and delivery dates remain subject to validation and stakeholder approval.
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200 mt-8 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Project Amigo | Internal Working Document</span>
            <span>Confidential · For Project Team Use Only</span>
          </div>

        </div>
      </div>
    </div>
  );
};
