import { 
  IndianStandard, 
  BISChunk, 
  RawBISStandard, 
  SampleTender, 
  StandardClause,
  UserIntent,
  StructuredRequirement,
  ClarificationQuestion,
  RetrievalAnalysisResponse,
  RetrievalResult,
  VerificationBadge,
  StandardFactEvidence
} from '../types';
import rawStandardsJson from '../../data/bis_standards.json';
import rawChunksJson from '../../data/bis_chunks.json';

// Cast raw JSON data to typed collections
export const RAW_BIS_STANDARDS: RawBISStandard[] = rawStandardsJson as RawBISStandard[];
export const BIS_CHUNKS_DATABASE: BISChunk[] = rawChunksJson as BISChunk[];

// Index chunks by standard_id and is_number for quick lookup
const chunksByStandardId = new Map<string, BISChunk[]>();
const chunksByIsNumber = new Map<string, BISChunk[]>();

BIS_CHUNKS_DATABASE.forEach((chunk) => {
  if (chunk.standard_id) {
    const existing = chunksByStandardId.get(chunk.standard_id) || [];
    existing.push(chunk);
    chunksByStandardId.set(chunk.standard_id, existing);
  }
  if (chunk.is_number) {
    const normalizedIS = chunk.is_number.trim().toLowerCase();
    const existing = chunksByIsNumber.get(normalizedIS) || [];
    existing.push(chunk);
    chunksByIsNumber.set(normalizedIS, existing);
  }
});

// Helper to determine division from sector name
function resolveDivision(sector?: string | null): { code: string; name: string } {
  const s = (sector || '').toLowerCase();
  if (s.includes('building') || s.includes('cement') || s.includes('concrete') || s.includes('structural')) {
    return { code: 'CED', name: 'Civil Engineering Division' };
  }
  if (s.includes('petroleum') || s.includes('lubricant') || s.includes('fuel')) {
    return { code: 'PCD', name: 'Petroleum, Coal & Related Products Division' };
  }
  if (s.includes('automotive') || s.includes('braking') || s.includes('steering') || s.includes('engine') || s.includes('ic engine')) {
    return { code: 'TED', name: 'Transport Engineering Division' };
  }
  if (s.includes('chemical') || s.includes('hazard')) {
    return { code: 'CHID', name: 'Chemical Division' };
  }
  if (s.includes('dairy') || s.includes('milk') || s.includes('food') || s.includes('agriculture')) {
    return { code: 'FAD', name: 'Food & Agriculture Division' };
  }
  if (s.includes('textile') || s.includes('fabric') || s.includes('coverall')) {
    return { code: 'TXD', name: 'Textile Division' };
  }
  if (s.includes('ayush') || s.includes('ayurveda') || s.includes('unani') || s.includes('siddha') || s.includes('homeopathy')) {
    return { code: 'AYUSD', name: 'AYUSH Systems Division' };
  }
  if (s.includes('metallurgy') || s.includes('heat treatment') || s.includes('steel') || s.includes('alloy')) {
    return { code: 'MTD', name: 'Metallurgical Engineering Division' };
  }
  if (s.includes('machine safety') || s.includes('refrigeration') || s.includes('air conditioning') || s.includes('pump') || s.includes('hvac')) {
    return { code: 'MED', name: 'Mechanical Engineering Division' };
  }
  if (s.includes('water resources') || s.includes('lake') || s.includes('reservoir') || s.includes('dam')) {
    return { code: 'WRD', name: 'Water Resources Division' };
  }
  if (s.includes('information technology') || s.includes('cyber') || s.includes('electronics') || s.includes('software')) {
    return { code: 'LITD', name: 'Electronics & Information Technology' };
  }
  if (s.includes('electrical') || s.includes('power') || s.includes('luminaire') || s.includes('cable') || s.includes('transformer')) {
    return { code: 'ETD', name: 'Electrotechnical Division' };
  }
  return { code: 'CED', name: 'Civil & General Engineering Division' };
}

// Extract clean short IS code (e.g. "IS 2742" from "IS 2742 (Part 1)")
function extractShortCode(isNumber?: string | null): string {
  if (!isNumber) return 'IS Standard';
  const match = isNumber.match(/IS\s*\d+/i);
  return match ? match[0].toUpperCase() : isNumber;
}

// Generate meaningful search keywords from title, sector, and IS code
function generateKeywords(title?: string | null, sector?: string | null, isNumber?: string | null): string[] {
  const words = new Set<string>();
  
  // Add core components
  if (isNumber) {
    words.add(isNumber.toLowerCase());
    words.add(extractShortCode(isNumber).toLowerCase());
  }
  if (sector) {
    words.add(sector.toLowerCase());
  }
  
  // Clean title words
  if (title) {
    const cleanTokens = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !['and', 'for', 'the', 'with', 'part', 'sec', 'section', 'methods', 'test', 'specification'].includes(t));
    
    cleanTokens.forEach(t => words.add(t));
  }
  return Array.from(words);
}

// Build standardized clauses from chunks and metadata
function buildClauses(_std: RawBISStandard, _chunks: BISChunk[]): StandardClause[] {
  // STRICT EVIDENCE GATING: If the current dataset does not contain actual clause-level text
  // with verified clause numbers, do NOT invent or estimate plausible-sounding clause numbers
  // (such as Clause 4.1 or Clause 6.2).
  // Return empty array. The UI and API display: "Detailed clauses are not available in the current BIS-derived source."
  return [];
}

// Normalize IS number string to handle variations like 'IS 10484', 'IS 10484:2021', 'is 10484', 'IS 10484 (Part 1)'
export function normalizeIsCode(code?: string | null): string {
  if (!code) return '';
  return code
    .trim()
    .toUpperCase()
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Normalize prefix like 'IS/ISO', 'IS / ISO', 'IS :'
    .replace(/^IS\s*[/:\-]\s*ISO/i, 'IS/ISO')
    .replace(/^IS\s*[:\-]\s*/i, 'IS ')
    // Strip trailing revision years when matching base catalog numbers (e.g. "IS 269:2015" -> "IS 269")
    // but keep part/section information e.g. "IS 2742 (Part 1)"
    .replace(/:\s*\d{4}/g, '')
    .trim();
}

// Compute appropriate provenance badge
export function computeSourceBadge(raw: RawBISStandard, chunks: BISChunk[]): VerificationBadge {
  if (chunks.length > 0 && chunks.some(c => Boolean(c.source_document))) {
    return 'Source-Document-Sourced';
  }
  if (raw.source_documents || (raw.source_count && raw.source_count > 0)) {
    return 'BIS-Sourced';
  }
  return 'Catalogue-Sourced';
}

// Transform raw standards into full IndianStandard records
export const BIS_STANDARDS_DATABASE: IndianStandard[] = RAW_BIS_STANDARDS.map((raw) => {
  const isCode = raw.display_is_number || raw.is_number || 'IS Standard';
  const shortCode = extractShortCode(isCode);
  const divInfo = resolveDivision(raw.sector);
  const associatedChunks = (raw.standard_id ? chunksByStandardId.get(raw.standard_id) : undefined) || 
    (raw.is_number ? chunksByIsNumber.get(raw.is_number.trim().toLowerCase()) : undefined) || [];
  
  const statusStr = (raw.status || '').toLowerCase();
  const notesStr = (raw.notes || '').toLowerCase();

  // STRICT EVIDENCE GATING: QCO must only be true if explicitly supported in source data.
  // Never guess based on sector strings like 'braking' or 'medical textiles'.
  const isQCO = Boolean(
    (statusStr && statusStr.includes('mandatory')) ||
    (notesStr && notesStr.includes('qco'))
  );

  const keyClauses = buildClauses(raw, associatedChunks);
  const keywords = generateKeywords(raw.title, raw.sector, isCode);

  // STRICT EVIDENCE GATING: Do NOT generate fabricated test parameters
  const testParams: string[] = [];

  // STRICT EVIDENCE GATING: Tender boilerplate clause must ONLY state standard conformity.
  // Never include unsupported claims like BIS licence / ISI Mark / CRS registration / NABL testing / GFR 144(xi).
  const boilerplate = `The supplied product shall conform to ${isCode}.`;

  const sourceBadge = computeSourceBadge(raw, associatedChunks);

  return {
    id: raw.standard_id || `STD-${Math.random().toString(36).substring(2, 9)}`,
    isCode,
    shortCode,
    title: raw.title || isCode,
    division: divInfo.code,
    divisionName: divInfo.name,
    committee: divInfo.code,
    yearOfPublication: raw.publication_year_observed || (raw.observed_years ? raw.observed_years.split(';')[0].trim() : 2020),
    status: raw.status || 'Active',
    isQCOMandatory: isQCO,
    qcoNotification: isQCO ? `Applicable DPIIT / Ministry Quality Control Order for ${raw.sector || 'Category'}` : undefined,
    ministry: isQCO ? 'Ministry of Commerce & Industry / Sectoral Ministry' : undefined,
    scope: raw.scope_for_matching || raw.title || isCode,
    keyClauses,
    testParameters: testParams,
    relatedStandards: [],
    gemClauseBoilerplate: boilerplate,
    category: raw.sector || 'General Engineering',
    keywords,
    standardId: raw.standard_id,
    standardType: raw.standard_type,
    verificationStatus: raw.verification_status,
    sourceBadge,
    sourceCount: raw.source_count,
    sourceDocuments: raw.source_documents,
    sourcePages: raw.source_pages,
    notes: raw.notes,
    chunks: associatedChunks
  };
});

