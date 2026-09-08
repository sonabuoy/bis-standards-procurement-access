import React, { useState } from 'react';
import { RequirementAnalysis } from '../types';
import { Bookmark, Search, Trash2, ArrowRight, FileText, Printer, Sparkles, Calendar, Layers, ShieldCheck } from 'lucide-react';

interface MyAnalysesViewProps {
  savedAnalyses: RequirementAnalysis[];
  onOpenAnalysis: (analysis: RequirementAnalysis) => void;
  onDeleteAnalysis: (id: string) => void;
  onNewAnalysis: () => void;
}

export const MyAnalysesView: React.FC<MyAnalysesViewProps> = ({
  savedAnalyses,
  onOpenAnalysis,
  onDeleteAnalysis,
  onNewAnalysis
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = savedAnalyses.filter(item => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.rawRequirement.toLowerCase().includes(q) ||
      item.sector.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Institutional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#081a33] text-white px-2 py-0.5 rounded font-mono">
                Procurement Dossier Store
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Locally Persisted Audits
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#081a33] font-['Noto_Sans',sans-serif]">
              Saved Procurement Advisories & Specifications
            </h1>
          </div>

          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#081a33] hover:bg-[#0e274a] text-white text-xs sm:text-sm font-bold rounded shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#f39c12]" />
            <span>New Procurement Analysis</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-3.5 border border-slate-300 shadow-2xs mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved advisories by item title, standard code, or sector..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#081a33]"
            />
          </div>
        </div>

        {/* List of Saved Analyses */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-slate-300">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Saved Advisories Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {savedAnalyses.length === 0
                ? 'You have not saved any procurement standard advisories yet. Run a requirement audit to save advisories.'
                : 'No saved advisories match your search query.'}
            </p>
            {savedAnalyses.length === 0 && (
              <button
                onClick={onNewAnalysis}
                className="mt-4 px-4 py-2 bg-[#081a33] text-white text-xs font-bold rounded cursor-pointer"
              >
                Run First Analysis
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 sm:p-5 border border-slate-300 shadow-2xs hover:border-slate-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      {item.sector}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Evidence Verified
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#081a33] font-['Noto_Sans',sans-serif]">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1 mt-1 font-serif">
                    {item.rawRequirement}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.primaryStandards.slice(0, 3).map((ps, idx) => (
                      <span key={idx} className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {ps.standard.isCode}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => onDeleteAnalysis(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete saved advisory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenAnalysis(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#081a33] hover:bg-[#0e274a] text-white text-xs font-bold rounded cursor-pointer shadow-2xs"
                  >
                    <span>Open Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
