import React, { useState } from 'react';
import { FileText, FileUp, Sparkles, ArrowRight, Loader2, Info } from 'lucide-react';

interface HeroSectionProps {
  requirementText: string;
  setRequirementText: (text: string) => void;
  onAnalyze: (customText?: string) => void;
  isLoading: boolean;
  onOpenTenderModal: () => void;
}

const SAMPLE_REQUIREMENTS = [
  '90W outdoor LED street lights for highway use with IP66 and 10kV surge',
  'TMT 500D steel rebar & OPC 53 Grade cement for hospital construction',
  'Grid-tied 540Wp Mono-PERC Solar PV Modules and 50kW Inverter',
  'Centrifugal pumps & ERW Galvanized Iron pipes for water supply',
  'N95 Filtering Half Masks & Protective Coveralls for medical staff',
  'Desktop PCs with Core i7, 16GB RAM, TPM 2.0 and BIS CRS certificate'
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  requirementText,
  setRequirementText,
  onAnalyze,
  isLoading,
  onOpenTenderModal
}) => {
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const handleSelectSample = (sample: string) => {
    setSelectedSample(sample);
    setRequirementText(sample);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirementText.trim()) return;
    onAnalyze(requirementText);
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero Background Container with Iconic Landmark Visual */}
      <div className="relative min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] flex items-center justify-center bg-[#081a33] overflow-hidden">
        {/* Explicit Landmark Photograph: India Gate, New Delhi */}
        <img
          src="/images/india-gate.jpg"
          alt="India Gate, New Delhi - National Landmark"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2000&q=80';
          }}
        />

        {/* Subtle Dark Navy Overlay for text readability without obscuring the landmark */}
        <div className="absolute inset-0 bg-[#081a33]/65 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081a33]/90 via-transparent to-[#081a33]/40 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
          {/* State Emblem of India (Ashoka Lion Capital) */}
          <div className="inline-flex flex-col items-center justify-center mb-4">
            <div className="w-16 h-20 flex items-center justify-center text-amber-100/90 filter drop-shadow-md">
              <svg viewBox="0 0 100 130" className="w-full h-full fill-current" aria-hidden="true">
                {/* Stylized Lion Capital Silhouette */}
                <path d="M50 5 C45 5, 42 12, 42 18 C38 15, 30 18, 30 24 C30 30, 36 34, 38 38 C32 38, 25 43, 26 50 C27 58, 34 60, 38 64 C35 70, 38 78, 44 82 C42 86, 44 92, 50 94 C56 92, 58 86, 56 82 C62 78, 65 70, 62 64 C66 60, 73 58, 74 50 C75 43, 68 38, 62 38 C64 34, 70 30, 70 24 C70 18, 62 15, 58 18 C58 12, 55 5, 50 5 Z" opacity="0.95" />
                {/* Abacus Base with Ashoka Chakra Circle */}
                <rect x="25" y="96" width="50" height="8" rx="2" fill="currentColor" />
                <circle cx="50" cy="100" r="3.5" fill="#081a33" />
                {/* Base Plinth */}
                <path d="M20 106 L80 106 L75 116 L25 116 Z" fill="currentColor" />
                {/* Satyameva Jayate Inscription */}
                <text x="50" y="126" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">
                  सत्यमेव जयते
                </text>
              </svg>
            </div>
            <span className="text-[11px] uppercase tracking-widest text-amber-200/90 font-medium drop-shadow-xs">
              National Standards Portal
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-['Noto_Sans',sans-serif] leading-tight drop-shadow-md">
            Find the right Indian Standards
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-xs">
            AI-assisted specification support for government and institutional procurement.
          </p>

          {/* Elevated Input Card */}
          <div className="mt-8 bg-white/95 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-2xl border border-white/50 text-left transition-all">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="procurement-requirement-input" 
                  className="block text-sm font-semibold text-gray-800"
                >
                  Describe your requirement
                </label>
                <span className="text-[11px] text-gray-500 font-medium hidden sm:inline-flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-600" />
                  Auto-mapped to BIS Database & Mandatory QCOs
                </span>
              </div>

              {/* Textarea Input */}
              <div className="relative">
                <textarea
                  id="procurement-requirement-input"
                  rows={3}
                  value={requirementText}
                  onChange={(e) => setRequirementText(e.target.value)}
                  placeholder="Describe what you need to procure... (e.g., '90W outdoor LED street lights for highway use')"
                  className="w-full px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#081a33] focus:border-transparent resize-none transition-shadow shadow-inner font-sans"
                  required
                />
              </div>

              {/* Sample Prompts / Fast Suggestions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-600 mr-1">
                  Try examples:
                </span>
                {SAMPLE_REQUIREMENTS.slice(0, 3).map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200 transition-colors truncate max-w-[280px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#081a33]"
                    title={sample}
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Bottom Row inside card */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Left: Upload Tender Link */}
                <button
                  type="button"
                  onClick={onOpenTenderModal}
                  id="btn-upload-tender-hero"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#081a33] transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#081a33] rounded px-1.5 py-0.5"
                >
                  <FileUp className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
                  <span>
                    Or <span className="underline font-bold text-[#081a33]">Upload Tender</span> (PDF/DOCX)
                  </span>
                </button>

                {/* Right: Red / Crimson Action Button */}
                <button
                  type="submit"
                  disabled={isLoading || !requirementText.trim()}
                  id="btn-analyze-requirement-hero"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#c5221f] hover:bg-[#a51a18] active:bg-[#8e1412] text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#081a33] focus-visible:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Consulting BIS Standards...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-white" />
                      <span>Analyze Requirement</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Tricolor National Horizontal Divider matching design */}
      <div className="w-full flex h-1.5 shadow-xs shrink-0" aria-hidden="true">
        <div className="flex-1 bg-[#FF9933]" title="Saffron" />
        <div className="flex-1 bg-[#FFFFFF]" title="White" />
        <div className="flex-1 bg-[#138808]" title="India Green" />
      </div>
    </section>
  );

};