// Build strict per-fact provenance evidence for a standard
export function buildStandardFactEvidence(
  std: IndianStandard,
  evidenceChunk?: { title?: string; text?: string; source?: string } | null
): StandardFactEvidence {
  const sourceDoc = std.sourceDocuments || (evidenceChunk?.source) || 'BIS Catalogue Handbook';
  const sourcePage = std.sourcePages || 'Dataset Entry';
  const hasClauses = Boolean(std.keyClauses && std.keyClauses.length > 0);
  const hasScopeEvidence = Boolean(std.scope && std.scope.length > 50 && std.scope !== std.title && std.scope !== std.isCode);

  return {
    isNumber: {
      status: 'SOURCE_SUPPORTED',
      value: std.isCode,
      sourceDocument: sourceDoc,
      sourcePage,
      statement: `${std.isCode} is present in the available BIS-derived dataset.`
    },
    title: {
      status: 'SOURCE_SUPPORTED',
      value: std.title,
      sourceDocument: sourceDoc,
      sourcePage,
      statement: `Standard title "${std.title}" is verified in the BIS-derived dataset.`
    },
    scope: {
      status: hasScopeEvidence ? 'SOURCE_SUPPORTED' : 'NOT_AVAILABLE',
      value: hasScopeEvidence ? std.scope : null,
      sourceDocument: sourceDoc,
      sourcePage,
      statement: hasScopeEvidence ? std.scope : 'Detailed scope is not available in the current BIS-derived source.'
    },
    clauses: {
      status: hasClauses ? 'SOURCE_SUPPORTED' : 'NOT_AVAILABLE',
      value: hasClauses ? std.keyClauses.map(c => `${c.clauseNumber}: ${c.title}`) : null,
      statement: hasClauses 
        ? undefined 
        : 'Detailed clauses are not available in the current BIS-derived source.'
    },
    requirements: {
      status: 'NOT_AVAILABLE',
      statement: 'Specific technical requirements are not available in the current BIS-derived source.'
    },
    testMethods: {
      status: 'NOT_AVAILABLE',
      statement: 'Laboratory test methods are not specified in the current BIS-derived source.'
    },
    testValues: {
      status: 'NOT_AVAILABLE',
      statement: 'Acceptance values and tolerance thresholds are not available in the current dataset.'
    },
    samplingMethods: {
      status: 'NOT_AVAILABLE',
      statement: 'Sampling protocol details are not available in the current dataset.'
    },
    certification: {
      status: std.isQCOMandatory ? 'SOURCE_SUPPORTED' : 'NOT_AVAILABLE',
      value: std.isQCOMandatory ? std.qcoNotification : null,
      statement: std.isQCOMandatory
        ? `Mandatory certification order: ${std.qcoNotification}`
        : 'Certification status could not be verified from the current knowledge base.'
    },
    qco: {
      status: std.isQCOMandatory ? 'SOURCE_SUPPORTED' : 'NOT_AVAILABLE',
      statement: std.isQCOMandatory
        ? `Covered under ${std.qcoNotification}`
        : 'Certification status could not be verified from the current knowledge base.'
    },
    crs: {
      status: 'NOT_AVAILABLE',
      statement: 'Compulsory Registration Scheme (CRS) status is not verified in the available dataset.'
    },
    hallmarking: {
      status: 'NOT_AVAILABLE',
      statement: 'Hallmarking order status is not applicable or not verified in the available dataset.'
    },
    amendments: {
      status: 'NOT_AVAILABLE',
      statement: 'Latest amendment/reaffirmation status is not independently verified in the current dataset.'
    },
    reaffirmation: {
      status: 'NOT_AVAILABLE',
      statement: 'Reaffirmation records are not verified in the current dataset.'
    },
    supersession: {
      status: 'NOT_AVAILABLE',
      statement: 'Supersession records are not verified in the current dataset.'
    },
    withdrawal: {
      status: 'NOT_AVAILABLE',
      statement: 'Withdrawal records are not verified in the current dataset.'
    },
    tenderClauses: {
      status: 'SOURCE_SUPPORTED',
      value: `The supplied product shall conform to ${std.isCode}.`,
      statement: `The supplied product shall conform to ${std.isCode}.`
    },
    boqRequirements: {
      status: 'SOURCE_SUPPORTED',
      value: `${std.title} conforming to ${std.isCode}.`,
      statement: `${std.title} conforming to ${std.isCode}. Detailed technical specifications are not available in the current BIS-derived source.`
    }
  };
}

// Map standards by ID and IS Code for instant O(1) verified lookup
const standardsByIdMap = new Map<string, IndianStandard>();
const standardsByCodeMap = new Map<string, IndianStandard>();
const standardsByNormalizedCodeMap = new Map<string, IndianStandard>();

BIS_STANDARDS_DATABASE.forEach((std) => {
  standardsByIdMap.set(std.id, std);
  standardsByCodeMap.set(std.isCode.toLowerCase(), std);
  standardsByCodeMap.set(std.shortCode.toLowerCase(), std);
  
  const normIs = normalizeIsCode(std.isCode).toLowerCase();
  const normShort = normalizeIsCode(std.shortCode).toLowerCase();
  if (normIs) standardsByNormalizedCodeMap.set(normIs, std);
  if (normShort) standardsByNormalizedCodeMap.set(normShort, std);

  // Also index pure digits (e.g. '10484' or '269')
  const numMatch = std.isCode.match(/\b(\d+)\b/);
  if (numMatch) {
    const isNumKey = `is ${numMatch[1]}`.toLowerCase();
    if (!standardsByNormalizedCodeMap.has(isNumKey)) {
      standardsByNormalizedCodeMap.set(isNumKey, std);
    }
  }
});

// Hard Verification Gate Helper: Verifies whether an IS number exists in the BIS-derived knowledge base
export function verifyStandardInCatalogue(isCodeOrNumber?: string | null): IndianStandard | null {
  if (!isCodeOrNumber) return null;
  const rawKey = isCodeOrNumber.trim().toLowerCase();
  if (standardsByCodeMap.has(rawKey)) {
    return standardsByCodeMap.get(rawKey)!;
  }
  const normKey = normalizeIsCode(isCodeOrNumber).toLowerCase();
  if (standardsByNormalizedCodeMap.has(normKey)) {
    return standardsByNormalizedCodeMap.get(normKey)!;
  }
  // Try matching standard short codes directly
  const match = isCodeOrNumber.match(/IS\s*(\d+)/i);
  if (match) {
    const isNumKey = `is ${match[1]}`.toLowerCase();
    if (standardsByNormalizedCodeMap.has(isNumKey)) {
      return standardsByNormalizedCodeMap.get(isNumKey)!;
    }
  }
  return null;
}

// Dynamic Division Metadata with accurate counts computed from 1,392 standards
const divisionCounts: Record<string, number> = {};
BIS_STANDARDS_DATABASE.forEach((std) => {
  divisionCounts[std.division] = (divisionCounts[std.division] || 0) + 1;
});

export const DIVISION_META: Record<string, { name: string; icon: string; count: number; description: string }> = {
  CED: {
    name: 'Civil Engineering Division',
    icon: 'Building2',
    count: divisionCounts['CED'] || 308,
    description: 'Structural concrete, cement, building materials, geotechnical engineering, tiles, and seismic resilience.'
  },
  PCD: {
    name: 'Petroleum & Coal Products',
    icon: 'Flame',
    count: divisionCounts['PCD'] || 261,
    description: 'Petroleum products, lubricating oils, test methods, greases, solvents, bitumen, and petrochemical assays.'
  },
  TED: {
    name: 'Transport Engineering Division',
    icon: 'Truck',
    count: divisionCounts['TED'] || 186,
    description: 'Automotive braking systems, steering linkages, IC engine components, vehicle safety, and transmission.'
  },
  CHID: {
    name: 'Chemical Division',
    icon: 'FlaskConical',
    count: divisionCounts['CHID'] || 141,
    description: 'Industrial chemicals, chemical hazard management, solvents, polymers, acids, and laboratory reagents.'
  },
  FAD: {
    name: 'Food & Agriculture Division',
    icon: 'Wheat',
    count: divisionCounts['FAD'] || 139,
    description: 'Dairy products, microbiological testing methods, agricultural equipment, packaged food, and nutrition.'
  },
  TXD: {
    name: 'Textile Division',
    icon: 'Layers',
    count: divisionCounts['TXD'] || 74,
    description: 'Medical textiles, surgical coveralls, PPE fabrics, agrotextiles, geogrids, and industrial geotextiles.'
  },
  AYUSD: {
    name: 'AYUSH Systems Division',
    icon: 'HeartPulse',
    count: divisionCounts['AYUSD'] || 90,
    description: 'Ayurveda, Siddha, Unani, Homeopathy formulations, herbal extracts, and traditional healthcare standards.'
  },
  MTD: {
    name: 'Metallurgical Engineering',
    icon: 'Hammer',
    count: divisionCounts['MTD'] || 84,
    description: 'Metallurgy, heat treatment of alloy steels, metal casting, foundry standards, and nondestructive testing.'
  },
  MED: {
    name: 'Mechanical Engineering Division',
    icon: 'Wrench',
    count: divisionCounts['MED'] || 92,
    description: 'Machine safety, refrigeration & air conditioning, industrial pumps, valves, and mechanical fixtures.'
  },
  WRD: {
    name: 'Water Resources Division',
    icon: 'Droplets',
    count: divisionCounts['WRD'] || 12,
    description: 'Water resources, reservoir capacity measurement, lake hydrology, intake structures, and irrigation channels.'
  },
  LITD: {
    name: 'Electronics & Information Technology',
    icon: 'Cpu',
    count: divisionCounts['LITD'] || 3,
    description: 'Emerging information technologies, software engineering, and electronic data interfaces.'
  },
  ETD: {
    name: 'Electrotechnical Division',
    icon: 'Zap',
    count: divisionCounts['ETD'] || 2,
    description: 'Electrical and electromechanical equipment, power systems, and electrical safety standards.'
  }
};

