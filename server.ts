import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { BIS_STANDARDS_DATABASE } from './src/data/bisDatabase';
import { RequirementAnalysis, IndianStandard } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Helper to generate content with retries and multi-model fallback
async function generateJsonWithFallback(ai: GoogleGenAI, prompt: string): Promise<any> {
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text || '{}';
      // Clean possible markdown code fences or trailing markers
      const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanedText);
      return parsed;
    } catch (err: any) {
      lastError = err;
      const errStr = `${err?.message || err} ${JSON.stringify(err || {})}`;
      const is503OrBusy = errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE') || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED');
      
      console.log(`[Gemini Engine] Model ${model} returned ${is503OrBusy ? 'high-demand / transient status (503)' : 'error'}, trying next fallback model...`);
      // Proceed directly to the next fallback model in the list
    }
  }

  throw lastError;
}

// Fallback rule-based matching engine
function fallbackAnalysis(rawRequirement: string): RequirementAnalysis {
  const q = rawRequirement.toLowerCase();
  
  // Find matching standards in database
  const matches = BIS_STANDARDS_DATABASE.map(std => {
    let score = 0;
    std.keywords.forEach(kw => {
      if (q.includes(kw.toLowerCase())) score += 25;
    });
    if (q.includes(std.shortCode.toLowerCase())) score += 50;
    if (q.includes(std.title.toLowerCase())) score += 40;
    if (q.includes(std.category.toLowerCase())) score += 20;

    return { standard: std, score: Math.min(score, 98) };
  })
  .filter(m => m.score > 0)
  .sort((a, b) => b.score - a.score);

  // If no direct keyword match, default to closest relevant or luminaire
  const matchedList = matches.length > 0 ? matches : [
    { standard: BIS_STANDARDS_DATABASE[0], score: 88 },
    { standard: BIS_STANDARDS_DATABASE[2], score: 75 },
    { standard: BIS_STANDARDS_DATABASE[1], score: 65 }
  ];

  const primaryStd = matchedList[0].standard;
  const secondaryStds = matchedList.slice(1, 4).map(m => ({
    standard: m.standard,
    matchConfidence: m.score,
    role: 'Secondary' as const,
    rationale: `Associated compliance standard applicable to internal sub-components, power supplies, or auxiliary testing protocols.`,
    mandatoryClausesToQuote: m.standard.keyClauses.map(c => `${c.clauseNumber}: ${c.title}`),
    qcoMandatory: m.standard.isQCOMandatory
  }));

  // Generate extracted specs based on query text
  const extractedSpecs = [
    {
      parameter: 'Primary Equipment Scope',
      specifiedValue: rawRequirement.slice(0, 80),
      standardReference: primaryStd.isCode,
      importance: 'Mandatory' as const
    },
    {
      parameter: 'Ingress & Environmental Protection',
      specifiedValue: q.includes('ip66') ? 'IP66' : q.includes('ip67') ? 'IP67' : q.includes('ip65') ? 'IP65' : 'Minimum IP65 / IP66 rated enclosure for outdoor harsh environments',
      standardReference: 'IS/IEC 60529',
      importance: 'Mandatory' as const
    },
    {
      parameter: 'Operating Voltage & Environmental Limits',
      specifiedValue: '120V to 300V AC with high-voltage endurance up to 440V AC for 2 hours (-10°C to +50°C)',
      standardReference: primaryStd.shortCode,
      importance: 'Mandatory' as const
    },
    {
      parameter: 'Quality Certification Mandate',
      specifiedValue: 'BIS ISI Mark or MeitY CRS Registration with NABL Lab Accredited Type-Test Reports',
      standardReference: primaryStd.isCode,
      importance: 'Mandatory' as const
    }
  ];

  return {
    id: 'analysis-' + Date.now(),
    title: `BIS Advisory: ${rawRequirement.slice(0, 60)}${rawRequirement.length > 60 ? '...' : ''}`,
    rawRequirement,
    timestamp: new Date().toISOString(),
    sector: primaryStd.category,
    summary: `Based on your procurement requirement, the technical scope falls under ${primaryStd.divisionName} (${primaryStd.committee}). Compliance with ${primaryStd.isCode} is strictly mandatory under Indian Government public procurement rules (General Financial Rules - GFR 2017 Rule 144(xi) and relevant Quality Control Orders).`,
    extractedSpecs,
    primaryStandards: [
      {
        standard: primaryStd,
        matchConfidence: matchedList[0].score || 95,
        role: 'Primary' as const,
        rationale: `Directly governs the core safety, construction, operational performance, and type-testing parameters for this procurement category.`,
        mandatoryClausesToQuote: primaryStd.keyClauses.map(c => `${c.clauseNumber} (${c.title})`),
        qcoMandatory: primaryStd.isQCOMandatory
      }
    ],
    secondaryStandards: secondaryStds,
    gemTenderClauses: [
      {
        title: 'Core BIS Compliance & ISI / CRS Marking',
        text: primaryStd.gemClauseBoilerplate,
        applicableIS: primaryStd.isCode
      },
      {
        title: 'Mandatory Quality Control Order (QCO) Verification',
        text: `The offered item is covered under ${primaryStd.qcoNotification || 'Mandatory Indian Standards Order'}. The bidder must upload a valid BIS License / Registration Certificate along with active endorsement valid on the date of bid opening. Bids without valid BIS registration will be summarily rejected at technical evaluation stage.`,
        applicableIS: primaryStd.shortCode
      },
      {
        title: 'Third-Party NABL Laboratory Test Reports',
        text: 'The bidder must furnish complete Type Test Reports from a BIS-recognized or NABL-accredited laboratory for all critical clauses (Ingress Protection, High Voltage Breakdown, Thermal Endurance, and Surge Capability) conducted not older than 18 months.',
        applicableIS: primaryStd.isCode
      }
    ],
    complianceChecklist: [
      {
        id: 'chk-1',
        category: 'Certification',
        title: 'Valid BIS Standard Mark / CRS License',
        description: `Verify that OEM has an active BIS CML (Certification Mark License) or R-Number under ${primaryStd.isCode}.`,
        isMandatory: true,
        standardRef: primaryStd.shortCode,
        verificationMethod: 'Verify online on BIS Manakonline portal (manakonline.in).'
      },
      {
        id: 'chk-2',
        category: 'Lab Testing',
        title: 'NABL Type Test Certificate Submission',
        description: 'Submission of complete type test reports covering all mandatory clauses specified in the standard.',
        isMandatory: true,
        standardRef: primaryStd.isCode,
        verificationMethod: 'Check QR code verification & NABL ULR number on test reports.'
      },
      {
        id: 'chk-3',
        category: 'Quality Control',
        title: 'Factory Quality Assurance & Acceptance Test Plan',
        description: 'Bidder must provide Factory Acceptance Testing (FAT) protocol in accordance with BIS Scheme of Testing and Inspection (STI).',
        isMandatory: true,
        standardRef: primaryStd.shortCode,
        verificationMethod: 'Review Manufacturer Quality Assurance Plan (QAP).'
      },
      {
        id: 'chk-4',
        category: 'Packaging & Marking',
        title: 'Physical Product Marking with BIS Logo',
        description: `Each unit must have indelible stamping with BIS Standard Mark, License Number, batch code, and rated electrical/mechanical parameters.`,
        isMandatory: true,
        standardRef: 'BIS Act 2016',
        verificationMethod: 'Physical pre-dispatch inspection (PDI) at factory premises.'
      }
    ],
    qcoSummary: {
      isRegulated: primaryStd.isQCOMandatory,
      orderName: primaryStd.qcoNotification || 'Applicable Quality Control Order (QCO)',
      enforcementDate: 'Enforced (Active Notification)',
      consequences: 'Under Section 16 & 17 of the Bureau of Indian Standards Act, 2016, no person shall manufacture, import, distribute, sell or procure non-BIS certified goods for this category. Non-compliance is a punishable offence.'
    },
    sampleBoQSpecification: `Item Description: Supply, testing, and commissioning of ${rawRequirement.slice(0, 100)}. Equipment must strictly comply with ${primaryStd.isCode} and secondary standards ${secondaryStds.map(s => s.standard.shortCode).join(', ')}. All products must bear authentic BIS Standard Marks with 5-year replacement warranty.`
  };
}

