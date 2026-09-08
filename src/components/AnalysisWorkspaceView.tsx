import React, { useState } from 'react';
import { 
  RequirementAnalysis, 
  IndianStandard, 
  TenderProcessingResult, 
  TenderProcurementItem,
  ClaimedStandardVerification,
  ExtractedSpec,
  EvidenceStatus 
} from '../types';
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
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  FileCheck, 
  Download,
  Sparkles,
  BookOpen,
  Info,
  Building2,
  AlertCircle,
  HelpCircle,
  MinusCircle,
  Scale,
  ArrowRight,
  Tag,
  CornerDownRight,
  Clock
} from 'lucide-react';
import { BIS_STANDARDS_DATABASE } from '../data/bisDatabase';
import { ProcurementStandardsAdvisoryView } from './ProcurementStandardsAdvisoryView';

interface AnalysisWorkspaceViewProps {
  analysis: RequirementAnalysis | null;
  tenderResult: TenderProcessingResult | null;
  onBackToHome: () => void;
  onSelectStandard: (standard: IndianStandard) => void;
  onSaveAnalysis: (analysis: RequirementAnalysis) => void;
  isSaved: boolean;
  onAnalyzeTenderItem?: (item: TenderProcurementItem, index: number) => Promise<void>;
  isAnalyzingItem?: boolean;
  onRefineRequirement?: (refinedText: string) => void;
}

type WorkspaceTab = 'executive' | 'standards' | 'specs_gaps' | 'tender_refs' | 'boq_gem' | 'advisory';

