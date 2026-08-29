import { IndianStandard, SampleTender } from '../types';

export const DIVISION_META: Record<string, { name: string; icon: string; count: number; description: string }> = {
  ETD: {
    name: 'Electrotechnical Division',
    icon: 'Zap',
    count: 2450,
    description: 'Electrical power equipment, luminaires, solar PV, cables, transformers, batteries, and switchgear.'
  },
  CED: {
    name: 'Civil Engineering Division',
    icon: 'Building2',
    count: 3120,
    description: 'Structural concrete, cement, TMT reinforcement steel, building materials, geotechnical & seismic design.'
  },
  MED: {
    name: 'Mechanical Engineering Division',
    icon: 'Wrench',
    count: 2180,
    description: 'Pumps, compressors, fire fighting equipment, pipes, boilers, pressure vessels, HVAC & hydraulics.'
  },
  LITD: {
    name: 'Electronics & Information Technology',
    icon: 'Cpu',
    count: 1420,
    description: 'IT electronics, telecom, surveillance CCTV, smart cards, cybersecurity & audio-video equipment.'
  },
  MHD: {
    name: 'Medical Equipment & Hospital Planning',
    icon: 'Activity',
    count: 980,
    description: 'Medical devices, surgical masks, hospital ventilators, sterile implants, diagnostic machinery.'
  },
  FAD: {
    name: 'Food & Agriculture Division',
    icon: 'Wheat',
    count: 1890,
    description: 'Packaged drinking water, food processing machinery, agricultural implements, fertilizers & cold chains.'
  },
  TXD: {
    name: 'Textile Division',
    icon: 'Layers',
    count: 1340,
    description: 'Protective textiles, medical coveralls, geogrids, uniforms, technical textiles and geotextiles.'
  },
  CHID: {
    name: 'Chemical Division',
    icon: 'FlaskConical',
    count: 2670,
    description: 'Paints, coatings, adhesives, industrial chemicals, polymers, lubricants and water treatment reagents.'
  }
};