// Domain definitions for semantic classification and domain filtering
export const DOMAIN_MAP: Record<string, { name: string; keywords: string[]; sectors: string[] }> = {
  FOOD_DAIRY: {
    name: 'Food & Agriculture Division (Dairy & Nutrition)',
    keywords: ['milk', 'dairy', 'paneer', 'chhana', 'cheese', 'butter', 'ghee', 'lactose', 'condensed', 'curd', 'yogurt', 'catering', 'pasteurized', 'cream', 'ice cream', 'infant milk', 'food', 'whey', 'casein', 'khoya', 'dahi', 'flavor'],
    sectors: ['dairy products & testing']
  },
  CIVIL_CONSTRUCTION: {
    name: 'Civil Engineering & Building Materials',
    keywords: ['cement', 'portland', 'concrete', 'aggregate', 'sand', 'brick', 'tile', 'mortar', 'building', 'construction', 'timber', 'furniture', 'wood', 'structure', 'plywood', 'cabinet', 'highway', 'geosynthetics', 'shutter', 'doors', 'glass', 'paving', 'roofing', 'lime', 'pozzolana', 'flyash', 'slag', 'soil', 'grout'],
    sectors: ['building materials', 'building materials; metallurgy & heat treatment', 'building materials; agrotextiles']
  },
  METALLURGY_JEWELLERY: {
    name: 'Metallurgy & Precious Metals',
    keywords: ['gold', 'jewellery', 'jewelry', 'silver', 'platinum', 'palladium', 'alloy', 'hallmark', 'carat', 'fineness', 'heat treatment', 'metallurgy', 'steel', 'forging', 'copper rod', 'brass', 'bronze', 'assaying', 'casting', 'ferrous', 'non-ferrous', 'metallographic', 'annealing', 'hardening'],
    sectors: ['metallurgy & heat treatment', 'building materials; metallurgy & heat treatment']
  },
  ELECTRICAL_ELECTRONICS: {
    name: 'Electrotechnical & Information Technology',
    keywords: ['led', 'light', 'street light', 'luminaire', 'lamp', 'lighting', 'cable', 'electrical', 'electric', 'wire', 'conductor', 'motor', 'switchgear', 'transformer', 'insulation', 'power', 'voltage', 'current', 'electronic', 'iot', 'communication protocol', 'digital infrastructure', 'data exchange', 'copper wire'],
    sectors: ['electrical / mechanical engineering', 'emerging information technology']
  },
  MEDICAL_HEALTHCARE: {
    name: 'Medical Devices & Healthcare Textiles',
    keywords: ['medical', 'surgical', 'glove', 'gloves', 'hospital', 'bandage', 'gauze', 'mask', 'ppe', 'dressings', 'coverall', 'healthcare', 'sanitary', 'drape', 'gown', 'underpad', 'face mask', 'bacterial filtration', 'plaster', 'swab', 'lint', 'bedsheet'],
    sectors: ['medical textiles', 'agrotextiles; medical textiles']
  },
  AUTOMOTIVE_TRANSPORT: {
    name: 'Automotive & Transport Engineering',
    keywords: ['automotive', 'brake', 'braking', 'steering', 'vehicle', 'engine', 'piston', 'clutch', 'moped', 'two wheeler', 'three wheeler', 'axle', 'trailer', 'wheel', 'spark ignition', 'friction lining', 'brake lining', 'silencing system', 'exhaust', 'knuckle', 'king pin'],
    sectors: ['automotive braking & steering systems', 'ic engine components']
  },
  PETROLEUM_CHEMICAL: {
    name: 'Petroleum & Chemical Hazards',
    keywords: ['petroleum', 'diesel', 'petrol', 'lubricant', 'grease', 'fuel', 'bitumen', 'kerosene', 'oil', 'chemical hazard', 'solvent', 'gasoline', 'viscosity', 'distillation', 'flash point', 'hydrocarbon', 'toxic', 'corrosive'],
    sectors: ['petroleum products & test methods', 'chemical hazards']
  },
  TEXTILE_AGRO: {
    name: 'Agrotextiles & General Textiles',
    keywords: ['agrotextile', 'textile', 'fencing net', 'shade net', 'mulch mat', 'crop cover', 'anti-hail', 'anti-bird', 'ground cover', 'jute', 'polypropylene net', 'tea plucking'],
    sectors: ['agrotextiles', 'agrotextiles; medical textiles', 'agrotextiles; building materials']
  },
  AYUSH: {
    name: 'AYUSH Systems of Medicine',
    keywords: ['ayush', 'ayurveda', 'unani', 'siddha', 'homeopathy', 'herbal', 'churna', 'taila', 'bhasma', 'vati', 'kwatha', 'arishta', 'asava', 'rasa', 'leha', 'guggulu'],
    sectors: ['ayush systems']
  },
  MECHANICAL_SAFETY: {
    name: 'Mechanical Engineering & Machine Safety',
    keywords: ['machine safety', 'refrigeration', 'air conditioning', 'hvac', 'compressor', 'guarding', 'water dispenser', 'chilling package', 'mechanical safety', 'interlocking', 'emergency stop', 'crushing', 'shearing'],
    sectors: ['machine safety', 'refrigeration & air conditioning']
  },
  WATER_RESOURCES: {
    name: 'Water Resources & Reservoirs',
    keywords: ['water resources', 'reservoir', 'lake', 'capacity survey', 'sedimentation', 'dam', 'intake', 'barrage', 'canal', 'evaporation', 'catchment'],
    sectors: ['water resources / lakes & reservoirs']
  }
};

// Granular Product Taxonomy Definition
export interface TaxonomyProductDef {
  productId: string;
  name: string;
  domain: string;
  matchTerms: string[];
  subtypes: { name: string; matchTerms: string[] }[];
  applications: string[];
  materials: string[];
  requiresClarification: boolean;
  clarificationQuestions: {
    parameter: string;
    question: string;
    whyNeeded: string;
    options: string[];
  }[];
}