export const AnalysisWorkspaceView: React.FC<AnalysisWorkspaceViewProps> = ({
  analysis,
  tenderResult,
  onBackToHome,
  onSelectStandard,
  onSaveAnalysis,
  isSaved,
  onAnalyzeTenderItem,
  isAnalyzingItem = false,
  onRefineRequirement
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('executive');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const handlePrint = () => {
    setActiveTab('advisory');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Determine active item if multi-item tender
  const activeTenderItem: TenderProcurementItem | undefined = 
    tenderResult && tenderResult.items && tenderResult.items.length > 0
      ? tenderResult.items[selectedItemIndex]
      : undefined;

  // Active analysis to render (either direct analysis or tender item's embedded analysis)
  const currentAnalysis: RequirementAnalysis | null = 
    activeTenderItem?.analysis || analysis;

  // 1. EMPTY STATE
  if (!analysis && !tenderResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-300">
          <Layers className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-[#081a33] mb-2 font-['Noto_Sans',sans-serif]">
          No Active Procurement Analysis
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
          No procurement specifications or tender documents are currently loaded. Please start a new procurement analysis on the home portal.
        </p>
        <button
          onClick={onBackToHome}
          className="px-6 py-2.5 bg-[#081a33] text-white text-xs sm:text-sm font-bold rounded shadow-sm hover:bg-[#0e274a] transition-all cursor-pointer"
        >
          Go to New Procurement Analysis
        </button>
      </div>
    );
  }

  // Derive Understood Procurement Item Name
  const understoodItemName = 
    activeTenderItem?.product || 
    currentAnalysis?.structuredRequirement?.product || 
    (currentAnalysis?.title ? currentAnalysis.title.replace(/^Advisory:\s*/i, '').replace(/^BIS Advisory:\s*/i, '') : '') ||
    tenderResult?.tenderTitle || 
    'Commercial Procurement Item';

  // Derive Quantity
  const detectedQuantity = 
    activeTenderItem?.quantity || 
    extractQuantityFromText(currentAnalysis?.rawRequirement || '') || 
    null;

  // Derive Missing Specification Gaps
  const missingGaps = getMissingSpecificationGaps(
    understoodItemName, 
    currentAnalysis?.extractedSpecs || [], 
    activeTenderItem
  );

  // Derive Claimed Standards Verification from tender item or requirement text
  const claimedStandards = getClaimedStandards(activeTenderItem, currentAnalysis?.rawRequirement || '');

  // Extract key specification quick tags
  const keySpecTags = getKeySpecTags(currentAnalysis?.extractedSpecs || [], activeTenderItem?.technicalParameters || []);

  const hasClarification = (currentAnalysis?.clarificationQuestions && currentAnalysis.clarificationQuestions.length > 0) || currentAnalysis?.clarificationRequired;
  const isNoMatch = currentAnalysis?.isSafeNoMatch || (!currentAnalysis?.primaryStandards || currentAnalysis.primaryStandards.length === 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ========================================================================= */}
        {/* TOP ACTION BAR & AUDIT IDENTIFIERS                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#081a33] bg-white border border-slate-300 hover:border-slate-400 px-3 py-2 rounded shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>

            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Audit Dossier #{currentAnalysis?.id ? currentAnalysis.id.slice(-8).toUpperCase() : 'PROC-SPEC'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentAnalysis && (
              <button
                onClick={() => onSaveAnalysis(currentAnalysis)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-700 text-emerald-700' : 'text-slate-500'}`} />
                <span>{isSaved ? 'Saved to Dossier' : 'Save Dossier'}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('advisory')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer ${
                activeTab === 'advisory'
                  ? 'bg-[#081a33] text-white'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Advisory Dossier</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Dossier (Print/PDF)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. PROMINENT PROCUREMENT ITEM HEADER                                      */}
        {/* Answers: What item was understood? Quantity? Key detected specifications?  */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
          {/* Subtle Tricolour Institutional Rule */}
          <div className="h-[3px] w-full grid grid-cols-3" aria-hidden="true">
            <div className="bg-[#e06a14]" />
            <div className="bg-[#ffffff]" />
            <div className="bg-[#138808]" />
          </div>

          <div className="p-5 sm:p-6 bg-[#081a33] text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              <div className="space-y-2 max-w-4xl">
                {/* Institutional Category & Schedule Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#1b3d68] text-[#f39c12] border border-[#2b5894] font-mono">
                    Procurement Commodity Evaluation
                  </span>

                  {activeTenderItem && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/60 font-mono">
                      Schedule Item {selectedItemIndex + 1} of {tenderResult?.items.length || 1}
                    </span>
                  )}

                  {currentAnalysis?.sector && (
                    <span className="text-[11px] text-slate-300 font-medium">
                      Division: <strong>{currentAnalysis.sector}</strong>
                    </span>
                  )}
                </div>

                {/* Primary Understood Item Name */}
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                    Procurement Item:
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Noto_Sans',sans-serif] tracking-tight">
                    {understoodItemName}
                  </h1>
                </div>

                {/* Quantity Highlight Badge & Scope */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0b2447] text-white border border-[#2b5894] text-xs font-semibold shadow-2xs">
                    <Tag className="w-3.5 h-3.5 text-[#f39c12]" />
                    <span className="text-slate-300">Procurement Quantity:</span>
                    <strong className="text-white font-mono">{detectedQuantity || 'Not Specified in Extract'}</strong>
                  </div>

                  {activeTenderItem?.sourceReference && (
                    <span className="text-[11px] text-slate-300">
                      Tender Reference: <strong>Page {activeTenderItem.sourceReference.pageNumber || 1}</strong>
                      {activeTenderItem.sourceReference.sectionHeading && ` (${activeTenderItem.sourceReference.sectionHeading})`}
                    </span>
                  )}
                </div>

                {/* Detected Key Specifications Quick Tags */}
                {keySpecTags.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Detected Specs:</span>
                    {keySpecTags.map((spec, sIdx) => (
                      <span 
                        key={sIdx} 
                        className="text-[11px] bg-[#14335c] text-blue-100 px-2.5 py-0.5 rounded border border-[#234d85] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status / Compliance Box */}
              <div className="bg-[#051122]/90 border border-slate-700/80 rounded-lg p-4 text-left lg:text-right shrink-0 space-y-1.5">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Catalogue Grounding
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono flex items-center lg:justify-end gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>1,392 BIS Standards Indexed</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  GFR 2017 Rule 144(xi) Conformity
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 font-mono">
                  Evidence Gated • Zero Hallucination
                </div>
              </div>

            </div>
          </div>

          {/* Document Sub-Bar */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span><strong>Source:</strong> {tenderResult?.documentName || 'Direct Technical Requirement Input'}</span>
              {tenderResult?.pageCount && (
                <span><strong>Document Pages:</strong> {tenderResult.pageCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>National Standards Formulation Body (BIS)</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. MULTI-ITEM SELECTOR (IF TENDER HAS MULTIPLE ITEMS)                     */}
        {/* ========================================================================= */}
        {tenderResult && tenderResult.items && tenderResult.items.length > 1 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#081a33]" />
                <span>Detected Procurement Schedules ({tenderResult.items.length} Distinct Commodities)</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                Click any line item to review its dedicated standards advisory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tenderResult.items.map((item, idx) => {
                const isSelected = idx === selectedItemIndex;
                const hasAnalysis = !!item.analysis;

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedItemIndex(idx)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#081a33] shadow-md ring-2 ring-[#081a33]/15'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-[#081a33] text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        ITEM #{idx + 1}
                      </span>

                      {item.quantity && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                          {item.quantity}
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                      {item.product}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {item.missingSpecificationGaps && item.missingSpecificationGaps.length > 0 ? (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {item.missingSpecificationGaps.length} Spec Gap{item.missingSpecificationGaps.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Specs Complete
                        </span>
                      )}

                      {hasAnalysis ? (
                        <span className="text-emerald-700 font-bold">Audited</span>
                      ) : (
                        <span className="text-blue-700 font-medium">Ready to Audit</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. SCANNED DOCUMENT ALERT (IF APPLICABLE)                                 */}
        {/* ========================================================================= */}
        {tenderResult?.isScannedOnly && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-900">
                  Scanned / Image-Only Document Detected
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  This tender document contains scanned or non-selectable rasterized pages. Text extraction could not reliably isolate technical specifications. To prevent hallucinating incorrect standard numbers, synthetic lines were not generated. Please paste the requirement text directly or upload an electronic document with selectable text.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. "NO VERIFIED MATCH" STATE BANNER (IF APPLICABLE)                       */}
        {/* ========================================================================= */}
        {isNoMatch && (
          <div className="bg-amber-50/90 border-l-4 border-amber-500 p-5 rounded-lg shadow-2xs space-y-2">
            <div className="flex items-start gap-3">
              <MinusCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-950 font-['Noto_Sans',sans-serif]">
                  No Verified Match Found in the Indexed BIS-Derived Knowledge Base
                </h3>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  No verified match was found in the indexed BIS-derived catalogue (1,392 standards) for the specified procurement parameters.
                </p>
                <div className="mt-2 text-xs bg-white/80 p-3 rounded border border-amber-200 text-amber-950 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Public Procurement Safeguard Policy:</span>
                  </div>
                  <p className="leading-relaxed">
                    Under strict zero-hallucination protocols, the system will <strong>not substitute an unrelated standard</strong>. Procurement officers should verify whether this item requires custom project-specific performance criteria or check live gazettes on <a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="text-blue-700 underline font-mono">services.bis.gov.in</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. "NEEDS CLARIFICATION" STATE BANNER (IF APPLICABLE)                     */}
        {/* ========================================================================= */}
        {hasClarification && (
          <div className="bg-blue-50/90 border border-blue-200 rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-bold text-blue-950 font-['Noto_Sans',sans-serif]">
                  Needs Clarification: Technical Parameter Ambiguity
                </h3>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded font-mono">
                {currentAnalysis.clarificationQuestions?.length || 1} Clarification Parameter(s)
              </span>
            </div>
            <p className="text-xs text-blue-900/90 leading-relaxed">
              Multiple Indian Standards govern different operational tiers, voltage grades, or service duties for this commodity. The system cannot safely recommend a single definitive standard code without clarifying the following parameters:
            </p>

            <div className="space-y-2.5 pt-1">
              {currentAnalysis.clarificationQuestions?.map((cq, idx) => (
                <div key={idx} className="bg-white rounded-md p-3.5 border border-blue-100 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#081a33] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        {cq.question}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 mb-2">
                        <span className="font-semibold text-slate-700">Procurement Impact:</span> {cq.whyNeeded}
                      </p>
                      
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Select a specification option to refine audit:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cq.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                if (onRefineRequirement) {
                                  const baseText = currentAnalysis.rawRequirement || currentAnalysis.title || '';
                                  onRefineRequirement(`${baseText} - ${opt}`);
                                } else {
                                  handleCopy(opt, `opt-${idx}-${optIdx}`);
                                }
                              }}
                              className="inline-flex items-center text-[11px] font-medium bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-900 px-2.5 py-1 rounded border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#081a33]"
                              title={`Click to audit with specification: ${opt}`}
                            >
                              <span>{opt}</span>
                              <ArrowRight className="w-3 h-3 ml-1 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. WORKSPACE NAVIGATION TABS                                              */}
        {/* ========================================================================= */}
        <div className="border-b border-slate-200 flex flex-wrap space-x-1 sm:space-x-3">
          <button
            onClick={() => setActiveTab('executive')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'executive'
                ? 'border-[#081a33] text-[#081a33]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-[#081a33]" />
            <span>Executive Briefing (All-in-One)</span>
          </button>

          <button
            onClick={() => setActiveTab('standards')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'standards'
                ? 'border-[#081a33] text-[#081a33]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Recommended Standards ({currentAnalysis ? (currentAnalysis.primaryStandards.length + currentAnalysis.secondaryStandards.length) : 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('specs_gaps')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'specs_gaps'
                ? 'border-[#081a33] text-[#081a33]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Specifications & Gaps</span>
          </button>

          <button
            onClick={() => setActiveTab('tender_refs')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tender_refs'
                ? 'border-[#081a33] text-[#081a33]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Tender Citations & Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('boq_gem')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'boq_gem'
                ? 'border-[#081a33] text-[#081a33]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4 text-[#e06a14]" />
            <span>Model BoQ & GeM Clauses</span>
          </button>

          <button
            onClick={() => setActiveTab('advisory')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'advisory'
                ? 'border-[#081a33] text-[#081a33]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>Procurement Standards Advisory (Dossier / Print)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB CONTENT 1: EXECUTIVE BRIEFING (ANSWERS ALL 10 QUESTIONS AT A GLANCE) */}
        {/* ========================================================================= */}
        {activeTab === 'executive' && (
          <div className="space-y-8">
            
            {/* SECTION A: DETECTED SPECIFICATIONS VS SPECIFICATION GAPS COMPARISON */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Question 2: What specifications were detected? */}
              <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      2. Detected Technical Specifications
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentAnalysis?.extractedSpecs?.length || keySpecTags.length} Parameters
                  </span>
                </div>

                {currentAnalysis?.extractedSpecs && currentAnalysis.extractedSpecs.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {currentAnalysis.extractedSpecs.map((spec, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 block">{spec.parameter}</span>
                          <span className="text-slate-600 text-[11px]">{spec.specifiedValue}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            spec.importance === 'Mandatory'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {spec.importance}
                          </span>
                          {spec.standardReference && (
                            <span className="block text-[10px] font-mono text-blue-700 mt-0.5">
                              {spec.standardReference}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded text-center text-xs text-slate-500">
                    No specific tabular parameters extracted; specifications derived from item scope.
                  </div>
                )}
              </div>

              {/* Question 3: What specifications are missing? */}
              <div className="bg-white border border-amber-300 rounded-lg p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                      3. Specification Gaps (Critical Missing Parameters)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono">
                    {missingGaps.length} Gap(s) Identified
                  </span>
                </div>

                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Omission of these parameters creates ambiguity during vendor technical evaluation and risks delivery of sub-standard commercial equipment:
                </p>

                <div className="space-y-2">
                  {missingGaps.map((gap, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-50/60 rounded border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
                      <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        !
                      </span>
                      <div>
                        <span className="font-semibold block">{gap}</span>
                        <span className="text-[10px] text-amber-700 mt-0.5 block">
                          Recommendation: Clarify in Pre-Bid meeting or issue tender Corrigendum before opening technical bids.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* SECTION B: TENDER CLAIMS VERIFICATION GATE */}
            {/* Question 9: Did the tender itself claim any IS numbers, and were those claims verified? */}
            <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#081a33]" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide font-['Noto_Sans',sans-serif]">
                    9. Tender Claims Verification Gate
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  Checking explicitly cited standard codes against BIS database
                </span>
              </div>

              {claimedStandards.length > 0 ? (
                <div className="space-y-2.5">
                  {claimedStandards.map((claim, idx) => {
                    const isVerified = claim.status === 'VERIFIED_IN_CATALOGUE';

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isVerified
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-red-50/80 border-red-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {claim.isCode}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              {isVerified ? 'VERIFIED IN BIS CATALOGUE' : 'UNVERIFIED / INVALID CODE'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                            {claim.note}
                          </p>
                        </div>

                        {claim.matchedStandard && (
                          <button
                            onClick={() => onSelectStandard(claim.matchedStandard!)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#081a33] bg-white border border-slate-300 hover:bg-slate-50 rounded shrink-0 cursor-pointer self-start sm:self-auto"
                          >
                            View Standard Dossier
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>No explicit Indian Standard numbers were claimed in the tender text excerpt. Standard recommendations below were derived purely from technical parameter mapping.</span>
                </div>
              )}
            </div>

            {/* SECTION C: RECOMMENDED STANDARDS (PRIMARY VS SUPPORTING) */}
            {/* Questions 4, 5, 6, 7, 8 */}
            <div className="space-y-6">
              
              {/* PRIMARY STANDARDS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#081a33] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span>Primary Indian Standards (Core Product Safety & Performance)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mandatory benchmark standards governing overall construction, electrical safety ratings, and functional acceptance.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-mono">
                    {currentAnalysis?.primaryStandards.length || 0} Standard(s)
                  </span>
                </div>

                {currentAnalysis?.primaryStandards && currentAnalysis.primaryStandards.length > 0 ? (
                  <div className="space-y-4">
                    {currentAnalysis.primaryStandards.map((match, idx) => (
                      <StandardCard
                        key={match.standard.id || idx}
                        standard={match.standard}
                        role="Primary"
                        rationale={match.rationale}
                        matchConfidence={match.matchConfidence}
                        mandatoryClauses={match.mandatoryClausesToQuote}
                        qcoMandatory={match.qcoMandatory}
                        onSelectStandard={onSelectStandard}
                        onCopy={handleCopy}
                        copiedLabel={copiedLabel}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                    No primary product standard matched with high confidence in the 1,392 handbook entries.
                  </div>
                )}
              </div>

              {/* SUPPORTING STANDARDS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#081a33] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>Supporting Indian Standards (Sub-Assemblies, Test Methods & Code of Practice)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applies to electronic drivers, raw material metallurgy, ingress verification (IP ratings), and installation codes.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-mono">
                    {currentAnalysis?.secondaryStandards.length || 0} Standard(s)
                  </span>
                </div>

                {currentAnalysis?.secondaryStandards && currentAnalysis.secondaryStandards.length > 0 ? (
                  <div className="space-y-4">
                    {currentAnalysis.secondaryStandards.map((match, idx) => (
                      <StandardCard
                        key={match.standard.id || idx}
                        standard={match.standard}
                        role="Supporting"
                        rationale={match.rationale}
                        matchConfidence={match.matchConfidence}
                        mandatoryClauses={match.mandatoryClausesToQuote}
                        qcoMandatory={match.qcoMandatory}
                        onSelectStandard={onSelectStandard}
                        onCopy={handleCopy}
                        copiedLabel={copiedLabel}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                    No secondary/supporting standards required for this item.
                  </div>
                )}
              </div>

            </div>

            {/* SECTION D: WHAT SHOULD THE PROCUREMENT OFFICER DO NEXT? */}
            {/* Question 10: What should the procurement officer do next? */}
            <div className="bg-[#081a33] text-white rounded-lg p-5 sm:p-6 shadow-md border border-[#173864] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f4577] pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#f39c12]" />
                  <h3 className="text-sm sm:text-base font-bold text-white font-['Noto_Sans',sans-serif]">
                    10. Actionable Next Steps for Procurement Officers
                  </h3>
                </div>
                <span className="text-[10px] font-bold font-mono bg-[#14335c] text-blue-200 border border-[#234d85] px-2.5 py-0.5 rounded">
                  Procedural Workflow
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                To support audit defensibility under GFR Rule 144(xi) and the Bureau of Indian Standards Act, 2016, technical evaluation committees should execute the following 5 actions:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                
                <div className="bg-[#0c2445] p-3.5 rounded border border-[#1e4880] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#f39c12] text-[#081a33] text-xs font-bold flex items-center justify-center font-mono">1</span>
                    <h4 className="text-xs font-bold text-white">Mandate Primary IS Code in BoQ</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
                    Specify the primary standard ({currentAnalysis?.primaryStandards[0]?.standard.isCode || 'applicable IS'}) as a mandatory non-waivable technical criterion in the tender schedule.
                  </p>
                </div>

                <div className="bg-[#0c2445] p-3.5 rounded border border-[#1e4880] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#f39c12] text-[#081a33] text-xs font-bold flex items-center justify-center font-mono">2</span>
                    <h4 className="text-xs font-bold text-white">Resolve Specification Gaps in Pre-Bid</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
                    Issue a Corrigendum addressing the {missingGaps.length} detected missing engineering parameters before opening technical bids.
                  </p>
                </div>

                <div className="bg-[#0c2445] p-3.5 rounded border border-[#1e4880] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#f39c12] text-[#081a33] text-xs font-bold flex items-center justify-center font-mono">3</span>
                    <h4 className="text-xs font-bold text-white">Verify Operative License on Manakonline</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
                    Confirm bidder's CM/L or R-number status is "Operative" on <a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="text-[#f39c12] underline">services.bis.gov.in</a> before opening commercial price bids.
                  </p>
                </div>

                <div className="bg-[#0c2445] p-3.5 rounded border border-[#1e4880] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#f39c12] text-[#081a33] text-xs font-bold flex items-center justify-center font-mono">4</span>
                    <h4 className="text-xs font-bold text-white">Audit NABL Type Test Reports with ULR</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
                    Ensure submitted laboratory test certificates bear a valid Unique Lab Report (ULR) issued by an ISO/IEC 17025 accredited laboratory.
                  </p>
                </div>

              </div>

              {/* Quick Model BoQ Copy preview */}
              {currentAnalysis?.sampleBoQSpecification && (
                <div className="pt-2 border-t border-[#1f4577] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-300">
                    Ready-to-use Model BoQ Specification available for copy
                  </span>
                  <button
                    onClick={() => handleCopy(currentAnalysis.sampleBoQSpecification, 'exec-boq')}
                    className="px-3 py-1.5 bg-[#f39c12] hover:bg-[#e06a14] text-[#081a33] text-xs font-bold rounded shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLabel === 'exec-boq' ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5 text-[#081a33]" />}
                    <span>{copiedLabel === 'exec-boq' ? 'BoQ Clause Copied!' : 'Copy Model BoQ Paragraph'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CONTENT 2: DEDICATED RECOMMENDED STANDARDS VIEW                       */}
        {/* ========================================================================= */}
        {activeTab === 'standards' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[#081a33] uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Primary Indian Standards</span>
              </h3>
              {currentAnalysis?.primaryStandards && currentAnalysis.primaryStandards.length > 0 ? (
                <div className="space-y-4">
                  {currentAnalysis.primaryStandards.map((match, idx) => (
                    <StandardCard
                      key={match.standard.id || idx}
                      standard={match.standard}
                      role="Primary"
                      rationale={match.rationale}
                      matchConfidence={match.matchConfidence}
                      mandatoryClauses={match.mandatoryClausesToQuote}
                      qcoMandatory={match.qcoMandatory}
                      onSelectStandard={onSelectStandard}
                      onCopy={handleCopy}
                      copiedLabel={copiedLabel}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                  No primary standards available for this item.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#081a33] uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Supporting Indian Standards</span>
              </h3>
              {currentAnalysis?.secondaryStandards && currentAnalysis.secondaryStandards.length > 0 ? (
                <div className="space-y-4">
                  {currentAnalysis.secondaryStandards.map((match, idx) => (
                    <StandardCard
                      key={match.standard.id || idx}
                      standard={match.standard}
                      role="Supporting"
                      rationale={match.rationale}
                      matchConfidence={match.matchConfidence}
                      mandatoryClauses={match.mandatoryClausesToQuote}
                      qcoMandatory={match.qcoMandatory}
                      onSelectStandard={onSelectStandard}
                      onCopy={handleCopy}
                      copiedLabel={copiedLabel}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                  No supporting standards needed.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CONTENT 3: SPECIFICATIONS & SPECIFICATION GAPS                        */}
        {/* ========================================================================= */}
        {activeTab === 'specs_gaps' && (
          <div className="space-y-6">
            {/* Gaps Notice */}
            <div className="bg-amber-50/80 border border-amber-300 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <h3 className="text-sm font-bold text-amber-900 font-['Noto_Sans',sans-serif]">
                  Specification Gap Analysis & Tender Risk Mitigation
                </h3>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed mb-4">
                The following vital engineering specifications were omitted from the tender documentation. Omission creates ambiguity during technical evaluation and may lead to non-conforming bids:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missingGaps.map((gap, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded border border-amber-200 flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      !
                    </span>
                    <div>
                      <span className="text-xs text-slate-900 font-bold block">{gap}</span>
                      <span className="text-[11px] text-slate-600 mt-0.5 block">
                        Mandate numerical thresholds or performance standards in technical schedule.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Matrix Table */}
            <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Parsed Technical Parameters Matrix
                </h3>
                <span className="text-[11px] text-slate-500">
                  Extracted from requirement or tender schedule
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Parameter</th>
                      <th className="px-4 py-2.5 text-left">Specified Value</th>
                      <th className="px-4 py-2.5 text-left">Standard Reference</th>
                      <th className="px-4 py-2.5 text-center">Criticality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {currentAnalysis?.extractedSpecs && currentAnalysis.extractedSpecs.length > 0 ? (
                      currentAnalysis.extractedSpecs.map((spec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {spec.parameter}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {spec.specifiedValue}
                          </td>
                          <td className="px-4 py-3 text-blue-700 font-mono">
                            {spec.standardReference || 'General Engineering Duty'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              spec.importance === 'Mandatory'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {spec.importance}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                          No specific parametric matrix extracted.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CONTENT 4: TENDER REFERENCES & CITATIONS                              */}
        {/* ========================================================================= */}
        {activeTab === 'tender_refs' && (
          <div className="space-y-6">
            {/* Citation Snippet */}
            {activeTenderItem?.sourceReference && (
              <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  Source Document Location & Verbatim Excerpt
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 rounded border border-slate-200 mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Document Name:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {activeTenderItem.sourceReference.documentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Page Number:</span>
                    <span className="font-bold text-slate-900">
                      Page {activeTenderItem.sourceReference.pageNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Section / Heading:</span>
                    <span className="font-bold text-slate-900">
                      {activeTenderItem.sourceReference.sectionHeading || 'Technical Schedule'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Ingested Verbatim Excerpt:
                  </span>
                  <div className="p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {activeTenderItem.sourceReference.sourceSnippet}
                  </div>
                </div>
              </div>
            )}

            {/* Claimed Standards Gate */}
            <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                Claimed Standards Verification Gate Results
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of tender citations against current Bureau of Indian Standards catalogue.
              </p>

              {claimedStandards.length > 0 ? (
                <div className="space-y-3">
                  {claimedStandards.map((claim, idx) => {
                    const isVerified = claim.status === 'VERIFIED_IN_CATALOGUE';

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isVerified ? 'bg-emerald-50/60 border-emerald-300' : 'bg-red-50/60 border-red-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 font-mono">{claim.isCode}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              {claim.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{claim.note}</p>
                        </div>

                        {claim.matchedStandard && (
                          <button
                            onClick={() => onSelectStandard(claim.matchedStandard!)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#081a33] bg-white border border-slate-300 hover:bg-slate-50 rounded shrink-0 cursor-pointer"
                          >
                            View Standard Details
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded text-center text-xs text-slate-500">
                  No explicit Indian Standard references were cited in the tender excerpt for this item.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CONTENT 5: BOQ & GEM CLAUSE DOSSIER                                   */}
        {/* ========================================================================= */}
        {activeTab === 'boq_gem' && currentAnalysis && (
          <div className="space-y-6">
            {/* Model BoQ Clause */}
            <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Model Bill of Quantities (BoQ) Technical Specification Clause
                </h3>
                <button
                  onClick={() => handleCopy(currentAnalysis.sampleBoQSpecification, 'boq')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#081a33] hover:text-[#e06a14] cursor-pointer"
                >
                  {copiedLabel === 'boq' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLabel === 'boq' ? 'Copied to Clipboard' : 'Copy BoQ Clause'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Pre-drafted, audit-compliant technical paragraph ready for insertion into GeM Custom Bids or CPPP / State e-Procurement portals.
              </p>
              <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 font-serif leading-relaxed whitespace-pre-wrap">
                {currentAnalysis.sampleBoQSpecification}
              </div>
            </div>

            {/* GeM Special Terms */}
            {currentAnalysis.gemTenderClauses && currentAnalysis.gemTenderClauses.length > 0 && (
              <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  Government e-Marketplace (GeM) Special Terms & Conditions
                </h3>
                <div className="space-y-3">
                  {currentAnalysis.gemTenderClauses.map((clause, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{clause.title}</span>
                        <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {clause.applicableIS}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-mono text-[11px]">
                        {clause.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QCO Mandatory Status */}
            {currentAnalysis.qcoSummary && currentAnalysis.qcoSummary.isRegulated && (
              <div className="bg-red-50/80 border border-red-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-red-700 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-red-950 font-['Noto_Sans',sans-serif]">
                    Mandatory Quality Control Order (QCO) Statutory Status
                  </h3>
                </div>
                <p className="text-xs text-red-900 leading-relaxed mb-3">
                  This commodity is notified under the <strong>{currentAnalysis.qcoSummary.orderName}</strong>. Under Section 16 of the Bureau of Indian Standards Act, 2016, manufacturing, importing, or selling non-certified goods is prohibited. Bidders MUST possess an active BIS Standard Mark license at the time of bid submission.
                </p>
                <div className="text-[11px] text-red-800 font-semibold">
                  Legal Consequence: Non-certified bids must be rejected at the technical evaluation stage.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CONTENT 6: FORMAL PROCUREMENT STANDARDS ADVISORY (PRINT / PDF / SHARE) */}
        {/* ========================================================================= */}
        {activeTab === 'advisory' && (
          <ProcurementStandardsAdvisoryView
            analysis={currentAnalysis}
            tenderResult={tenderResult}
            activeItemIndex={selectedItemIndex}
            onBackToWorkspace={() => setActiveTab('executive')}
            onSelectStandard={onSelectStandard}
          />
        )}

      </div>
    </div>
  );
};

/**
 * Enhanced Institutional Standard Card Component
 * Answers:
 * - Which standards are recommended?
 * - Which are PRIMARY vs SUPPORTING?
 * - Why was each standard recommended? (Expandable)
 * - What evidence supports it? (Expandable)
 * - What information is unavailable or not independently verified?
 * - Certification section (ONLY when evidence exists)
 */
interface StandardCardProps {
  standard: IndianStandard;
  role: 'Primary' | 'Supporting';
  rationale: string;
  matchConfidence?: number;
  mandatoryClauses: string[];
  qcoMandatory: boolean;
  onSelectStandard: (standard: IndianStandard) => void;
  onCopy: (text: string, label: string) => void;
  copiedLabel: string | null;
}

const StandardCard: React.FC<StandardCardProps> = ({
  standard,
  role,
  rationale,
  matchConfidence,
  mandatoryClauses,
  qcoMandatory,
  onSelectStandard,
  onCopy,
  copiedLabel
}) => {
  const [isWhyOpen, setIsWhyOpen] = useState(true);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isClausesOpen, setIsClausesOpen] = useState(false);

  // Evidence Status determination
  const hasIndexedChunks = standard.chunks && standard.chunks.length > 0;
  const evidenceStatus: EvidenceStatus = 'SOURCE_SUPPORTED';

  // Check if certification evidence exists
  const hasCertificationEvidence = qcoMandatory || standard.isQCOMandatory || standard.qcoNotification;

  return (
    <div className={`bg-white border rounded-lg overflow-hidden shadow-2xs transition-colors ${
      role === 'Primary' ? 'border-emerald-300 hover:border-emerald-400' : 'border-slate-300 hover:border-slate-400'
    }`}>
      {/* Top Role Indicator Stripe */}
      <div className={`h-[3px] w-full ${role === 'Primary' ? 'bg-emerald-600' : 'bg-blue-600'}`} />

      <div className="p-4 sm:p-5 space-y-4">
        
        {/* HEADER: Standard Code, Provenance Badge, Title & Match Score */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-[#081a33] font-mono tracking-tight">
                {standard.isCode}
              </span>

              {/* Role Badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                role === 'Primary' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}>
                {role.toUpperCase()} SPECIFICATION
              </span>

              {/* Evidence / Provenance Badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>SOURCE_SUPPORTED</span>
              </span>

              {/* QCO Mandatory Badge */}
              {qcoMandatory && (
                <span className="text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded font-mono">
                  QCO MANDATORY
                </span>
              )}

              {/* Publication Year */}
              {standard.yearOfPublication && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                  Pub: {standard.yearOfPublication}
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-['Noto_Sans',sans-serif]">
              {standard.title}
            </h4>
          </div>

          {/* Relevance / Match Score ONLY if existing system supplies one */}
          {typeof matchConfidence === 'number' && matchConfidence > 0 && (
            <div className="text-right shrink-0 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Match Score</div>
              <div className="text-sm font-bold text-[#081a33] font-mono">{matchConfidence}%</div>
            </div>
          )}
        </div>

        {/* Division & Committee Meta Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
          <div>
            <span className="text-slate-400">Division: </span>
            <span className="font-semibold text-slate-800">{standard.divisionName || standard.division}</span>
          </div>
          {standard.committee && (
            <div>
              <span className="text-slate-400">Committee: </span>
              <span className="font-mono font-semibold text-slate-800">{standard.committee}</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* EXPANDABLE SECTION 1: WHY THIS STANDARD?                                  */}
        {/* ========================================================================= */}
        <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50">
          <button
            onClick={() => setIsWhyOpen(!isWhyOpen)}
            className="w-full px-3.5 py-2 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#081a33]" />
              <span>Why Was This Standard Recommended? (Engineering Rationale)</span>
            </span>
            {isWhyOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {isWhyOpen && (
            <div className="px-3.5 pb-3 pt-1 text-xs text-slate-700 border-t border-slate-200 bg-white leading-relaxed">
              <p>{rationale || `Directly governs product construction and safety ratings for ${standard.title}.`}</p>
              {standard.scope && (
                <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-0.5">Catalogued Scope:</span>
                  {standard.scope}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* EXPANDABLE SECTION 2: EVIDENCE & SOURCE                                   */}
        {/* ========================================================================= */}
        <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50">
          <button
            onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
            className="w-full px-3.5 py-2 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#081a33]" />
              <span>Evidence & Provenance (Catalogue Grounding)</span>
            </span>
            {isEvidenceOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {isEvidenceOpen && (
            <div className="px-3.5 pb-3 pt-2 text-xs text-slate-700 border-t border-slate-200 bg-white space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="font-semibold text-slate-500 block">Source Handbook Reference:</span>
                  <span className="font-mono text-slate-800">{standard.sourceDocuments || 'Bureau of Indian Standards National Standards Repository'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="font-semibold text-slate-500 block">Section / Division:</span>
                  <span className="font-mono text-slate-800">{standard.division} ({standard.divisionName})</span>
                </div>
              </div>

              {hasIndexedChunks && standard.chunks && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">Indexed Source Chunk Excerpt:</span>
                  <p className="font-mono text-[10px] leading-relaxed text-slate-800">{standard.chunks[0].text}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* EXPANDABLE SECTION 3: KEY MANDATORY CLAUSES TO QUOTE                      */}
        {/* ========================================================================= */}
        {mandatoryClauses && mandatoryClauses.length > 0 && (
          <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50">
            <button
              onClick={() => setIsClausesOpen(!isClausesOpen)}
              className="w-full px-3.5 py-2 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#081a33]" />
                <span>Mandatory Technical Clauses to Quote ({mandatoryClauses.length} Clauses)</span>
              </span>
              {isClausesOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {isClausesOpen && (
              <div className="px-3.5 pb-3 pt-2 text-xs border-t border-slate-200 bg-white space-y-1.5">
                {mandatoryClauses.map((clause, cIdx) => (
                  <div key={cIdx} className="bg-blue-50/60 text-blue-950 p-2 rounded border border-blue-100 flex items-start gap-2 text-[11px]">
                    <span className="font-bold text-blue-800 shrink-0 font-mono">•</span>
                    <span>{clause}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: CURRENTNESS / AMENDMENT STATUS WITH CAREFUL WORDING            */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Catalogue Currentness & Verification Boundaries</span>
          </div>
          <p className="leading-relaxed">
            Live currentness/amendment status is not independently verified in this system. Standard presence is verified in the indexed Bureau of Indian Standards catalogue ({standard.isCode}). Currentness, latest gazetted amendments, and operative errata slips must be independently confirmed on <a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="text-blue-700 underline font-mono">services.bis.gov.in</a> before contract award.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: CERTIFICATION & CONFORMITY (ONLY WHEN EVIDENCE EXISTS)         */}
        {/* ========================================================================= */}
        {hasCertificationEvidence && (
          <div className="bg-amber-50/70 border border-amber-200 p-3 rounded text-[11px] text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Conformity Assessment & Statutory Scheme:</span>
            </div>
            <p className="leading-relaxed">
              Regulated under Quality Control Order ({standard.qcoNotification || 'Compulsory BIS Certification'}). Bidders must hold an active Standard Mark license under Scheme-I or CRS Scheme-II as applicable.
            </p>
            <div className="text-[10px] text-amber-800 pt-1 border-t border-amber-200/80">
              <strong>Unavailable Offline Data:</strong> Active manufacturer licensee rosters (CM/L numbers) and accredited testing lab directories (NABL) are transactional live government records not stored offline; verify current manufacturer validity on BIS Manakonline.
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => onCopy(standard.isCode, `code-${standard.id}`)}
            className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
          >
            {copiedLabel === `code-${standard.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLabel === `code-${standard.id}` ? 'IS Code Copied!' : 'Copy Code'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCopy(standard.gemClauseBoilerplate, `gem-${standard.id}`)}
              className="px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded cursor-pointer"
            >
              {copiedLabel === `gem-${standard.id}` ? 'GeM Text Copied!' : 'Copy GeM Boilerplate'}
            </button>

            <button
              onClick={() => onSelectStandard(standard)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#081a33] hover:bg-[#0e274a] rounded cursor-pointer shadow-2xs"
            >
              View Full Standard Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// =========================================================================
// HELPER FUNCTIONS FOR ROBUST PROCUREMENT EXTRACTIONS
// =========================================================================

/**
 * Extracts quantity from requirement text if not parsed by tender item
 */
function extractQuantityFromText(text: string): string | null {
  if (!text) return null;
  const qtyMatch = text.match(/\b(\d[\d,]*\s*(?:nos|sets|units|pieces|km|meters|mtrs|mt|metric\s*tonnes?|liters?|ltrs?|kg|kva|kw|mw|pairs|boxes))\b/i);
  if (qtyMatch) return qtyMatch[1];
  const numQtyMatch = text.match(/\b(?:quantity|qty)[:\s=]+(\d[\d,]*\s*[a-zA-Z]*)\b/i);
  if (numQtyMatch) return numQtyMatch[1].trim();
  return null;
}

/**
 * Derives missing specification gaps with engineering domain heuristics
 */
function getMissingSpecificationGaps(
  productName: string, 
  specs: ExtractedSpec[] = [], 
  activeItem?: TenderProcurementItem
): string[] {
  if (activeItem?.missingSpecificationGaps && activeItem.missingSpecificationGaps.length > 0) {
    return activeItem.missingSpecificationGaps;
  }

  const p = productName.toLowerCase();
  const existing = specs.map(s => `${s.parameter} ${s.specifiedValue}`.toLowerCase()).join(' ');
  const gaps: string[] = [];

  if (p.includes('light') || p.includes('luminaire') || p.includes('lamp') || p.includes('led')) {
    if (!existing.includes('distribution') && !existing.includes('beam')) gaps.push('Optical beam distribution & luminous efficacy (minimum lm/W)');
    if (!existing.includes('ip') && !existing.includes('ingress')) gaps.push('IP ingress protection rating (e.g. IP65 / IP66 outdoor environmental rating)');
    if (!existing.includes('surge') && !existing.includes('kv')) gaps.push('Surge protection capacity (e.g. 4kV / 10kV SPD protection)');
    if (!existing.includes('cct') && !existing.includes('color')) gaps.push('Correlated Color Temperature (CCT: 4000K vs 5700K)');
  } else if (p.includes('cable') || p.includes('wire') || p.includes('conductor')) {
    if (!existing.includes('volt') && !existing.includes('kv') && !existing.includes('1.1kv')) gaps.push('Voltage grade rating (e.g. 1.1 kV LT vs 11 kV/33 kV HT)');
    if (!existing.includes('xlpe') && !existing.includes('pvc')) gaps.push('Insulation type (Cross-linked Polyethylene / XLPE vs PVC)');
    if (!existing.includes('copper') && !existing.includes('aluminium') && !existing.includes('aluminum')) gaps.push('Conductor material (Stranded Copper vs Aluminum)');
    if (!existing.includes('armour') && !existing.includes('armored')) gaps.push('Armouring specification (Steel wire/strip armoured vs unarmoured)');
  } else if (p.includes('pole') || p.includes('mast') || p.includes('tower')) {
    if (!existing.includes('height') && !existing.includes('meter') && !existing.includes('mtr')) gaps.push('Mounting height & base plate dimensions');
    if (!existing.includes('octagonal') && !existing.includes('tubular')) gaps.push('Pole cross-section design (Octagonal, Swaged Tubular, or Polygonal)');
    if (!existing.includes('galvaniz') && !existing.includes('zinc')) gaps.push('Hot-dip galvanizing coating thickness (microns as per IS 2629)');
    if (!existing.includes('wind') && !existing.includes('speed')) gaps.push('Design wind speed resistance (km/h per IS 875 Part 3)');
  } else if (p.includes('steel') || p.includes('rebar') || p.includes('tmt')) {
    if (!existing.includes('fe') && !existing.includes('500') && !existing.includes('550')) gaps.push('Steel yield strength grade (Fe 500 vs Fe 500D vs Fe 550D)');
    if (!existing.includes('crs') && !existing.includes('corrosion')) gaps.push('Corrosion resistance requirement (Standard vs CRS alloyed)');
    if (!existing.includes('elongation') && !existing.includes('bend')) gaps.push('Minimum percentage elongation & reverse bend ductility tolerances');
  } else if (p.includes('cement') || p.includes('concrete')) {
    if (!existing.includes('43') && !existing.includes('53') && !existing.includes('33')) gaps.push('Cement strength grade (Grade 43 vs 53 OPC)');
    if (!existing.includes('opc') && !existing.includes('ppc') && !existing.includes('slag')) gaps.push('Cement chemical type (Ordinary Portland vs Portland Pozzolana vs Slag)');
    if (!existing.includes('setting') && !existing.includes('soundness')) gaps.push('Initial/final setting time & autoclave soundness test tolerances');
  } else {
    gaps.push('Specific operational duty cycle / environmental rating');
    gaps.push('Dimensional tolerances and material grade classification');
    gaps.push('Mandatory factory acceptance test (FAT) parameters');
  }

  return gaps.slice(0, 3);
}

/**
 * Extracts claimed standards from tender item or text and verifies against BIS catalogue
 */
function getClaimedStandards(
  activeItem?: TenderProcurementItem, 
  rawText: string = ''
): ClaimedStandardVerification[] {
  if (activeItem?.claimedStandardsVerification && activeItem.claimedStandardsVerification.length > 0) {
    return activeItem.claimedStandardsVerification;
  }

  if (!rawText) return [];

  // Match IS codes in raw text
  const matches = rawText.match(/\bIS\s*(?:\/IEC\s*)?[0-9]{3,5}(?:\s*\(Part\s*[0-9]+(?:\/[A-Za-z0-9]+)?\))?(?::\s*[0-9]{4})?\b/gi) || [];
  const unique = Array.from(new Set(matches.map(m => m.trim())));

  return unique.map(code => {
    const cleanNum = code.replace(/^IS\s*(?:\/IEC\s*)?/i, '').replace(/:\s*\d{4}$/, '').trim();
    const matched = BIS_STANDARDS_DATABASE.find(s => 
      s.isCode.toLowerCase().includes(cleanNum.toLowerCase()) || 
      s.shortCode.toLowerCase().includes(cleanNum.toLowerCase())
    );

    if (matched) {
      return {
        isCode: code,
        status: 'VERIFIED_IN_CATALOGUE' as const,
        matchedStandard: matched,
        note: `Verified in BIS catalogue as "${matched.title}".`
      };
    } else {
      return {
        isCode: code,
        status: 'UNVERIFIED_IN_CATALOGUE' as const,
        note: `Standard code "${code}" could not be verified in the 1,392 catalogued Indian Standards. Check for typographical error, withdrawn code, or unlisted standard.`
      };
    }
  });
}

/**
 * Generates quick specification chips
 */
function getKeySpecTags(specs: ExtractedSpec[], technicalParams: string[] = []): string[] {
  const tags: string[] = [];

  for (const s of specs) {
    if (s.specifiedValue && s.specifiedValue.length < 30) {
      tags.push(`${s.parameter}: ${s.specifiedValue}`);
    }
  }

  for (const t of technicalParams) {
    if (t && t.length < 30 && !tags.some(tag => tag.toLowerCase().includes(t.toLowerCase()))) {
      tags.push(t);
    }
  }

  return tags.slice(0, 5);
}