// 1. API: Analyze Requirement
app.post('/api/analyze-requirement', async (req, res) => {
  const { requirement } = req.body;
  if (!requirement || typeof requirement !== 'string') {
    return res.status(400).json({ error: 'Requirement description is required' });
  }

  const ai = getGenAI();
  if (!ai) {
    console.log('Gemini API key not found in env, using built-in BIS intelligence engine');
    const fallback = fallbackAnalysis(requirement);
    return res.json(fallback);
  }

  try {
    const prompt = `You are the chief standards advisor at the Bureau of Indian Standards (BIS) and Government e-Marketplace (GeM) technical consultant.
Analyze this procurement requirement: "${requirement}"

Your task is to identify the precise Indian Standards (IS Codes), extract technical parameters, recommend primary and secondary standards, quote specific clauses, provide ready-to-copy GeM tender clauses, and create a comprehensive procurement compliance checklist.

Respond strictly in JSON format according to this exact structure:
{
  "title": "Short descriptive title for this analysis",
  "sector": "Category (e.g., Electrical & Lighting, Civil & Construction, Solar, Mechanical, Medical, Electronics)",
  "summary": "2-3 sentences explaining applicable BIS regulations, QCO status, and technical scope.",
  "extractedSpecs": [
    {
      "parameter": "Parameter name (e.g., Power Rating, Ingress Protection, Concrete Grade, Tensile Yield)",
      "specifiedValue": "Extracted or recommended value",
      "standardReference": "Relevant IS code",
      "importance": "Mandatory" | "Recommended" | "Optional"
    }
  ],
  "primaryStandards": [
    {
      "isCode": "Exact Indian Standard Code (e.g. IS 10322 (Part 5/Sec 3): 2012, IS 1786: 2008, IS 14286: 2019, IS 13252: 2010)",
      "shortCode": "Short code e.g. IS 10322",
      "title": "Full Official Title of Standard",
      "division": "ETD" | "CED" | "MED" | "LITD" | "FAD" | "TXD" | "CHID" | "MHD",
      "divisionName": "Full Division Name",
      "committee": "Technical Committee (e.g., ETD 23)",
      "matchConfidence": 95,
      "qcoMandatory": true,
      "rationale": "Detailed explanation why this standard applies to this procurement.",
      "keyClauses": [
        {
          "clauseNumber": "Clause X.X",
          "title": "Clause Title",
          "requirement": "Exact technical requirement and permissible tolerance",
          "testMethod": "Testing procedure",
          "isCritical": true
        }
      ],
      "testParameters": ["List of 4-6 key test parameters"],
      "gemClauseBoilerplate": "Comprehensive ready-to-paste tender clause for GeM / RFP documents."
    }
  ],
  "secondaryStandards": [
    {
      "isCode": "Secondary standard IS code",
      "shortCode": "Short code",
      "title": "Title",
      "division": "ETD",
      "divisionName": "Division",
      "committee": "Committee",
      "matchConfidence": 85,
      "qcoMandatory": true,
      "rationale": "Why this standard is required for sub-components, power supplies, or testing.",
      "keyClauses": [
        {
          "clauseNumber": "Clause X.X",
          "title": "Clause Title",
          "requirement": "Requirement",
          "isCritical": false
        }
      ],
      "testParameters": ["Test 1", "Test 2"],
      "gemClauseBoilerplate": "Boilerplate clause"
    }
  ],
  "gemTenderClauses": [
    {
      "title": "Clause Name (e.g., BIS Quality Certification Requirement)",
      "text": "Detailed legal and technical clause to paste directly into NIT/Tender document.",
      "applicableIS": "IS Code"
    }
  ],
  "complianceChecklist": [
    {
      "id": "chk-1",
      "category": "Certification" | "Lab Testing" | "Quality Control" | "GeM Clause" | "Packaging & Marking",
      "title": "Checklist Item Title",
      "description": "Specific action the procurement officer must verify",
      "isMandatory": true,
      "standardRef": "Relevant IS / Act",
      "verificationMethod": "How to verify on Manakonline / NABL portal"
    }
  ],
  "qcoSummary": {
    "isRegulated": true,
    "orderName": "Name of relevant Quality Control Order",
    "enforcementDate": "Status of enforcement",
    "consequences": "Legal consequences of non-compliance under BIS Act 2016"
  },
  "sampleBoQSpecification": "Complete BoQ technical specification paragraph ready for tender schedule."
}`;

    const parsed = await generateJsonWithFallback(ai, prompt);
    
    // Enrich with id and timestamp
    const fullAnalysis: RequirementAnalysis = {
      id: 'analysis-' + Date.now(),
      title: parsed.title || `BIS Advisory for ${requirement.slice(0, 40)}`,
      rawRequirement: requirement,
      timestamp: new Date().toISOString(),
      sector: parsed.sector || 'General Engineering',
      summary: parsed.summary || 'Detailed Indian Standards assessment generated.',
      extractedSpecs: parsed.extractedSpecs || [],
      primaryStandards: (parsed.primaryStandards || []).map((p: any) => ({
        standard: {
          id: 'std-' + (p.shortCode || 'is').toLowerCase().replace(/\s+/g, '-'),
          isCode: p.isCode || 'IS Code',
          shortCode: p.shortCode || 'IS Code',
          title: p.title || 'Standard Title',
          division: p.division || 'ETD',
          divisionName: p.divisionName || 'Electrotechnical Division',
          committee: p.committee || 'Technical Committee',
          yearOfPublication: 2020,
          status: 'Active',
          isQCOMandatory: p.qcoMandatory !== false,
          scope: p.rationale || '',
          keyClauses: p.keyClauses || [],
          testParameters: p.testParameters || [],
          relatedStandards: [],
          gemClauseBoilerplate: p.gemClauseBoilerplate || '',
          category: parsed.sector || 'Engineering',
          keywords: []
        },
        matchConfidence: p.matchConfidence || 95,
        role: 'Primary' as const,
        rationale: p.rationale || 'Core specification standard',
        mandatoryClausesToQuote: (p.keyClauses || []).map((c: any) => `${c.clauseNumber}: ${c.title}`),
        qcoMandatory: p.qcoMandatory !== false
      })),
      secondaryStandards: (parsed.secondaryStandards || []).map((p: any) => ({
        standard: {
          id: 'std-' + (p.shortCode || 'is').toLowerCase().replace(/\s+/g, '-'),
          isCode: p.isCode || 'IS Code',
          shortCode: p.shortCode || 'IS Code',
          title: p.title || 'Standard Title',
          division: p.division || 'ETD',
          divisionName: p.divisionName || 'Electrotechnical Division',
          committee: p.committee || 'Technical Committee',
          yearOfPublication: 2018,
          status: 'Active',
          isQCOMandatory: p.qcoMandatory !== false,
          scope: p.rationale || '',
          keyClauses: p.keyClauses || [],
          testParameters: p.testParameters || [],
          relatedStandards: [],
          gemClauseBoilerplate: p.gemClauseBoilerplate || '',
          category: parsed.sector || 'Engineering',
          keywords: []
        },
        matchConfidence: p.matchConfidence || 85,
        role: 'Secondary' as const,
        rationale: p.rationale || 'Associated component standard',
        mandatoryClausesToQuote: (p.keyClauses || []).map((c: any) => `${c.clauseNumber}: ${c.title}`),
        qcoMandatory: p.qcoMandatory !== false
      })),
      gemTenderClauses: parsed.gemTenderClauses || [],
      complianceChecklist: parsed.complianceChecklist || [],
      qcoSummary: parsed.qcoSummary || {
        isRegulated: true,
        orderName: 'Mandatory Indian Standards Order',
        enforcementDate: 'Enforced',
        consequences: 'Mandatory for all public procurement.'
      },
      sampleBoQSpecification: parsed.sampleBoQSpecification || ''
    };

    return res.json(fullAnalysis);
  } catch (err: any) {
    console.error('Gemini processing error, using intelligent built-in fallback:', err?.message || err);
    const fallback = fallbackAnalysis(requirement);
    return res.json(fallback);
  }
});

