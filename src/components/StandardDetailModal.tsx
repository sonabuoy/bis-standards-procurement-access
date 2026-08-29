import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, Copy, Check, BookOpen, FileCheck, ExternalLink, Sparkles } from 'lucide-react';
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
    navigator.clipboard.writeText(standard.gemClauseBoilerplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#031632] text-white p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-xs font-bold rounded border border-blue-400/30">
                  {standard.division} • {standard.divisionName}
                </span>
                <span className="text-xs text-gray-300">
                  Committee: {standard.committee}
                </span>
                {standard.isQCOMandatory && (
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Mandatory QCO
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
                {standard.isCode}
              </h2>
              <h3 className="text-sm sm:text-base text-gray-200 mt-1 font-medium">
                {standard.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Scope & Overview */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Official Technical Scope
            </h4>
            <p className="text-sm text-gray-800 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
              {standard.scope}
            </p>
          </div>

          {/* QCO Order Details if mandatory */}
          {standard.isQCOMandatory && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Mandatory Quality Control Order (QCO) Notification</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Governed under <strong>{standard.qcoNotification}</strong> issued by the <strong>{standard.ministry}</strong>. Under Section 16 of the BIS Act, 2016, no person shall manufacture, import, distribute, sell or procure non-certified goods.
              </p>
            </div>
          )}

          {/* Key Clauses */}
          {standard.keyClauses && standard.keyClauses.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Key Technical Clauses & Test Requirements
              </h4>
              <div className="space-y-3">
                {standard.keyClauses.map((clause, idx) => (
                  <div key={idx} className="p-4 bg-[#fafafa] rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {clause.clauseNumber}
                      </span>
                      {clause.isCritical && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase">
                          Critical Quality Gate
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-gray-900 mb-1">
                      {clause.title}
                    </h5>
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">
                      {clause.requirement}
                    </p>
                    {clause.testMethod && (
                      <div className="text-[11px] text-gray-500 pt-1.5 border-t border-gray-200">
                        <strong className="text-gray-700">Test Method: </strong>
                        {clause.testMethod}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testing Parameters */}
          {standard.testParameters && standard.testParameters.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Mandatory Laboratory Test Protocols
              </h4>
              <div className="flex flex-wrap gap-2">
                {standard.testParameters.map((param, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-full font-medium">
                    ✓ {param}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ready GeM Tender Boilerplate Clause */}
          {standard.gemClauseBoilerplate && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ready GeM / RFP Tender Specification Clause
                </h4>
                <button
                  onClick={handleCopyClause}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#031632] hover:underline cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Clause</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed select-all">
                {standard.gemClauseBoilerplate}
              </div>
            </div>
          )}

          {/* International Equivalency */}
          {standard.equivalentISO && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="font-semibold text-gray-700">International Harmonization:</span>
              <span className="font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-bold">
                {standard.equivalentISO}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 px-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onAnalyze(standard);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#031632] hover:bg-[#1a2b48] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Full Procurement Advisory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