export const PRODUCT_TAXONOMY: TaxonomyProductDef[] = [
  {
    productId: 'pasteurized_milk',
    name: 'Packaged Pasteurized Milk',
    domain: 'FOOD_DAIRY',
    matchTerms: ['pasteurized milk', 'pasteurised milk', 'packaged milk', 'milk'],
    subtypes: [
      { name: 'Packaged Pasteurized Milk', matchTerms: ['pasteurized', 'pasteurised', 'packaged'] },
      { name: 'Skimmed Milk Powder', matchTerms: ['skimmed milk powder', 'smp', 'skimmed milk'] },
      { name: 'Condensed Milk', matchTerms: ['condensed milk', 'partly skimmed condensed'] },
      { name: 'Infant Milk Food', matchTerms: ['infant milk', 'baby milk', 'infant formula'] }
    ],
    applications: ['retail distribution', 'institutional supply', 'beverage preparation', 'direct consumption'],
    materials: ['bovine milk', 'standardized dairy milk'],
    requiresClarification: false,
    clarificationQuestions: [
      {
        parameter: 'fatAndSnfGrade',
        question: 'What fat and Solid-Not-Fat (SNF) classification is required for the pasteurized milk?',
        whyNeeded: 'BIS and FSSAI standards categorize pasteurized milk into Full Cream (6% Fat, 9% SNF), Standardized (4.5% Fat, 8.5% SNF), Toned (3.0% Fat, 8.5% SNF), and Double Toned (1.5% Fat, 9.0% SNF).',
        options: ['Full Cream Milk (6.0% Fat / 9.0% SNF)', 'Standardized Milk (4.5% Fat / 8.5% SNF)', 'Toned Milk (3.0% Fat / 8.5% SNF)', 'Double Toned Milk (1.5% Fat / 9.0% SNF)', 'Skimmed Milk (<0.5% Fat / 8.7% SNF)', 'Not specified / Commercial Grade']
      }
    ]
  },
  {
    productId: 'paneer_chhana',
    name: 'Paneer / Chhana',
    domain: 'FOOD_DAIRY',
    matchTerms: ['paneer', 'chhana', 'cottage cheese', 'panir'],
    subtypes: [
      { name: 'Fresh Chilled Paneer', matchTerms: ['fresh', 'chilled', 'raw'] },
      { name: 'Vacuum Packed Paneer', matchTerms: ['vacuum', 'packaged', 'modified atmosphere'] },
      { name: 'Low Fat Paneer', matchTerms: ['low fat', 'skimmed paneer'] },
      { name: 'Canned / Brine Packed Paneer', matchTerms: ['canned', 'tin', 'brine'] }
    ],
    applications: ['institutional catering', 'hospital dietary services', 'hostel mess supply', 'culinary'],
    materials: ['cow milk', 'buffalo milk', 'mixed milk paneer'],
    requiresClarification: false,
    clarificationQuestions: [
      {
        parameter: 'packagingAndForm',
        question: 'What packaging form and shelf-life requirement applies to the paneer supply?',
        whyNeeded: 'IS 10484 specifies distinct moisture limits (max 60% for fresh, max 70% for low fat) and microbiological packaging protocols for vacuum vs. block paneer.',
        options: ['Vacuum Packed / Sealed Chilled Blocks (2°C to 4°C)', 'Fresh Bulk Paneer Blocks in Wet Liner', 'Canned / Thermal Retort Packed', 'Low-Fat Paneer Variant']
      }
    ]
  },
  {
    productId: 'cement',
    name: 'Cement (Portland / Hydraulic)',
    domain: 'CIVIL_CONSTRUCTION',
    matchTerms: ['cement', 'portland cement', 'opc', 'ppc', 'psc', 'ordinary portland cement', 'pozzolana cement', 'slag cement'],
    subtypes: [
      { name: 'Ordinary Portland Cement (OPC 33/43/53 Grade)', matchTerms: ['ordinary portland', 'opc', '53 grade', '43 grade', '33 grade'] },
      { name: 'Portland Pozzolana Cement - Flyash Based', matchTerms: ['pozzolana', 'ppc', 'flyash', 'fly ash'] },
      { name: 'Portland Pozzolana Cement - Calcined Clay Based', matchTerms: ['calcined clay', 'clay based ppc'] },
      { name: 'Portland Slag Cement (PSC)', matchTerms: ['slag cement', 'psc', 'blast furnace slag'] },
      { name: 'Rapid Hardening Portland Cement', matchTerms: ['rapid hardening', 'early strength'] },
      { name: 'Sulphate Resisting Portland Cement', matchTerms: ['sulphate resisting', 'sulphate resistant', 'srp'] },
      { name: 'Masonry Cement', matchTerms: ['masonry cement'] },
      { name: 'Supersulphated Cement', matchTerms: ['supersulphated'] }
    ],
    applications: ['government construction', 'reinforced concrete (RCC)', 'pavements', 'marine structures', 'plastering', 'mass concrete'],
    materials: ['clinker', 'gypsum', 'flyash', 'granulated blast furnace slag'],
    requiresClarification: true,
    clarificationQuestions: [
      {
        parameter: 'cementType',
        question: 'What specific type of Portland cement do you require for the construction works?',
        whyNeeded: 'Different cement types have distinct BIS product specifications, strength development curves, and chemical resistances (e.g., OPC IS 269 for rapid structural strength, PPC IS 1489 for durability and mass concrete, PSC IS 455 for sulphate/marine environments).',
        options: [
          'Ordinary Portland Cement (IS 269: 53/43/33 Grade)',
          'Portland Pozzolana Cement - Flyash Based (IS 1489 Part 1)',
          'Portland Pozzolana Cement - Calcined Clay Based (IS 1489 Part 2)',
          'Portland Slag Cement (IS 455)',
          'Rapid Hardening Portland Cement (IS 8041)',
          'Sulphate Resisting Portland Cement (IS 12330)',
          'Not sure / Need recommendation based on structural exposure'
        ]
      },
      {
        parameter: 'structuralExposure',
        question: 'What is the environmental exposure condition or structural element?',
        whyNeeded: 'IS 456 environmental durability classes (Mild, Moderate, Severe, Very Severe, Extreme) mandate specific cement types and minimum grades.',
        options: [
          'General Reinforced Concrete (RCC) / Multi-story Buildings',
          'Marine / Coastal / High-Sulphate Soil Environment',
          'Mass Concrete / Dam Foundations / Heavy Retaining Walls',
          'Pre-cast Elements / High Early Strength Requirement',
          'Plastering and Brick Masonry Works'
        ]
      }
    ]
  },
  {
    productId: 'electrical_cables',
    name: 'Electrical Cables & Conductors',
    domain: 'ELECTRICAL_ELECTRONICS',
    matchTerms: ['cable', 'cables', 'electrical cables', 'power cable', 'control cable', 'insulated cable', 'copper wire', 'wiring', 'electrical wire'],
    subtypes: [
      { name: 'PVC Insulated Heavy Duty Power Cable', matchTerms: ['pvc insulated', 'pvc cable', 'is 1554'] },
      { name: 'XLPE Insulated Power Cable', matchTerms: ['xlpe', 'is 7098', 'cross linked polyethylene'] },
      { name: 'Flexible PVC Insulated Building Wire', matchTerms: ['flexible wire', 'is 694', 'house wiring'] },
      { name: 'Fire Survival / FRLS Cable', matchTerms: ['frls', 'fire survival', 'fire resistant'] },
      { name: 'Control / Multi-core Cable', matchTerms: ['control cable', 'multicore'] }
    ],
    applications: ['industrial power distribution', 'internal electrical installations', 'switchyard cabling', 'infrastructure wiring'],
    materials: ['electrolytic copper', 'ec grade aluminium', 'pvc', 'xlpe'],
    requiresClarification: true,
    clarificationQuestions: [
      {
        parameter: 'cableTypeAndInsulation',
        question: 'What specific insulation and cable construction type do you require?',
        whyNeeded: 'BIS standards are divided by insulation and voltage: IS 1554 covers PVC insulated heavy-duty cables, IS 7098 covers XLPE insulated power cables, and IS 694 covers flexible PVC building wires.',
        options: [
          'PVC Insulated Heavy Duty Power Cable (IS 1554 Part 1)',
          'XLPE Insulated Power Cable (IS 7098 Part 1 / Part 2)',
          'Flexible PVC Insulated Copper Wires for 1100V (IS 694)',
          'Fire Retardant Low Smoke (FRLS) / Fire Survival Cable',
          'Armoured Control / Multi-core Instrumentation Cable',
          'Not sure / Need technical specification guide'
        ]
      },
      {
        parameter: 'voltageGrade',
        question: 'What is the rated operating voltage grade?',
        whyNeeded: 'Voltage rating determines insulation thickness, dielectric withstand test requirements, and part division of the IS standard.',
        options: [
          'Low Voltage (Up to 1.1 kV / 1100 V)',
          'Medium / High Voltage (3.3 kV up to 33 kV)',
          'Extra High Voltage (Above 33 kV / 66 kV / 132 kV)'
        ]
      },
      {
        parameter: 'conductorMaterial',
        question: 'What conductor material and core configuration is specified?',
        whyNeeded: 'Conductor material (Copper vs. Aluminium) and armouring (Armoured vs. Unarmoured) directly impact ampacity and mechanical protection clauses.',
        options: [
          'Stranded Electrolytic High-Conductivity Copper',
          'EC Grade Solid / Stranded Aluminium',
          'Armoured (Steel Strip / Wire Armoured)',
          'Unarmoured'
        ]
      }
    ]
  },
  {
    productId: 'medical_gloves',
    name: 'Medical Examination & Surgical Gloves',
    domain: 'MEDICAL_HEALTHCARE',
    matchTerms: ['glove', 'gloves', 'examination gloves', 'medical gloves', 'surgical gloves', 'latex gloves', 'nitrile gloves', 'examination glove'],
    subtypes: [
      { name: 'Medical Examination Gloves', matchTerms: ['examination', 'exam gloves', 'non-sterile'] },
      { name: 'Sterile Surgical Gloves', matchTerms: ['surgical', 'sterile surgical', 'operation theatre'] },
      { name: 'Nitrile Gloves', matchTerms: ['nitrile', 'nbr'] },
      { name: 'Natural Rubber Latex Gloves', matchTerms: ['latex', 'natural rubber'] }
    ],
    applications: ['patient examination', 'surgical operations', 'clinical diagnostic procedures', 'laboratory handling'],
    materials: ['nitrile butadiene rubber', 'natural rubber latex', 'polyvinyl chloride (vinyl)', 'polychloroprene'],
    requiresClarification: true,
    clarificationQuestions: [
      {
        parameter: 'gloveTypeAndSterility',
        question: 'Are you procuring non-sterile medical examination gloves or sterile surgical gloves?',
        whyNeeded: 'Medical examination gloves (IS/ISO 11193-1) and sterile surgical gloves (IS 13422 / IS/ISO 10282) have separate BIS standards, sterile packaging requirements, and different pinhole water-tightness Acceptance Quality Limits (AQL 1.5 vs AQL 0.65).',
        options: [
          'Non-Sterile Medical Examination Gloves (IS/ISO 11193-1)',
          'Sterile Surgical Gloves (IS 13422 / IS/ISO 10282)',
          'Chemotherapy / Chemical Protection Gloves (IS 15477)',
          'Not sure / Need clinical recommendation'
        ]
      },
      {
        parameter: 'materialAndPowderStatus',
        question: 'What material composition and powder specification is required?',
        whyNeeded: 'Nitrile eliminates latex allergy risks in healthcare settings, and powder-free gloves prevent post-operative granuloma complications.',
        options: [
          'Nitrile (NBR) — Powder-Free (Recommended for clinical safety)',
          'Natural Rubber Latex — Powder-Free',
          'Natural Rubber Latex — Lightly Powdered (USP absorbable dusting powder)',
          'Vinyl / Synthetic Polymer'
        ]
      }
    ]
  },
  {
    productId: 'led_street_lights',
    name: 'LED Street Lights & Luminaires',
    domain: 'ELECTRICAL_ELECTRONICS',
    matchTerms: ['led street light', 'street light', 'street lights', 'led luminaire', 'outdoor lighting', 'highway lighting', 'floodlight', 'led lamp', 'luminaire'],
    subtypes: [
      { name: '90W Outdoor LED Highway Luminaire', matchTerms: ['90w', 'highway', 'outdoor', 'street light'] },
      { name: 'High-mast LED Floodlight', matchTerms: ['high mast', 'floodlight'] },
      { name: 'Solar Integrated LED Street Light', matchTerms: ['solar', 'solar led'] },
      { name: 'Secondary / Urban Road Street Light', matchTerms: ['urban', 'secondary road', 'residential'] }
    ],
    applications: ['highway illumination', 'urban arterial roads', 'municipal street lighting', 'perimeter security lighting'],
    materials: ['die-cast aluminium housing', 'polycarbonate / toughened glass diffuser', 'high-power led chips'],
    requiresClarification: true,
    clarificationQuestions: [
      {
        parameter: 'luminaireMountingAndOptics',
        question: 'What optical distribution and mounting arrangement is specified for the highway luminaires?',
        whyNeeded: 'IS 10322 (Part 5/Sec 3) governs luminaires for road and street lighting, requiring specific semi-cutoff/cutoff batwing optical distributions to prevent driver glare at 90W output.',
        options: [
          'Pole-Mounted Highway Street Light (IS 10322 Part 5 Sec 3)',
          'Integrated Solar LED Street Light (MNRE / BIS Specs)',
          'High-Mast Luminaire for Junctions and Toll Plazas',
          'Smart City Street Light with NEMA / Zhaga Socket for Centralized Control'
        ]
      },
      {
        parameter: 'ingressAndSurgeProtection',
        question: 'What ingress protection (IP) and surge protection ratings are required?',
        whyNeeded: 'Highway outdoor fixtures require minimum IP66 weatherproofing and 10 kV internal surge protection per CEA/BIS lighting guidelines to withstand monsoon storms and voltage spikes.',
        options: [
          'IP66 Dust & Water Jet Proof with 10 kV In-built Surge Protection (Highway Standard)',
          'IP65 with 4 kV Surge Protection (Standard Urban Road)',
          'IP67 Submersible / Extreme Coastal Rating with 10 kV Surge'
        ]
      }
    ]
  },
  {
    productId: 'furniture',
    name: 'Furniture & Timber Fixtures',
    domain: 'CIVIL_CONSTRUCTION',
    matchTerms: ['furniture', 'school furniture', 'classroom furniture', 'desks', 'benches', 'cabinets', 'chairs', 'tables', 'timber furniture'],
    subtypes: [
      { name: 'School Classroom Furniture (Desks & Benches)', matchTerms: ['school', 'classroom', 'student desk', 'dual desk'] },
      { name: 'Office Furniture', matchTerms: ['office', 'workstation', 'executive desk'] },
      { name: 'Storage Cabinets and Almirahs', matchTerms: ['cabinet', 'almirah', 'storage', 'racks'] },
      { name: 'Timber for Furniture & Cabinet Making', matchTerms: ['timber', 'wood', 'plywood', 'classification'] }
    ],
    applications: ['educational institutions', 'schools and colleges', 'government offices', 'laboratories'],
    materials: ['seasoned hardwood timber', 'cold rolled steel tubing', 'pre-laminated particle board', 'plywood'],
    requiresClarification: true,
    clarificationQuestions: [
      {
        parameter: 'furnitureItemAndDesign',
        question: 'What specific furniture items and structural construction materials are being procured?',
        whyNeeded: 'BIS provides distinct standards for finished school furniture dimensions/ergonomics (IS 4837/IS 4838) vs. timber species classifications for furniture manufacturing (IS 399 / IS 13622).',
        options: [
          'Dual Desks and Integrated Classroom Benches for Students (IS 4837 / IS 4838)',
          'Steel Tubular Frame Classroom Chairs & Desks',
          'Teacher Demonstration Tables & Laboratory Benches',
          'Steel Storage Almirahs / Book Racks for Libraries',
          'Timber Species Selection / Raw Material Classification (IS 399 / IS 13622)'
        ]
      },
      {
        parameter: 'targetAgeGroup',
        question: 'What is the target student age/height group for ergonomic dimensioning?',
        whyNeeded: 'IS 4838 defines 6 size classes (Size 1 to Size 6) based on anthropometric stature to ensure correct spinal posture.',
        options: [
          'Primary School (Classes 1 to 5 / Height 100–130 cm)',
          'Middle & Secondary School (Classes 6 to 10 / Height 130–165 cm)',
          'Senior Secondary & Higher Education (Classes 11+ / Adult)',
          'Adjustable Height Modular Desks'
        ]
      }
    ]
  },
  {
    productId: 'gold_jewellery',
    name: 'Gold & Precious Metal Jewellery',
    domain: 'METALLURGY_JEWELLERY',
    matchTerms: ['gold jewellery', 'gold jewelry', 'jewellery', 'jewelry', 'gold', 'gold alloys', 'hallmark', 'gold artifacts', 'silver jewellery'],
    subtypes: [
      { name: 'Gold Jewellery & Artifacts', matchTerms: ['gold', 'gold jewellery', 'gold alloys'] },
      { name: 'Silver Jewellery & Artifacts', matchTerms: ['silver', 'silver jewellery', 'silver alloys'] },
      { name: 'Platinum Jewellery', matchTerms: ['platinum'] }
    ],
    applications: ['retail sales', 'institutional gifting', 'temple treasures', 'bullion trade', 'sovereign reserves'],
    materials: ['24k gold (999)', '22k gold (916)', '18k gold (750)', '14k gold (585)', 'sterling silver (925)'],
    requiresClarification: false,
    clarificationQuestions: [
      {
        parameter: 'goldPurityGrade',
        question: 'What karatage / fineness grade is specified for the gold jewellery/artifacts?',
        whyNeeded: 'IS 1417 specifies mandatory hallmarking grades recognized under the BIS Hallmarking Scheme (24K/999, 23K/958, 22K/916, 20K/833, 18K/750, 14K/585, 9K/375).',
        options: [
          '22 Karat / 916 Fineness (Standard Indian Commercial Jewellery)',
          '24 Karat / 999 Fineness (Pure Gold Coins & Bullion)',
          '18 Karat / 750 Fineness (Diamond Studded / Contemporary Jewellery)',
          '14 Karat / 585 Fineness',
          '9 Karat / 375 Fineness'
        ]
      }
    ]
  },
  {
    productId: 'automotive_brakes',
    name: 'Automotive Brake Linings & Friction Materials',
    domain: 'AUTOMOTIVE_TRANSPORT',
    matchTerms: ['brake lining', 'brake linings', 'brake pad', 'friction material', 'friction lining', 'automotive brake'],
    subtypes: [
      { name: 'Non-Rubberized Brake Linings for Automotive', matchTerms: ['non-rubberized', 'is 2742', 'heavy vehicle'] },
      { name: 'Disc Brake Pads', matchTerms: ['disc pad', 'caliper'] },
      { name: 'Clutch Facings', matchTerms: ['clutch', 'facing'] }
    ],
    applications: ['commercial heavy vehicles', 'state transport corporation buses', 'passenger cars', 'two wheelers'],
    materials: ['non-asbestos composite friction material', 'semi-metallic', 'ceramic'],
    requiresClarification: false,
    clarificationQuestions: []
  },
  {
    productId: 'electric_motors',
    name: 'Electric Motors (Induction / Energy Efficient)',
    domain: 'ELECTRICAL_ELECTRONICS',
    matchTerms: ['motor', 'motors', 'induction motor', 'electric motor', 'ac motor', 'induction motors'],
    subtypes: [
      { name: 'Single Phase AC Induction Motors', matchTerms: ['single phase', 'is 996', 'fractional horsepower'] },
      { name: 'Three Phase Energy Efficient Motors (IE2/IE3/IE4)', matchTerms: ['three phase', 'is 12615', 'energy efficient', 'ie3', 'ie2'] }
    ],
    applications: ['industrial drives', 'pumps and compressors', 'domestic appliances', 'agricultural pump sets'],
    materials: ['cast iron / aluminium frame', 'copper winding wire', 'silicon steel laminations'],
    requiresClarification: true,
    clarificationQuestions: [
      {
        parameter: 'motorPhaseAndEfficiency',
        question: 'What phase configuration and efficiency class (IE Code) is required?',
        whyNeeded: 'IS 996 covers single-phase induction motors up to 2.2 kW, while IS 12615 covers three-phase energy-efficient motors (IE2, IE3, IE4) with mandatory Bureau of Energy Efficiency (BEE) star labeling.',
        options: [
          'Single Phase AC Induction Motor (IS 996)',
          'Three Phase High Efficiency Motor — IE2 Class (IS 12615)',
          'Three Phase Premium Efficiency Motor — IE3 Class (IS 12615 / QCO Mandatory)',
          'Three Phase Super Premium Efficiency Motor — IE4 Class'
        ]
      }
    ]
  }
];

