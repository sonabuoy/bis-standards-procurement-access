import React, { useState } from 'react';
import { RequirementAnalysis, IndianStandard } from '../types';
import { Bookmark, Search, Trash2, ArrowRight, FileText, Printer, Sparkles, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-[#fcf8f8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Bookmark className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Saved Audits & Procurement Specifications
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1b1b] font-['Noto_Sans',sans-serif]">
              My Analyses Repository
            </h1>
          </div>

          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#031632] hover:bg-[#1a2b48] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Analyze New Requirement</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved analyses by title, equipment type or sector..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No Saved Analyses Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto mb-6">
              Whenever you analyze a requirement or upload a tender, you can save the resulting BIS specification audit here for easy access.
            </p>
            <button
              onClick={onNewAnalysis}
              className="px-5 py-2.5 bg-[#031632] text-white text-xs font-semibold rounded-xl"
            >
              Start First Analysis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold rounded font-mono">
                      {item.sector}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.timestamp).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#1c1b1b] mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    "{item.rawRequirement}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.primaryStandards.map((std, idx) => (
                      <span key={idx} className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {std.standard.shortCode}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => onDeleteAnalysis(item.id)}
                    className="text-gray-400 hover:text-red-600 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => onOpenAnalysis(item)}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-[#031632] hover:bg-[#1a2b48] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <span>View Report</span>
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
