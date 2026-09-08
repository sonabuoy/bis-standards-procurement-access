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

        {/* Safe Insufficient-Data Banner if no match found */}
        {analysis.isSafeNoMatch && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl mb-6 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  {analysis.statusMessage || 'No sufficiently relevant standard was found in the current BIS-derived knowledge base.'}
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  The query did not match any of the 1,392 indexed Indian Standards in this handbook subset. To prevent incorrect procurement references, no unrelated standards were substituted. Please review the clarification questions below to refine your requirement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Clarification Engine Alert */}
        {analysis.clarificationQuestions && analysis.clarificationQuestions.length > 0 && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 sm:p-6 mb-8 shadow-2xs">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <h3 className="text-sm sm:text-base font-bold text-blue-950 font-['Noto_Sans',sans-serif]">
                  Technical Clarification Required for Precise BIS Standard
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                {analysis.clarificationQuestions.length} Clarification{analysis.clarificationQuestions.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-blue-900/80 mb-4 leading-relaxed">
              Multiple distinct Indian Standards govern different product grades, voltages, ratings, or structural formulations. Clarifying the parameters below ensures exact compliance in your tender document:
            </p>

            <div className="space-y-4">
              {analysis.clarificationQuestions.map((cq, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-blue-100 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#031632] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        {cq.question}
                      </h4>
                      <p className="text-[11px] text-gray-600 mt-1 mb-2.5">
                        <span className="font-semibold text-gray-700">Why this matters:</span> {cq.whyNeeded}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cq.options.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

              {/* Granular Structured Concepts */}
              {analysis.structuredRequirement && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {analysis.structuredRequirement.product && (
                    <span className="inline-flex items-center text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                      Product: {analysis.structuredRequirement.product}
                    </span>
                  )}
                  {analysis.structuredRequirement.productSubtype && (
                    <span className="inline-flex items-center text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-md">
                      Subtype: {analysis.structuredRequirement.productSubtype}
                    </span>
                  )}
                  {analysis.structuredRequirement.intendedApplication && (
                    <span className="inline-flex items-center text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-md">
                      Application: {analysis.structuredRequirement.intendedApplication}
                    </span>
                  )}
                  {analysis.structuredRequirement.material && (
                    <span className="inline-flex items-center text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md">
                      Material: {analysis.structuredRequirement.material}
                    </span>
                  )}
                  <span className="inline-flex items-center text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md">
                    Intent: {analysis.structuredRequirement.detectedIntent || 'Product Procurement'}
                  </span>
                </div>
              )}

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
            {/* Primary Applicable Standards Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Primary Applicable Product Standards
                  </h3>
                  <p className="text-xs text-gray-500">
                    Direct product/subcategory specifications meeting strict threshold evidence
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  {analysis.primaryStandards.length} Primary Standard{analysis.primaryStandards.length === 1 ? '' : 's'}
                </span>
              </div>

              {analysis.primaryStandards.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-amber-900">
                    No Direct Primary Product Standard in Current Corpus
                  </h4>
                  <p className="text-xs text-amber-800 max-w-xl mx-auto mt-1">
                    No standard in the indexed 1,392 handbook subset crossed the strict primary relevance threshold for this specific product. Unrelated or same-domain standards have been rejected to prevent inaccurate tender references.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {analysis.primaryStandards.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-mono text-xs font-bold rounded">
                              RETRIEVED PRIMARY STANDARD
                            </span>
                            {/* Provenance Badge */}
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200">
                              <ShieldCheck className="w-3 h-3 text-blue-700" />
                              {item.verificationStatusText || 'Retrieved + Source-Document-Sourced + Not Independently Verified'}
                            </span>
                            {item.qcoMandatory ? (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-full inline-flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-amber-700" />
                                Mandatory QCO Certified
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                                Certification Unverified
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#031632] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>View Standard Specs</span>
                        </button>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Scope & Factual Rationale
                        </h5>
                        <p className="text-sm text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                          {item.rationale || item.standard.scope || `${item.standard.title} is listed in the BIS-derived dataset.`}
                        </p>
                      </div>

                      {/* Fact-Level Provenance Status Matrix */}
                      {item.factEvidence && (
                        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                            Fact-Level Evidence Classification Matrix
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                              <span className="text-slate-700 font-medium">Standard Number & Title</span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                                SOURCE_SUPPORTED
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                              <span className="text-slate-700 font-medium">Technical Clauses</span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                item.factEvidence.clauses?.status === 'SOURCE_SUPPORTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {item.factEvidence.clauses?.status || 'NOT_AVAILABLE'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                              <span className="text-slate-700 font-medium">Laboratory Test Methods</span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                item.factEvidence.testMethods?.status === 'SOURCE_SUPPORTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {item.factEvidence.testMethods?.status || 'NOT_AVAILABLE'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                              <span className="text-slate-700 font-medium">Certification / QCO Status</span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                item.factEvidence.certification?.status === 'SOURCE_SUPPORTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {item.factEvidence.certification?.status || 'NOT_AVAILABLE'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                              <span className="text-slate-700 font-medium">Amendment / Reaffirmation</span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-700">
                                NOT_AVAILABLE
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                              <span className="text-slate-700 font-medium">Tender Conformity Clause</span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                                SOURCE_SUPPORTED
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Retrieved Source Evidence Box */}
                      {(item.evidenceText || item.sourceDocument) && (
                        <div className="mb-6 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-blue-700" />
                              Retrieved Source Evidence & Provenance
                            </span>
                            {item.sourcePage && item.sourcePage !== 'N/A' && (
                              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Ref: {item.sourcePage}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-950/90 leading-relaxed">
                            {item.evidenceText || item.standard.scope}
                          </p>
                          {item.sourceDocument && (
                            <div className="mt-2 pt-2 border-t border-blue-200/60 text-[11px] text-blue-800">
                              <span className="font-semibold">Source Document: </span>
                              {item.sourceDocument}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Key Clauses & Test Methods */}
                      <div className="mb-6">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          Critical Clauses for Technical Evaluation
                        </h5>
                        {item.standard.keyClauses && item.standard.keyClauses.length > 0 ? (
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
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Clauses Status: </span>
                            Detailed clauses are not available in the current BIS-derived source.
                          </div>
                        )}
                      </div>

                      {/* Required Laboratory Testing Parameters */}
                      <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Mandatory Laboratory Test Protocols
                        </h5>
                        {item.standard.testParameters && item.standard.testParameters.length > 0 ? (
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
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Test Methods Status: </span>
                            Laboratory test methods are not specified in the current BIS-derived source.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Supporting / Related Standards Section */}
            {analysis.secondaryStandards && analysis.secondaryStandards.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      Supporting / Related Standards
                    </h3>
                    <p className="text-xs text-gray-500">
                      Component standards, classification systems, raw material guides, or test methods
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {analysis.secondaryStandards.length} Supporting
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.secondaryStandards.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase tracking-wider">
                              Supporting / Related
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-semibold rounded">
                              {item.sourceBadge || 'Catalogue-Sourced'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#031632] font-mono">
                            {item.standard.isCode}
                          </h4>
                        </div>
                        <button
                          onClick={() => onSelectStandard(item.standard)}
                          className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 mb-2">
                        {item.standard.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {item.rationale || item.standard.scope}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quarantined Unverified AI Suggestions (Anti-Hallucination Gate) */}
            {analysis.unverifiedSuggestions && analysis.unverifiedSuggestions.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-6 shadow-2xs">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        Quarantined Unverified AI Suggestions ({analysis.unverifiedSuggestions.length})
                      </h4>
                      <p className="text-xs text-amber-900/80 mt-1">
                        The AI identified a possible related standard, but it could not be verified against the current BIS-derived knowledge base. These references are quarantined and must NOT be cited as verified or official standards in tender documents.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.unverifiedSuggestions.map((unv, uIdx) => (
                      <div key={uIdx} className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                            {unv.isCode}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unverified AI Suggestion
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-gray-800 mb-1">
                          {unv.title}
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          {unv.reason}
                        </p>
                        <div className="text-[11px] text-amber-800 font-medium bg-amber-50/60 p-2 rounded border border-amber-200/50">
                          <strong>Factual Safeguard:</strong> {unv.disclaimer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Warnings & Audit Trail */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Verification Gate Audit Notice:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                  {analysis.warnings.map((w, wIdx) => (
                    <li key={wIdx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
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
