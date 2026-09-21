import React, { useEffect, useState } from 'react';
import { X, Image as ImageIcon, Printer, Download } from 'lucide-react';

interface SaveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (asBW: boolean, mode: 'save' | 'print') => void;
  isExporting?: boolean;
}

export const SaveExportModal: React.FC<SaveExportModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isExporting = false,
}) => {
  const [step, setStep] = useState<'style' | 'action'>('style');
  const [styleChoice, setStyleChoice] = useState<'color' | 'bw' | null>(null);

  // Reset the wizard back to step 1 each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setStep('style');
      setStyleChoice(null);
    }
  }, [isOpen]);

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

  const chooseStyle = (choice: 'color' | 'bw') => {
    setStyleChoice(choice);
    setStep('action');
  };

  const finish = (mode: 'save' | 'print') => {
    if (!styleChoice) return;
    onComplete(styleChoice === 'bw', mode);
    onClose();
  };

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col">

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h3 id="save-export-modal-title" className="font-bold text-base text-slate-800">
            {step === 'style' ? 'Save or Print Rotation' : 'Save or Print?'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-2.5">
          {step === 'style' ? (
            <>
              <p className="text-sm text-slate-500 -mt-1 mb-1">Choose a style for the rotation image.</p>

              <button
                onClick={() => chooseStyle('color')}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/40 transition-all active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-slate-800">Color</span>
              </button>

              <button
                onClick={() => chooseStyle('bw')}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-slate-800">Black &amp; White</span>
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 -mt-1 mb-1">
                {styleChoice === 'bw' ? 'Black & white' : 'Color'} rotation card — save it or print it?
              </p>

              <button
                onClick={() => finish('save')}
                disabled={isExporting}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/40 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Download className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-slate-800">
                  {isExporting ? 'Generating...' : 'Save to Device'}
                </span>
              </button>

              <button
                onClick={() => finish('print')}
                disabled={isExporting}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Printer className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-slate-800">
                  {isExporting ? 'Generating...' : 'Print'}
                </span>
              </button>

              <button
                onClick={() => setStep('style')}
                className="text-xs text-slate-400 hover:text-slate-600 pt-1"
              >
                ← Change style
              </button>
            </>
          )}
        </div>

        {/* Modal Footer with Cancel Button */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
