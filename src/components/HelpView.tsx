import React from 'react';
import { ShieldCheck, BookOpen, FileCheck, HelpCircle, ExternalLink, Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#031632] text-white text-xs font-bold rounded">
              Procurement Officer Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1b1b] font-['Noto_Sans',sans-serif]">
            BIS Standards & Government Procurement Guide
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Official advisory on Quality Control Orders (QCOs), GeM compliance, and certification verification under the Bureau of Indian Standards Act, 2016.
          </p>
        </div>

        {/* Section 1: Understanding BIS Certification Schemes */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#031632] font-['Noto_Sans',sans-serif] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900" />
            1. Overview of BIS Certification Schemes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ISI Mark Scheme I */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold bg-[#031632] text-white px-2 py-0.5 rounded">
                  Scheme-I
                </span>
                <h3 className="font-bold text-sm text-gray-900">
                  ISI Mark (Product Certification)
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Third-party certification where BIS conducts regular factory audits, oversees factory testing facilities, and draws independent market samples. Applicable to structural steel (IS 1786), cement (IS 269), luminaires (IS 10322), packaged water (IS 14543), and fire safety equipment.
              </p>
              <div className="text-[11px] text-gray-500 font-mono">
                Identifier format: <strong>CM/L - XXXXXXX</strong> (7 digits)
              </div>
            </div>

            {/* CRS Scheme II */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold bg-amber-700 text-white px-2 py-0.5 rounded">
                  Scheme-II
                </span>
                <h3 className="font-bold text-sm text-gray-900">
                  Compulsory Registration Scheme (CRS)
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Self-declaration of conformity based on type test reports from BIS recognized / NABL laboratories. Mandatory for IT electronics (IS 13252), solar PV modules (IS 14286), solar inverters (IS 16221), and secondary lithium battery cells (IS 16046).
              </p>
              <div className="text-[11px] text-gray-500 font-mono">
                Identifier format: <strong>R-XXXXXXXX</strong> (8 digits)
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Quality Control Orders (QCO) Legal Framework */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#031632] font-['Noto_Sans',sans-serif] flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-700" />
            2. Quality Control Orders (QCO) & Legal Mandates
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Various Central Government Ministries (DPIIT, Ministry of Steel, MeitY, Ministry of Power, Ministry of Heavy Industries, Ministry of Chemicals) issue statutory Quality Control Orders under Section 16 of the BIS Act, 2016.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Statutory Rule for Tender Committees:</span>
            </div>
            <p className="leading-relaxed">
              If an item is covered under a notified QCO, procuring officers and government departments <strong>CANNOT</strong> relax or waive the BIS standard certification requirement. Bidders offering non-BIS certified goods are legally ineligible and bids must be rejected during preliminary technical evaluation.
            </p>
          </div>
        </div>

        {/* Section 3: Verification Procedures for Procurement Officers */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#031632] font-['Noto_Sans',sans-serif] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-800" />
            3. Verification Checklist for Bid Evaluation
          </h2>

          <div className="space-y-3">
            {[
              {
                step: 'Step 1: Check License Validity Online',
                detail: 'Verify the CM/L number or R-Number on the BIS official portal (www.services.bis.gov.in) to confirm the license is Active (not suspended or expired).'
              },
              {
                step: 'Step 2: Match Brand and Manufacturing Factory',
                detail: 'Confirm that the exact manufacturing location quoted in the bid matches the factory address registered in the BIS license endorsement.'
              },
              {
                step: 'Step 3: Verify NABL Test Report QR Codes',
                detail: 'All type-test certificates must feature a verifiable Unique Lab Report (ULR) number issued by an accredited NABL testing facility.'
              },
              {
                step: 'Step 4: Pre-Dispatch Inspection (PDI) Marking',
                detail: 'Ensure physical product stamping contains the authentic Standard Mark, IS Code, License No., and manufacturer batch identification.'
              }
            ].map((s, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{s.step}</h4>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