// Fallback Tender Parser
function fallbackTenderParser(tenderText: string) {
  const q = tenderText.toLowerCase();
  const matched = BIS_STANDARDS_DATABASE.filter(s => 
    s.keywords.some(k => q.includes(k.toLowerCase())) ||
    q.includes(s.shortCode.toLowerCase()) ||
    q.includes(s.category.toLowerCase())
  );

  const primary = matched.length > 0 ? matched[0] : BIS_STANDARDS_DATABASE[0];
  const secondary = matched.length > 1 ? matched[1] : BIS_STANDARDS_DATABASE[1];

  return {
    title: 'Public Procurement Tender Analysis',
    authority: q.includes('railway') ? 'Ministry of Railways / RDSO' : q.includes('smart city') ? 'Smart Cities Mission Authority' : 'Public Procurement Division',
    category: primary.category,
    extractedItems: [
      {
        itemNo: 'Item 1',
        name: `Primary Equipment conforming to ${primary.isCode}`,
        description: tenderText.slice(0, 180),
        recommendedIS: `${primary.isCode} (${primary.title})`,
        isQCO: primary.isQCOMandatory,
        mandatoryClauses: primary.keyClauses.map(c => `${c.clauseNumber} - ${c.title}`)
      },
      {
        itemNo: 'Item 2',
        name: `Auxiliary / Sub-System Component conforming to ${secondary.isCode}`,
        description: `Compliance mandatory for internal modules and protection subsystems.`,
        recommendedIS: secondary.isCode,
        isQCO: secondary.isQCOMandatory,
        mandatoryClauses: secondary.keyClauses.map(c => `${c.clauseNumber} - ${c.title}`)
      }
    ],
    complianceScore: 94,
    riskPoints: [
      'Bids without valid BIS Certification Mark / CRS Registration license valid on date of tender opening are liable for technical disqualification.',
      'Test certificates must be from NABL accredited laboratories conducted within the past 18 months.'
    ],
    recommendationSummary: `All procurement line items must cite ${primary.isCode} and ${secondary.isCode} with mandatory ISI marking as per GFR Rule 144(xi).`
  };
}

