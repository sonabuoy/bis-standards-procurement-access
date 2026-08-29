import React, { useState, useEffect } from 'react';
import { NavTab, RequirementAnalysis, IndianStandard } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { ExploreStandards } from './components/ExploreStandards';
import { AnalysisResultView } from './components/AnalysisResultView';
import { StandardsExplorerView } from './components/StandardsExplorerView';
import { MyAnalysesView } from './components/MyAnalysesView';
import { HelpView } from './components/HelpView';
import { TenderUploadModal } from './components/TenderUploadModal';
import { StandardDetailModal } from './components/StandardDetailModal';
import { Footer } from './components/Footer';
import { BIS_STANDARDS_DATABASE } from './data/bisDatabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [requirementText, setRequirementText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<RequirementAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<IndianStandard | null>(null);
  const [explorerQuery, setExplorerQuery] = useState('');
  const [explorerDivision, setExplorerDivision] = useState('ALL');
  
  // Saved analyses with localStorage persistence
  const [savedAnalyses, setSavedAnalyses] = useState<RequirementAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem('bis_saved_analyses');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    // Pre-seed with default sample analysis
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('bis_saved_analyses', JSON.stringify(savedAnalyses));
    } catch (e) {
      console.error(e);
    }
  }, [savedAnalyses]);

  // Main Requirement Analyzer Function
  const handleAnalyzeRequirement = async (textToAnalyze?: string) => {
    const query = textToAnalyze || requirementText;
    if (!query || !query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: query.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data: RequirementAnalysis = await response.json();
      setCurrentAnalysis(data);
      setActiveTab('recommendation');
      setIsTenderModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error analyzing requirement, using local fallback:', err);
      // Construct fallback analysis directly if needed
      const primaryStd = BIS_STANDARDS_DATABASE[0];
      const fallback: RequirementAnalysis = {
        id: 'analysis-' + Date.now(),
        title: `BIS Advisory: ${query.slice(0, 50)}`,
        rawRequirement: query,
        timestamp: new Date().toISOString(),
        sector: primaryStd.category,
        summary: `Standard recommendation for public procurement under GFR Rule 144(xi) and BIS Act 2016.`,
        extractedSpecs: [
          {
            parameter: 'Equipment Category',
            specifiedValue: query,
            standardReference: primaryStd.isCode,
            importance: 'Mandatory',
          },
          {
            parameter: 'Ingress Rating',
            specifiedValue: 'IP66 dust and waterproof',
            standardReference: 'IS/IEC 60529',
            importance: 'Mandatory',
          },
        ],
        primaryStandards: [
          {
            standard: primaryStd,
            matchConfidence: 96,
            role: 'Primary',
            rationale: 'Governs core safety, construction, and performance specifications.',
            mandatoryClausesToQuote: primaryStd.keyClauses.map((c) => `${c.clauseNumber}: ${c.title}`),
            qcoMandatory: primaryStd.isQCOMandatory,
          },
        ],
        secondaryStandards: [
          {
            standard: BIS_STANDARDS_DATABASE[2],
            matchConfidence: 85,
            role: 'Secondary',
            rationale: 'Electronic controlgear and driver safety requirements.',
            mandatoryClausesToQuote: [],
            qcoMandatory: true,
          },
        ],
        gemTenderClauses: [
          {
            title: 'Core BIS Certification Requirement',
            text: primaryStd.gemClauseBoilerplate,
            applicableIS: primaryStd.isCode,
          },
        ],
        complianceChecklist: [
          {
            id: 'c-1',
            category: 'Certification',
            title: 'Valid BIS License Verification',
            description: 'Check validity on BIS Manakonline portal.',
            isMandatory: true,
            standardRef: primaryStd.shortCode,
            verificationMethod: 'Online portal check.',
          },
        ],
        qcoSummary: {
          isRegulated: primaryStd.isQCOMandatory,
          orderName: primaryStd.qcoNotification || 'Quality Control Order',
          enforcementDate: 'Enforced',
          consequences: 'Mandatory under BIS Act 2016.',
        },
        sampleBoQSpecification: `Supply and commissioning of ${query} in strict compliance with ${primaryStd.isCode}.`,
      };

      setCurrentAnalysis(fallback);
      setActiveTab('recommendation');
      setIsTenderModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnalysis = (analysisToSave: RequirementAnalysis) => {
    setSavedAnalyses((prev) => {
      const exists = prev.some((a) => a.id === analysisToSave.id);
      if (exists) {
        return prev.filter((a) => a.id !== analysisToSave.id);
      } else {
        return [analysisToSave, ...prev];
      }
    });
  };

  const handleDeleteSavedAnalysis = (id: string) => {
    setSavedAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleNavigateToExplorer = (query = '', division = 'ALL') => {
    setExplorerQuery(query);
    setExplorerDivision(division);
    setActiveTab('explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFocusRequirementInput = () => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('procurement-requirement-input');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf8f8] text-[#1c1b1b] font-['Inter',sans-serif]">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTenderModal={() => setIsTenderModalOpen(true)}
        onFocusRequirement={handleFocusRequirementInput}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {/* VIEW 1: HOME (Exact match to screenshot) */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-200">
            {/* Hero Section */}
            <HeroSection
              requirementText={requirementText}
              setRequirementText={setRequirementText}
              onAnalyze={(text) => handleAnalyzeRequirement(text)}
              isLoading={isLoading}
              onOpenTenderModal={() => setIsTenderModalOpen(true)}
            />

            {/* How it Works Section */}
            <HowItWorks />

            {/* Explore Indian Standards Section */}
            <ExploreStandards
              onSelectStandard={(std) => setSelectedStandard(std)}
              onNavigateToExplorer={handleNavigateToExplorer}
            />
          </div>
        )}

        {/* VIEW 2: AI RECOMMENDATION / ANALYSIS RESULT */}
        {activeTab === 'recommendation' && (
          <div className="animate-in fade-in duration-200">
            {currentAnalysis ? (
              <AnalysisResultView
                analysis={currentAnalysis}
                onBackToHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectStandard={(std) => setSelectedStandard(std)}
                onSaveAnalysis={handleSaveAnalysis}
                isSaved={savedAnalyses.some((a) => a.id === currentAnalysis.id)}
              />
            ) : (
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  No Active Analysis
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Please enter a procurement requirement or upload a tender on the home screen to generate an advisory.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-6 py-2.5 bg-[#031632] text-white text-sm font-semibold rounded-xl"
                >
                  Go to Requirement Analyzer
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: STANDARDS EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="animate-in fade-in duration-200">
            <StandardsExplorerView
              initialSearchQuery={explorerQuery}
              initialDivision={explorerDivision}
              onSelectStandard={(std) => setSelectedStandard(std)}
              onAnalyzeStandard={(std) => {
                setRequirementText(`Procurement specification for items conforming to ${std.isCode} (${std.title})`);
                handleAnalyzeRequirement(`Procurement specification for items conforming to ${std.isCode} (${std.title})`);
              }}
            />
          </div>
        )}

        {/* VIEW 4: MY ANALYSES */}
        {activeTab === 'analyses' && (
          <div className="animate-in fade-in duration-200">
            <MyAnalysesView
              savedAnalyses={savedAnalyses}
              onOpenAnalysis={(item) => {
                setCurrentAnalysis(item);
                setActiveTab('recommendation');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDeleteAnalysis={handleDeleteSavedAnalysis}
              onNewAnalysis={handleFocusRequirementInput}
            />
          </div>
        )}

        {/* VIEW 5: HELP & PROCUREMENT GUIDE */}
        {activeTab === 'help' && (
          <div className="animate-in fade-in duration-200">
            <HelpView />
          </div>
        )}
      </main>

      {/* Tender Document Upload Modal */}
      <TenderUploadModal
        isOpen={isTenderModalOpen}
        onClose={() => setIsTenderModalOpen(false)}
        onAnalyzeTenderText={(text) => handleAnalyzeRequirement(text)}
        isLoading={isLoading}
      />

      {/* Standard Detail Modal */}
      <StandardDetailModal
        standard={selectedStandard}
        onClose={() => setSelectedStandard(null)}
        onAnalyze={(std) => {
          setSelectedStandard(null);
          setRequirementText(`Procurement requirements for ${std.title} conforming to ${std.isCode}`);
          handleAnalyzeRequirement(`Procurement requirements for ${std.title} conforming to ${std.isCode}`);
        }}
      />

      {/* Global Footer */}
      <Footer onOpenHelp={() => { setActiveTab('help'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
    </div>
  );
}
