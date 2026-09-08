export type NavTab = 'home' | 'recommendation' | 'explorer' | 'analyses' | 'help';

export type DivisionCode = 
  | 'ETD' // Electrotechnical Division
  | 'CED' // Civil Engineering Division
  | 'MED' // Mechanical Engineering Division
  | 'TED' // Transport Engineering Division
  | 'LITD' // Electronics and Information Technology
  | 'FAD' // Food and Agriculture Division
  | 'TXD' // Textile Division
  | 'CHID' // Chemical Division
  | 'PCD' // Petroleum, Coal and Related Products Division
  | 'MTD' // Metallurgical Engineering Division
  | 'WRD' // Water Resources Division
  | 'MHD' // Medical Equipment and Hospital Planning
  | 'AYUSD' // AYUSH Systems Division
  | string;

export type VerificationBadge = 
  | 'BIS-Sourced'
  | 'Catalogue-Sourced'
  | 'Source-Document-Sourced'
  | 'Unverified AI Suggestion';

export type EvidenceStatus = 
  | 'SOURCE_SUPPORTED'
  | 'NOT_AVAILABLE'
  | 'AI_SUGGESTED_UNVERIFIED';

export interface FactFieldProvenance {
  status: EvidenceStatus;
  value?: string | string[] | null;
  statement?: string;
  sourceDocument?: string;
  sourcePage?: string | number;
  evidenceText?: string;
}

export interface StandardFactEvidence {
  isNumber: FactFieldProvenance;
  title: FactFieldProvenance;
  scope: FactFieldProvenance;
  clauses: FactFieldProvenance;
  requirements: FactFieldProvenance;
  testMethods: FactFieldProvenance;
  testValues: FactFieldProvenance;
  samplingMethods: FactFieldProvenance;
  certification: FactFieldProvenance;
  qco: FactFieldProvenance;
  crs: FactFieldProvenance;
  hallmarking: FactFieldProvenance;
  amendments: FactFieldProvenance;
  reaffirmation: FactFieldProvenance;
  supersession: FactFieldProvenance;
  withdrawal: FactFieldProvenance;
  tenderClauses: FactFieldProvenance;
  boqRequirements: FactFieldProvenance;
}

export interface StandardClause {
  clauseNumber: string;
  title: string;
  requirement: string;
  testMethod?: string;
  isCritical: boolean;
}

export interface BISChunk {
  chunk_id: string;
  standard_id: string;
  is_number: string;
  section_title: string;
  chunk_type: 'standard_summary' | 'page_context' | string;
  chunk_text: string;
  source_document: string;
  source_page: string;
  verification_status: string;
}

export interface RawBISStandard {
  standard_id: string;
  is_number: string;
  display_is_number: string;
  title: string;
  publication_year_observed: number | string | null;
  observed_years: string | null;
  sector: string;
  standard_type: string;
  scope_for_matching: string;
  status: string;
  verification_status: string;
  source_count: number;
  source_documents: string;
  source_pages: string;
  notes: string;
}

export interface IndianStandard {
  id: string;
  isCode: string; // e.g. "IS 2742 (Part 1)"
  shortCode: string; // e.g. "IS 2742"
  title: string;
  division: DivisionCode;
  divisionName: string;
  committee: string; // e.g. "TED 23"
  yearOfPublication: number | string;
  status: 'Active' | 'Under Revision' | 'Amended' | string;
  isQCOMandatory: boolean;
  qcoNotification?: string;
  ministry?: string;
  scope: string;
  keyClauses: StandardClause[];
  testParameters: string[];
  relatedStandards: string[];
  equivalentISO?: string;
  gemClauseBoilerplate: string;
  category: string;
  keywords: string[];
  // Factual knowledge repository attributes
  standardId?: string;
  standardType?: string;
  verificationStatus?: string;
  sourceBadge?: VerificationBadge;
  sourceCount?: number;
  sourceDocuments?: string;
  sourcePages?: string;
  notes?: string;
  chunks?: BISChunk[];
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
  sourceBadge?: VerificationBadge;
  sourceDocument?: string;
  sourcePage?: string;
  evidenceText?: string;
  factEvidence?: StandardFactEvidence;
  verificationStatusText?: string;
}