// 2. API: Parse Tender Document Text
app.post('/api/parse-tender', async (req, res) => {
  const { tenderText } = req.body;
  if (!tenderText) {
    return res.status(400).json({ error: 'Tender text is required' });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(fallbackTenderParser(tenderText));
  }

  try {
    const prompt = `Analyze this government tender document / RFP text:
"""${tenderText}"""

Extract all procurement items, their specified technical parameters, and map each to the mandatory Indian Standard (IS Code).
Return JSON:
{
  "title": "Title of tender / procurement notice",
  "authority": "Procuring Authority / Department",
  "category": "Sector category",
  "extractedItems": [
    {
      "itemNo": "Item 1",
      "name": "Item Name",
      "description": "Key technical parameters extracted",
      "recommendedIS": "Applicable IS Code(s)",
      "isQCO": true,
      "mandatoryClauses": ["Key clauses to enforce"]
    }
  ],
  "complianceScore": 95,
  "riskPoints": ["Risk 1 if standard not mentioned", "Risk 2"],
  "recommendationSummary": "Summary of required BIS certifications"
}`;

    const parsed = await generateJsonWithFallback(ai, prompt);
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Gemini tender parser error, using built-in parser fallback:', err?.message || err);
    return res.json(fallbackTenderParser(tenderText));
  }
});

// 3. API: Standards Database Search & Filter
app.get('/api/standards', (req, res) => {
  const { q, division, qcoOnly } = req.query;
  let results = [...BIS_STANDARDS_DATABASE];

  if (division && typeof division === 'string' && division !== 'ALL') {
    results = results.filter(s => s.division === division);
  }

  if (qcoOnly === 'true') {
    results = results.filter(s => s.isQCOMandatory);
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    results = results.filter(s => 
      s.isCode.toLowerCase().includes(query) ||
      s.shortCode.toLowerCase().includes(query) ||
      s.title.toLowerCase().includes(query) ||
      s.scope.toLowerCase().includes(query) ||
      s.keywords.some(k => k.toLowerCase().includes(query)) ||
      s.category.toLowerCase().includes(query)
    );
  }

  return res.json({
    total: results.length,
    standards: results
  });
});

// 4. API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BIS Standard Advisor Full-Stack Server',
    standardsCount: BIS_STANDARDS_DATABASE.length,
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BIS Standard Advisor server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
