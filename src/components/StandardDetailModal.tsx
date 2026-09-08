import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  BookOpen, 
  FileCheck, 
  ExternalLink, 
  Sparkles,
  Info,
  Building2,
  MinusCircle,
  Scale
} from 'lucide-react';
import { IndianStandard } from '../types';

interface StandardDetailModalProps {
  standard: IndianStandard | null;
  onClose: () => void;
  onAnalyze: (standard: IndianStandard) => void;
}

export const StandardDetailModal: React.FC<StandardDetailModalProps> = ({
  standard,
  onClose,
  onAnalyze
}) => {
  const [copied, setCopied] = useState(false);

  if (!standard) return null;

  const handleCopyClause = () => {
    navigator.clipboard.writeText(standard.gemClauseBoilerplate || `The supplied commodity shall strictly conform to ${standard.isCode}.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Tricolour Rule */}
        <div className="h-[3px] w-full grid grid-cols-3" aria-hidden="true">
          <div className="bg-[#e06a14]" />
          <div className="bg-[#ffffff]" />
          <div className="bg-[#138808]" />
        </div>

        {/* Institutional Header */}
        <div className="bg-[#081a33] text-white p-5 sm:p-6 border-b border-[#173864]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold font-mono bg-[#14335c] text-blue-200 px-2.5 py-0.5 rounded border border-[#234d85]">
                  {standard.division} • {standard.divisionName}
                </span>

                {standard.committee && (
                  <span className="text-xs text-slate-300 font-mono">
                    Committee: {standard.committee}
                  </span>
                )}

                {standard.isQCOMandatory && (
                  <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Mandatory QCO
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-tight">
                {standard.isCode}
              </h2>
              <h3 className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-snug font-['Noto_Sans',sans-serif]">
                {standard.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          
          {/* SECTION 1: CATALOGUE PRESENCE & EVIDENCE BADGES */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                CATALOGUE PRESENCE CONFIRMED
              </span>

              <span className="inline-flex items-center gap-1 font-semibold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                SOURCE-DOCUMENT SOURCED
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Publication Year Observed: <strong>{standard.yearOfPublication || 'Indexed in Handbook'}</strong>
            </div>
          </div>

          {/* SECTION 2: VERIFIED TECHNICAL SCOPE */}
          <div>
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#081a33]" />
              <span>Verified Technical Scope (BIS Source Documentation)</span>
            </div>
            <div className="p-3.5 bg-white rounded border border-slate-200 leading-relaxed text-slate-800">
              {standard.scope || `${standard.title} is formally registered in the Bureau of Indian Standards engineering catalogue.`}
            </div>
          </div>

          {/* SECTION 3: KEY MANDATORY CLAUSES & TESTING PROTOCOLS */}
          {standard.keyClauses && standard.keyClauses.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                Mandatory Inspection & Quality Clauses
              </div>
              <div className="space-y-2">
                {standard.keyClauses.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-blue-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                        Clause {c.clauseNumber}
                      </span>
                      {c.isCritical && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          CRITICAL PARAMETER
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 mb-0.5">{c.title}</div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{c.requirement}</p>
                    {c.testMethod && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Test Method: </span>{c.testMethod}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: QUALITY CONTROL ORDER (QCO) REGULATORY STATUS */}
          <div>
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#081a33]" />
              <span>Regulatory & Quality Control Order (QCO) Status</span>
            </div>
            {standard.isQCOMandatory ? (
              <div className="bg-amber-50/90 border border-amber-300 rounded p-3.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Mandatory Quality Control Order Enforced</span>
                </div>
                <p className="text-amber-900 text-xs leading-relaxed">
                  Conformity is legally mandated under <strong>{standard.qcoNotification}</strong> issued by <strong>{standard.ministry || 'Government of India'}</strong>. Public procurement tenders on GeM must mandate valid BIS Standard Mark licenses.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 flex items-center justify-between">
                <span>Not identified as covered by a compulsory Quality Control Order in the indexed handbook. Voluntary compliance applies unless specified in ministry procurement guidelines.</span>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded shrink-0 ml-2">
                  VOLUNTARY / SECTORAL
                </span>
              </div>
            )}
          </div>

          {/* SECTION 5: UNSUPPORTED & UNAVAILABLE INFORMATION DISCLOSURE */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Information Boundaries & Unsupported Live Fields</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
              To prevent procurement disputes, this system explicitly distinguishes between indexed handbook facts and live transactional registry data:
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                <span className="font-medium text-slate-700">Live Gazette Amendment Dates & Draft Revisions:</span>
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">NOT AVAILABLE IN STATIC INDEX</span>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                <span className="font-medium text-slate-700">Active Manufacturer BIS Licenses & Operative CMLs:</span>
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">VERIFY ON MANAKONLINE.IN</span>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                <span className="font-medium text-slate-700">Live NABL Accredited Testing Laboratories:</span>
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">VERIFY ON NABL-INDIA.ORG</span>
              </div>
            </div>
          </div>

          {/* SECTION 6: CURRENTNESS & AUDIT DISCLAIMER */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong>Currentness Notice: </strong>
              Live currentness/amendment status is not independently verified in this system. Standard presence is verified against the indexed Bureau of Indian Standards catalogue (1,392 standards). Officers must independently verify the operative amendment status on <a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="text-blue-700 underline font-mono">services.bis.gov.in</a> prior to tender finalization.
            </div>
          </div>

          {/* SECTION 7: READY BOQ SPECIFICATION PARAGRAPH */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Model BoQ Tender Specification Clause
              </span>
              <button
                onClick={handleCopyClause}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#081a33] hover:text-[#e06a14] cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Clause'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded leading-relaxed">
              {standard.gemClauseBoilerplate || `The offered equipment/goods shall strictly comply with all relevant safety, performance, and construction requirements stipulated under ${standard.isCode} as amended to date.`}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onAnalyze(standard);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#081a33] hover:bg-[#0e274a] text-white text-xs font-bold rounded shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f39c12]" />
            <span>Generate Procurement Advisory for this Standard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
