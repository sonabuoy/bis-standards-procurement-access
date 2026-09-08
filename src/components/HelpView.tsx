import React from 'react';
import { ShieldCheck, BookOpen, FileCheck, HelpCircle, ExternalLink, Scale, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Banner */}
        <div className="bg-[#081a33] text-white rounded-lg p-6 sm:p-8 border border-[#173864] shadow-sm relative overflow-hidden">
          {/* Restrained Tricolour Rule */}
          <div className="absolute top-0 left-0 right-0 h-[3px] grid grid-cols-3" aria-hidden="true">
            <div className="bg-[#e06a14]" />
            <div className="bg-[#ffffff]" />
            <div className="bg-[#138808]" />
          </div>

          <div className="mt-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#14335c] text-[#f39c12] border border-[#234d85] px-2.5 py-0.5 rounded font-mono">
                Procurement Officer Reference
              </span>
              <span className="text-xs text-slate-300">
                GFR 2017 & BIS Act 2016 Guidelines
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Noto_Sans',sans-serif]">
              Indian Standards & Public Procurement Regulatory Guidance
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
              Official reference on Quality Control Orders (QCOs), BIS Certification Schemes, GeM compliance, and tender clause drafting under General Financial Rules (GFR) Rule 144(xi).
            </p>
          </div>
        </div>

        {/* Section 1: Overview of BIS Certification Schemes */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-300 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm sm:text-base font-bold text-[#081a33] font-['Noto_Sans',sans-serif]">
              1. BIS Certification Schemes Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ISI Mark Scheme I */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold bg-[#081a33] text-white px-2 py-0.5 rounded">
                  Scheme-I
                </span>
                <h3 className="font-bold text-xs text-slate-900">
                  ISI Mark (Product Certification)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                Third-party certification where BIS conducts regular factory audits, oversees in-house testing facilities, and draws independent market surveillance samples. Mandatory for steel rebar (IS 1786), cement (IS 269), luminaires (IS 10322), cables (IS 694), and packaged drinking water (IS 14543).
              </p>
              <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded border border-slate-200">
                License format: <strong>CM/L - XXXXXXX</strong> (7 digits)
              </div>
            </div>

            {/* CRS Scheme II */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold bg-amber-700 text-white px-2 py-0.5 rounded">
                  Scheme-II
                </span>
                <h3 className="font-bold text-xs text-slate-900">
                  Compulsory Registration Scheme (CRS)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                Self-declaration of conformity based on type test reports from BIS-recognized / NABL laboratories. Mandatory for IT electronics (IS 13252), solar PV modules (IS 14286), grid-tied inverters (IS 16221), and secondary lithium cells (IS 16046).
              </p>
              <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded border border-slate-200">
                Registration format: <strong>R-XXXXXXXX</strong> (8 digits)
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Quality Control Orders (QCO) Legal Framework */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-300 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Scale className="w-5 h-5 text-amber-700" />
            <h2 className="text-sm sm:text-base font-bold text-[#081a33] font-['Noto_Sans',sans-serif]">
              2. Quality Control Orders (QCO) Statutory Mandate
            </h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Central Government line ministries (DPIIT, Ministry of Steel, MeitY, Ministry of Power, Ministry of Heavy Industries, Ministry of Chemicals) issue statutory Quality Control Orders under Section 16 of the BIS Act, 2016.
          </p>

          <div className="bg-amber-50/90 border border-amber-300 rounded p-3.5 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Binding Rule for Tender Evaluation Committees:</span>
            </div>
            <p className="leading-relaxed">
              If a product category is notified under an in-force Quality Control Order (QCO), tender drafting officers and evaluation committees <strong>CANNOT</strong> waive, relax, or accept equivalent uncertified alternatives. Bidders offering non-certified goods are legally non-compliant and must be rejected at technical evaluation.
            </p>
          </div>
        </div>

        {/* Section 3: Verification Checklist for Procurement Officers */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-300 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <FileCheck className="w-5 h-5 text-[#081a33]" />
            <h2 className="text-sm sm:text-base font-bold text-[#081a33] font-['Noto_Sans',sans-serif]">
              3. Verification Checklist for Bid Technical Evaluation
            </h2>
          </div>

          <div className="space-y-2.5">
            {[
              {
                step: '1. Verify Active License on BIS Manakonline',
                detail: 'Confirm the vendor\'s CM/L number or R-Number on services.bis.gov.in. Verify that the license status is "Operative" and covers the exact product grade, voltage, or rating quoted.'
              },
              {
                step: '2. Reconcile Manufacturing Factory Endorsement',
                detail: 'Confirm that the manufacturing plant location declared in the bid matches the factory address registered in the BIS license certificate endorsement.'
              },
              {
                step: '3. Inspect NABL Test Reports & QR Codes',
                detail: 'All submitted laboratory test certificates must feature a verifiable Unique Lab Report (ULR) number issued by a testing laboratory accredited under ISO/IEC 17025 by NABL.'
              },
              {
                step: '4. Pre-Dispatch Physical Marking Inspection',
                detail: 'Ensure delivered consignments carry the authentic Standard Mark, IS Code, License No., and manufacturer batch identification stamped or laser-marked on the product casing.'
              }
            ].map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{s.step}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
