import React from 'react';
import { ExternalLink, ShieldCheck, Building2, HelpCircle, Scale } from 'lucide-react';

interface FooterProps {
  onOpenHelp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHelp }) => {
  return (
    <footer className="bg-[#051122] text-white border-t border-[#122b4d]">
      {/* Top Tricolour Subtle Rule */}
      <div className="h-[3px] w-full grid grid-cols-3" aria-hidden="true">
        <div className="bg-[#e06a14]" />
        <div className="bg-[#ffffff]" />
        <div className="bg-[#138808]" />
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-300">
          {/* Col 1: Institutional Authority */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#0b2140] border border-[#1f477d] flex items-center justify-center font-bold text-[#f39c12] text-xs">
                BIS
              </div>
              <div>
                <span className="font-bold text-sm text-white font-['Noto_Sans',sans-serif] block">
                  Bureau of Indian Standards
                </span>
                <span className="text-[10px] text-slate-400">
                  National Standards Body of India
                </span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Established under the Bureau of Indian Standards Act, 2016 (Ministry of Consumer Affairs, Food & Public Distribution, Government of India). Operates the national standards formulation and conformity assessment framework.
            </p>
          </div>

          {/* Col 2: Official Portals */}
          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px] text-[#f39c12]">
              Official Portals & Verification
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs">
              <li>
                <a 
                  href="https://www.services.bis.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>BIS Manakonline (License Directory)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://gem.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Government e-Marketplace (GeM)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://eprocure.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Central Public Procurement Portal (CPPP)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://nabl-india.org" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>NABL Testing Laboratory Directory</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Procurement Guidelines */}
          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px] text-[#f39c12]">
              Public Procurement Mandates
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs">
              <li>
                <button 
                  onClick={onOpenHelp} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  General Financial Rules (GFR 2017) Rule 144(xi)
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenHelp} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Compulsory Quality Control Orders (QCO)
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenHelp} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Public Procurement (Make in India Order, 2017)
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenHelp} 
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  BIS Compulsory Registration Scheme (CRS)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Manak Bhawan Headquarters */}
          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px] text-[#f39c12]">
              Manak Bhawan Headquarters
            </h4>
            <address className="not-italic text-slate-400 leading-relaxed text-[11px]">
              9 Bahadur Shah Zafar Marg,<br />
              New Delhi – 110002, INDIA<br />
              EPABX: +91 11 23230131, 23233375<br />
              Email: info@bis.gov.in
            </address>
          </div>
        </div>

        {/* Factual Disclaimer */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong>Statutory Disclaimer:</strong> This portal assists public procurement officials, tender drafting committees, and vendors in identifying applicable Indian Standards (IS) and drafting BoQ specifications. Published standards data is indexed from Bureau of Indian Standards documentation. Procurement officers must independently confirm operative amendments and live manufacturer license validity on <em>services.bis.gov.in</em> before awarding contracts.
          </p>
        </div>
      </div>

      {/* Bottom Micro-Bar */}
      <div className="bg-[#030b17] border-t border-slate-900 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} Bureau of Indian Standards. Government of India.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button onClick={onOpenHelp} className="hover:text-white transition-colors cursor-pointer">
              Procurement Guidance
            </button>
            <span>•</span>
            <button onClick={onOpenHelp} className="hover:text-white transition-colors cursor-pointer">
              Evidence Gate Standards
            </button>
            <span>•</span>
            <button onClick={onOpenHelp} className="hover:text-white transition-colors cursor-pointer">
              Accessibility
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