export const BIS_STANDARDS_DATABASE: IndianStandard[] = [
  // LUMINAIRES & LIGHTING
  {
    id: 'is-10322-p5-s3',
    isCode: 'IS 10322 (Part 5/Sec 3): 2012',
    shortCode: 'IS 10322',
    title: 'Luminaires - Part 5: Particular Requirements - Section 3: Luminaires for Road and Street Lighting',
    division: 'ETD',
    divisionName: 'Electrotechnical Division',
    committee: 'ETD 23 (Electric Lamps and Luminaires)',
    yearOfPublication: 2012,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Ministry of Heavy Industries & DPIIT QCO S.O. 2486(E)',
    ministry: 'Ministry of Commerce & Industry / MeitY',
    scope: 'Specifies safety and constructional requirements for luminaires for road, street, highway, and public outdoor area lighting, with supply voltages not exceeding 1000 V.',
    keyClauses: [
      {
        clauseNumber: 'Clause 4.4',
        title: 'Ingress Protection (IP Rating)',
        requirement: 'Optical and driver compartments of outdoor street lights must have minimum IP66 rating in accordance with IS/IEC 60529.',
        testMethod: 'Dust-tight chamber (Talcom powder test) & High-pressure water jet test (100 kPa).',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 5.1',
        title: 'Impact Resistance (IK Code)',
        requirement: 'Housing and optical diffuser must withstand mechanical impact rating of minimum IK08 (5 Joules impact energy).',
        testMethod: 'Spring hammer test / Free fall pendulum impact tester.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 6.3',
        title: 'Thermal Management & Operating Temperature',
        requirement: 'Luminaire shall operate continuously in ambient temperature ranging from -10°C to +50°C without exceeding LED junction limits.',
        testMethod: 'Endurance and thermal test at 45°C ambient inside draught-proof enclosure.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 7.2',
        title: 'Surge Protection Capability',
        requirement: 'Must include integrated Surge Protection Device (SPD) capable of withstanding minimum 10 kV / 5 kA surges for highway outdoor conditions.',
        testMethod: 'Combination wave surge generator (1.2/50 μs voltage, 8/20 μs current).',
        isCritical: true
      }
    ],
    testParameters: [
      'Ingress Protection IP66 (Dust & Water ingress)',
      'Impact Resistance IK08 / IK09',
      'Surge Protection up to 10 kV / 10 kA',
      'Insulation Resistance & High Voltage Breakdown test (2 kV AC)',
      'Photometric luminous efficacy (min 120 lm/W)',
      'Corrosion resistance (Salt spray test 500 hours)'
    ],
    relatedStandards: ['IS 16102 (Part 1 & 2)', 'IS 15885 (Part 2/Sec 13)', 'IS 16107 (Part 2/Sec 1)', 'IS/IEC 60529'],
    equivalentISO: 'IEC 60598-2-3:2011',
    gemClauseBoilerplate: 'The bidder must provide Luminaires strictly certified to IS 10322 (Part 5/Sec 3): 2012 carrying a valid BIS Standard Mark (ISI mark). The luminaire housing must be high-pressure die-cast aluminum with IP66 ingress rating and IK08 impact resistance. An in-built 10kV surge protection device and test reports from an NABL accredited laboratory are mandatory.',
    category: 'Electrical & Lighting',
    keywords: ['led', 'street light', 'luminaire', 'outdoor lighting', 'highway light', 'flood light', 'pole light', 'ip66', '90w']
  },
  {
    id: 'is-16102-p1-p2',
    isCode: 'IS 16102 (Part 1 & 2): 2014',
    shortCode: 'IS 16102',
    title: 'Self-Ballasted LED-Lamps for General Lighting Services - Part 1: Safety Requirements & Part 2: Performance Requirements',
    division: 'ETD',
    divisionName: 'Electrotechnical Division',
    committee: 'ETD 23',
    yearOfPublication: 2014,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'MeitY Compulsory Registration Scheme (CRS) Order',
    ministry: 'Ministry of Electronics & Information Technology',
    scope: 'Covers safety, interchangeability, lumen maintenance, and color rendering for self-ballasted LED lamps for domestic and commercial general lighting.',
    keyClauses: [
      {
        clauseNumber: 'Clause 8.1',
        title: 'Insulation Resistance and Electric Strength',
        requirement: 'Insulation resistance between current carrying parts and accessible metal body shall be at least 4 MΩ after humidity conditioning.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 9.2',
        title: 'Power Factor & Total Harmonic Distortion (THD)',
        requirement: 'Power factor must be ≥ 0.90 for ratings above 5W and THD ≤ 15% to prevent grid harmonics.',
        isCritical: true
      }
    ],
    testParameters: ['Lumen maintenance at 6000 hours', 'Color Rendering Index (CRI > 80)', 'Harmonic distortion THD < 15%', 'Safety against electrical shock'],
    relatedStandards: ['IS 10322', 'IS 15885', 'IS 16103'],
    equivalentISO: 'IEC 62560 & IEC 62612',
    gemClauseBoilerplate: 'Self-ballasted LED lamps supplied under this contract must possess valid BIS registration under MeitY CRS Scheme conforming to IS 16102 (Part 1 & 2) with CRI ≥ 80 and power factor ≥ 0.95.',
    category: 'Electrical & Lighting',
    keywords: ['led bulb', 'led lamp', 'indoor lighting', 'tubelight', 'b22', 'e27', 'downlight']
  },
  {
    id: 'is-15885-p2-s13',
    isCode: 'IS 15885 (Part 2/Sec 13): 2012',
    shortCode: 'IS 15885',
    title: 'Lamp Controlgear - Part 2: Particular Requirements - Section 13: D.C. or A.C. Supplied Electronic Controlgear for LED Modules',
    division: 'ETD',
    divisionName: 'Electrotechnical Division',
    committee: 'ETD 23',
    yearOfPublication: 2012,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'MeitY Compulsory Registration Scheme (CRS) Mandate',
    ministry: 'MeitY / Ministry of Power',
    scope: 'Covers constant current/constant voltage electronic drivers for LED modules operating on DC supplies up to 250V or AC supplies up to 1000V at 50/60 Hz.',
    keyClauses: [
      {
        clauseNumber: 'Clause 12.1',
        title: 'Over-voltage and Under-voltage Protection',
        requirement: 'Driver must automatically isolate or withstand overvoltages up to 320V AC continuous and up to 440V AC for 2 hours (phase-to-phase cut-off).',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 15.3',
        title: 'Efficiency & Power Factor',
        requirement: 'Driver efficiency shall exceed 88% with power factor greater than 0.95 under full load conditions.',
        isCritical: true
      }
    ],
    testParameters: ['Short circuit protection', 'Open circuit voltage limit', 'Creepage distances & clearances', 'Thermal thermal cut-off'],
    relatedStandards: ['IS 16102', 'IS 10322', 'IS 15885 (Part 1)'],
    equivalentISO: 'IEC 61347-2-13:2014',
    gemClauseBoilerplate: 'All LED Drivers shall be BIS registered under CRS conforming to IS 15885 (Part 2/Sec 13) with built-in high voltage cut-off up to 440V AC and driver efficiency ≥ 90%.',
    category: 'Electrical & Lighting',
    keywords: ['led driver', 'power supply', 'controlgear', 'ballast', 'smps', 'constant current driver']
  },

  // CIVIL & STRUCTURAL CONSTRUCTION
  {
    id: 'is-1786-2008',
    isCode: 'IS 1786: 2008 (Fourth Revision)',
    shortCode: 'IS 1786',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement - Specification (TMT Steel)',
    division: 'CED',
    divisionName: 'Civil Engineering Division',
    committee: 'CED 54 (Concrete Reinforcement)',
    yearOfPublication: 2008,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Ministry of Steel (Steel and Steel Products Quality Control Order 2020)',
    ministry: 'Ministry of Steel',
    scope: 'Specifies requirements for Thermo-Mechanically Treated (TMT) and cold twisted deformed steel bars and wires for concrete reinforcement in grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D, and Fe 600.',
    keyClauses: [
      {
        clauseNumber: 'Clause 8.1',
        title: 'Chemical Composition Limits (Fe 500D)',
        requirement: 'Carbon max 0.25%, Sulphur max 0.040%, Phosphorus max 0.040%, and combined S+P max 0.075% for enhanced ductility in earthquake-prone zones.',
        testMethod: 'Optical Emission Spectrometry (OES) / Chemical wet analysis as per IS 228.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 9.1',
        title: 'Mechanical Properties & Elongation',
        requirement: '0.2% Proof Stress min 500 N/mm², Ultimate Tensile Strength min 565 N/mm² (TS/YS ratio ≥ 1.10), and total elongation min 16.0%.',
        testMethod: 'Universal Testing Machine (UTM) Tensile Test as per IS 1608.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 9.3',
        title: 'Bend and Rebend Test',
        requirement: 'Bars shall show no rupture or cracks visible to unaided eye when bent through 180° followed by reverse bending after immersion in boiling water.',
        testMethod: 'Mandrel bending fixture with diameter 4d/5d.',
        isCritical: true
      }
    ],
    testParameters: [
      'Tensile Yield Strength (min 500 MPa for Fe 500D)',
      'Ultimate Tensile Strength / Yield ratio ≥ 1.10',
      'Elongation at gauge length (min 16% for 500D)',
      'Bend & Rebend crack test',
      'Nominal mass per meter (tolerance ±3% to ±7%)',
      'Rib geometry and Projected Rib Area (fR parameter)'
    ],
    relatedStandards: ['IS 456', 'IS 2062', 'IS 228', 'IS 1608'],
    equivalentISO: 'ISO 6935-2:2019',
    gemClauseBoilerplate: 'All reinforcement steel supplied must be primary producer manufactured TMT Fe 500D / Fe 550D grade carrying BIS Certification Mark (ISI) strictly conforming to IS 1786: 2008 with Sulphur & Phosphorus combined content ≤ 0.075% and manufacturer test certificates (MTC) for each rolling batch.',
    category: 'Civil & Construction',
    keywords: ['tmt', 'steel', 'rebar', 'reinforcement', 'fe 500d', 'fe 550d', 'concrete steel', 'hospital construction', 'building']
  },
  {
    id: 'is-456-2000',
    isCode: 'IS 456: 2000 (Reaffirmed 2021)',
    shortCode: 'IS 456',
    title: 'Plain and Reinforced Concrete - Code of Practice',
    division: 'CED',
    divisionName: 'Civil Engineering Division',
    committee: 'CED 2 (Cement and Concrete)',
    yearOfPublication: 2000,
    status: 'Active',
    isQCOMandatory: false,
    ministry: 'Ministry of Housing and Urban Affairs / CPWD',
    scope: 'Deals with the general structural use of plain and reinforced concrete in buildings and civil engineering structures. Establishes mix design, minimum cement content, cover, and design criteria.',
    keyClauses: [
      {
        clauseNumber: 'Table 5 (Clause 6.1)',
        title: 'Minimum Cement Content & Maximum Water-Cement Ratio',
        requirement: 'For severe exposure (coastal/industrial), minimum grade of reinforced concrete is M30 with minimum cement content of 320 kg/m³ and max w/c ratio 0.45.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 26.4',
        title: 'Nominal Concrete Cover to Reinforcement',
        requirement: 'Minimum nominal cover of 40 mm for columns, 45-50 mm for severe environmental exposure, and 50 mm for foundations.',
        isCritical: true
      }
    ],
    testParameters: ['Compressive cube strength (7 & 28 days)', 'Slump workability test', 'Water absorption test', 'Durability & carbonation depth'],
    relatedStandards: ['IS 1786', 'IS 269', 'IS 383', 'IS 516', 'IS 1199'],
    equivalentISO: 'ISO 19338 / ACI 318',
    gemClauseBoilerplate: 'All design, batching, casting, and curing of structural concrete shall strictly comply with IS 456: 2000 and CPWD Specifications with 28-day cube compressive strength verified per IS 516.',
    category: 'Civil & Construction',
    keywords: ['concrete', 'rcc', 'plain concrete', 'cement concrete', 'm25', 'm30', 'mix design', 'cpwd']
  },
  {
    id: 'is-269-2015',
    isCode: 'IS 269: 2015',
    shortCode: 'IS 269',
    title: 'Ordinary Portland Cement (33, 43 and 53 Grade) - Specification',
    division: 'CED',
    divisionName: 'Civil Engineering Division',
    committee: 'CED 2',
    yearOfPublication: 2015,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Cement (Quality Control) Order 2003 & Amendments',
    ministry: 'DPIIT / Ministry of Commerce & Industry',
    scope: 'Covers manufacture, chemical composition, physical properties, packaging and marking of 33 Grade, 43 Grade, and 53 Grade Ordinary Portland Cement.',
    keyClauses: [
      {
        clauseNumber: 'Clause 6.1',
        title: 'Compressive Strength Requirements (53 Grade)',
        requirement: '72±1 h strength ≥ 27.0 MPa; 168±2 h strength ≥ 37.0 MPa; 672±4 h (28 days) strength ≥ 53.0 MPa.',
        testMethod: 'Standard mortar cube compressive test as per IS 4031 (Part 6).',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 6.2',
        title: 'Setting Time and Soundness',
        requirement: 'Initial setting time not less than 30 minutes; Final setting time not more than 600 minutes; Le-Chatelier expansion ≤ 10 mm.',
        isCritical: true
      }
    ],
    testParameters: ['Fineness by Blaine Air Permeability (min 225 m²/kg)', 'Soundness by Le-Chatelier & Autoclave', 'Loss on Ignition (max 5.0%)', 'Insoluble residue (max 5.0%)'],
    relatedStandards: ['IS 456', 'IS 4031', 'IS 4032', 'IS 1489'],
    equivalentISO: 'EN 197-1 / ASTM C150',
    gemClauseBoilerplate: 'Cement supplied shall be fresh 53 Grade Ordinary Portland Cement conforming to IS 269: 2015 bearing valid BIS ISI mark, packed in airtight HDPE bags not older than 6 weeks from packing date.',
    category: 'Civil & Construction',
    keywords: ['opc 53', 'opc 43', 'cement', 'portland cement', 'concrete works', 'cpwd tender', 'building material']
  },
  {
    id: 'is-2062-2011',
    isCode: 'IS 2062: 2011',
    shortCode: 'IS 2062',
    title: 'Hot Rolled Medium and High Tensile Structural Steel - Specification',
    division: 'CED',
    divisionName: 'Civil Engineering Division',
    committee: 'CED 54 / MTD 4',
    yearOfPublication: 2011,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Steel and Steel Products (Quality Control) Order',
    ministry: 'Ministry of Steel',
    scope: 'Covers requirements for structural steel plates, sections, channels, beams, angles, flats, bars and hollow profiles for use in structural framing, bridges, transmission towers and industrial sheds.',
    keyClauses: [
      {
        clauseNumber: 'Table 1',
        title: 'Grade E250 / E350 Mechanical Strength',
        requirement: 'Tensile strength 410-540 MPa; Yield strength min 250 MPa (E250) or min 350 MPa (E350); Charpy V-Notch impact energy min 27 Joules at 0°C (Quality BR/BO).',
        isCritical: true
      }
    ],
    testParameters: ['Tensile Yield Strength', 'Charpy Impact Test at 0°C / -20°C', 'Bend test', 'Carbon equivalent CE max 0.42% for weldability'],
    relatedStandards: ['IS 800', 'IS 1852', 'IS 228'],
    equivalentISO: 'ISO 630 / EN 10025-2',
    gemClauseBoilerplate: 'Structural steel sections (beams, angles, channels, plates) shall strictly conform to IS 2062: 2011 Grade E250/E350 Quality BR/B0 with mandatory BIS ISI certification and Mill Test Certificates.',
    category: 'Civil & Construction',
    keywords: ['structural steel', 'steel plates', 'i-beam', 'channel', 'angle iron', 'shed', 'bridge steel', 'e250']
  },

  // SOLAR PHOTOVOLTAIC & RENEWABLE ENERGY
  {
    id: 'is-14286-2019',
    isCode: 'IS 14286 (Part 1 & 2): 2019 / IEC 61215: 2016',
    shortCode: 'IS 14286',
    title: 'Terrestrial Photovoltaic (PV) Modules - Design Qualification and Type Approval',
    division: 'ETD',
    divisionName: 'Electrotechnical Division',
    committee: 'ETD 28 (Solar Photovoltaic Energy Systems)',
    yearOfPublication: 2019,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'MNRE Solar Photovoltaics, Systems, Devices and Components Goods (Requirements for Compulsory Registration) Order',
    ministry: 'Ministry of New and Renewable Energy (MNRE)',
    scope: 'Specifies requirements for the design qualification and type approval of terrestrial crystalline silicon and thin-film photovoltaic (PV) modules suitable for long-term outdoor operation.',
    keyClauses: [
      {
        clauseNumber: 'Clause 10.11',
        title: 'Thermal Cycling & Humidity Freeze Test',
        requirement: 'Modules must undergo 200 thermal cycles (-40°C to +85°C) and 10 humidity-freeze cycles without power degradation exceeding 5%.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 10.17',
        title: 'Mechanical Load Test (Hail and Wind/Snow load)',
        requirement: 'Must withstand front surface static snow/wind pressure of 5400 Pa and rear surface wind load of 2400 Pa.',
        isCritical: true
      }
    ],
    testParameters: ['Electroluminescence (EL) crack inspection', 'PID (Potential Induced Degradation) resistance', 'Wet leakage current test', 'Hot-spot endurance test', 'Salt mist corrosion (IS 61701)'],
    relatedStandards: ['IS/IEC 61730 (Part 1 & 2)', 'IS 16221', 'IS 16046'],
    equivalentISO: 'IEC 61215-1:2016',
    gemClauseBoilerplate: 'Solar PV Modules must be listed on the Approved List of Models and Manufacturers (ALMM) by MNRE and certified to IS 14286 / IEC 61215 and IS/IEC 61730 under the BIS Compulsory Registration Scheme with 25-year linear performance warranty.',
    category: 'Solar & Renewable Energy',
    keywords: ['solar module', 'solar panel', 'pv module', 'monocrystalline', 'bifacial', 'mnre', 'almm', 'rooftop solar']
  },
  {
    id: 'is-16221-p2-2015',
    isCode: 'IS 16221 (Part 2): 2015 / IEC 62109-2: 2011',
    shortCode: 'IS 16221',
    title: 'Safety of Power Converters for Use in Photovoltaic Power Systems - Part 2: Particular Requirements for Inverters',
    division: 'ETD',
    divisionName: 'Electrotechnical Division',
    committee: 'ETD 28',
    yearOfPublication: 2015,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'MNRE Solar Equipment Compulsory Registration Scheme',
    ministry: 'MNRE',
    scope: 'Covers particular safety requirements for grid-connected, hybrid, and standalone inverters used in photovoltaic solar power installations up to 1500V DC.',
    keyClauses: [
      {
        clauseNumber: 'Clause 4.4',
        title: 'Anti-Islanding Protection (Grid Disconnection)',
        requirement: 'Inverter must automatically trip and disconnect from the grid within 2.0 seconds upon loss of utility power as per IEEE 1547 / IEC 62116.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 4.7',
        title: 'Harmonics and THD Injection',
        requirement: 'Total current harmonic distortion (THD) injected into the utility grid shall not exceed 3% at rated output.',
        isCritical: true
      }
    ],
    testParameters: ['Anti-islanding test', 'MPPT efficiency (> 99%)', 'Peak European efficiency (> 98%)', 'IP65 outdoor enclosure rating', 'Residual current monitoring (RCD)'],
    relatedStandards: ['IS 14286', 'IS/IEC 61730', 'IS/IEC 62116'],
    equivalentISO: 'IEC 62109-2:2011',
    gemClauseBoilerplate: 'Grid-tied Solar Inverters must possess valid BIS CRS Registration under IS 16221 (Part 2) / IEC 62109-2 and anti-islanding test certificate as per IEC 62116 with minimum IP65 outdoor enclosure protection.',
    category: 'Solar & Renewable Energy',
    keywords: ['solar inverter', 'grid tie inverter', 'string inverter', 'mppt', 'solar power plant', 'hybrid inverter']
  },

  // MECHANICAL & PUMPS
  {
    id: 'is-1520-1980',
    isCode: 'IS 1520: 1980 (Reaffirmed 2021)',
    shortCode: 'IS 1520',
    title: 'Horizontal Centrifugal Pumps for Clear, Cold Water - Specification',
    division: 'MED',
    divisionName: 'Mechanical Engineering Division',
    committee: 'MED 20 (Pumps and Turbines)',
    yearOfPublication: 1980,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Pumps for Clear Cold Water (Quality Control) Order 2023',
    ministry: 'Ministry of Heavy Industries / DPIIT',
    scope: 'Specifies requirements for horizontal centrifugal pumps (monobloc or bare-shaft) for pumping clean cold water for agricultural irrigation, municipal water supply, and building services.',
    keyClauses: [
      {
        clauseNumber: 'Clause 9.1',
        title: 'Hydraulic Performance and Pump Efficiency',
        requirement: 'Overall pump efficiency and head-capacity discharge curve must meet or exceed BEE Star Rating benchmarks without motor overload.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 12.2',
        title: 'Hydrostatic Pressure Test of Casing',
        requirement: 'Pump casing shall withstand hydrostatic test pressure of 1.5 times maximum working pressure or 2.0 times shut-off head for min 5 minutes without leakage.',
        isCritical: true
      }
    ],
    testParameters: ['Hydrostatic casing pressure test', 'Discharge head and flow rate test', 'NPSH (Net Positive Suction Head) cavitation test', 'Vibration and bearing temperature limits'],
    relatedStandards: ['IS 9079', 'IS 8034', 'IS 12615'],
    equivalentISO: 'ISO 9906:2012',
    gemClauseBoilerplate: 'Centrifugal clear water pumps must be BIS ISI marked under IS 1520: 1980 with BEE 5-Star efficiency rating, dynamic balance grade G2.5 per ISO 1940, and class F insulation electric motors conforming to IS 12615 IE3 efficiency.',
    category: 'Mechanical & Fluid Systems',
    keywords: ['pump', 'centrifugal pump', 'water pump', 'monobloc pump', 'water supply', 'irrigation pump', 'jal jeevan']
  },
  {
    id: 'is-1239-p1-2004',
    isCode: 'IS 1239 (Part 1): 2004',
    shortCode: 'IS 1239',
    title: 'Steel Tubes, Tubulars and Other Wrought Steel Fittings - Part 1: Steel Tubes (GI and MS Pipes)',
    division: 'MED',
    divisionName: 'Mechanical Engineering Division',
    committee: 'MTD 19 / MED 17',
    yearOfPublication: 2004,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Steel and Steel Products QCO (Ministry of Steel)',
    ministry: 'Ministry of Steel',
    scope: 'Covers electric resistance welded (ERW) and seamless mild steel tubes (black and galvanized) for water, gas, air, steam, fire fighting, and sewage lines.',
    keyClauses: [
      {
        clauseNumber: 'Clause 10.1',
        title: 'Hydrostatic Leak Test',
        requirement: 'Each tube shall be hydraulically tested at mill to a pressure of 5.0 MPa (50 bar) for min 5 seconds without showing leakage or sweating.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 11.2',
        title: 'Galvanizing Coating Mass (GI Pipes)',
        requirement: 'Zinc coating mass for galvanized tubes shall be minimum 400 g/m² determined per IS 6745 with uniform adherence.',
        isCritical: true
      }
    ],
    testParameters: ['Hydrostatic pressure 5 MPa', 'Galvanized zinc mass test (min 400 g/m²)', 'Flattening and bend test', 'Tensile yield and elongation'],
    relatedStandards: ['IS 1239 (Part 2)', 'IS 4736', 'IS 3589'],
    equivalentISO: 'BS 1387 / EN 10255',
    gemClauseBoilerplate: 'All Galvanized Iron (GI) / Mild Steel (MS) pipes must be Heavy/Medium Class ERW tubes bearing authentic BIS ISI mark conforming to IS 1239 (Part 1): 2004 with minimum zinc coating of 400 g/m².',
    category: 'Mechanical & Fluid Systems',
    keywords: ['gi pipe', 'ms pipe', 'steel tube', 'plumbing pipe', 'fire hydrant pipe', 'galvanized pipe', 'water pipeline']
  },

  // ELECTRONICS, IT & CYBERSECURITY
  {
    id: 'is-13252-p1-2010',
    isCode: 'IS 13252 (Part 1): 2010 / IEC 60950-1: 2005',
    shortCode: 'IS 13252',
    title: 'Information Technology Equipment - Safety - Part 1: General Requirements',
    division: 'LITD',
    divisionName: 'Electronics & Information Technology',
    committee: 'LITD 7 (Electronics and Safety)',
    yearOfPublication: 2010,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order - MeitY CRS',
    ministry: 'Ministry of Electronics & Information Technology (MeitY)',
    scope: 'Applicable to mains-powered or battery-powered information technology equipment, including computer servers, laptops, desktop PCs, POS terminals, biometric readers, printers, and network switches.',
    keyClauses: [
      {
        clauseNumber: 'Clause 2.1',
        title: 'Protection against Electric Shock and Energy Hazards',
        requirement: 'SELV (Safety Extra-Low Voltage) circuits and user-accessible conductive parts must prevent contact with hazardous live voltages.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 4.7',
        title: 'Resistance to Fire & Flammability',
        requirement: 'Enclosures, internal wiring, and PCB laminates must comply with flame retardancy class V-1 or V-0 per IS 12444 / UL 94.',
        isCritical: true
      }
    ],
    testParameters: ['Touch current and protective conductor current', 'Dielectric electric strength test (3 kV)', 'Temperature rise limits under peak CPU load', 'Flammability rating of plastics'],
    relatedStandards: ['IS 616', 'IS 16046', 'IS/IEC 62368-1'],
    equivalentISO: 'IEC 60950-1 / IEC 62368-1',
    gemClauseBoilerplate: 'All IT hardware (servers, desktop PCs, laptops, network equipment) must possess a valid R-Number registered under the Compulsory Registration Scheme (CRS) of BIS in compliance with IS 13252 (Part 1).',
    category: 'Electronics & IT',
    keywords: ['computer', 'server', 'laptop', 'desktop pc', 'network switch', 'meity', 'crs', 'it hardware', 'cctv']
  },
  {
    id: 'is-16046-p2-2018',
    isCode: 'IS 16046 (Part 2): 2018 / IEC 62133-2: 2017',
    shortCode: 'IS 16046',
    title: 'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes - Safety Requirements for Portable Sealed Secondary Lithium Cells and Batteries',
    division: 'ETD',
    divisionName: 'Electrotechnical & IT',
    committee: 'ETD 11 (Secondary Cells and Batteries)',
    yearOfPublication: 2018,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'MeitY Compulsory Registration Scheme (CRS)',
    ministry: 'MeitY / Ministry of Heavy Industries',
    scope: 'Specifies safety requirements and testing protocols for portable sealed secondary lithium-ion cells and battery packs used in portable electronics, UPS systems, telecom, and electric vehicle subsystems.',
    keyClauses: [
      {
        clauseNumber: 'Clause 7.3.2',
        title: 'External Short Circuit Test',
        requirement: 'Fully charged cell/battery is short-circuited at 55°C ambient; must not catch fire, explode, or exceed case temperature limits.',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 7.3.6',
        title: 'Overcharge and Thermal Abuse (130°C)',
        requirement: 'Battery pack Battery Management System (BMS) must prevent thermal runaway and explosive rupture under sustained overcharging.',
        isCritical: true
      }
    ],
    testParameters: ['Continuous charging safety', 'Drop test from 1.0 m', 'Thermal abuse (oven test at 130°C)', 'Crush and forced internal short circuit test'],
    relatedStandards: ['IS 16221', 'IS 13252', 'IS/IEC 62619'],
    equivalentISO: 'IEC 62133-2:2017',
    gemClauseBoilerplate: 'Lithium-ion battery packs and individual cells must be certified under BIS CRS conforming to IS 16046 (Part 2): 2018 / IEC 62133-2 with UN38.3 transport safety and smart BMS protection.',
    category: 'Electronics & IT',
    keywords: ['lithium battery', 'li-ion', 'battery pack', 'bms', 'ups battery', 'portable power', 'ev battery']
  },

  // MEDICAL & PPE
  {
    id: 'is-9473-2002',
    isCode: 'IS 9473: 2002',
    shortCode: 'IS 9473',
    title: 'Respiratory Protective Devices - Filtering Half Masks to Protect Against Particles - Specification (N95 / FFP2)',
    division: 'MHD',
    divisionName: 'Medical Equipment & Hospital Planning',
    committee: 'MHD 9 (Occupational Safety)',
    yearOfPublication: 2002,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Medical Equipment and Protective Textiles Quality Control Order',
    ministry: 'Ministry of Health & Family Welfare / Ministry of Textiles',
    scope: 'Specifies minimum requirements for particle-filtering half masks used as respiratory protective devices (Class FFP1, FFP2, and FFP3 equivalents of N95/N99) against solid and liquid aerosols.',
    keyClauses: [
      {
        clauseNumber: 'Clause 7.12',
        title: 'Sodium Chloride (NaCl) & Paraffin Oil Filter Penetration',
        requirement: 'Filter penetration shall not exceed 6% for FFP2 (equivalent to 94-95% filtration efficiency at 95 L/min air flow).',
        isCritical: true
      },
      {
        clauseNumber: 'Clause 7.16',
        title: 'Breathing Resistance (Inhalation & Exhalation)',
        requirement: 'Inhalation resistance shall not exceed 2.4 mbar at 95 L/min continuous flow; exhalation resistance max 3.0 mbar at 160 L/min.',
        isCritical: true
      }
    ],
    testParameters: ['Bacterial Filtration Efficiency (BFE > 99%)', 'Particulate Filtration Efficiency (PFE > 95%)', 'Differential pressure (breathability test)', 'Fluid resistance (synthetic blood penetration at 160 mmHg)'],
    relatedStandards: ['IS 16289', 'IS 17423'],
    equivalentISO: 'EN 149:2001+A1:2009 / NIOSH N95',
    gemClauseBoilerplate: 'Surgical/N95 Filtering Half Masks must carry authentic BIS ISI Certification under IS 9473: 2002 (Class FFP2) with particulate filtration efficiency ≥ 95% at 95 LPM flow rate and SITRA/DRDO lab test certifications.',
    category: 'Medical & Healthcare',
    keywords: ['n95 mask', 'respirator', 'surgical mask', 'ffp2', 'ppe', 'medical mask', 'hospital procurement']
  },
  {
    id: 'is-17423-2020',
    isCode: 'IS 17423: 2020',
    shortCode: 'IS 17423',
    title: 'Medical Textiles - Coveralls for Healthcare Workers - Specification',
    division: 'TXD',
    divisionName: 'Textile Division',
    committee: 'TXD 36 (Medical Textiles)',
    yearOfPublication: 2020,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Technical Textiles Quality Control Order 2023',
    ministry: 'Ministry of Textiles',
    scope: 'Covers requirements for disposable and reusable protective coveralls used by healthcare personnel and sanitary workers to prevent blood and body fluid pathogen transmission.',
    keyClauses: [
      {
        clauseNumber: 'Clause 5.1',
        title: 'Synthetic Blood Penetration Resistance',
        requirement: 'Fabric and taped seam joints must withstand synthetic blood penetration pressure of Class 3 (minimum 3.5 kPa) per ISO 16603 / ASTM F1670.',
        isCritical: true
      }
    ],
    testParameters: ['Synthetic blood penetration test', 'Seam strength test (min 100 N)', 'Tensile strength and tear resistance', 'Air and water vapor permeability'],
    relatedStandards: ['IS 9473', 'IS 17349', 'IS 17354'],
    equivalentISO: 'ISO 16603 / ISO 16604',
    gemClauseBoilerplate: 'Protective Coveralls must comply with IS 17423: 2020 Class 3 or higher with heat-sealed seams and certified NABL/SITRA blood penetration resistance test reports.',
    category: 'Medical & Healthcare',
    keywords: ['coverall', 'ppe suit', 'medical textile', 'hospital protective gear', 'hazmat', 'biomedical']
  },

  // FOOD, WATER & ENVIRONMENT
  {
    id: 'is-14543-2004',
    isCode: 'IS 14543: 2004 (Reaffirmed 2021)',
    shortCode: 'IS 14543',
    title: 'Packaged Drinking Water (Other than Packaged Natural Mineral Water) - Specification',
    division: 'FAD',
    divisionName: 'Food & Agriculture Division',
    committee: 'FAD 14 (Drinks and Carbonated Beverages)',
    yearOfPublication: 2004,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Food Safety and Standards Authority of India (FSSAI) & BIS Mandatory Order',
    ministry: 'Ministry of Consumer Affairs / FSSAI',
    scope: 'Prescribes quality criteria, permissible microbiological parameters, heavy metal limits, purification treatment methods, and hygienic packaging for packaged drinking water in bottles, jars, or pouches.',
    keyClauses: [
      {
        clauseNumber: 'Table 1',
        title: 'Physical and Chemical Limits',
        requirement: 'TDS 75-500 mg/L; Turbidity max 2 NTU; pH 6.5 to 8.5; Calcium max 75 mg/L; Magnesium max 30 mg/L; Nitrates max 45 mg/L.',
        isCritical: true
      },
      {
        clauseNumber: 'Table 2',
        title: 'Microbiological Safety Criteria',
        requirement: 'Total coliform bacteria, E. coli, Faecal streptococci, Pseudomonas aeruginosa, and Yeast/Mould must be completely ABSENT in 250 ml sample.',
        isCritical: true
      }
    ],
    testParameters: ['Microbiological culture (E. coli, Coliforms zero)', 'Heavy metals (Lead, Arsenic, Cadmium < 0.01 mg/L)', 'Pesticide residues (individual max 0.0001 mg/L)', 'Radioactive alpha/beta emitters'],
    relatedStandards: ['IS 13428', 'IS 10500', 'IS 3025'],
    equivalentISO: 'WHO Guidelines for Drinking-water Quality',
    gemClauseBoilerplate: 'Packaged drinking water must strictly possess valid BIS ISI Certification mark under IS 14543: 2004 along with FSSAI License, supplied in food-grade virgin PET/polycarbonate containers certified to IS 15410.',
    category: 'Food, Water & Agriculture',
    keywords: ['drinking water', 'packaged water', 'water plant', 'ro plant', 'water purification', 'bottled water', 'mineral water']
  },
  {
    id: 'is-10500-2012',
    isCode: 'IS 10500: 2012 (Second Revision)',
    shortCode: 'IS 10500',
    title: 'Drinking Water - Specification (Piped Municipal Water)',
    division: 'FAD',
    divisionName: 'Food & Agriculture / Civil',
    committee: 'FAD 14 / CED 24',
    yearOfPublication: 2012,
    status: 'Active',
    isQCOMandatory: true,
    qcoNotification: 'Jal Jeevan Mission & Central Pollution Control Board Guidelines',
    ministry: 'Ministry of Jal Shakti',
    scope: 'Prescribes requirements and methods of sampling and test for piped drinking water intended for human consumption supplied by municipal corporations and rural water grids.',
    keyClauses: [
      {
        clauseNumber: 'Table 1',
        title: 'Organoleptic and Chemical Standards',
        requirement: 'pH 6.5-8.5, Total Dissolved Solids max 500 mg/L (desirable) up to 2000 mg/L (permissible), Total hardness (as CaCO3) max 200 mg/L, Free residual chlorine min 0.2 mg/L.',
        isCritical: true
      }
    ],
    testParameters: ['Bacteriological purity', 'Residual chlorine (min 0.2 ppm)', 'Turbidity (< 1 NTU)', 'Fluoride (max 1.0 mg/L)', 'Arsenic (max 0.01 mg/L)'],
    relatedStandards: ['IS 14543', 'IS 3025', 'IS 1622'],
    equivalentISO: 'WHO Drinking Water Guidelines',
    gemClauseBoilerplate: 'The water treatment plant output must guarantee compliance with IS 10500: 2012 Drinking Water Specification with NABL lab certified water testing reports.',
    category: 'Food, Water & Agriculture',
    keywords: ['drinking water', 'piped water', 'jal jeevan', 'water treatment plant', 'wtp', 'chlorination', 'municipal water']
  }
];

