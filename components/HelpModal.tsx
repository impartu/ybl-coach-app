import React from 'react';
import { X, HelpCircle, FileText, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBlackAndWhite?: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, isBlackAndWhite = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <HelpCircle className={isBlackAndWhite ? "text-slate-800" : "text-brand-500"} size={24} />
            <h3 className="font-bold text-lg text-slate-800">How to Use</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Setup */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 border-b pb-1">1. Setup</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tap a player's <strong>Name</strong> in the list to toggle them{' '}
              {isBlackAndWhite ? (
                <span className="text-slate-900 font-bold">Active (Dark border)</span>
              ) : (
                <span className="text-brand-600 font-bold">Playing (Orange)</span>
              )}{' '}
              or <span className="text-red-500 font-bold">Benched</span>. Unchecked players will be skipped by the auto-assigner.
            </p>
          </div>

          {/* Auto Assign */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 border-b pb-1">2. Auto Assign & Print View</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Select your starters manually in Period 1 if desired, then click the{' '}
              <span className={isBlackAndWhite ? "font-semibold text-slate-900" : "font-semibold text-brand-600"}>Auto Assign</span>{' '}
              button to fill remaining slots. Toggle the <strong>B&W</strong> button anytime for printer-friendly output.
            </p>
          </div>

          {/* Visuals */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 border-b pb-1">3. Rotation Grid Legend</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className={isBlackAndWhite 
                  ? "w-8 h-8 rounded bg-white border-2 border-slate-900 shadow-sm shrink-0" 
                  : "w-8 h-8 rounded bg-brand-500 border border-brand-600 shadow-sm shrink-0"
                }></div>
                <div>
                  <span className="font-bold text-slate-800 text-sm">SUB IN</span>
                  <p className="text-xs text-slate-500">
                    {isBlackAndWhite ? "Coming off the bench (Fresh / White background)" : "Coming off the bench (Fresh)"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={isBlackAndWhite 
                  ? "w-8 h-8 rounded bg-slate-200 border border-slate-400 shadow-sm shrink-0" 
                  : "w-8 h-8 rounded bg-brand-300 border border-brand-400 shadow-sm shrink-0"
                }></div>
                <div>
                  <span className="font-bold text-slate-800 text-sm">STAY IN</span>
                  <p className="text-xs text-slate-500">
                    {isBlackAndWhite ? "Played in the previous period (Light gray fill)" : "Played in the previous period"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 border-b pb-1">4. Actions</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use the <strong>Download</strong> button to save an image of the rotation to your phone. Use <strong>Reset</strong> to clear all assignments and start over.
            </p>
          </div>

          {/* League Rules Section */}
          <div className="pt-2">
            <hr className="border-gray-200 mb-4" />
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-sm">Youth Basketball League (YBL) Rules</h4>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <a 
                href="https://drive.google.com/file/d/1XGKBwx5R_IIRApTbvemQrli0sbprtSYp/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs font-bold underline flex items-center gap-1 inline-flex"
              >
                <FileText size={14} />
                View Official Rules PDF
                <ExternalLink size={10} />
              </a>

              <div>
                <p className="text-xs text-slate-700 font-medium mb-1">
                  The Auto-Assigner enforces these constraints:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 ml-1">
                  <li><span className="font-semibold text-slate-700">Continuous Play:</span> Play 1+ period in P1-P2 & P3-P5.</li>
                  <li><span className="font-semibold text-slate-700">Mandatory Rest:</span> Sit out at least 1 period in P1-P4.</li>
                  <li><span className="font-semibold text-slate-700">No Free Subs:</span> Periods 1-4 are fixed rotations.</li>
                  <li><span className="font-semibold text-slate-700">5th Period:</span> Coach's discretion (Free subs).</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};