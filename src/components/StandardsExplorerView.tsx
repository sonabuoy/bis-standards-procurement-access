import React, { useState, useMemo } from 'react';
import { Search, ShieldAlert, ShieldCheck, Filter, BookOpen, Sparkles, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BIS_STANDARDS_DATABASE, DIVISION_META } from '../data/bisDatabase';
import { IndianStandard, DivisionCode } from '../types';

interface StandardsExplorerViewProps {
  initialSearchQuery?: string;
  initialDivision?: string;
  onSelectStandard: (standard: IndianStandard) => void;
  onAnalyzeStandard: (standard: IndianStandard) => void;
}

export const StandardsExplorerView: React.FC<StandardsExplorerViewProps> = ({
  initialSearchQuery = '',
  initialDivision = 'ALL',
  onSelectStandard,
  onAnalyzeStandard
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedDivision, setSelectedDivision] = useState<string>(initialDivision);
  const [qcoOnly, setQcoOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    BIS_STANDARDS_DATABASE.forEach(s => set.add(s.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredStandards = useMemo(() => {
    return BIS_STANDARDS_DATABASE.filter(std => {
      if (selectedDivision !== 'ALL' && std.division !== selectedDivision) return false;
      if (selectedCategory !== 'ALL' && std.category !== selectedCategory) return false;
      if (qcoOnly && !std.isQCOMandatory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        std.isCode.toLowerCase().includes(q) ||
        std.shortCode.toLowerCase().includes(q) ||
        std.title.toLowerCase().includes(q) ||
        std.scope.toLowerCase().includes(q) ||
        std.keywords.some(k => k.toLowerCase().includes(q)) ||
        std.committee.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedDivision, selectedCategory, qcoOnly]);

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#031632] text-white text-xs font-bold rounded">
              BIS Standard Catalog
            </span>
            <span className="text-xs text-gray-500 font-medium">
              National Repository of Indian Standards (IS)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1b1b] font-['Noto_Sans',sans-serif] tracking-tight">
            Indian Standards Explorer
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Browse, search, and inspect authentic Indian Standards with full clause specifications, mandatory Quality Control Orders (QCOs), and GeM procurement clauses.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by IS code (e.g. 'IS 10322', 'IS 1786'), title, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#031632]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* QCO Mandatory Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQcoOnly(!qcoOnly)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  qcoOnly
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Mandatory QCO Only</span>
              </button>
            </div>
          </div>

          {/* Division Filter Pills */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                BIS Division Councils
              </span>
              <span className="text-xs text-gray-500">
                Showing {filteredStandards.length} standards
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedDivision('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedDivision === 'ALL'
                    ? 'bg-[#031632] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Divisions
              </button>
              {Object.entries(DIVISION_META).map(([code, meta]) => (
                <button
                  key={code}
                  onClick={() => setSelectedDivision(code)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    selectedDivision === code
                      ? 'bg-[#031632] text-white font-bold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-mono font-bold">{code}</span>
                  <span>({meta.name.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredStandards.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No Indian Standards Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              We couldn't find any standards matching your query "{searchQuery}". Try searching for broader terms like "lighting", "steel", "solar", or "cement".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDivision('ALL');
                setQcoOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-[#031632] text-white text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStandards.map((std) => (
              <div
                key={std.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#031632]/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-mono font-bold rounded-md">
                      {std.shortCode}
                    </span>

                    {std.isQCOMandatory ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold rounded-full">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Mandatory QCO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-medium rounded-full">
                        <ShieldCheck className="w-3 h-3 text-gray-500" />
                        Active Standard
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#1c1b1b] mb-1 group-hover:text-[#031632] font-mono leading-tight">
                    {std.isCode}
                  </h3>

                  <h4 className="text-xs font-semibold text-gray-800 mb-3 line-clamp-2">
                    {std.title}
                  </h4>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {std.scope}
                  </p>

                  {/* Testing parameters chips */}
                  {std.testParameters && std.testParameters.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Key Testing Protocols:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {std.testParameters.slice(0, 3).map((tp, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded truncate max-w-[200px]">
                            {tp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-mono text-[11px]">{std.committee}</span>
                    <span className="text-[11px]">{std.divisionName.split(' ')[0]}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onSelectStandard(std)}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => onAnalyzeStandard(std)}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#031632] hover:bg-[#1a2b48] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Advisory</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