export const SAMPLE_TENDERS: SampleTender[] = [
  {
    id: 'tender-smart-lighting',
    title: 'Supply, Installation & 5-Year O&M of 90W/120W Smart LED Street Lighting for Ring Road Phase-II',
    authority: 'Delhi Development Authority / Smart City Mission',
    tenderNumber: 'DDA/ELECT/2024/NIT-48',
    category: 'Electrical & Lighting',
    estimatedValue: '₹ 14.50 Crores',
    summary: 'Procurement of 12,500 units of 90W and 120W outdoor high-pressure die-cast aluminum LED luminaires with centralized CCMS automated dimming, 10kV surge protection, and IP66 ingress protection.',
    documentText: `TENDER NOTICE (NIT NO. DDA/ELECT/2024/NIT-48)
ITEM 1: Supply and commissioning of 90 Watt LED Street Light Luminaires for arterial road lighting.
Technical Specifications:
- System Wattage: 90 Watt ± 5%
- Luminous Efficacy: Not less than 130 Lumens/Watt at 5000K CCT.
- Housing: High Pressure Die Cast Aluminium alloy (LM6 or equivalent) with corrosion-resistant powder coating.
- Ingress Protection: IP66 for optical and controlgear compartment.
- Impact Resistance: IK 08 minimum.
- Driver: Constant current driver with THD < 10%, Power Factor > 0.98, Operating AC voltage range 120V to 300V AC, with high voltage cut-off up to 440V AC for 2 hours.
- Surge Protection: Internal/external Surge Protection Device (SPD) of minimum 10 kV / 10 kA capacity.
- Certification: Must have valid BIS Certificate / ISI Mark as per applicable Indian Standards and MeitY CRS registration for drivers. Bidder must submit NABL accredited test reports not older than 1 year.`
  },
  {
    id: 'tender-hospital-structural',
    title: 'Construction of 500-Bed Super Specialty Hospital Block (Civil, Structural Steel & RCC Works)',
    authority: 'Central Public Works Department (CPWD) / AIIMS Expansion',
    tenderNumber: 'CPWD/DELHI-CE-I/2024/221',
    category: 'Civil & Construction',
    estimatedValue: '₹ 185.00 Crores',
    summary: 'Civil structural framing, seismic zone IV ductile detailing, high strength TMT 500D steel rebars, 53 Grade Ordinary Portland Cement, Ready Mix Concrete M35/M40 grade, and structural steel sections.',
    documentText: `SECTION 3: TECHNICAL SPECIFICATIONS (CIVIL & STRUCTURAL)
1. Reinforcement Steel:
All steel reinforcement bars shall be Thermo-Mechanically Treated (TMT) bars of Grade Fe 500D conforming to IS 1786. Steel must be procured directly from primary integrated steel producers (SAIL, TATA, JSW, JSPL, RINL). Combined Sulphur and Phosphorus content must not exceed 0.075%.
2. Cement:
Ordinary Portland Cement (OPC) 53 Grade conforming to IS 269: 2015 / IS 12269. PPC may be used only with prior approval for non-structural masonry.
3. Concrete Mix & Workmanship:
Ready Mix Concrete (RMC) of grades M30, M35, and M40 designed as per IS 10262 and placed conforming to IS 456. Minimum cement content and water-cement ratios shall comply with Table 5 of IS 456 for Severe environmental exposure.
4. Structural Steel:
Hot rolled steel plates, angles, channels, and built-up box sections conforming to IS 2062 Grade E250/E350 Quality BR/B0 with complete ultrasonic testing for plate thickness above 25 mm.`
  },
  {
    id: 'tender-solar-rooftop',
    title: 'Design, Supply, Installation & Commissioning of 2.5 MW Grid-Connected Rooftop Solar PV Plants',
    authority: 'Solar Energy Corporation of India (SECI) / Indian Railways',
    tenderNumber: 'SECI/C&P/RTS/2024/78',
    category: 'Solar & Renewable Energy',
    estimatedValue: '₹ 11.20 Crores',
    summary: 'Mono-PERC / Bifacial Solar PV Modules (minimum 540Wp), 50kW/100kW grid-tied string inverters with anti-islanding protection, IP65 enclosures, aluminum mounting structures, and remote monitoring.',
    documentText: `TECHNICAL SPECIFICATIONS FOR ROOFTOP SOLAR PV SYSTEM
1. Solar Photovoltaic Modules:
- Crystalline Silicon Mono-PERC / Bifacial modules of minimum 540 Wp rated output at STC.
- Must be listed in MNRE's Approved List of Models and Manufacturers (ALMM).
- Must be certified to IS 14286 / IEC 61215 for design qualification and IS/IEC 61730 (Part 1 & 2) for safety qualification under BIS CRS scheme.
- Module degradation shall not exceed 2.0% in Year 1 and 0.55% per year from Year 2 to Year 25.
2. Grid-Tied Inverters:
- High efficiency transformerless string inverters with multiple MPPT trackers.
- Certification conforming to IS 16221 (Part 2) / IEC 62109-2 and islanding protection testing per IEC 62116.
- Efficiency > 98.5%, Total Harmonic Distortion (THD) < 3%, IP65 ingress protection.`
  },
  {
    id: 'tender-fire-pumps',
    title: 'Supply and Erection of Fire Fighting Hydrant System, Centrifugal Pumps & Sprinkler Network',
    authority: 'Airports Authority of India (AAI) / Terminal Expansion Project',
    tenderNumber: 'AAI/ENGG-ELECT/FIRE-2024/11',
    category: 'Mechanical & Fluid Systems',
    estimatedValue: '₹ 8.75 Crores',
    summary: 'Electric motor driven main fire pump (2850 LPM @ 8.8 bar), Diesel engine backup fire pump, Jockey pump, Heavy class ERW MS/GI piping network, landing valves, and hose reels.',
    documentText: `FIRE PROTECTION SYSTEM SPECIFICATIONS
1. Main Fire Pumps:
- Horizontal split-case or end-suction centrifugal pump delivering 2850 LPM at 88 meters rated head.
- Pump must conform to IS 1520 and NFPA 20 requirements, with casing hydrostatic test pressure of 1.5 times shut-off head.
- Driven by squirrel cage induction motor with IE3 energy efficiency as per IS 12615.
2. Piping and Valves:
- Heavy Class Mild Steel ERW pipes conforming to IS 1239 (Part 1) for sizes up to 150 mm NB and IS 3589 for sizes above 150 mm NB.
- Galvanized coating as per IS 4736 for all outdoor and wet installations.
- Landing valves, branch pipes, and instantaneous delivery couplings conforming to IS 903 and IS 5290 with ISI marking.`
  }
];
