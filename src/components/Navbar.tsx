import React, { useState } from 'react';
import { NavTab } from '../types';
import { 
  FileUp, 
  Search, 
  Bookmark, 
  HelpCircle, 
  Menu, 
  X, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenTenderModal: () => void;
  onFocusRequirement: () => void;
  hasActiveAnalysis?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenTenderModal,
  onFocusRequirement,
  hasActiveAnalysis = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white text-slate-900 border-b border-slate-200 shadow-2xs">
      {/* Top Tricolour Institutional Accent Rule */}
      <div className="h-[3px] w-full grid grid-cols-3" aria-hidden="true">
        <div className="bg-[#e06a14]" />
        <div className="bg-[#ffffff]" />
        <div className="bg-[#138808]" />
      </div>

      {/* Top Micro-Bar (Institutional Masthead) */}
      <div className="bg-[#f8fafc] text-slate-600 text-[11px] px-4 py-1 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider uppercase text-[#081a33]">
              भारत सरकार | Government of India
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-medium">
              Bureau of Indian Standards (BIS) — Manak Bhawan, New Delhi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              1,392 Standards Indexed
            </span>
            <span className="text-slate-300">•</span>
            <span>GFR 2017 Rule 144(xi) Aligned</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">National Procurement Standards Advisory</span>
          </div>
        </div>
      </div>

      {/* Main Government Portal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand & Emblem */}
          <div 
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="bis-brand-logo"
          >
            {/* BIS Geometric Institutional Emblem */}
            <div className="w-10 h-10 rounded bg-[#081a33] flex items-center justify-center relative overflow-hidden border border-[#1b365d] shadow-2xs shrink-0">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <polygon points="50,12 88,80 12,80" fill="none" stroke="#ffffff" strokeWidth="6" />
                <polygon points="50,28 76,74 24,74" fill="#e06a14" opacity="0.95" />
                <circle cx="50" cy="56" r="8" fill="#ffffff" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-[#081a33] tracking-tight font-['Noto_Sans',sans-serif]">
                  BIS Standard Advisor
                </span>
                <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-tight">
                Bureau of Indian Standards • Public Procurement Advisory
              </p>
            </div>
          </div>

          {/* Desktop Horizontal Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => handleTabClick('home')}
              id="nav-tab-home"
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-slate-100 text-[#081a33] font-semibold border-b-2 border-[#081a33]'
                  : 'text-slate-600 hover:text-[#081a33] hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleTabClick('recommendation')}
              id="nav-tab-workspace"
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'recommendation'
                  ? 'bg-slate-100 text-[#081a33] font-semibold border-b-2 border-[#081a33]'
                  : 'text-slate-600 hover:text-[#081a33] hover:bg-slate-50'
              }`}
            >
              <span>AI Recommendation</span>
              {hasActiveAnalysis && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" title="Active analysis available" />
              )}
            </button>

            <button
              onClick={() => handleTabClick('explorer')}
              id="nav-tab-explorer"
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-slate-100 text-[#081a33] font-semibold border-b-2 border-[#081a33]'
                  : 'text-slate-600 hover:text-[#081a33] hover:bg-slate-50'
              }`}
            >
              Standards Explorer
            </button>

            <button
              onClick={() => handleTabClick('analyses')}
              id="nav-tab-analyses"
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer ${
                activeTab === 'analyses'
                  ? 'bg-slate-100 text-[#081a33] font-semibold border-b-2 border-[#081a33]'
                  : 'text-slate-600 hover:text-[#081a33] hover:bg-slate-50'
              }`}
            >
              My Analyses
            </button>

            <button
              onClick={() => handleTabClick('help')}
              id="nav-tab-help"
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer ${
                activeTab === 'help'
                  ? 'bg-slate-100 text-[#081a33] font-semibold border-b-2 border-[#081a33]'
                  : 'text-slate-600 hover:text-[#081a33] hover:bg-slate-50'
              }`}
            >
              Help
            </button>
          </nav>

          {/* Action CTAs: Upload Tender & Analyze Requirement */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenTenderModal}
              id="btn-upload-tender-nav"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5 text-slate-600" />
              <span>Upload Tender</span>
            </button>

            <button
              type="button"
              onClick={onFocusRequirement}
              id="btn-analyze-requirement-nav"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-[#081a33] hover:bg-[#0e274a] active:bg-[#051122] rounded shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Analyze Requirement</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 shadow-md">
          <button
            onClick={() => handleTabClick('home')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${
              activeTab === 'home' ? 'bg-slate-100 text-[#081a33] font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleTabClick('recommendation')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center justify-between ${
              activeTab === 'recommendation' ? 'bg-slate-100 text-[#081a33] font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>AI Recommendation</span>
            {hasActiveAnalysis && (
              <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                Active
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick('explorer')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${
              activeTab === 'explorer' ? 'bg-slate-100 text-[#081a33] font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Standards Explorer
          </button>
          <button
            onClick={() => handleTabClick('analyses')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${
              activeTab === 'analyses' ? 'bg-slate-100 text-[#081a33] font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            My Analyses
          </button>
          <button
            onClick={() => handleTabClick('help')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${
              activeTab === 'help' ? 'bg-slate-100 text-[#081a33] font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Help
          </button>

          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => { onOpenTenderModal(); setIsMobileMenuOpen(false); }}
              className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded"
            >
              Upload Tender Document
            </button>
            <button
              onClick={() => { onFocusRequirement(); setIsMobileMenuOpen(false); }}
              className="w-full py-2 text-center text-xs font-semibold text-white bg-[#081a33] hover:bg-[#0e274a] rounded"
            >
              Analyze Requirement
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
