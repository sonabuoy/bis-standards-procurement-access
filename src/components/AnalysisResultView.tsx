import React, { useState } from 'react';
import { RequirementAnalysis, IndianStandard } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Copy, 
  Check, 
  Bookmark, 
  Printer, 
  ArrowLeft, 
  ExternalLink, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  FileCheck, 
  Download,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface AnalysisResultViewProps {
  analysis: RequirementAnalysis;
  onBackToHome: () => void;
  onSelectStandard: (standard: IndianStandard) => void;
  onSaveAnalysis: (analysis: RequirementAnalysis) => void;
  isSaved: boolean;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  analysis,
  onBackToHome,
  onSelectStandard,
  onSaveAnalysis,
  isSaved
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'primary' | 'gem' | 'checklist' | 'boq'>('overview');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#031632] bg-white border border-gray-200 px-3.5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveAnalysis(analysis)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 text-emerald-700' : 'text-gray-500'}`} />
              <span>{isSaved ? 'Saved to My Analyses' : 'Save Analysis'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
          {/* National Tricolor Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-[#FFFFFF]" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pt-2">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#031632] text-white text-xs font-bold rounded-md uppercase tracking-wider font-mono">
                  {analysis.sector}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Analysis ID: <span className="font-mono text-gray-700">{analysis.id}</span>
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {new Date(analysis.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1c1b1b] font-['Noto_Sans',sans-serif] tracking-tight">
                {analysis.title}
              </h1>

              <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs sm:text-sm text-slate-700">
                <span className="font-semibold text-slate-900 mr-1.5">Input Requirement:</span>
                "{analysis.rawRequirement}"
              </div>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* QCO & Compliance Readiness Score Widget */}
            <div className="w-full lg:w-72 shrink-0 bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Compliance Status
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {analysis.qcoSummary?.isRegulated ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Mandatory QCO Enforced
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Under BIS Act 2016, non-certified supply is prohibited for government tenders.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-400/20 text-blue-300 border border-blue-400/30 rounded text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Voluntary / Standard BIS
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Primary IS Code:</span>
                <span className="font-mono font-bold text-amber-300">
                  {analysis.primaryStandards[0]?.standard.shortCode || 'IS Code'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center border-b border-gray-200 mb-8 overflow-x-auto pb-1 scrollbar-none gap-2">
          {[
            { id: 'overview', label: '1. Overview & Specs' },
            { id: 'primary', label: '2. Recommended Standards' },
            { id: 'gem', label: '3. GeM Tender Clauses' },
            { id: 'checklist', label: '4. Inspection Checklist' },
            { id: 'boq', label: '5. BoQ Boilerplate' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#031632] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Overview & Extracted Specs */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Extracted Specifications Matrix */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Extracted Technical Specification Matrix
                </h3>
                <span className="text-xs text-gray-500">
                  {analysis.extractedSpecs.length} parameters identified
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                      <th className="py-3 px-4">Parameter</th>
                      <th className="py-3 px-4">Specified / Recommended Value</th>
                      <th className="py-3 px-4">Standard Reference</th>
                      <th className="py-3 px-4 text-center">Tender Importance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {analysis.extractedSpecs.map((spec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {spec.parameter}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {spec.specifiedValue}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-blue-900 font-bold">
                          {spec.standardReference || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                              spec.importance === 'Mandatory'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {spec.importance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Summary of Standards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Standard Card */}
              <div className="bg-white rounded-xl p-6 border-2 border-[#031632]/20 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    Primary Applicable Standard
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {analysis.primaryStandards[0]?.matchConfidence}% Match
                  </span>
                </div>

                <h4 className="text-lg font-bold text-[#031632] font-mono mb-1">
                  {analysis.primaryStandards[0]?.standard.isCode}
                </h4>
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  {analysis.primaryStandards[0]?.standard.title}
                </p>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  {analysis.primaryStandards[0]?.rationale}
                </p>

                <button
                  onClick={() => onSelectStandard(analysis.primaryStandards[0]?.standard)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#031632] hover:bg-[#1a2b48] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>View All Clauses & Testing Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Secondary Standards Summary */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-3 inline-block">
                  Associated & Interconnected Standards ({analysis.secondaryStandards.length})
                </span>

                <div className="space-y-3 mt-2">
                  {analysis.secondaryStandards.map((sec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onSelectStandard(sec.standard)}
                      className="p-3 bg-gray-50 hover:bg-slate-100 rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-[#031632]">
                          {sec.standard.shortCode}
                        </div>
                        <div className="text-xs text-gray-700 line-clamp-1">
                          {sec.standard.title}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Recommended Standards & Testing Details */}
        {activeTab === 'primary' && (
          <div className="space-y-8">
            {analysis.primaryStandards.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-mono text-xs font-bold rounded">
                        PRIMARY MANDATE
                      </span>
                      {item.qcoMandatory && (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-full inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-700" />
                          Mandatory QCO Certified
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#031632] font-mono">
                      {item.standard.isCode}
                    </h3>
                    <h4 className="text-base font-semibold text-gray-800 mt-1">
                      {item.standard.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => onSelectStandard(item.standard)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#031632] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Standard Specs</span>
                  </button>
                </div>

                <div className="mb-6">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Scope & Rationale
                  </h5>
                  <p className="text-sm text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {item.rationale || item.standard.scope}
                  </p>
                </div>

                {/* Key Clauses & Test Methods */}
                {item.standard.keyClauses && item.standard.keyClauses.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Critical Clauses for Technical Evaluation
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.standard.keyClauses.map((clause, cIdx) => (
                        <div 
                          key={cIdx} 
                          className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                                {clause.clauseNumber}
                              </span>
                              {clause.isCritical && (
                                <span className="text-[10px] font-bold text-red-700 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                                  Critical Gate
                                </span>
                              )}
                            </div>
                            <h6 className="text-sm font-bold text-gray-900 mb-1.5">
                              {clause.title}
                            </h6>
                            <p className="text-xs text-gray-700 leading-relaxed mb-2">
                              {clause.requirement}
                            </p>
                          </div>

                          {clause.testMethod && (
                            <div className="mt-2 pt-2 border-t border-gray-200/60 text-[11px] text-gray-500">
                              <span className="font-semibold text-gray-700">Test Method: </span>
                              {clause.testMethod}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Laboratory Testing Parameters */}
                {item.standard.testParameters && (
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Mandatory Type Tests (NABL Accredited Lab Reports Required)
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {item.standard.testParameters.map((param, pIdx) => (
                        <span 
                          key={pIdx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-full font-medium shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GeM Tender Clauses */}
        {activeTab === 'gem' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Government e-Marketplace (GeM) & RFP Legal Boilerplate:</span>
                <p className="mt-0.5 text-blue-800">
                  These clauses can be copied directly into your Notice Inviting Tender (NIT), GeM Custom Bid parameters, or RFP Technical Qualification criteria to ensure full legal protection under General Financial Rules (GFR).
                </p>
              </div>
            </div>

            {analysis.gemTenderClauses.map((clause, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#031632] text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-[#1c1b1b]">
                      {clause.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleCopy(clause.text, `clause-${idx}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#031632] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedItem === `clause-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Clause</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-slate-800 leading-relaxed border border-slate-200 select-all">
                  {clause.text}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Applicable Standard: <strong className="font-mono text-gray-800">{clause.applicableIS}</strong></span>
                  <span className="text-emerald-700 font-semibold">Standard GFR Clause Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Inspection Checklist */}
        {activeTab === 'checklist' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif]">
                Technical Evaluation Committee (TEC) & PDI Inspection Checklist
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Mandatory document checks and physical pre-dispatch inspection protocols for tender verification.
              </p>
            </div>

            <div className="space-y-4">
              {analysis.complianceChecklist.map((chk, idx) => (
                <div 
                  key={chk.id || idx}
                  className="p-4 rounded-xl border border-gray-200 bg-[#fafafa] flex items-start gap-4 hover:border-gray-300 transition-colors"
                >
                  <div className="mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-[10px] font-bold rounded uppercase font-mono">
                        {chk.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">
                        {chk.title}
                      </h4>
                      {chk.isMandatory && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          MANDATORY
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 mb-2 leading-relaxed">
                      {chk.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-200">
                      <span><strong>Standard Ref:</strong> {chk.standardRef}</span>
                      <span><strong>Verification:</strong> {chk.verificationMethod}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BoQ Technical Specification Paragraph */}
        {activeTab === 'boq' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif]">
                  Ready BoQ Technical Specification Schedule
                </h3>
                <p className="text-sm text-gray-600">
                  Formatted text for direct insertion into Tender Schedule / BoQ Item Description.
                </p>
              </div>

              <button
                onClick={() => handleCopy(analysis.sampleBoQSpecification, 'boq-text')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#031632] hover:bg-[#1a2b48] rounded-lg transition-colors cursor-pointer"
              >
                {copiedItem === 'boq-text' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy BoQ Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
              {analysis.sampleBoQSpecification}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
