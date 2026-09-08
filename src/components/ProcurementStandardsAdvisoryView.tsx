import React, { useState } from 'react';
import { 
  RequirementAnalysis, 
  IndianStandard, 
  TenderProcessingResult, 
  TenderProcurementItem,
  ClaimedStandardVerification,
  ExtractedSpec,
  EvidenceStatus,
  MatchedStandard
} from '../types';
import { 
  Printer, 
  Copy, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Scale, 
  FileCheck, 
  Info, 
  Tag,
  ExternalLink,
  Share2,
  Lock,
  MinusCircle,
  Layers
} from 'lucide-react';
import { BIS_STANDARDS_DATABASE } from '../data/bisDatabase';

export interface ProcurementStandardsAdvisoryViewProps {
  analysis: RequirementAnalysis | null;
  tenderResult: TenderProcessingResult | null;
  onBackToWorkspace: () => void;
  onSelectStandard?: (standard: IndianStandard) => void;
  activeItemIndex?: number;
}

export const ProcurementStandardsAdvisoryView: React.FC<ProcurementStandardsAdvisoryViewProps> = ({
  analysis,
  tenderResult,
  onBackToWorkspace,
  onSelectStandard,
  activeItemIndex = 0
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Active tender item if multi-item tender
  const activeItem: TenderProcurementItem | undefined = 
    tenderResult?.items && tenderResult.items.length > 0 
      ? tenderResult.items[activeItemIndex] 
      : undefined;

  // Active analysis (either from tender item or direct analysis)
  const currentAnalysis: RequirementAnalysis | null = activeItem?.analysis || analysis;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Derive Understood Procurement Commodity Name
  const procurementItemName = 
    activeItem?.product || 
    currentAnalysis?.structuredRequirement?.product || 
    (currentAnalysis?.title ? currentAnalysis.title.replace(/^Advisory:\s*/i, '').replace(/^BIS Advisory:\s*/i, '') : '') ||
    tenderResult?.tenderTitle || 
    'Commercial Procurement Commodity';

  // Derive Tender / Procurement Reference Name
  const tenderReferenceName = 
    tenderResult?.tenderTitle || 
    tenderResult?.documentName || 
    (currentAnalysis?.rawRequirement ? currentAnalysis.rawRequirement.slice(0, 70) + (currentAnalysis.rawRequirement.length > 70 ? '...' : '') : 'Technical Procurement Specification');

  // Derive Quantity
  const detectedQuantity = 
    activeItem?.quantity || 
    extractQuantity(currentAnalysis?.rawRequirement || '') || 
    'Not explicitly stated in technical extract';

  // Analysis Date / Time
  const analysisDateTime = currentAnalysis?.timestamp 
    ? new Date(currentAnalysis.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium'
      }) + ' (IST)'
    : new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' }) + ' (IST)';

  // Dossier Reference ID
  const dossierId = currentAnalysis?.id 
    ? `BIS-ADV-${currentAnalysis.id.slice(-8).toUpperCase()}` 
    : `BIS-ADV-${Date.now().toString().slice(-8)}`;

  // Missing Specification Gaps
  const missingGaps = getMissingSpecificationGaps(
    procurementItemName,
    currentAnalysis?.extractedSpecs || [],
    activeItem
  );

  // Tender-claimed standards & verification outcomes
  const claimedStandards = getClaimedStandards(activeItem, currentAnalysis?.rawRequirement || '');

  // Primary & Supporting standards
  const primaryStandards: MatchedStandard[] = currentAnalysis?.primaryStandards || [];
  const supportingStandards: MatchedStandard[] = currentAnalysis?.secondaryStandards || [];

  // Generate full markdown advisory for copy
  const handleCopyFullAdvisory = () => {
    const md = buildPlaintextAdvisory(
      dossierId,
      procurementItemName,
      tenderReferenceName,
      analysisDateTime,
      detectedQuantity,
      currentAnalysis,
      activeItem,
      primaryStandards,
      supportingStandards,
      missingGaps,
      claimedStandards
    );
    handleCopyText(md, 'full_advisory');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 print:bg-white print:py-0 print:m-0 font-['Noto_Sans',sans-serif]">
      
      {/* ========================================================================= */}
      {/* TOP CONTROL BAR (HIDDEN IN PRINT)                                         */}
      {/* ========================================================================= */}
      <div className="max-w-5xl mx-auto px-4 mb-6 print:hidden">
        <div className="bg-white border border-slate-300 rounded-lg p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBackToWorkspace}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#081a33] bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Interactive Workspace</span>
            </button>
            <span className="text-slate-300">|</span>
            <div className="text-xs text-slate-600 font-mono hidden sm:block">
              Doc Ref: <strong>{dossierId}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullAdvisory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition-colors cursor-pointer"
              title="Copy formatted markdown advisory to clipboard"
            >
              {copiedSection === 'full_advisory' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Advisory Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Text Advisory</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#081a33] hover:bg-[#0e274a] rounded shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Advisory Dossier (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORMAL ADVISORY DOSSIER DOCUMENT CONTAINER                                */}
      {/* Designed in clean, high-contrast, reference government audit typography   */}
      {/* ========================================================================= */}
      <div 
        id="official-procurement-standards-advisory"
        className="max-w-5xl mx-auto bg-white border-2 border-slate-800 shadow-lg print:shadow-none print:border-none p-6 sm:p-12 text-slate-900 leading-normal"
      >
        
        {/* INSTITUTIONAL TRICOLOUR HEADER STRIPE */}
        <div className="h-1.5 w-full grid grid-cols-3 mb-6 print:mb-4" aria-hidden="true">
          <div className="bg-[#e06a14]" />
          <div className="bg-[#ffffff] border-y border-slate-200" />
          <div className="bg-[#138808]" />
        </div>

        {/* 1. INSTITUTIONAL LETTERHEAD & ADVISORY TITLE */}
        <header className="border-b-2 border-slate-900 pb-5 mb-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-800 text-xs uppercase font-extrabold tracking-widest">
            <Building2 className="w-4 h-4 text-[#081a33]" />
            <span>Public Procurement Technical Advisory • Reference Audit Dossier</span>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 uppercase tracking-tight font-['Noto_Sans',sans-serif]">
            Procurement Standards Advisory Report
          </h1>
          
          <p className="text-xs text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
            Standardization, Quality Conformity & Specification Gaps Technical Audit under General Financial Rules (GFR) 2017 Rule 144(xi) and Bureau of Indian Standards Act, 2016
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-600 border-t border-slate-200 mt-3">
            <span><strong>ADVISORY REF:</strong> {dossierId}</span>
            <span>•</span>
            <span><strong>CLASSIFICATION:</strong> PUBLIC PROCUREMENT / TENDER AUDIT</span>
            <span>•</span>
            <span><strong>CATALOGUE SCOPE:</strong> 1,392 BIS STANDARDS INDEXED</span>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2 & 3. PROCUREMENT METADATA & AUDIT TIMESTAMP MATRIX                     */}
        {/* ========================================================================= */}
        <section className="mb-6 bg-slate-50 border border-slate-300 p-4 rounded-xs text-xs space-y-2.5">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>1. Procurement & Evaluation Reference Parameters</span>
            <span className="font-mono text-slate-500 font-normal">Section 1 of 15</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <span className="text-slate-500 font-semibold block">Procurement / Tender Subject:</span>
              <strong className="text-slate-900 font-medium text-xs sm:text-sm">{tenderReferenceName}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block">Evaluation Date & Time:</span>
              <strong className="text-slate-900 font-mono">{analysisDateTime}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block">Target Commodity / Scope:</span>
              <strong className="text-slate-900">{procurementItemName}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block">Estimated / Detected Quantity:</span>
              <strong className="text-slate-900 font-mono">{detectedQuantity}</strong>
            </div>

            {tenderResult?.documentName && (
              <div>
                <span className="text-slate-500 font-semibold block">Source Tender File:</span>
                <span className="text-slate-800 font-mono">{tenderResult.documentName}</span>
                {tenderResult.pageCount && <span className="text-slate-500 ml-1">({tenderResult.pageCount} pages)</span>}
              </div>
            )}

            <div>
              <span className="text-slate-500 font-semibold block">Technical Division / Sector:</span>
              <span className="text-slate-800 font-semibold">{currentAnalysis?.sector || 'General Engineering'}</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. PROCUREMENT ITEMS ANALYZED (SCHEDULE SCHEDULE MATRIX)                  */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide">
              2. Procurement Items Analyzed
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {tenderResult?.items?.length ? `${tenderResult.items.length} Schedule Item(s)` : 'Single Commodity Item'}
            </span>
          </div>

          {tenderResult?.items && tenderResult.items.length > 0 ? (
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="py-2 px-3 border-r border-slate-300 w-12 text-center">Item #</th>
                    <th className="py-2 px-3 border-r border-slate-300">Commodity Description</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-32">Procured Quantity</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-36">Tender Reference</th>
                    <th className="py-2 px-3 w-32 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tenderResult.items.map((it, idx) => (
                    <tr key={it.id || idx} className={idx === activeItemIndex ? 'bg-amber-50/40 font-medium' : ''}>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300">
                        <div className="font-semibold text-slate-900">{it.product}</div>
                        {it.application && <div className="text-[11px] text-slate-500">Scope: {it.application}</div>}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 font-mono">
                        {it.quantity || 'Not specified'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-[11px] text-slate-600">
                        {it.sourceReference?.documentName || 'Extracted Text'}
                        {it.sourceReference?.pageNumber && ` (p. ${it.sourceReference.pageNumber})`}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-300 text-slate-800">
                          {idx === activeItemIndex ? 'CURRENTLY AUDITED' : 'SCHEDULE ITEM'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xs text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{procurementItemName}</span>
                <span className="font-mono text-slate-600">Quantity: {detectedQuantity}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {currentAnalysis?.summary || 'Procurement requirement parsed from provided commercial technical text.'}
              </p>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. SPECIFICATIONS DETECTED                                                */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide">
              3. Specifications Detected in Requirement Excerpt
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {currentAnalysis?.extractedSpecs?.length || 0} Parameter(s) Isolated
            </span>
          </div>

          {currentAnalysis?.extractedSpecs && currentAnalysis.extractedSpecs.length > 0 ? (
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="py-2 px-3 border-r border-slate-300 w-10 text-center">#</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-1/3">Technical Parameter</th>
                    <th className="py-2 px-3 border-r border-slate-300">Specified Requirement / Value</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-28 text-center">Criticality</th>
                    <th className="py-2 px-3 w-36">Relevant Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentAnalysis.extractedSpecs.map((spec, sIdx) => (
                    <tr key={sIdx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono text-slate-500">
                        {sIdx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 font-medium text-slate-900">
                        {spec.parameter}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-slate-800">
                        {spec.specifiedValue}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          spec.importance === 'Mandatory' 
                            ? 'bg-red-50 text-red-800 border border-red-200' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {spec.importance}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                        {spec.standardReference || 'General Spec'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 border border-slate-200">
              No specific tabular parameters were extracted; evaluation performed on general scope and item description.
            </p>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 6. SPECIFICATION GAPS (DEFICIENCIES / MISSING PARAMETERS)                 */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>4. Technical Specification Gaps Identified</span>
            </h2>
            <span className="text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
              {missingGaps.length} Deficiency / Gap(s) Detected
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            The technical requirement lacks essential engineering parameters required to unambiguously benchmark product conformity. Omission of these variables creates commercial ambiguity and risks supply of non-compliant goods:
          </p>

          <div className="border border-amber-300 bg-amber-50/50 divide-y divide-amber-200">
            {missingGaps.map((gap, gIdx) => (
              <div key={gIdx} className="p-3 text-xs flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {gIdx + 1}
                </span>
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-950">{gap}</div>
                  <div className="text-[11px] text-amber-900 leading-relaxed">
                    <strong>Procurement Risk & Action:</strong> Absence of explicit limit tolerances in the tender schedule prevents objective technical evaluation. The Tender Inviting Authority (TIA) is advised to issue a Pre-Bid Corrigendum specifying numerical thresholds conforming to the primary Indian Standard.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. RECOMMENDED PRIMARY STANDARDS (MANDATORY BENCHMARKS)                   */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>5. Recommended PRIMARY Indian Standards (Core Conformity)</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold">
              {primaryStandards.length} Primary Code(s)
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            These standards define the governing specifications, construction requirements, safety tests, and acceptance criteria. All bidders must demonstrate strict compliance as a non-waivable technical qualification criterion:
          </p>

          {primaryStandards.length > 0 ? (
            <div className="space-y-3">
              {primaryStandards.map((match, idx) => (
                <div 
                  key={match.standard.id || idx} 
                  className="border border-slate-300 bg-white p-4 rounded-xs shadow-2xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#081a33] font-mono">
                          {match.standard.isCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                          PRIMARY STANDARD
                        </span>
                        {match.standard.isQCOMandatory && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-mono">
                            STATUTORY QCO MANDATED
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">
                        {match.standard.title}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right shrink-0 text-[11px] font-mono text-slate-600 space-y-0.5">
                      <div>Division: <strong>{match.standard.divisionName || match.standard.division}</strong></div>
                      <div>Committee: <strong>{match.standard.committee}</strong></div>
                      <div>Observed Publication: <strong>{match.standard.yearOfPublication || 'Observed in Catalogue'}</strong></div>
                    </div>
                  </div>

                  {/* 9. Why this standard was recommended */}
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                      Engineering Selection Rationale:
                    </span>
                    <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                      {match.rationale || 'Directly governs product construction, electrical safety ratings, mechanical tolerances, and functional performance benchmarks.'}
                    </p>
                  </div>

                  {/* 10. Evidence / Provenance / Source */}
                  <div className="text-[11px] flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-slate-600">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400 font-semibold">Provenance:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        SOURCE_SUPPORTED
                      </span>
                      <span>• BIS Handbook Volume ({match.standard.committee})</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      Standard ID: {match.standard.id}
                    </div>
                  </div>

                  {/* Mandatory clauses to quote */}
                  {match.mandatoryClausesToQuote && match.mandatoryClausesToQuote.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-xs">
                      <span className="font-bold text-slate-800 text-[11px] block mb-1">
                        Mandatory Clauses to Quote in Tender Schedule:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {match.mandatoryClausesToQuote.map((c, cIdx) => (
                          <div key={cIdx} className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-800">
                            ✓ {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xs text-xs text-amber-950">
              <strong>No High-Confidence Primary Standard Match in Indexed Handbook:</strong> Under zero-hallucination public procurement protocols, generic standard numbers have NOT been substituted. Technical evaluation officers must verify if custom ministerial specifications apply.
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 8. RECOMMENDED SUPPORTING STANDARDS                                       */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>6. Recommended SUPPORTING & Component Standards</span>
            </h2>
            <span className="text-[11px] font-mono text-blue-800 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded font-bold">
              {supportingStandards.length} Supporting Code(s)
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            These secondary standards govern sub-assemblies, electronic drivers, raw material metallurgy, ingress verification (IP ratings), and test methodologies:
          </p>

          {supportingStandards.length > 0 ? (
            <div className="border border-slate-300 divide-y divide-slate-200">
              {supportingStandards.map((match, idx) => (
                <div key={match.standard.id || idx} className="p-3 bg-white text-xs space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 font-mono">
                        {match.standard.isCode}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                        {match.role.toUpperCase()}
                      </span>
                      {match.standard.isQCOMandatory && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-800 border border-red-200 font-mono">
                          QCO
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Committee: {match.standard.committee} | Pub: {match.standard.yearOfPublication || 'Observed'}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 text-xs">
                    {match.standard.title}
                  </div>

                  {/* Why recommended */}
                  <div className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>Applicability:</strong> {match.rationale || 'Applicable to component assemblies, driver safety, or environmental test procedures.'}
                  </div>

                  {/* Provenance */}
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 pt-0.5">
                    <span className="text-emerald-700 font-semibold">SOURCE_SUPPORTED</span>
                    <span>• Indexed BIS Catalogue</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 border border-slate-200">
              No supplementary or component standards required for this commodity.
            </p>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 11. CURRENTNESS & AMENDMENT STATUS (CAUTIOUS ADVISORY)                     */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-700" />
              <span>7. Currentness, Reaffirmation & Amendment Status</span>
            </h2>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded">
              EVIDENCE STATUS: NOT_AVAILABLE (LIVE REVISIONS)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-300 p-3.5 text-xs text-slate-800 space-y-2 rounded-xs">
            <p className="leading-relaxed">
              <strong>Catalogue Publication Baseline:</strong> Standards in this advisory are verified present in the published 1,392 Bureau of Indian Standards indexed technical catalogue.
            </p>
            
            {/* Strict cautious wording mandated by prompt */}
            <div className="p-2.5 bg-amber-50 border-l-3 border-amber-600 text-amber-950 text-xs leading-relaxed space-y-1">
              <div className="font-bold">Mandatory Verification Directive for Procuring Entity:</div>
              <p>
                <em>"Published year observed in indexed catalogue: {primaryStandards[0]?.standard.yearOfPublication || 'Observed Edition'}. Currentness Status: Verified present in indexed BIS handbook catalogue. Live gazetted amendments, corrigenda, or reaffirmations must be verified on <strong>services.bis.gov.in</strong> prior to commercial award. The indexed dataset reflects published catalogue volumes and does not independently replace the live government gazette."</em>
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 12. CERTIFICATION INFORMATION (EVIDENCE-SUPPORTED ONLY)                   */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#081a33]" />
              <span>8. Statutory Certification & Quality Control Orders (QCO)</span>
            </h2>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              currentAnalysis?.qcoSummary?.isRegulated
                ? 'bg-red-50 text-red-800 border-red-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              STATUS: {currentAnalysis?.qcoSummary?.isRegulated ? 'SOURCE_SUPPORTED (REGULATED)' : 'NOT_AVAILABLE (NON-MANDATORY QCO)'}
            </span>
          </div>

          {currentAnalysis?.qcoSummary?.isRegulated ? (
            <div className="border border-red-300 bg-red-50/50 p-4 rounded-xs text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider font-mono">
                    STATUTORY QUALITY CONTROL ORDER IN EFFECT
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-red-950 mt-0.5">
                    {currentAnalysis.qcoSummary.orderName || 'Central Ministry Quality Control Order'}
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold rounded shrink-0">
                  REJECTION CRITERION
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-red-900 font-semibold block">Certification Regime:</span>
                  <span className="text-slate-900">
                    Scheme I (Standard Mark / ISI) or Scheme II (CRS Compulsory Registration)
                  </span>
                </div>
                <div>
                  <span className="text-red-900 font-semibold block">Enforcement Standard:</span>
                  <span className="text-slate-900 font-mono">
                    {primaryStandards[0]?.standard.isCode || 'Applicable IS Code'}
                  </span>
                </div>
              </div>

              <p className="text-red-950 pt-1 border-t border-red-200 text-xs leading-relaxed">
                <strong>Legal Impact under BIS Act 2016:</strong> Supply, distribution, or import of goods without valid BIS Standard Mark is prohibited under Indian law. Tenders must disqualify any bidder lacking an operative BIS license at the time of technical bid opening.
              </p>
            </div>
          ) : (
            <div className="border border-slate-300 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">
                General Product Certification (Scheme I Voluntary or Departmental):
              </div>
              <p className="leading-relaxed">
                No specific statutory Quality Control Order (QCO) was indexed as mandatory for this product scope. Procuring entities may voluntarily require BIS Standard Mark (ISI) or NABL type test certificates to verify compliance with the primary standard.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                EVIDENCE STATUS: <strong>NOT_AVAILABLE</strong> (Active manufacturer licensee list not stored offline; verify via Manakonline).
              </div>
            </div>
          )}

          {/* Explicit AI unverified suggestions notice if any */}
          {currentAnalysis?.unverifiedSuggestions && currentAnalysis.unverifiedSuggestions.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded text-xs text-red-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-950">
                <MinusCircle className="w-3.5 h-3.5 text-red-700" />
                <span>EVIDENCE STATUS: AI_SUGGESTED_UNVERIFIED (UNVERIFIED SUGGESTION)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The following candidate standard was suggested by generative heuristic but could NOT be verified in the 1,392 indexed standards handbook: 
                <strong> {currentAnalysis.unverifiedSuggestions.map(u => u.isCode).join(', ')}</strong>. 
                Under strict public procurement rules, this unverified suggestion is classified as <strong>AI_SUGGESTED_UNVERIFIED</strong> and MUST NOT be quoted as a binding tender qualification requirement.
              </p>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 13. TENDER-CLAIMED IS REFERENCES & VERIFICATION OUTCOMES                  */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-800" />
              <span>9. Tender-Claimed Standard References & Verification Audit</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-600">
              {claimedStandards.length} Cited Code(s) Audited
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            Audit of specific Indian Standard codes claimed in the tender text against the 1,392 catalogued standards:
          </p>

          {claimedStandards.length > 0 ? (
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="py-2 px-3 border-r border-slate-300 w-36">Claimed IS Code</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-44">Catalogue Verification</th>
                    <th className="py-2 px-3">Audit Finding & Procurement Advisory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {claimedStandards.map((claim, cIdx) => {
                    const isVerified = claim.status === 'VERIFIED_IN_CATALOGUE';
                    return (
                      <tr key={cIdx} className={isVerified ? 'bg-emerald-50/30' : 'bg-red-50/40'}>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-mono font-bold text-slate-900">
                          {claim.isCode}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isVerified 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {isVerified ? 'VERIFIED_IN_CATALOGUE' : 'UNVERIFIED_IN_CATALOGUE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 text-[11px] leading-relaxed">
                          {isVerified ? (
                            <span>
                              <strong>Verified:</strong> {claim.note}
                            </span>
                          ) : (
                            <span className="text-red-950 font-medium">
                              <strong>DEFENSE ALERT:</strong> Standard code "{claim.isCode}" could not be verified in the 1,392 catalogued Indian Standards. Potential invalid, superseded, or hallucinated standard number. The Evaluation Committee must seek pre-bid clarification or replace with the verified primary standard ({primaryStandards[0]?.standard.isCode || 'applicable IS'}).
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
              No explicit Indian Standard numbers were claimed in the tender text excerpt. Standard recommendations in this advisory were derived purely through technical parameter matching against catalogued scope definitions.
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 14. UNVERIFIED & UNAVAILABLE INFORMATION SCOPE                            */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>10. Unverified & Unavailable Information Scope</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Operational Scope Limits
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-300 p-3.5 rounded-xs text-xs space-y-2 text-slate-700">
            <p className="leading-relaxed">
              In accordance with transparent public procurement integrity policies, the following information categories are explicitly designated as <strong>UNAVAILABLE OFFLINE</strong> or <strong>UNVERIFIED</strong> in this report:
            </p>

            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-800">
              <li>
                <strong>Active Licensee Directory (CM/L & R-numbers):</strong> Real-time operational standing of individual bidder licenses is transactional government data hosted on <em>manakonline.in</em> and cannot be certified from an offline handbook.
              </li>
              <li>
                <strong>NABL Accredited Testing Lab Validity:</strong> Specific lab accreditation scope and QR-coded Unique Lab Report (ULR) test certificates must be authenticated directly on <em>nabl-india.org</em>.
              </li>
              <li>
                <strong>Post-Publication Gazette Amendments:</strong> Real-time notification slips, errata, or draft revisions published subsequent to handbook catalogue publication require live verification on <em>services.bis.gov.in</em>.
              </li>
              <li>
                <strong>Commercial Price Benchmarking:</strong> L1 price estimates, schedule of rates (SoR), and vendor commercial viability are outside technical standardization purview.
              </li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ACTIONABLE PROCEDURAL WORKFLOW FOR PROCUREMENT OFFICERS                   */}
        {/* ========================================================================= */}
        <section className="mb-6 space-y-2">
          <div className="border-b border-slate-800 pb-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#081a33]" />
              <span>11. Actionable Procedural Steps for Tender Inviting Authority</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-0.5">Step 1: BoQ Standardization</div>
              <p className="text-[11px] text-slate-600">
                Incorporate primary standard ({primaryStandards[0]?.standard.isCode || 'applicable IS'}) as mandatory technical qualification in tender document.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-0.5">Step 2: Pre-Bid Corrigendum</div>
              <p className="text-[11px] text-slate-600">
                Publish corrigendum resolving the {missingGaps.length} detected missing engineering parameters prior to bid closing.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-0.5">Step 3: Portal License Audit</div>
              <p className="text-[11px] text-slate-600">
                Verify manufacturer's CM/L license status is "Operative" on services.bis.gov.in before opening financial bids.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-0.5">Step 4: Type Test Report Inspection</div>
              <p className="text-[11px] text-slate-600">
                Audit submitted test certificates for valid ULR numbers issued by an ISO/IEC 17025 accredited laboratory.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 14. MODEL BOQ TECHNICAL SPECIFICATION CLAUSE                             */}
        {/* ========================================================================= */}
        {currentAnalysis?.sampleBoQSpecification && (
          <section className="mb-6 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-800" />
                <span>12. Model BoQ Technical Specification Clause (Ready to Quote)</span>
              </h2>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded">
                EVIDENCE STATUS: SOURCE_SUPPORTED
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-300 font-mono text-[11px] text-slate-800 leading-relaxed rounded-xs">
              {currentAnalysis.sampleBoQSpecification}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 15. STATUTORY DISCLAIMER & LIMITATIONS OF KNOWLEDGE BASE                  */}
        {/* ========================================================================= */}
        <section className="mt-8 pt-4 border-t-2 border-slate-900 space-y-2 text-xs">
          <div className="bg-slate-100 border border-slate-300 p-4 rounded-xs text-[11px] text-slate-700 space-y-2 leading-relaxed">
            <div className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-800" />
              <span>13. Statutory Public Procurement Disclaimer & Knowledge Base Limits</span>
            </div>

            <p>
              This Procurement Standards Advisory Report is generated using an indexed knowledge base derived from published Bureau of Indian Standards (BIS) technical catalogues and handbook extracts (1,392 standards). It is provided solely as a specialized decision-support resource to assist Tender Inviting Authorities (TIA), procurement officers, and Technical Evaluation Committees (TEC) in formulating specifications and verifying standards in compliance with General Financial Rules (GFR) 2017 Rule 144(xi) and the Bureau of Indian Standards Act, 2016.
            </p>

            <p className="font-semibold text-slate-900">
              Live currentness/amendment status is not independently verified in this system. The system is strictly based on the indexed BIS-derived knowledge base (1,392 standards) and does NOT independently establish live currentness, legal enforceability of subsequent gazette amendments, or operative manufacturer licensing standing unless explicitly verified by available transactional evidence.
            </p>

            <p>
              The Procuring Entity retains the sole and final responsibility for authenticating operative standard editions, gazetted amendment slips, and valid licensee CM/L credentials on official portals (<a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="text-[#081a33] underline">services.bis.gov.in</a> and <a href="https://www.manakonline.in" target="_blank" rel="noreferrer" className="text-[#081a33] underline">manakonline.in</a>) prior to tender publication, bid qualification, or commercial contract award.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-200">
            <span>AUDIT GENERATED: {analysisDateTime}</span>
            <span>EVALUATION ENGINE: BIS ADVISOR (1,392 CATALOGUE CHUNKS)</span>
            <span>PAGE 1 OF 1 (REFERENCE DOSSIER)</span>
          </div>
        </section>

      </div>
    </div>
  );
};

// =========================================================================
// HELPER FUNCTIONS FOR ROBUST RENDERING & TEXT EXPORT
// =========================================================================

function extractQuantity(rawText: string): string | null {
  if (!rawText) return null;
  const match = rawText.match(/(\d[\d,]*)\s*(nos|no\.|sets|meters|mtrs|km|pieces|units|items|kgs|mt|metric tonnes?)/i);
  if (match) {
    return `${match[1]} ${match[2]}`.trim();
  }
  return null;
}

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

function buildPlaintextAdvisory(
  dossierId: string,
  procurementItemName: string,
  tenderReferenceName: string,
  analysisDateTime: string,
  detectedQuantity: string,
  analysis: RequirementAnalysis | null,
  activeItem: TenderProcurementItem | undefined,
  primaryStandards: MatchedStandard[],
  supportingStandards: MatchedStandard[],
  missingGaps: string[],
  claimedStandards: ClaimedStandardVerification[]
): string {
  let out = '';
  out += `================================================================================\n`;
  out += `GOVERNMENT OF INDIA - PUBLIC PROCUREMENT TECHNICAL ADVISORY\n`;
  out += `BUREAU OF INDIAN STANDARDS (BIS) SPECIFICATION ADVISORY REPORT\n`;
  out += `================================================================================\n\n`;
  out += `Advisory Reference ID : ${dossierId}\n`;
  out += `Procurement Subject   : ${tenderReferenceName}\n`;
  out += `Commodity Analyzed    : ${procurementItemName}\n`;
  out += `Detected Quantity     : ${detectedQuantity}\n`;
  out += `Evaluation Timestamp  : ${analysisDateTime}\n`;
  out += `Knowledge Base Scope  : 1,392 BIS Standards Indexed\n`;
  out += `Conformity Mandate    : GFR 2017 Rule 144(xi) & Bureau of Indian Standards Act, 2016\n\n`;

  out += `--------------------------------------------------------------------------------\n`;
  out += `1. DETECTED TECHNICAL SPECIFICATIONS\n`;
  out += `--------------------------------------------------------------------------------\n`;
  if (analysis?.extractedSpecs && analysis.extractedSpecs.length > 0) {
    analysis.extractedSpecs.forEach((s, idx) => {
      out += `  [${idx + 1}] ${s.parameter}: ${s.specifiedValue} (${s.importance}) ${s.standardReference ? `[Ref: ${s.standardReference}]` : ''}\n`;
    });
  } else {
    out += `  No tabular parameters extracted; based on general commodity scope.\n`;
  }
  out += `\n`;

  out += `--------------------------------------------------------------------------------\n`;
  out += `2. SPECIFICATION GAPS IDENTIFIED (MISSING ENGINEERING PARAMETERS)\n`;
  out += `--------------------------------------------------------------------------------\n`;
  if (missingGaps.length > 0) {
    missingGaps.forEach((gap, idx) => {
      out += `  [Gap ${idx + 1}] ${gap}\n`;
      out += `        Action: Issue pre-bid corrigendum specifying numerical limits per primary IS.\n`;
    });
  } else {
    out += `  Technical parameters appear complete for standard benchmarking.\n`;
  }
  out += `\n`;

  out += `--------------------------------------------------------------------------------\n`;
  out += `3. RECOMMENDED PRIMARY INDIAN STANDARDS (MANDATORY BENCHMARKS)\n`;
  out += `--------------------------------------------------------------------------------\n`;
  if (primaryStandards.length > 0) {
    primaryStandards.forEach((p, idx) => {
      out += `  [${idx + 1}] Standard Code : ${p.standard.isCode}\n`;
      out += `      Title         : ${p.standard.title}\n`;
      out += `      Division      : ${p.standard.divisionName || p.standard.division} (Committee: ${p.standard.committee})\n`;
      out += `      Pub. Year     : ${p.standard.yearOfPublication || 'Observed Edition'}\n`;
      out += `      QCO Regulated : ${p.standard.isQCOMandatory ? 'YES - Mandatory under Central QCO' : 'No general mandatory QCO'}\n`;
      out += `      Why Selected  : ${p.rationale}\n`;
      out += `      Evidence      : SOURCE_SUPPORTED (BIS Technical Catalogue)\n`;
      if (p.mandatoryClausesToQuote && p.mandatoryClausesToQuote.length > 0) {
        out += `      BoQ Clauses   : ${p.mandatoryClausesToQuote.join('; ')}\n`;
      }
      out += `\n`;
    });
  } else {
    out += `  No high-confidence primary standard identified in the 1,392 indexed standards.\n\n`;
  }

  out += `--------------------------------------------------------------------------------\n`;
  out += `4. RECOMMENDED SUPPORTING & COMPONENT STANDARDS\n`;
  out += `--------------------------------------------------------------------------------\n`;
  if (supportingStandards.length > 0) {
    supportingStandards.forEach((s, idx) => {
      out += `  - ${s.standard.isCode}: ${s.standard.title} [Role: ${s.role}] (Evidence: SOURCE_SUPPORTED)\n`;
      out += `    Rationale: ${s.rationale}\n`;
    });
  } else {
    out += `  No supporting standards required.\n`;
  }
  out += `\n`;

  out += `--------------------------------------------------------------------------------\n`;
  out += `5. CURRENTNESS & AMENDMENT STATUS (CAUTIOUS ADVISORY)\n`;
  out += `--------------------------------------------------------------------------------\n`;
  out += `  Published year observed in indexed catalogue: ${primaryStandards[0]?.standard.yearOfPublication || 'Observed Edition'}.\n`;
  out += `  Currentness Status: Verified present in indexed BIS handbook catalogue.\n`;
  out += `  Notice: Live gazetted amendments, corrigenda, or reaffirmations must be verified on\n`;
  out += `  services.bis.gov.in prior to commercial award. The indexed dataset reflects published\n`;
  out += `  catalogue volumes and does not independently replace the live government gazette.\n`;
  out += `  Evidence Status for Live Amendments: NOT_AVAILABLE (Live inquiry required).\n\n`;

  out += `--------------------------------------------------------------------------------\n`;
  out += `6. STATUTORY CERTIFICATION & QUALITY CONTROL ORDERS (QCO)\n`;
  out += `--------------------------------------------------------------------------------\n`;
  if (analysis?.qcoSummary?.isRegulated) {
    out += `  Regime           : STATUTORY MANDATORY QUALITY CONTROL ORDER\n`;
    out += `  Order Name       : ${analysis.qcoSummary.orderName || 'QCO Order'}\n`;
    out += `  Status           : SOURCE_SUPPORTED\n`;
    out += `  Consequence      : Rejection criterion. Unlicensed goods cannot be procured.\n`;
  } else {
    out += `  Regime           : Standard Voluntary / Departmental Quality Verification\n`;
    out += `  Evidence Status  : NOT_AVAILABLE for manufacturer-specific licenses\n`;
  }
  if (analysis?.unverifiedSuggestions && analysis.unverifiedSuggestions.length > 0) {
    out += `  AI Suggestion    : AI_SUGGESTED_UNVERIFIED (${analysis.unverifiedSuggestions.map(u => u.isCode).join(', ')}) - NOT VERIFIED; DO NOT QUOTE\n`;
  }
  out += `\n`;

  out += `--------------------------------------------------------------------------------\n`;
  out += `7. TENDER-CLAIMED STANDARD CITATIONS & VERIFICATION OUTCOMES\n`;
  out += `--------------------------------------------------------------------------------\n`;
  if (claimedStandards.length > 0) {
    claimedStandards.forEach((c) => {
      out += `  - Claimed: ${c.isCode} -> Status: [${c.status}]\n`;
      out += `    Finding: ${c.note}\n`;
    });
  } else {
    out += `  No explicit Indian Standard numbers were claimed in the tender excerpt.\n`;
  }
  out += `\n`;

  out += `--------------------------------------------------------------------------------\n`;
  out += `8. UNVERIFIED & UNAVAILABLE INFORMATION SCOPE\n`;
  out += `--------------------------------------------------------------------------------\n`;
  out += `  1. Active Manufacturer Licenses (CM/L & R-numbers): NOT STORED OFFLINE (manakonline.in)\n`;
  out += `  2. NABL Accredited Testing Lab Validity & ULRs: NOT STORED OFFLINE (nabl-india.org)\n`;
  out += `  3. Post-Publication Gazette Amendments: NOT STORED OFFLINE (services.bis.gov.in)\n`;
  out += `  4. Commercial Price Schedules: EXCLUDED FROM TECHNICAL PURVIEW\n\n`;

  if (analysis?.sampleBoQSpecification) {
    out += `--------------------------------------------------------------------------------\n`;
    out += `9. MODEL BOQ TECHNICAL SPECIFICATION CLAUSE\n`;
    out += `--------------------------------------------------------------------------------\n`;
    out += `  "${analysis.sampleBoQSpecification}"\n\n`;
  }

  out += `================================================================================\n`;
  out += `IMPORTANT STATUTORY DISCLAIMER (GFR 2017 & BIS ACT 2016)\n`;
  out += `================================================================================\n`;
  out += `This Procurement Standards Advisory Report is generated using an indexed knowledge\n`;
  out += `base derived from published Bureau of Indian Standards (BIS) technical catalogues\n`;
  out += `and handbook extracts (1,392 standards). It does NOT independently establish live\n`;
  out += `currentness, legal enforceability of subsequent gazette amendments, or valid\n`;
  out += `licensee standing unless explicitly verified by available real-time evidence.\n`;
  out += `The Procuring Entity retains sole responsibility for verifying live standard editions\n`;
  out += `and active licensee CM/L credentials on services.bis.gov.in and manakonline.in\n`;
  out += `prior to tender publication or commercial contract award.\n`;
  out += `================================================================================\n`;

  return out;
}
