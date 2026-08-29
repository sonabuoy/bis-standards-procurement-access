import React from 'react';
import { ExternalLink, ShieldCheck, Building, HelpCircle } from 'lucide-react';

interface FooterProps {
  onOpenHelp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHelp }) => {
  return (
    <footer className="bg-[#031632] text-white">
      {/* Upper informational strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-gray-300">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center font-bold text-amber-400">
                IS
              </div>
              <span className="font-bold text-sm text-white font-['Noto_Sans',sans-serif]">
                Bureau of Indian Standards
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Established by the Bureau of Indian Standards Act, 2016. The National Standards Body of India responsible for the harmonious development of standardization, marking, and quality certification.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px]">
              Key Portals & Services
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a 
                  href="https://www.services.bis.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  BIS Manakonline Portal <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://gem.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  Government e-Marketplace (GeM) <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://nabl-india.org" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  NABL Testing Lab Directory <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px]">
              Procurement Guidance
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button onClick={onOpenHelp} className="hover:text-amber-300 transition-colors text-left">
                  General Financial Rules (GFR) Rule 144(xi)
                </button>
              </li>
              <li>
                <button onClick={onOpenHelp} className="hover:text-amber-300 transition-colors text-left">
                  Quality Control Orders (QCO) Gazette Mandates
                </button>
              </li>
              <li>
                <button onClick={onOpenHelp} className="hover:text-amber-300 transition-colors text-left">
                  Public Procurement (Preference to Make in India)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px]">
              Headquarters
            </h4>
            <address className="not-italic text-gray-400 leading-relaxed">
              Manak Bhawan, 9 Bahadur Shah Zafar Marg,<br />
              New Delhi – 110002, INDIA<br />
              Tel: +91 11 23230131 / 23233375<br />
              Email: info@bis.gov.in
            </address>
          </div>
        </div>
      </div>

      {/* Main bottom copyright bar matching exact screenshot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-300">
        <p className="font-medium text-gray-300">
          © 2024 Bureau of Indian Standards. All rights reserved.
        </p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-300">
          <a href="#accessibility" onClick={(e) => { e.preventDefault(); onOpenHelp(); }} className="hover:text-white transition-colors">
            Accessibility
          </a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); onOpenHelp(); }} className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); onOpenHelp(); }} className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); onOpenHelp(); }} className="hover:text-white transition-colors">
            Contact
          </a>
          <a href="#bis-info" onClick={(e) => { e.preventDefault(); onOpenHelp(); }} className="hover:text-white transition-colors font-semibold text-amber-300">
            BIS Information
          </a>
        </div>
      </div>
    </footer>
  );
};
