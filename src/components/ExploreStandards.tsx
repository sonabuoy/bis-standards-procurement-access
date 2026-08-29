import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, ArrowRight, ExternalLink, SlidersHorizontal, BookOpen } from 'lucide-react';
import { BIS_STANDARDS_DATABASE, DIVISION_META } from '../data/bisDatabase';
import { IndianStandard, DivisionCode } from '../types';

interface ExploreStandardsProps {
  onSelectStandard: (standard: IndianStandard) => void;
  onNavigateToExplorer: (query?: string, division?: string) => void;
}

export const ExploreStandards: React.FC<ExploreStandardsProps> = ({
  onSelectStandard,
  onNavigateToExplorer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [onlyQCO, setOnlyQCO] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToExplorer(searchQuery, selectedDivision);
  };

  // Filter top standards for preview
  const filteredStandards = BIS_STANDARDS_DATABASE.filter(std => {
    if (selectedDivision !== 'ALL' && std.division !== selectedDivision) return false;
    if (onlyQCO && !std.isQCOMandatory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      std.isCode.toLowerCase().includes(q) ||
      std.shortCode.toLowerCase().includes(q) ||
      std.title.toLowerCase().includes(q) ||
      std.keywords.some(k => k.toLowerCase().includes(q))
    );
  }).slice(0, 6);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading matching screenshot */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif] tracking-tight">
            Explore Indian Standards
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
            Search manually by IS number, title, or subject.
          </p>
        </div>

        {/* Large Prominent Search Bar matching screenshot */}
        <div className="max-w-3xl mx-auto mb-10">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center w-full bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#031632] focus-within:border-transparent p-1.5 transition-all">
              <div className="pl-4 pr-2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IS number or keywords... (e.g., 'IS 10322', 'TMT steel', 'solar', 'pipes')"
                className="w-full py-2.5 px-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                id="btn-search-standards-home"
                className="px-6 py-2.5 bg-[#031632] hover:bg-[#1a2b48] text-white text-sm font-semibold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Filters / Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-500 font-medium">Quick IS Codes:</span>
              {['IS 10322', 'IS 1786', 'IS 456', 'IS 14286', 'IS 13252', 'IS 1239'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setSearchQuery(code);
                    onNavigateToExplorer(code);
                  }}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono rounded transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOnlyQCO(!onlyQCO)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
                onlyQCO
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Mandatory QCO Only</span>
            </button>
          </div>
        </div>

        {/* Division Council Grid Pills */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setSelectedDivision('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
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
                type="button"
                onClick={() => setSelectedDivision(code)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedDivision === code
                    ? 'bg-[#031632] text-white font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="font-mono font-bold text-[10px]">{code}</span>
                <span>{meta.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Standards Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStandards.map((std) => (
            <div
              key={std.id}
              onClick={() => onSelectStandard(std)}
              className="bg-[#fafafa] hover:bg-white rounded-xl p-5 border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:border-[#031632]/40"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-mono font-bold rounded">
                    {std.shortCode}
                  </span>
                  {std.isQCOMandatory && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold rounded-full">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Mandatory QCO
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#031632]">
                  {std.title}
                </h4>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                  {std.scope}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
                <span className="font-mono text-[11px]">{std.committee}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#031632] group-hover:underline">
                  View Clauses <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View All in Explorer CTA */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => onNavigateToExplorer()}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#031632] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse All 25,000+ Indian Standards in Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
