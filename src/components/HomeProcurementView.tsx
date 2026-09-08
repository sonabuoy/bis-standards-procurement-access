import React from 'react';
import { HeroSection } from './HeroSection';
import { HowItWorks } from './HowItWorks';
import { ExploreStandards } from './ExploreStandards';
import { IndianStandard, TenderProcessingResult } from '../types';

interface HomeProcurementViewProps {
  requirementText: string;
  setRequirementText: (text: string) => void;
  onAnalyze: (customText?: string) => void;
  isLoading: boolean;
  onOpenTenderModal: () => void;
  onNavigateToExplorer: (query?: string, division?: string) => void;
  onTenderProcessed?: (result: TenderProcessingResult) => void;
  onSelectStandard?: (standard: IndianStandard) => void;
}

export const HomeProcurementView: React.FC<HomeProcurementViewProps> = ({
  requirementText,
  setRequirementText,
  onAnalyze,
  isLoading,
  onOpenTenderModal,
  onNavigateToExplorer,
  onSelectStandard
}) => {
  return (
    <div className="w-full bg-[#f8fafc]">
      {/* 1. RESTORED HERO SECTION: LARGE VISIBLE LANDMARK, CENTERED INPUT & TRICOLOUR DIVIDER */}
      <HeroSection
        requirementText={requirementText}
        setRequirementText={setRequirementText}
        onAnalyze={onAnalyze}
        isLoading={isLoading}
        onOpenTenderModal={onOpenTenderModal}
      />

      {/* 2. HOW IT WORKS */}
      <HowItWorks />

      {/* 3. EXPLORE INDIAN STANDARDS */}
      <ExploreStandards
        onSelectStandard={(std) => {
          if (onSelectStandard) {
            onSelectStandard(std);
          }
        }}
        onNavigateToExplorer={onNavigateToExplorer}
      />
    </div>
  );
};
