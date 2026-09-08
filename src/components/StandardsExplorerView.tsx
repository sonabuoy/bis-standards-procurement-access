import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Building2,
  Scale,
  CheckCircle2,
  Info
} from 'lucide-react';
import { BIS_STANDARDS_DATABASE, DIVISION_META } from '../data/bisDatabase';
import { IndianStandard } from '../types';

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

  const [visibleCount, setVisibleCount] = useState(24);

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

  const displayedStandards = useMemo(() => {
    return filteredStandards.slice(0, visibleCount);
  }, [filteredStandards, visibleCount]);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Institutional Section Banner */}
        <div className="bg-[#081a33] text-white rounded-lg p-6 sm:p-8 mb-6 border border-[#173864] shadow-sm relative overflow-hidden">
          {/* Restrained Tricolour Rule */}
          <div className="absolute top-0 left-0 right-0 h-[3px] grid grid-cols-3" aria-hidden="true">
            <div className="bg-[#e06a14]" />
            <div className="bg-[#ffffff]" />
            <div className="bg-[#138808]" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#14335c] text-[#f39c12] border border-[#234d85] px-2.5 py-0.5 rounded">
                  Bureau of Indian Standards Repository
                </span>
                <span className="text-xs text-slate-300">
                  BIS-Derived Standards Database
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Noto_Sans',sans-serif] tracking-tight">
                Indian Standards Explorer
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
                Filter and inspect 1,392 catalogued Indian Standards (IS), mandatory Quality Control Orders (QCOs), testing protocols, and pre-drafted GeM tender clauses.
              </p>
            </div>

            <div className="bg-[#051122]/90 border border-slate-700/80 rounded p-3 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Catalogue Index</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">1,392 Standards</div>
              <div className="text-[11px] text-emerald-400 flex items-center justify-end gap-1 mt-0.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Evidence Gated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-lg p-5 border border-slate-300 shadow-2xs mb-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by IS code (e.g. 'IS 10322', 'IS 1786', 'IS 694'), title, or equipment keywords..."
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#081a33]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* QCO Mandatory Toggle */}
            <button
              type="button"
              onClick={() => setQcoOnly(!qcoOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded border text-xs font-semibold transition-all cursor-pointer ${
                qcoOnly
                  ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs font-bold'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Mandatory QCO Only</span>
            </button>
          </div>

          {/* Division Filter Badges */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700">
                BIS Engineering Division Councils:
              </span>
              <span className="font-mono">
                Matching: <strong>{filteredStandards.length}</strong> / 1,392
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedDivision('ALL')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                  selectedDivision === 'ALL'
                    ? 'bg-[#081a33] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                All Divisions
              </button>
              {Object.entries(DIVISION_META).map(([code, meta]) => (
                <button
                  key={code}
                  onClick={() => setSelectedDivision(code)}
                  className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 cursor-pointer ${
                    selectedDivision === code
                      ? 'bg-[#081a33] text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span className="font-mono font-bold text-[11px]">{code}</span>
                  <span className="text-[11px] text-slate-500">({meta.name.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredStandards.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center border border-slate-300">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Catalogued Indian Standards Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No standards matched "{searchQuery}" under the selected division. Try searching for broader terms like "cables", "steel", "pumps", "cement", or "protective".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDivision('ALL');
                setQcoOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-[#081a33] text-white text-xs font-bold rounded cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedStandards.map((std) => (
                <div
                  key={std.id}
                  className="bg-white rounded-lg p-4 sm:p-5 border border-slate-300 shadow-2xs hover:border-slate-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-mono font-bold rounded">
                        {std.shortCode}
                      </span>

                      {std.isQCOMandatory ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold rounded">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          QCO MANDATORY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          CATALOGUED
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-[#081a33] font-mono leading-tight mb-1">
                      {std.isCode}
                    </h3>

                    <h4 className="text-xs font-bold text-slate-800 mb-2 line-clamp-2 font-['Noto_Sans',sans-serif]">
                      {std.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {std.scope}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{std.committee}</span>
                      <span>{std.divisionName.split(' ')[0]}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onSelectStandard(std)}
                        className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded cursor-pointer transition-colors"
                      >
                        <BookOpen className="w-3 h-3 text-slate-600" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => onAnalyzeStandard(std)}
                        className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#081a33] hover:bg-[#0e274a] text-white text-xs font-bold rounded cursor-pointer transition-colors shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-[#f39c12]" />
                        <span>Advisory</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < filteredStandards.length && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded shadow-2xs transition-all cursor-pointer"
                >
                  Load More Standards ({filteredStandards.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