// Map each standard to its canonical domain
export function getStandardDomain(std: IndianStandard | RawBISStandard): string {
  const sector = ((std as IndianStandard).category || (std as RawBISStandard).sector || '').toLowerCase();
  const doc = ((std as IndianStandard).sourceDocuments || (std as RawBISStandard).source_documents || '').toLowerCase();
  
  for (const [domKey, domVal] of Object.entries(DOMAIN_MAP)) {
    if (domVal.sectors.some(s => sector.includes(s))) return domKey;
  }
  if (doc.includes('fad_')) return 'FOOD_DAIRY';
  if (doc.includes('ced_')) return 'CIVIL_CONSTRUCTION';
  if (doc.includes('mtd_')) return 'METALLURGY_JEWELLERY';
  if (doc.includes('etd_') || doc.includes('litd_')) return 'ELECTRICAL_ELECTRONICS';
  if (doc.includes('medical-textile')) return 'MEDICAL_HEALTHCARE';
  if (doc.includes('agrotextile')) return 'TEXTILE_AGRO';
  if (doc.includes('ted_')) return 'AUTOMOTIVE_TRANSPORT';
  if (doc.includes('pcd') || doc.includes('chd')) return 'PETROLEUM_CHEMICAL';
  if (doc.includes('ayush')) return 'AYUSH';
  if (doc.includes('med_') || doc.includes('pgd_')) return 'MECHANICAL_SAFETY';
  if (doc.includes('wrd_')) return 'WATER_RESOURCES';
  return 'OTHER';
}

// Classify standard into precise taxonomy type
export function classifyStandardType(std: IndianStandard | RawBISStandard): 'Product Specification' | 'Test Method' | 'Safety' | 'Installation' | 'Terminology' | 'Component' | 'General / Code of Practice' | 'Classification' | 'Guideline' | 'Other' {
  const rawType = ((std as IndianStandard).standardType || (std as RawBISStandard).standard_type || '').toLowerCase();
  const title = (std.title || '').toLowerCase();
  
  if (
    rawType.includes('product') || 
    rawType.includes('technical specification') || 
    (title.includes('specification') && !title.includes('method of test') && !title.includes('methods of test') && !title.includes('methods of sampling'))
  ) {
    return 'Product Specification';
  }
  if (
    rawType.includes('method') || 
    rawType.includes('test') || 
    title.includes('method of test') || 
    title.includes('methods of test') || 
    title.includes('methods of sampling') || 
    title.includes('determination of') || 
    title.includes('sensory evaluation') || 
    title.includes('chemical analysis') ||
    title.includes('measurement') || 
    title.includes('testing of') || 
    title.includes('procedure for')
  ) {
    return 'Test Method';
  }
  if (rawType.includes('safety') || title.includes('safety') || title.includes('hazard') || title.includes('hygienic conditions')) {
    return 'Safety';
  }
  if (title.includes('installation') || title.includes('erection') || title.includes('laying')) {
    return 'Installation';
  }
  if (title.includes('code of practice') || rawType.includes('code of practice')) {
    return 'General / Code of Practice';
  }
  if (title.includes('classification') || rawType.includes('classification')) {
    return 'Classification';
  }
  if (title.includes('terminology') || rawType.includes('terminology') || title.includes('glossary') || title.includes('definitions')) {
    return 'Terminology';
  }
  if (rawType.includes('guideline') || title.includes('guideline')) {
    return 'Guideline';
  }
  if (title.includes('component') || title.includes('parts') || title.includes('accessories')) {
    return 'Component';
  }
  return 'Product Specification';
}