export interface UnverifiedSuggestion {
  isCode: string;
  title: string;
  reason: string;
  disclaimer: string;
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
  // Conceptual categories mandated by Evidence Gating:
  retrievedPrimaryStandards?: MatchedStandard[];
  retrievedSupportingStandards?: MatchedStandard[];
  verifiedStandards?: MatchedStandard[];
  unverifiedSuggestions?: UnverifiedSuggestion[];
  // Backward-compatible properties:
  primaryStandards: MatchedStandard[];
  secondaryStandards: MatchedStandard[];
  verifiedPrimaryStandards?: MatchedStandard[];
  verifiedSupportingStandards?: MatchedStandard[];
  warnings?: string[];
  gemTenderClauses: {
    title: string;
    text: string;
    applicableIS: string;
    evidenceStatus?: EvidenceStatus;
  }[];
  complianceChecklist: ChecklistItem[];
  qcoSummary: {
    isRegulated: boolean;
    orderName?: string;
    enforcementDate?: string;
    consequences: string;
    evidenceStatus?: EvidenceStatus;
  };
  sampleBoQSpecification: string;
  boqEvidenceStatus?: EvidenceStatus;
  clausesEvidenceStatus?: EvidenceStatus;
  certificationEvidenceStatus?: EvidenceStatus;
  amendmentEvidenceStatus?: EvidenceStatus;
  structuredRequirement?: StructuredRequirement;
  clarificationRequired?: boolean;
  clarificationQuestions?: ClarificationQuestion[];
  statusMessage?: string;
  isSafeNoMatch?: boolean;
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

export interface TenderSourceReference {
  documentName: string;
  pageNumber?: number;
  sectionHeading?: string;
  sourceSnippet: string;
}

export interface ClaimedStandardVerification {
  isCode: string;
  status: 'VERIFIED_IN_CATALOGUE' | 'UNVERIFIED_IN_CATALOGUE';
  matchedStandard?: IndianStandard;
  note: string;
}

export interface TenderProcurementItem {
  id: string;
  itemNumber: number;
  product: string;
  subtype?: string;
  quantity?: string;
  application?: string;
  material?: string;
  technicalParameters?: string[];
  locationOrUse?: string;
  performanceRequirements?: string[];
  explicitISReferencesMentionedInTender: string[];
  claimedStandardsVerification: ClaimedStandardVerification[];
  sourceReference: TenderSourceReference;
  missingSpecificationGaps: string[];
  analysis?: RequirementAnalysis;
  isAnalyzing?: boolean;
  error?: string;
}

export interface TenderProcessingResult {
  documentName: string;
  fileType: 'PDF' | 'DOCX' | 'PASTED_TEXT';
  pageCount?: number;
  totalLength: number;
  tenderTitle?: string;
  issuerAuthority?: string;
  items: TenderProcurementItem[];
  warnings?: string[];
  isScannedOnly?: boolean;
  errorMessage?: string;
}

export interface ClarificationQuestion {
  parameter: string;
  question: string;
  whyNeeded: string;
  options: string[];
}

export type UserIntent = 
  | 'product_procurement' 
  | 'testing' 
  | 'safety' 
  | 'installation' 
  | 'certification_compliance' 
  | 'terminology_general';

export interface StructuredRequirement {
  rawQuery: string;
  product?: string;
  productSubtype?: string;
  intendedApplication?: string;
  material?: string;
  technicalParameters?: string[];
  industryDomain?: string;
  detectedIntent: UserIntent;
  primaryDomain?: string;
  detectedDomains: string[];
  coreProductWords: string[];
}

export interface RetrievalResult {
  standard: IndianStandard;
  score: number;
  standardType: 'Product Specification' | 'Test Method' | 'Safety' | 'Installation' | 'Terminology' | 'Component' | 'General / Code of Practice' | 'Classification' | 'Guideline' | 'Other';
  domain: string;
  matchReasons: string[];
  evidenceChunk?: {
    title: string;
    text: string;
    source: string;
  } | null;
  verificationStatus: string;
  categoryRole?: 'Primary' | 'Supporting' | 'Rejected';
  rejectionReason?: string;
}

export interface RetrievalAnalysisResponse {
  structuredRequirement: StructuredRequirement;
  clarificationRequired: boolean;
  clarificationQuestions: ClarificationQuestion[];
  statusMessage?: string;
  isSafeNoMatch: boolean;
  primaryStandards: RetrievalResult[];
  supportingStandards: RetrievalResult[];
  rejectedCandidates?: {
    standard: IndianStandard;
    score: number;
    rejectionReason: string;
  }[];
  results: RetrievalResult[];
}
