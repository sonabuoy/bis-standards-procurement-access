import React, { useState } from 'react';
import { X, FileUp, FileText, Sparkles, CheckCircle2, ArrowRight, Building, Layers, Loader2 } from 'lucide-react';
import { SAMPLE_TENDERS } from '../data/bisDatabase';
import { SampleTender } from '../types';

interface TenderUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeTenderText: (text: string) => void;
  isLoading: boolean;
}

export const TenderUploadModal: React.FC<TenderUploadModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeTenderText,
  isLoading
}) => {
  const [activeMode, setActiveMode] = useState<'sample' | 'paste' | 'upload'>('sample');
  const [pastedText, setPastedText] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleTender>(SAMPLE_TENDERS[0]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPastedText(text || `Procurement RFP Document: ${file.name}. Analysis of equipment technical specifications.`);
      };
      reader.readAsText(file);
    }
  };

  const handleRunAnalysis = () => {
    if (activeMode === 'sample') {
      onAnalyzeTenderText(selectedSample.documentText);
    } else {
      if (!pastedText.trim()) return;
      onAnalyzeTenderText(pastedText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#031632] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Noto_Sans',sans-serif]">
                Upload & Analyze Tender Document
              </h3>
              <p className="text-xs text-gray-300">
                Extract technical specifications and map mandatory Indian Standards (IS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveMode('sample')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeMode === 'sample'
                ? 'bg-white text-[#031632] border-t-2 border-[#031632] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sample Government Tenders
          </button>
          <button
            onClick={() => setActiveMode('paste')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeMode === 'paste'
                ? 'bg-white text-[#031632] border-t-2 border-[#031632] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Paste RFP / NIT Text
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-white text-[#031632] border-t-2 border-[#031632] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload PDF / DOCX
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Mode 1: Pre-loaded Sample Tenders */}
          {activeMode === 'sample' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-medium">
                Select a real public procurement tender RFP to simulate automated BIS standards mapping:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {SAMPLE_TENDERS.map((tender) => (
                  <div
                    key={tender.id}
                    onClick={() => setSelectedSample(tender)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedSample.id === tender.id
                        ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
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

          {/* Mode 2: Paste RFP Text */}
          {activeMode === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Paste Tender Technical Specification Clauses or Bill of Quantities (BoQ):
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the technical specifications section from your tender document here..."
                className="w-full p-4 border border-gray-300 rounded-xl text-xs sm:text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#031632] resize-none"
              />
            </div>
          )}

          {/* Mode 3: Upload File */}
          {activeMode === 'upload' && (
            <div className="space-y-4">
              <label 
                htmlFor="tender-file-input"
                className="border-2 border-dashed border-gray-300 hover:border-[#031632] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50"
              >
                <FileUp className="w-10 h-10 text-gray-400 mb-3" />
                <span className="text-sm font-bold text-gray-800">
                  {uploadedFileName ? uploadedFileName : 'Click to select or drag & drop tender document'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Supports PDF, DOCX, TXT tender schedules (Max 25MB)
                </span>
                <input
                  id="tender-file-input"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFileName && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Document "{uploadedFileName}" loaded and ready for standards mapping.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading || (activeMode !== 'sample' && !pastedText.trim())}
            onClick={handleRunAnalysis}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c5221f] hover:bg-[#a51a18] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing Tender Specs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Map Indian Standards</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