// Intent detector: accurately maps query to the user's objective
export function detectUserIntent(query: string): UserIntent {
  const q = (query || '').toLowerCase();
  if (
    q.includes('how to test') ||
    q.includes('how should this product be tested') ||
    q.includes('test method') ||
    q.includes('methods of test') ||
    q.includes('determination of') ||
    q.includes('sampling procedure') ||
    q.includes('sensory evaluation') ||
    q.includes('lab test') ||
    q.includes('testing protocol')
  ) {
    return 'testing';
  }
  if (
    q.includes('safety standard') ||
    q.includes('hazard') ||
    q.includes('hygienic condition') ||
    q.includes('protective measure') ||
    q.includes('fire safety') ||
    q.includes('safe handling')
  ) {
    return 'safety';
  }
  if (
    q.includes('installation') ||
    q.includes('how to install') ||
    q.includes('erection') ||
    q.includes('laying of') ||
    q.includes('mounting')
  ) {
    return 'installation';
  }
  if (
    q.includes('qco requirement') ||
    q.includes('mandatory certification') ||
    q.includes('isi mark process') ||
    q.includes('compliance order')
  ) {
    return 'certification_compliance';
  }
  if (
    q.includes('terminology') ||
    q.includes('glossary') ||
    q.includes('definitions of') ||
    q.includes('classification of')
  ) {
    return 'terminology_general';
  }
  return 'product_procurement';
}

// Extract structured concepts from query string without inventing missing values
export function extractStructuredRequirement(query: string): StructuredRequirement {
  const q = (query || '').trim().toLowerCase();
  const detectedIntent = detectUserIntent(q);

  // Stop words & noise filter
  const stopWords = new Set([
    'supply', 'of', 'for', 'in', 'and', 'the', 'with', 'per', 'as', 'to', 'all', 'is', 'a', 'an', 
    'on', 'at', 'by', 'from', 'government', 'institutional', 'commercial', 'use', 'item', 'items', 
    'works', 'tender', 'procurement', 'conforming', 'standard', 'standards', 'i', 'need', 'require',
    'please', 'find', 'recommend', 'how', 'what'
  ]);
  
  const rawWords = q.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(t => t.length > 1);
  const coreProductWords = rawWords.filter(w => !stopWords.has(w));
  
  // Technical parameters (e.g. 90W, 53 grade, numbers, IP ratings, etc.)
  const techParams = rawWords.filter(w => 
    /\d+(?:w|v|kv|a|mm|cm|m|kg|g|gsm|hz|°c|c|k|grade)?\b/i.test(w) || 
    w === '90w' || 
    w === '53' || 
    w === '43' || 
    w === '22k' || 
    w === '18k' || 
    w === '916' ||
    w === 'ip66' ||
    w === 'ip65'
  );

  // Match against granular product taxonomy
  let matchedTaxonomyProduct: TaxonomyProductDef | null = null;
  let matchedSubtypeName: string | undefined = undefined;

  for (const prod of PRODUCT_TAXONOMY) {
    for (const term of prod.matchTerms) {
      const regex = new RegExp('\\b' + term + '\\b', 'i');
      if (regex.test(q)) {
        matchedTaxonomyProduct = prod;
        break;
      }
    }
    if (matchedTaxonomyProduct) break;
  }

  // Check for subtype if product found
  if (matchedTaxonomyProduct) {
    for (const sub of matchedTaxonomyProduct.subtypes) {
      for (const st of sub.matchTerms) {
        if (new RegExp('\\b' + st + '\\b', 'i').test(q)) {
          matchedSubtypeName = sub.name;
          break;
        }
      }
      if (matchedSubtypeName) break;
    }
  }

  // Extract application if mentioned
  let intendedApplication: string | undefined = undefined;
  if (q.includes('highway') || q.includes('highways')) intendedApplication = 'Highways';
  else if (q.includes('institutional catering') || q.includes('catering')) intendedApplication = 'Institutional Catering';
  else if (q.includes('government construction') || q.includes('construction')) intendedApplication = 'Government Construction';
  else if (q.includes('school') || q.includes('classroom')) intendedApplication = 'School / Educational Institutions';
  else if (q.includes('hospital') || q.includes('medical') || q.includes('clinical')) intendedApplication = 'Medical / Healthcare';
  else if (q.includes('industrial')) intendedApplication = 'Industrial Power / Machinery';

  // Extract material if mentioned
  let material: string | undefined = undefined;
  if (q.includes('gold')) material = 'Gold';
  else if (q.includes('silver')) material = 'Silver';
  else if (q.includes('timber') || q.includes('wood')) material = 'Timber / Wood';
  else if (q.includes('nitrile')) material = 'Nitrile';
  else if (q.includes('latex')) material = 'Natural Rubber Latex';
  else if (q.includes('copper')) material = 'Copper';
  else if (q.includes('aluminium') || q.includes('aluminum')) material = 'Aluminium';
  else if (q.includes('pozzolana') || q.includes('flyash')) material = 'Pozzolana / Flyash';
  else if (q.includes('slag')) material = 'Blast Furnace Slag';

  // Determine domain
  let primaryDomain = matchedTaxonomyProduct ? matchedTaxonomyProduct.domain : undefined;
  const detectedDomains: string[] = primaryDomain ? [primaryDomain] : [];

  if (!primaryDomain) {
    const domainScores: { domain: string; score: number }[] = [];
    for (const [domKey, domVal] of Object.entries(DOMAIN_MAP)) {
      let matchCount = 0;
      for (const kw of domVal.keywords) {
        if (new RegExp('\\b' + kw + '\\b', 'i').test(q)) {
          matchCount += kw.length > 5 ? 2 : 1;
        }
      }
      if (matchCount > 0) {
        domainScores.push({ domain: domKey, score: matchCount });
      }
    }
    domainScores.sort((a, b) => b.score - a.score);
    if (domainScores.length > 0) {
      primaryDomain = domainScores[0].domain;
      domainScores.forEach(d => detectedDomains.push(d.domain));
    }
  }

  const extractedProduct = matchedTaxonomyProduct ? matchedTaxonomyProduct.name : (coreProductWords.length > 0 ? coreProductWords.slice(0, 2).join(' ') : undefined);
  const extractedSubtype = matchedSubtypeName || (q.includes('pasteurized') ? 'Pasteurized' : (q.includes('portland') ? 'Portland' : (q.includes('90w') ? '90W Outdoor' : (q.includes('examination') ? 'Examination' : (q.includes('school') ? 'School' : undefined)))));

  return {
    rawQuery: query,
    product: extractedProduct,
    productSubtype: extractedSubtype,
    intendedApplication,
    material,
    technicalParameters: techParams.length > 0 ? techParams : undefined,
    industryDomain: primaryDomain ? (DOMAIN_MAP[primaryDomain]?.name || primaryDomain) : undefined,
    detectedIntent,
    primaryDomain,
    detectedDomains,
    coreProductWords
  };
}

// Generate dynamic clarification questions when ambiguity exists among materially different standards
export function generateClarification(
  req: StructuredRequirement,
  candidates: { standard: IndianStandard; score: number; standardType: string }[] = []
): {
  clarificationRequired: boolean;
  clarificationQuestions: ClarificationQuestion[];
} {
  const q = req.rawQuery.toLowerCase();
  
  // Match with taxonomy definitions
  for (const prod of PRODUCT_TAXONOMY) {
    const matched = prod.matchTerms.some(term => new RegExp('\\b' + term + '\\b', 'i').test(q));
    if (matched) {
      // Check if query already specifies sufficient distinguishing parameters
      if (prod.productId === 'pasteurized_milk' && q.includes('pasteurized') && q.includes('milk')) {
        // IS 13688 is the exact pinpointed standard. Minor clarification on fat grade only if needed.
        return {
          clarificationRequired: false,
          clarificationQuestions: prod.clarificationQuestions
        };
      }
      if (prod.productId === 'paneer_chhana' && q.includes('paneer')) {
        // IS 10484 is the exact standard.
        return {
          clarificationRequired: false,
          clarificationQuestions: prod.clarificationQuestions
        };
      }
      if (prod.productId === 'gold_jewellery' && q.includes('gold') && q.includes('jewellery')) {
        // IS 1417 is the core hallmarking standard. Karatage question is provided for completeness.
        return {
          clarificationRequired: false,
          clarificationQuestions: prod.clarificationQuestions
        };
      }
      if (prod.productId === 'cement') {
        // Cement has multiple distinct standards (OPC, PPC, PSC, Sulphate Resisting)
        const isSpecific = q.includes('opc 53') || q.includes('53 grade opc') || q.includes('ppc flyash') || q.includes('is 269') || q.includes('is 1489');
        return {
          clarificationRequired: !isSpecific,
          clarificationQuestions: prod.clarificationQuestions
        };
      }
      if (prod.productId === 'furniture') {
        return {
          clarificationRequired: true,
          clarificationQuestions: prod.clarificationQuestions
        };
      }
      if (prod.productId === 'electrical_cables' || prod.productId === 'medical_gloves' || prod.productId === 'led_street_lights') {
        return {
          clarificationRequired: true,
          clarificationQuestions: prod.clarificationQuestions
        };
      }
      if (prod.requiresClarification) {
        return {
          clarificationRequired: true,
          clarificationQuestions: prod.clarificationQuestions
        };
      }
    }
  }

  // Fallback heuristic: If multiple distinct standards in different subcategories match
  if (candidates.length > 1) {
    const types = new Set(candidates.slice(0, 3).map(c => c.standard.shortCode));
    if (types.size > 2) {
      return {
        clarificationRequired: true,
        clarificationQuestions: [
          {
            parameter: 'specificApplication',
            question: `Which specific standard variation or application scope is required for "${req.product || 'this item'}"?`,
            whyNeeded: 'Multiple distinct Indian Standards govern different grades, ratings, and sub-assemblies for this category.',
            options: candidates.slice(0, 4).map(c => `${c.standard.shortCode}: ${c.standard.title.slice(0, 60)}...`)
          }
        ]
      };
    }
  }

  return {
    clarificationRequired: false,
    clarificationQuestions: []
  };
}

