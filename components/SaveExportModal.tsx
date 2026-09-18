import React, { useEffect } from 'react';
import { X, Save, Image, Printer, FileJson } from 'lucide-react';

interface SaveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGame: () => void;
  onDownloadColor: () => void;
  onDownloadBW: () => void;
  onExportSeasonData: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
  isExportingData?: boolean;
}

export const SaveExportModal: React.FC<SaveExportModalProps> = ({
  isOpen,
  onClose,
  onSaveGame,
  onDownloadColor,
  onDownloadBW,
  onExportSeasonData,
  isSaving = false,
  isExporting = false,
  isExportingData = false
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    // Automatically close the modal immediately, then execute the function
    onClose();
    action();
  };

  const isBusy = isSaving || isExporting || isExportingData;

  return (
    <div
      data-html2canvas-ignore
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-export-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 id="save-export-modal-title" className="font-bold text-base sm:text-lg text-slate-800 leading-tight">
                Save & Export Options
              </h3>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">
                Select an option to save or output your rotation
              </p>
            </div>
          </div>
          <button
            id="btn-close-save-export-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - 4 Styled Full-Width Action Buttons */}
        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto max-h-[75vh]">
          
          {/* 1. Save Game to Database */}
          <button
            id="btn-modal-save-db"
            disabled={isBusy}
            onClick={() => handleAction(onSaveGame)}
            className="w-full flex items-center text-left p-3.5 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 hover:border-emerald-300 transition-all active:scale-[0.99] gap-3.5 group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Save className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-950">
                  Save Game to Database
                </span>
                {isSaving && (
                  <span className="text-xs font-semibold text-emerald-700 animate-pulse">Saving...</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Records current game snapshot and player periods to Firebase
              </p>
            </div>
          </button>

          {/* 2. Download Color Image */}
          <button
            id="btn-modal-download-color"
            disabled={isBusy}
            onClick={() => handleAction(onDownloadColor)}
            className="w-full flex items-center text-left p-3.5 sm:p-4 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 hover:border-sky-300 transition-all active:scale-[0.99] gap-3.5 group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-lg bg-sky-600 text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Image className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-sky-950">
                  Download Color Image
                </span>
                {isExporting && (
                  <span className="text-xs font-semibold text-sky-700 animate-pulse">Generating...</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Saves high-resolution full-color rotation card (.jpg)
              </p>
            </div>
          </button>

          {/* 3. Download B&W Image */}
          <button
            id="btn-modal-download-bw"
            disabled={isBusy}
            onClick={() => handleAction(onDownloadBW)}
            className="w-full flex items-center text-left p-3.5 sm:p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-[0.99] gap-3.5 group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-lg bg-slate-800 text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-black block">
                Download B&W Image
              </span>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                High-contrast printer format (temporarily applied & auto-reverted)
              </p>
            </div>
          </button>

          {/* 4. Export Season Data */}
          <button
            id="btn-modal-export-data"
            disabled={isBusy}
            onClick={() => handleAction(onExportSeasonData)}
            className="w-full flex items-center text-left p-3.5 sm:p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 hover:border-indigo-300 transition-all active:scale-[0.99] gap-3.5 group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-lg bg-indigo-600 text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-950">
                  Export Season Data
                </span>
                {isExportingData && (
                  <span className="text-xs font-semibold text-indigo-700 animate-pulse">Exporting...</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Downloads complete season game logs as a JSON backup file
              </p>
            </div>
          </button>
        </div>

        {/* Modal Footer with Cancel Button */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            id="btn-cancel-save-export-modal"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/80 rounded-lg transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
