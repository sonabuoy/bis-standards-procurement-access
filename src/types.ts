export type NavTab = 'home' | 'recommendation' | 'explorer' | 'analyses' | 'help';

export type DivisionCode = 
  | 'ETD' // Electrotechnical Division
  | 'CED' // Civil Engineering Division
  | 'MED' // Mechanical Engineering Division
  | 'LITD' // Electronics and Information Technology
  | 'FAD' // Food and Agriculture Division
  | 'TXD' // Textile Division
  | 'CHID' // Chemical Division
  | 'MHD'; // Medical Equipment and Hospital Planning

export interface StandardClause {
  clauseNumber: string;
  title: string;
  requirement: string;
  testMethod?: string;
  isCritical: boolean;
}

export interface IndianStandard {
  id: string;
  isCode: string; // e.g. "IS 10322 (Part 5/Sec 3): 2012"
  shortCode: string; // e.g. "IS 10322"
  title: string;
  division: DivisionCode;
  divisionName: string;
  committee: string; // e.g. "ETD 23"
  yearOfPublication: number;
  status: 'Active' | 'Under Revision' | 'Amended';
  isQCOMandatory: boolean;
  qcoNotification?: string; // e.g. "DPIIT QCO S.O. 2486(E)"
  ministry?: string; // e.g. "Ministry of Heavy Industries"
  scope: string;
  keyClauses: StandardClause[];
  testParameters: string[];
  relatedStandards: string[];
  equivalentISO?: string;
  gemClauseBoilerplate: string;
  category: string;
  keywords: string[];
}

export interface ExtractedSpec {
  parameter: string;
  specifiedValue: string;
  standardReference?: string;
  importance: 'Mandatory' | 'Recommended' | 'Optional';
}

export interface MatchedStandard {
  standard: IndianStandard;
  matchConfidence: number; // 0-100
  role: 'Primary' | 'Secondary' | 'Component' | 'Testing';
  rationale: string;
  mandatoryClausesToQuote: string[];
  qcoMandatory: boolean;
}

export interface ChecklistItem {
  id: string;
  category: 'Certification' | 'Lab Testing' | 'Quality Control' | 'GeM Clause' | 'Packaging & Marking';
  title: string;
  description: string;
  isMandatory: boolean;
  standardRef: string;
  verificationMethod: string;
}

export interface RequirementAnalysis {
  id: string;
  title: string;
  rawRequirement: string;
  timestamp: string;
  sector: string;
  summary: string;
  extractedSpecs: ExtractedSpec[];
  primaryStandards: MatchedStandard[];
  secondaryStandards: MatchedStandard[];
  gemTenderClauses: {
    title: string;
    text: string;
    applicableIS: string;
  }[];
  complianceChecklist: ChecklistItem[];
  qcoSummary: {
    isRegulated: boolean;
    orderName?: string;
    enforcementDate?: string;
    consequences: string;
  };
  sampleBoQSpecification: string;
}

export interface SampleTender {
  id: string;
  title: string;
  authority: string;
  tenderNumber: string;
  category: string;
  estimatedValue: string;
  documentText: string;
  summary: string;
}