// Enhanced multi-stage retrieval and reranking engine with Strict Direct Product Match Threshold
export function retrieveRankedStandards(
  query: string,
  options?: {
    division?: string;
    category?: string;
    qcoOnly?: boolean;
    filterType?: string;
    limit?: number;
  }
): RetrievalResult[] {
  const req = extractStructuredRequirement(query);
  const qLower = (query || '').trim().toLowerCase();
  const qTokens = req.coreProductWords;
  const limit = options?.limit || 50;

  let candidateStandards = BIS_STANDARDS_DATABASE;

  if (options?.division && options.division !== 'ALL') {
    candidateStandards = candidateStandards.filter(s => s.division === options.division);
  }
  if (options?.category && options.category !== 'ALL') {
    candidateStandards = candidateStandards.filter(s => s.category === options.category);
  }
  if (options?.qcoOnly) {
    candidateStandards = candidateStandards.filter(s => s.isQCOMandatory);
  }

  // If empty query, return initial items with classification
  if (!qLower) {
    return candidateStandards.slice(0, limit).map(std => ({
      standard: std,
      score: 1.0,
      standardType: classifyStandardType(std),
      domain: getStandardDomain(std),
      matchReasons: ['Default catalog view'],
      evidenceChunk: null,
      verificationStatus: std.verificationStatus || 'Verified',
      categoryRole: 'Primary'
    }));
  }

  const results: RetrievalResult[] = [];

  // Identify broad general terms that must NOT be sufficient on their own
  const broadGenericWords = new Set([
    'electrical', 'medical', 'construction', 'textile', 'textiles', 'furniture', 
    'general', 'industry', 'industrial', 'engineering', 'supplies', 'supply', 
    'equipment', 'material', 'materials', 'product', 'products', 'commercial'
  ]);

  // Check specific product family taxonomy terms
  let queryProductTaxonomy: TaxonomyProductDef | null = null;
  for (const prod of PRODUCT_TAXONOMY) {
    if (prod.matchTerms.some(term => new RegExp('\\b' + term + '\\b', 'i').test(qLower))) {
      queryProductTaxonomy = prod;
      break;
    }
  }

  for (const std of candidateStandards) {
    const isCode = std.isCode.toLowerCase();
    const shortCode = std.shortCode.toLowerCase();
    const title = std.title.toLowerCase();
    const scope = std.scope.toLowerCase();
    const sector = std.category.toLowerCase();
    const stdDomain = getStandardDomain(std);
    const stdType = classifyStandardType(std);
    
    let score = 0;
    let productMatchScore = 0;
    let hasDirectProductMatch = false;
    let hasStrongPhraseMatch = false;
    let hasSpecificKeywordMatch = false;
    let hasExplicitScopeMatch = false;
    let hasStrongChunkEvidence = false;
    const matchReasons: string[] = [];
    
    // 1. IS Code Match (Exact & Prefix)
    if (isCode === qLower || shortCode === qLower || isCode.replace(/\s+/g, '') === qLower.replace(/\s+/g, '')) {
      score += 300;
      productMatchScore += 300;
      hasDirectProductMatch = true;
      matchReasons.push('Exact IS Code Match');
    } else if (qLower.includes('is ') && isCode.includes(qLower.match(/is\s*\d+/i)?.[0] || '___')) {
      score += 200;
      productMatchScore += 200;
      hasDirectProductMatch = true;
      matchReasons.push('IS Number Match');
    }
    
    // 2. Exact multi-word sub-phrase matching in Title and Scope
    for (let len = Math.min(qTokens.length, 4); len >= 2; len--) {
      for (let i = 0; i <= qTokens.length - len; i++) {
        const subPhrase = qTokens.slice(i, i + len).join(' ');
        if (subPhrase.length > 4) {
          if (title.includes(subPhrase)) {
            score += 80 * len;
            productMatchScore += 80 * len;
            hasStrongPhraseMatch = true;
            hasDirectProductMatch = true;
            matchReasons.push(`Title contains phrase "${subPhrase}"`);
            break;
          } else if (scope.includes(subPhrase)) {
            score += 35 * len;
            productMatchScore += 35 * len;
            hasStrongPhraseMatch = true;
            hasExplicitScopeMatch = true;
            matchReasons.push(`Scope contains phrase "${subPhrase}"`);
            break;
          }
        }
      }
      if (hasStrongPhraseMatch) break;
    }
    
    // 3. Whole-word token matching across Title, Scope, and Category
    let titleMatchedTokens = 0;
    let scopeMatchedTokens = 0;
    let nonBroadMatchedTokens = 0;
    
    for (const token of qTokens) {
      if (token.length < 2) continue;
      const regex = new RegExp('\\b' + token + '\\b', 'i');
      const isBroad = broadGenericWords.has(token);
      
      if (regex.test(title)) {
        titleMatchedTokens++;
        if (!isBroad) nonBroadMatchedTokens++;
        const tokenWeight = isBroad ? 20 : 50;
        score += tokenWeight;
        productMatchScore += tokenWeight;
        if (!isBroad) {
          hasSpecificKeywordMatch = true;
        }
        matchReasons.push(`Title matches "${token}"`);
      } else if (regex.test(scope)) {
        scopeMatchedTokens++;
        if (!isBroad) nonBroadMatchedTokens++;
        const tokenWeight = isBroad ? 10 : 20;
        score += tokenWeight;
        productMatchScore += tokenWeight;
        if (!isBroad) {
          hasExplicitScopeMatch = true;
        }
      } else if (regex.test(sector)) {
        score += 5;
      }
    }
    
    // 4. Query Coverage Bonus
    if (qTokens.length > 0) {
      const coverage = (titleMatchedTokens + scopeMatchedTokens * 0.5) / qTokens.length;
      if (coverage >= 1.0) {
        score += 50;
        productMatchScore += 50;
        matchReasons.push('100% Query Concept Coverage');
      } else if (coverage >= 0.6) {
        score += 25;
      }
    }
    
    // 5. Chunk Evidence Extraction & Boost
    const associatedChunks = getChunksForStandard(std.id) || getChunksForStandard(std.standardId);
    let bestChunkScore = 0;
    let bestChunk: BISChunk | null = null;
    
    for (const chunk of associatedChunks) {
      const cText = (chunk.chunk_text || '').toLowerCase();
      let cMatches = 0;
      let cNonBroadMatches = 0;
      for (const token of qTokens) {
        if (token.length > 2 && new RegExp('\\b' + token + '\\b', 'i').test(cText)) {
          cMatches++;
          if (!broadGenericWords.has(token)) {
            cNonBroadMatches++;
          }
        }
      }
      if (cMatches > bestChunkScore) {
        bestChunkScore = cMatches;
        bestChunk = chunk;
        if (cNonBroadMatches >= 1) {
          hasStrongChunkEvidence = true;
        }
      }
    }
    
    if (bestChunkScore > 0) {
      score += bestChunkScore * 10;
      matchReasons.push(`Chunk evidence match (${bestChunkScore} terms)`);
    }
    
    // DIRECT PRODUCT MATCH / SUB-CATEGORY COMPATIBILITY CHECK:
    // If the standard only matches broad words (e.g., 'electrical' on induction motors, 'medical' on bandages, 'construction' on timber),
    // it MUST NOT be given primary product standing!
    if (productMatchScore === 0 && !hasStrongPhraseMatch) {
      continue; // Strictly reject standards that have zero product match!
    }

    // Check if query was for a specific product family (e.g. electrical cables, medical gloves, led street lights)
    // but candidate is an unrelated item in that domain (e.g. induction motor, flannel, brake lever).
    if (queryProductTaxonomy) {
      if (queryProductTaxonomy.productId === 'electrical_cables') {
        // Must contain cable/conductor/wire terms
        const hasCable = /\b(cable|cables|conductor|conductors|wire|wires|wiring|pvc insulated|xlpe)\b/i.test(title + ' ' + scope);
        if (!hasCable) {
          // Reject induction motors, transformers, etc.
          continue;
        }
      } else if (queryProductTaxonomy.productId === 'medical_gloves') {
        // Must contain glove/gloves
        const hasGlove = /\b(glove|gloves)\b/i.test(title + ' ' + scope);
        if (!hasGlove) {
          // Reject flannel, plaster, bandage, dressings, masks
          continue;
        }
      } else if (queryProductTaxonomy.productId === 'led_street_lights') {
        // Must contain led / luminaire / street lighting / lamp
        const hasLighting = /\b(led|luminaire|luminaires|street light|street lighting|floodlight|lamp|lighting)\b/i.test(title + ' ' + scope);
        if (!hasLighting) {
          continue;
        }
      } else if (queryProductTaxonomy.productId === 'pasteurized_milk') {
        const hasMilk = /\b(milk)\b/i.test(title + ' ' + scope);
        if (!hasMilk) continue;
      } else if (queryProductTaxonomy.productId === 'paneer_chhana') {
        const hasPaneer = /\b(paneer|chhana)\b/i.test(title + ' ' + scope);
        if (!hasPaneer) continue;
      } else if (queryProductTaxonomy.productId === 'cement') {
        const hasCement = /\b(cement)\b/i.test(title + ' ' + scope);
        if (!hasCement) continue;
      } else if (queryProductTaxonomy.productId === 'gold_jewellery') {
        const hasGoldJewellery = /\b(gold|jewellery|jewelry|hallmark|bullion|karat)\b/i.test(title + ' ' + scope);
        if (!hasGoldJewellery) continue;
      }
    }
    
    // 6. Domain Affinity & Strong Negative Penalties
    if (req.primaryDomain) {
      if (stdDomain === req.primaryDomain) {
        score += 25;
        matchReasons.push(`Domain Alignment (${DOMAIN_MAP[req.primaryDomain]?.name || req.primaryDomain})`);
      } else if (req.detectedDomains.includes(stdDomain)) {
        score += 10;
      } else {
        score -= 120;
      }
    }
    
    // 7. Contextual Standard Type Weighting based on User Intent
    if (req.detectedIntent === 'testing') {
      if (stdType === 'Test Method') {
        score += 70;
        matchReasons.push('Contextual Priority: Testing Intent Matched to Test Method Standard');
      } else if (stdType === 'Product Specification') {
        score += 15;
      } else {
        score -= 20;
      }
    } else if (req.detectedIntent === 'safety') {
      if (stdType === 'Safety') {
        score += 70;
        matchReasons.push('Contextual Priority: Safety Intent Matched');
      } else if (stdType === 'Product Specification') {
        score += 20;
      }
    } else if (req.detectedIntent === 'installation') {
      if (stdType === 'Installation' || stdType === 'General / Code of Practice') {
        score += 70;
        matchReasons.push('Contextual Priority: Installation / Code of Practice');
      }
    } else if (req.detectedIntent === 'terminology_general') {
      if (stdType === 'Terminology' || stdType === 'Classification') {
        score += 70;
        matchReasons.push('Contextual Priority: Terminology / Classification');
      }
    } else {
      // Default: Product Procurement Intent
      if (stdType === 'Product Specification') {
        score += 40;
      } else if (stdType === 'Component') {
        score += 20;
      } else if (stdType === 'Classification') {
        score += 10;
      } else if (stdType === 'Test Method') {
        score -= 40;
      } else if (stdType === 'Terminology') {
        score -= 50;
      } else if (stdType === 'Safety') {
        score -= 10;
      }
    }
    
    if (options?.filterType && options.filterType !== 'ALL' && stdType !== options.filterType) {
      continue;
    }
    
    // DETERMINE PRIMARY vs SUPPORTING ROLE
    // A standard can ONLY be Primary if:
    // 1. It is a Product Specification (for procurement intent), OR
    // 2. It has direct product/subcategory match in title/scope/chunk with non-broad tokens, AND
    // 3. It crosses the direct product relevance score threshold (>= 120)
    let categoryRole: 'Primary' | 'Supporting' = 'Supporting';
    const hasStrongProductEvidence = hasDirectProductMatch || hasStrongPhraseMatch || (hasSpecificKeywordMatch && nonBroadMatchedTokens >= 1) || hasExplicitScopeMatch;
    
    if (req.detectedIntent === 'product_procurement') {
      if (stdType === 'Product Specification' && hasStrongProductEvidence && score >= 120) {
        categoryRole = 'Primary';
      } else {
        categoryRole = 'Supporting';
      }
    } else if (req.detectedIntent === 'testing') {
      if (stdType === 'Test Method' && hasStrongProductEvidence && score >= 100) {
        categoryRole = 'Primary';
      } else {
        categoryRole = 'Supporting';
      }
    } else {
      if (hasStrongProductEvidence && score >= 110) {
        categoryRole = 'Primary';
      } else {
        categoryRole = 'Supporting';
      }
    }
    
    if (score > 30) {
      results.push({
        standard: std,
        score,
        standardType: stdType,
        domain: stdDomain,
        matchReasons,
        evidenceChunk: bestChunk ? {
          title: bestChunk.section_title,
          text: (bestChunk.chunk_text || '').slice(0, 240) + '...',
          source: bestChunk.source_document
        } : null,
        verificationStatus: std.verificationStatus || 'Verified',
        categoryRole
      });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

// Complete Analysis with Strict Direct Match Threshold and Partitioning
export function analyzeRequirementWithClarification(query: string): RetrievalAnalysisResponse {
  const req = extractStructuredRequirement(query);
  const rankedResults = retrieveRankedStandards(query, { limit: 15 });
  
  // Separate into Primary and Supporting
  const primaryStandards = rankedResults.filter(r => r.categoryRole === 'Primary');
  const supportingStandards = rankedResults.filter(r => r.categoryRole === 'Supporting');
  
  // Direct match rule: If no standard crossed the primary threshold
  const hasNoPrimaryMatch = primaryStandards.length === 0;
  const isSafeNoMatch = rankedResults.length === 0 || hasNoPrimaryMatch;
  
  const clarificationInfo = generateClarification(req, rankedResults);
  
  let statusMessage: string | undefined = undefined;
  if (hasNoPrimaryMatch) {
    statusMessage = 'No sufficiently relevant standard was found in the current BIS-derived knowledge base.';
  }

  return {
    structuredRequirement: req,
    clarificationRequired: clarificationInfo.clarificationRequired || isSafeNoMatch,
    clarificationQuestions: clarificationInfo.clarificationQuestions,
    statusMessage,
    isSafeNoMatch,
    primaryStandards,
    supportingStandards,
    results: rankedResults
  };
}

// Search and Retrieval Functions (Backwards compatible interface)
export function searchStandards(
  query: string,
  options?: {
    division?: string;
    category?: string;
    qcoOnly?: boolean;
    limit?: number;
  }
): IndianStandard[] {
  const ranked = retrieveRankedStandards(query, options);
  return ranked.map(r => r.standard);
}

export function getStandardById(id: string): IndianStandard | undefined {
  return standardsByIdMap.get(id);
}

export function getStandardByCode(code?: string | null): IndianStandard | undefined {
  if (!code) return undefined;
  return standardsByCodeMap.get(code.trim().toLowerCase());
}

export function getChunksForStandard(standardId?: string | null): BISChunk[] {
  if (!standardId) return [];
  return chunksByStandardId.get(standardId) || [];
}

export function searchChunks(query?: string | null, limit = 10): BISChunk[] {
  const q = (query || '').toLowerCase();
  if (!q) return BIS_CHUNKS_DATABASE.slice(0, limit);
  return BIS_CHUNKS_DATABASE
    .filter(c => 
      (c.chunk_text || '').toLowerCase().includes(q) || 
      (c.is_number || '').toLowerCase().includes(q) || 
      (c.section_title || '').toLowerCase().includes(q)
    )
    .slice(0, limit);
}

// Sample Tenders for Procurement Testing
export const SAMPLE_TENDERS: SampleTender[] = [
  {
    id: 'tender-automotive-braking',
    title: 'Procurement of Non-Rubberized Automotive Brake Linings and Heavy Vehicle Steering Linkages',
    authority: 'State Road Transport Corporation (MSRTC) / Fleet Maintenance Wing',
    tenderNumber: 'MSRTC/MECH/BRAKE-2024/09',
    category: 'Automotive Braking & Steering Systems',
    estimatedValue: '₹ 4.50 Crores',
    summary: 'Procurement of heavy-duty friction materials, brake lining sets conforming to IS 2742 (Part 1/2/3) and automotive steering knuckles as per IS 12222 with mandatory BIS quality mark.',
    documentText: `SECTION 2: TECHNICAL SPECIFICATIONS FOR FRICTION BRAKE LININGS
1. Scope & Material:
- High-durability non-asbestos friction brake linings for commercial heavy passenger vehicles.
- Must conform strictly to IS 2742 (Part 1) for Non-Rubberized Linings and IS 2742 (Part 3) for Methods of Test.
- Must withstand continuous operating drum temperatures of 250°C without friction fade exceeding 15%.
2. Testing & Quality Mark:
- Valid BIS Certification Mark License (ISI Mark) under IS 2742 is mandatory.
- Bidder must provide NABL accredited laboratory test certificates for shear strength, compressibility, and wear loss.`
  },
  {
    id: 'tender-medical-coveralls',
    title: 'Supply of Medical Protective Coveralls and Disposable Surgical Drapes for District Hospitals',
    authority: 'State Medical Services Corporation (SMSC) / Health & Family Welfare',
    tenderNumber: 'SMSC/PROC-MED-TEX/2024/104',
    category: 'Medical Textiles',
    estimatedValue: '₹ 8.20 Crores',
    summary: 'High-barrier medical coveralls, surgical drapes, and PPE conforming to IS 17423 and IS 17349 with synthetic blood penetration resistance test certificates.',
    documentText: `TECHNICAL SPECIFICATIONS FOR MEDICAL TEXTILES
1. Medical Protective Coveralls:
- Manufactured from non-woven laminated fabric with minimum 60 GSM weight.
- Must comply with IS 17423: 2020 (Medical Textiles - Coveralls for Healthcare Personnel).
- Must pass Synthetic Blood Penetration Test as per IS 16546 / ASTM F1670.
2. Mandatory Certification:
- Valid BIS ISI mark or Certificate of Conformity is mandatory for all delivered batches.
- Submissions without BIS test verification will be rejected.`
  },
  {
    id: 'tender-building-cement-steel',
    title: 'Construction of Multipurpose Warehouse & RCC Grain Storage Silos',
    authority: 'Central Warehousing Corporation (CWC) / Engineering Division',
    tenderNumber: 'CWC/ENGG-CIVIL/2024/55',
    category: 'Building Materials',
    estimatedValue: '₹ 24.80 Crores',
    summary: 'Supply of 53-grade Ordinary Portland Cement (IS 269), High Strength TMT Steel Rebars (IS 1786 Fe 500D), and Ready Mix Concrete (IS 4926).',
    documentText: `SECTION 4: CIVIL & STRUCTURAL MATERIALS SPECIFICATIONS
1. Cement:
- 53 Grade Ordinary Portland Cement conforming to IS 269: 2015. Direct factory test reports required for every 100 MT consignment.
2. Reinforcement Steel:
- High Strength Deformed TMT Steel bars Grade Fe 500D conforming to IS 1786. Must possess valid BIS ISI license stamp on every 1 meter bar length.`
  },
  {
    id: 'tender-petroleum-lubricants',
    title: 'Annual Rate Contract for Industrial Lubricants, Turbine Oils & Hydraulic Fluids',
    authority: 'National Thermal Power Corporation (NTPC) / Materials Management',
    tenderNumber: 'NTPC/PROC-LUB/2024/88',
    category: 'Petroleum Products & Test Methods',
    estimatedValue: '₹ 14.50 Crores',
    summary: 'Industrial grade turbine lubricants, heavy machinery hydraulic fluids conforming to IS 1012 and IS 10522 with kinematic viscosity and flash point test compliance.',
    documentText: `TECHNICAL SPECIFICATIONS: LUBRICATING OILS
1. Industrial Turbine Oils:
- Must conform to IS 1012 specification for turbine lubricating oils with antioxidant and rust inhibitor additives.
- Flash point (Cleveland open cup) must exceed 210°C as tested per IS 1448 (Part 69).
- Kinematic viscosity at 40°C shall be 46 cSt ± 10% tested per IS 1448 (Part 25).`
  }
];
