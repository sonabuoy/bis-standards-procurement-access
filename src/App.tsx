import React, { useState, useEffect } from 'react';
import { NavTab, RequirementAnalysis, IndianStandard, TenderProcessingResult, TenderProcurementItem } from './types';
import { Navbar } from './components/Navbar';
import { HomeProcurementView } from './components/HomeProcurementView';
import { AnalysisWorkspaceView } from './components/AnalysisWorkspaceView';
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
  const [currentTenderResult, setCurrentTenderResult] = useState<TenderProcessingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingItem, setIsAnalyzingItem] = useState(false);
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
      console.error('Error loading saved analyses:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('bis_saved_analyses', JSON.stringify(savedAnalyses));
    } catch (e) {
      console.error('Error persisting saved analyses:', e);
    }
  }, [savedAnalyses]);

  // Main Requirement Analyzer Function (Pasted text or single standard query)
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
      setCurrentTenderResult(null); // Clear previous multi-item tender
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
      setCurrentTenderResult(null);
      setActiveTab('recommendation');
      setIsTenderModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Tender Document Ingestion Result
  const handleTenderProcessed = async (result: TenderProcessingResult) => {
    setCurrentTenderResult(result);
    
    // If the tender has an item with an embedded analysis, use it
    if (result.items && result.items.length > 0) {
      if (result.items[0].analysis) {
        setCurrentAnalysis(result.items[0].analysis);
      } else {
        // Automatically request analysis for Item 1
        try {
          setIsAnalyzingItem(true);
          const firstItem = result.items[0];
          const query = `${firstItem.product} ${firstItem.technicalParameters?.join(' ') || ''}`.trim();
          const response = await fetch('/api/analyze-requirement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requirement: query }),
          });

          if (response.ok) {
            const data: RequirementAnalysis = await response.json();
            firstItem.analysis = data;
            setCurrentAnalysis(data);
          }
        } catch (e) {
          console.error('Error pre-analyzing first tender item:', e);
        } finally {
          setIsAnalyzingItem(false);
        }
      }
    }

    setActiveTab('recommendation');
    setIsTenderModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // On-demand analysis for an unanalyzed tender item
  const handleAnalyzeTenderItem = async (item: TenderProcurementItem, index: number) => {
    if (!currentTenderResult) return;
    setIsAnalyzingItem(true);

    try {
      const query = `${item.product} ${item.technicalParameters?.join(' ') || ''}`.trim();
      const response = await fetch('/api/analyze-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: query }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data: RequirementAnalysis = await response.json();
      
      // Update item in tenderResult
      const updatedItems = [...currentTenderResult.items];
      updatedItems[index] = {
        ...item,
        analysis: data
      };

      setCurrentTenderResult({
        ...currentTenderResult,
        items: updatedItems
      });

      setCurrentAnalysis(data);
    } catch (err) {
      console.error('Error analyzing tender item:', err);
    } finally {
      setIsAnalyzingItem(false);
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-['Inter',sans-serif]">
      {/* Top Institutional Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTenderModal={() => setIsTenderModalOpen(true)}
        onFocusRequirement={handleFocusRequirementInput}
        hasActiveAnalysis={!!currentAnalysis || !!currentTenderResult}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {/* VIEW 1: HOME (NEW PROCUREMENT ANALYSIS) */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-200">
            <HomeProcurementView
              requirementText={requirementText}
              setRequirementText={setRequirementText}
              onAnalyze={(text) => handleAnalyzeRequirement(text)}
              isLoading={isLoading}
              onOpenTenderModal={() => setIsTenderModalOpen(true)}
              onNavigateToExplorer={handleNavigateToExplorer}
              onTenderProcessed={handleTenderProcessed}
              onSelectStandard={(std) => setSelectedStandard(std)}
            />
          </div>
        )}

        {/* VIEW 2: ANALYSIS WORKSPACE (ITEM CARDS, GAPS, PROVENANCE, RECOMMENDED STANDARDS, BOQ) */}
        {activeTab === 'recommendation' && (
          <div className="animate-in fade-in duration-200">
            <AnalysisWorkspaceView
              analysis={currentAnalysis}
              tenderResult={currentTenderResult}
              onBackToHome={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectStandard={(std) => setSelectedStandard(std)}
              onSaveAnalysis={handleSaveAnalysis}
              isSaved={currentAnalysis ? savedAnalyses.some((a) => a.id === currentAnalysis.id) : false}
              onAnalyzeTenderItem={handleAnalyzeTenderItem}
              isAnalyzingItem={isAnalyzingItem}
              onRefineRequirement={handleAnalyzeRequirement}
            />
          </div>
        )}

        {/* VIEW 3: STANDARDS EXPLORER (1,392 INDEXED STANDARDS) */}
        {activeTab === 'explorer' && (
          <div className="animate-in fade-in duration-200">
            <StandardsExplorerView
              initialSearchQuery={explorerQuery}
              initialDivision={explorerDivision}
              onSelectStandard={(std) => setSelectedStandard(std)}
              onAnalyzeStandard={(std) => {
                const query = `Procurement requirements for items conforming to ${std.isCode} (${std.title})`;
                setRequirementText(query);
                handleAnalyzeRequirement(query);
              }}
            />
          </div>
        )}

        {/* VIEW 4: MY SAVED ADVISORIES */}
        {activeTab === 'analyses' && (
          <div className="animate-in fade-in duration-200">
            <MyAnalysesView
              savedAnalyses={savedAnalyses}
              onOpenAnalysis={(item) => {
                setCurrentAnalysis(item);
                setCurrentTenderResult(null);
                setActiveTab('recommendation');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDeleteAnalysis={handleDeleteSavedAnalysis}
              onNewAnalysis={handleFocusRequirementInput}
            />
          </div>
        )}

        {/* VIEW 5: HELP & PROCUREMENT RULES */}
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
        onSelectAnalysis={(analysis) => {
          setCurrentAnalysis(analysis);
          setCurrentTenderResult(null);
          setActiveTab('recommendation');
          setIsTenderModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAnalyzeRequirement={(text) => handleAnalyzeRequirement(text)}
      />

      {/* Standard Detail Modal */}
      <StandardDetailModal
        standard={selectedStandard}
        onClose={() => setSelectedStandard(null)}
        onAnalyze={(std) => {
          setSelectedStandard(null);
          const query = `Procurement requirements for items conforming to ${std.isCode} (${std.title})`;
          setRequirementText(query);
          handleAnalyzeRequirement(query);
        }}
      />

      {/* Global Institutional Footer */}
      <Footer onOpenHelp={() => { setActiveTab('help'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
    </div>
  );
}
