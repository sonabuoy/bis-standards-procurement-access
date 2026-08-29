import React from 'react';
import { NavTab } from '../types';
import { ShieldCheck, FileUp, Sparkles, Search, Layers, Bookmark, HelpCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenTenderModal: () => void;
  onFocusRequirement: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenTenderModal,
  onFocusRequirement
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] shadow-xs">
      {/* Top micro-bar with national identity */}
      <div className="bg-[#031632] text-white text-[11px] px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="font-semibold tracking-wider uppercase text-amber-300">
            Government of India
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-200">
            Bureau of Indian Standards (BIS) — Manak Bhawan, New Delhi
          </span>
          <div className="ml-auto hidden md:flex items-center gap-4 text-gray-300">
            <span>National Standards Body of India</span>
            <span className="bg-emerald-700/80 text-emerald-100 text-[10px] font-medium px-2 py-0.5 rounded-full">
              GeM & QCO Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
          id="bis-brand-logo"
        >
          {/* BIS Geometric Logo Emblem */}
          <div className="w-10 h-10 rounded-md bg-[#031632] flex items-center justify-center relative overflow-hidden border border-slate-700 shadow-xs group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              {/* Triangular BIS Style Geometry */}
              <polygon points="50,12 88,80 12,80" fill="none" stroke="#ffffff" strokeWidth="6" />
              <polygon points="50,28 76,74 24,74" fill="#d32f2f" opacity="0.9" />
              <circle cx="50" cy="56" r="8" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-[#031632] tracking-tight font-['Noto_Sans',sans-serif]">
                BIS Standard Advisor
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                AI
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Public Procurement & Technical Specification Support
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('home')}
            id="nav-tab-home"
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'home'
                ? 'text-[#031632] font-semibold'
                : 'text-gray-600 hover:text-[#031632]'
            }`}
          >
            Home
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#031632] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('recommendation')}
            id="nav-tab-recommendation"
            className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'recommendation'
                ? 'text-[#031632] font-semibold'
                : 'text-gray-600 hover:text-[#031632]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            AI Recommendation
            {activeTab === 'recommendation' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#031632] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            id="nav-tab-explorer"
            className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'text-[#031632] font-semibold'
                : 'text-gray-600 hover:text-[#031632]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Standards Explorer
            {activeTab === 'explorer' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#031632] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('analyses')}
            id="nav-tab-analyses"
            className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'analyses'
                ? 'text-[#031632] font-semibold'
                : 'text-gray-600 hover:text-[#031632]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            My Analyses
            {activeTab === 'analyses' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#031632] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('help')}
            id="nav-tab-help"
            className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'help'
                ? 'text-[#031632] font-semibold'
                : 'text-gray-600 hover:text-[#031632]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Help
            {activeTab === 'help' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#031632] rounded-t-full" />
            )}
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenTenderModal}
            id="btn-upload-tender-nav"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#1a2b48] bg-white border border-[#c5c6ce] hover:bg-gray-50 rounded-md transition-all shadow-2xs hover:border-[#1a2b48]"
          >
            <FileUp className="w-4 h-4 text-gray-600" />
            Upload Tender
          </button>

          <button
            type="button"
            onClick={onFocusRequirement}
            id="btn-analyze-requirement-nav"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#031632] hover:bg-[#1a2b48] rounded-md transition-all shadow-xs hover:shadow-sm active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Analyze Requirement
          </button>
        </div>
      </div>
    </header>
  );
};
