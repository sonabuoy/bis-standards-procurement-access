import React, { useState } from 'react';
import { 
  X, 
  FileUp, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle, 
  FileCheck2, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { SAMPLE_TENDERS } from '../data/bisDatabase';
import { 
  SampleTender, 
  TenderProcessingResult, 
  TenderProcurementItem, 
  RequirementAnalysis 
} from '../types';

interface TenderUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnalysis: (analysis: RequirementAnalysis) => void;
  onAnalyzeRequirement?: (query: string) => void;
}

export const TenderUploadModal: React.FC<TenderUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectAnalysis,
  onAnalyzeRequirement
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste' | 'sample'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleTender>(SAMPLE_TENDERS[0]);
  
  // Ingestion & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tenderResult, setTenderResult] = useState<TenderProcessingResult | null>(null);

  // Per-item analysis loading states: itemId -> boolean
  const [itemAnalyzingMap, setItemAnalyzingMap] = useState<Record<string, boolean>>({});
  // Batch analyzing flag
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size limit: 15 MB
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 15 MB limit. Please select a smaller document.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const resetAll = () => {
    setTenderResult(null);
    setSelectedFile(null);
    setPastedText('');
    setErrorMessage(null);
    setIsProcessing(false);
    setIsAnalyzingAll(false);
  };

  // 1. Ingest & Process Document (PDF, DOCX, Pasted Text, or Sample)
  const handleIngestDocument = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStep('Validating and extracting document server-side...');

    try {
      let response: Response;

      if (activeMode === 'upload') {
        if (!selectedFile) {
          setErrorMessage('Please select a PDF or DOCX file to upload.');
          setIsProcessing(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('documentName', selectedFile.name);

        setProcessingStep(`Parsing ${selectedFile.name} and identifying discrete items...`);
        response = await fetch('/api/upload-tender', {
          method: 'POST',
          body: formData,
        });
      } else if (activeMode === 'paste') {
        if (!pastedText.trim()) {
          setErrorMessage('Please paste the tender RFP or specification text.');
          setIsProcessing(false);
          return;
        }

        setProcessingStep('Extracting procurement specifications...');
        response = await fetch('/api/upload-tender', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pastedText: pastedText.trim(),
            documentName: 'Pasted_Tender_Specification.txt'
          }),
        });
      } else {
        // Sample Mode
        setProcessingStep(`Ingesting sample: ${selectedSample.title}...`);
        response = await fetch('/api/upload-tender', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pastedText: selectedSample.documentText,
            documentName: `${selectedSample.category} - Tender RFP.txt`
          }),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data: TenderProcessingResult = await response.json();
      setTenderResult(data);
    } catch (err: any) {
      console.error('[Tender Upload Modal Error]', err);
      setErrorMessage(err.message || 'An unexpected error occurred during document processing.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // 2. Analyze Single Tender Item through the verified recommendation pipeline
  const handleAnalyzeItem = async (item: TenderProcurementItem) => {
    setItemAnalyzingMap(prev => ({ ...prev, [item.id]: true }));
    try {
      const response = await fetch('/api/analyze-tender-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errData.error || 'Failed to analyze tender item');
      }

      const resData = await response.json();
      const updatedItem: TenderProcurementItem = resData.item;

      // Update the tender result state with the analyzed item
      setTenderResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(it => it.id === updatedItem.id ? updatedItem : it)
        };
      });
    } catch (err: any) {
      console.error(`Error analyzing item ${item.id}:`, err);
      setTenderResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(it => it.id === item.id ? { ...it, error: err.message || 'Analysis failed' } : it)
        };
      });
    } finally {
      setItemAnalyzingMap(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // 3. Batch Analyze All Items
  const handleAnalyzeAllItems = async () => {
    if (!tenderResult || tenderResult.items.length === 0) return;
    setIsAnalyzingAll(true);

    try {
      const response = await fetch('/api/analyze-tender-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: tenderResult.items })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Batch analysis failed' }));
        throw new Error(errData.error || 'Failed to analyze all items');
      }

      const resData = await response.json();
      setTenderResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: resData.items
        };
      });
    } catch (err: any) {
      console.error('Batch analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze all tender items');
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-md max-w-4xl w-full border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Tricolour Accent Line */}
        <div className="h-[3px] w-full grid grid-cols-3 shrink-0" aria-hidden="true">
          <div className="bg-[#e06a14]" />
          <div className="bg-[#ffffff]" />
          <div className="bg-[#138808]" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#081a33] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center shrink-0">
              <FileUp className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-['Noto_Sans',sans-serif]">
                  Tender Document Ingestion & Verification
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded font-mono">
                  GFR 2017 Aligned
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Server-side tender schedule extraction and verified Indian Standards cross-referencing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Notice Banner (Mandatory Requirement) */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2 text-xs text-amber-900 shrink-0">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="leading-tight">
            <strong>Institutional Privacy Notice:</strong> Tender documents are parsed in-memory solely for specification scoping and standard matching. Do not upload classified files unless authorized by your department.
          </p>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-0.5">Document Processing Error</p>
                <p>{errorMessage}</p>
              </div>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="text-red-500 hover:text-red-700 cursor-pointer font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* VIEW A: UPLOAD & INGESTION FORM (When tenderResult is null) */}
          {!tenderResult && (
            <div className="space-y-5">
              {/* Input Mode Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50/80 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { setActiveMode('upload'); setErrorMessage(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeMode === 'upload'
                      ? 'bg-white text-[#031632] shadow-xs border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload PDF / DOCX</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('paste'); setErrorMessage(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeMode === 'paste'
                      ? 'bg-white text-[#031632] shadow-xs border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Tender RFP Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('sample'); setErrorMessage(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeMode === 'sample'
                      ? 'bg-white text-[#031632] shadow-xs border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Sample Public Tenders</span>
                </button>
              </div>

              {/* Mode 1: PDF / DOCX Server-Side Upload */}
              {activeMode === 'upload' && (
                <div className="space-y-4">
                  <label 
                    htmlFor="tender-file-input"
                    className="border-2 border-dashed border-gray-300 hover:border-[#031632] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50/90 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                      <FileUp className="w-6 h-6 text-blue-700" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {selectedFile ? selectedFile.name : 'Click to select or drag & drop tender document'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Supports PDF (.pdf), Word (.docx), and text (.txt) schedules (Max 15 MB)
                    </span>
                    <input
                      id="tender-file-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {selectedFile && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-blue-700" />
                        <span className="font-semibold">{selectedFile.name}</span>
                        <span className="text-gray-500">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
                    <p className="font-semibold text-gray-700">Security Architecture & Safe Processing:</p>
                    <p>• Binary PDF and DOCX files are processed entirely server-side using streaming text extraction.</p>
                    <p>• Page numbers, sections, and table formats are preserved for audit traceability.</p>
                    <p>• Scanned or image-only documents are safely detected without hallucinating missing contents.</p>
                  </div>
                </div>
              )}

              {/* Mode 2: Paste Tender RFP Text */}
              {activeMode === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      Paste Technical Specifications or Bill of Quantities (BoQ):
                    </label>
                    <span className="text-[11px] text-gray-400">
                      {pastedText.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={9}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Example: Supply of 500 LED street lights conforming to IS 10322, 10 km 1.1 kV XLPE insulated electrical cables, and 500 octagonal galvanized steel poles with minimum 70 microns zinc coating..."
                    className="w-full p-4 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#031632] resize-none"
                  />
                  <p className="text-[11px] text-gray-500">
                    Tip: Multiple procurement items within the same text will be extracted into discrete item cards for individual analysis.
                  </p>
                </div>
              )}

              {/* Mode 3: Pre-loaded Sample Tenders */}
              {activeMode === 'sample' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium">
                    Select a realistic public procurement tender RFP to test multi-item ingestion:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {SAMPLE_TENDERS.map((tender) => (
                      <div
                        key={tender.id}
                        onClick={() => setSelectedSample(tender)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          selectedSample.id === tender.id
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold font-mono text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded">
                            {tender.category}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800">
                            {tender.estimatedValue}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1">
                          {tender.title}
                        </h4>

                        <div className="text-[11px] text-gray-500 line-clamp-1 mb-2">
                          {tender.authority}
                        </div>

                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                          {tender.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: TENDER INGESTION RESULTS (When tenderResult is populated) */}
          {tenderResult && (
            <div className="space-y-6">
              {/* Document Summary Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded uppercase">
                        {tenderResult.fileType}
                      </span>
                      {tenderResult.pageCount && tenderResult.pageCount > 1 && (
                        <span className="text-xs text-gray-500">
                          {tenderResult.pageCount} Pages
                        </span>
                      )}
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 font-mono">
                        {tenderResult.documentName}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mt-1">
                      {tenderResult.tenderTitle || 'Public Procurement Tender Document'}
                    </h4>
                    {tenderResult.issuerAuthority && (
                      <p className="text-xs text-gray-600">
                        Authority: <span className="font-semibold text-gray-800">{tenderResult.issuerAuthority}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-700 bg-white cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                      <span>Upload Another</span>
                    </button>

                    {tenderResult.items.length > 0 && (
                      <button
                        type="button"
                        disabled={isAnalyzingAll}
                        onClick={handleAnalyzeAllItems}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#031632] hover:bg-[#07244f] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {isAnalyzingAll ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Analyzing All...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Analyze Entire Tender</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Scanned/Image-Only Warning (Mandatory Requirement 4) */}
                {tenderResult.isScannedOnly && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Scanned / Image-Only Document Warning</p>
                      <p className="mt-1">
                        This tender appears to contain scanned/image-only pages. Text could not be reliably extracted. The system will not hallucinate or invent specifications.
                      </p>
                      <p className="mt-2 text-[11px] text-amber-800">
                        Please provide a digitally created PDF, a DOCX file, or paste the text clauses manually.
                      </p>
                    </div>
                  </div>
                )}

                {tenderResult.warnings && tenderResult.warnings.length > 0 && !tenderResult.isScannedOnly && (
                  <div className="mt-2 space-y-1">
                    {tenderResult.warnings.map((w, idx) => (
                      <p key={idx} className="text-xs text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{w}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Procurement Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Extracted Procurement Items ({tenderResult.items.length})
                  </h5>
                  <span className="text-xs text-gray-500">
                    Click "Analyze Item" or "Analyze Entire Tender" to map Indian Standards
                  </span>
                </div>

                {tenderResult.items.length === 0 && !tenderResult.isScannedOnly && (
                  <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-xl">
                    No discrete procurement items could be identified from the text provided.
                  </div>
                )}

                <div className="space-y-4">
                  {tenderResult.items.map((item) => {
                    const isAnalyzingThisItem = itemAnalyzingMap[item.id] || false;
                    const hasAnalysis = Boolean(item.analysis);

                    return (
                      <div 
                        key={item.id}
                        className={`p-5 rounded-xl border transition-all ${
                          hasAnalysis 
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-xs' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Item Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded">
                                Item {item.itemNumber}
                              </span>
                              {item.quantity && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold rounded">
                                  Quantity: {item.quantity}
                                </span>
                              )}
                              {item.sourceReference.pageNumber && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                                  Page {item.sourceReference.pageNumber}
                                </span>
                              )}
                              {item.sourceReference.sectionHeading && (
                                <span className="text-[11px] text-gray-500 font-medium truncate max-w-xs">
                                  § {item.sourceReference.sectionHeading}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-gray-900">
                              {item.product}
                            </h4>
                            {item.subtype && (
                              <p className="text-xs text-gray-600">
                                Subtype / Rating: <span className="font-medium text-gray-800">{item.subtype}</span>
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {hasAnalysis && item.analysis ? (
                              <button
                                type="button"
                                onClick={() => onSelectAnalysis(item.analysis!)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c5221f] hover:bg-[#a51a18] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                              >
                                <span>View Full Advisory</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isAnalyzingThisItem || isAnalyzingAll}
                                onClick={() => handleAnalyzeItem(item)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#031632] hover:bg-[#07244f] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                              >
                                {isAnalyzingThisItem ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                    <span>Analyzing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Analyze Item</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Traceable Source Text Snippet */}
                        {item.sourceReference.sourceSnippet && (
                          <div className="text-[11px] bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-gray-600 font-mono italic mb-3">
                            "{item.sourceReference.sourceSnippet}"
                          </div>
                        )}

                        {/* Technical Parameters Pill List */}
                        {item.technicalParameters && item.technicalParameters.length > 0 && (
                          <div className="mb-3">
                            <span className="text-[11px] font-bold text-gray-700 block mb-1">
                              Explicit Stated Parameters:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.technicalParameters.map((param, pIdx) => (
                                <span key={pIdx} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 text-[11px] rounded-md">
                                  {param}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Claimed Indian Standards Verification (Anti-Hallucination Guard Requirement 12) */}
                        {item.claimedStandardsVerification && item.claimedStandardsVerification.length > 0 && (
                          <div className="mb-3 space-y-1.5">
                            <span className="text-[11px] font-bold text-gray-700 block">
                              Standards Cited in Tender:
                            </span>
                            <div className="space-y-1">
                              {item.claimedStandardsVerification.map((claim, cIdx) => (
                                <div key={cIdx}>
                                  {claim.status === 'VERIFIED_IN_CATALOGUE' ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900">
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span className="font-bold">{claim.isCode}:</span>
                                      <span>{claim.note}</span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900">
                                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="font-bold">{claim.isCode}:</span>
                                      <span>{claim.note}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Specification Gap Analysis (Requirement 11) */}
                        {item.missingSpecificationGaps && item.missingSpecificationGaps.length > 0 && (
                          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-900 mb-2">
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Specification Gaps Affecting Standard Selection:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800 ml-1">
                              {item.missingSpecificationGaps.map((gap, gIdx) => (
                                <li key={gIdx}>{gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* If already analyzed: quick recommendation preview */}
                        {item.analysis && (
                          <div className="mt-3 pt-3 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="font-semibold text-emerald-900">Primary Standard Recommendation:</span>{' '}
                              <span className="font-bold text-gray-900">
                                {item.analysis.primaryStandards[0]?.isCode || item.analysis.retrievedPrimaryStandards?.[0]?.standard.isCode}
                              </span>{' '}
                              <span className="text-gray-600">
                                ({item.analysis.primaryStandards[0]?.standard.title || item.analysis.retrievedPrimaryStandards?.[0]?.standard.title})
                              </span>
                              {item.analysis.qcoSummary.isRegulated && (
                                <span className="ml-2 px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                                  QCO Mandatory
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onSelectAnalysis(item.analysis!)}
                              className="text-xs text-[#c5221f] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <span>Open Full Recommendation</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          {!tenderResult ? (
            <button
              type="button"
              disabled={isProcessing || (activeMode === 'upload' && !selectedFile) || (activeMode === 'paste' && !pastedText.trim())}
              onClick={handleIngestDocument}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c5221f] hover:bg-[#a51a18] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{processingStep || 'Processing Document...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ingest & Extract Items</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAnalyzeAllItems}
              disabled={isAnalyzingAll || tenderResult.items.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#031632] hover:bg-[#07244f] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing All Items...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze Entire Tender</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
