import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, Users, Trophy, Sparkles, Check, Loader2, Layers, HelpCircle, BookOpen } from 'lucide-react';
import { AssignSettings } from '../types';
import { cn } from '../utils/cn';

interface AssignStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignSettings: AssignSettings;
  onSave: (settings: AssignSettings) => Promise<void> | void;
  isSaving?: boolean;
  isBlackAndWhite?: boolean;
}

export const AssignStrategyModal: React.FC<AssignStrategyModalProps> = ({
  isOpen,
  onClose,
  assignSettings,
  onSave,
  isSaving = false,
  isBlackAndWhite = false,
}) => {
  const [localSettings, setLocalSettings] = useState<AssignSettings>(assignSettings);
  const [showDocs, setShowDocs] = useState<boolean>(false);

  // Sync with prop whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(assignSettings);
      setShowDocs(false);
    }
  }, [isOpen, assignSettings]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleToggleRoles = () => {
    setLocalSettings(prev => ({ ...prev, requireRoles: !prev.requireRoles }));
  };

  const handleToggleDefense = () => {
    setLocalSettings(prev => ({ ...prev, balanceDefense: !prev.balanceDefense }));
  };

  const handleToggleStaggerDepth = () => {
    setLocalSettings(prev => ({ ...prev, staggerDepth: !prev.staggerDepth }));
  };

  const handleSetExtraMinutes = (strategy: 'development' | 'competitive') => {
    setLocalSettings(prev => ({ ...prev, extraMinutes: strategy }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div
      id="assign-strategy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-all",
          isBlackAndWhite
            ? "bg-white border-slate-900 text-slate-900"
            : "bg-white border-slate-200 text-slate-900"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-5 py-4 border-b shrink-0",
            isBlackAndWhite
              ? "bg-slate-100 border-slate-300"
              : "bg-slate-50/80 border-slate-100"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl text-white shadow-sm shrink-0",
                isBlackAndWhite ? "bg-slate-900" : "bg-brand-500"
              )}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Auto-Assign Strategy
              </h2>
              <p className="text-xs text-slate-500 leading-normal mt-0.5">
                Configure rotation balance rules and extra minutes policy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-toggle-strategy-docs"
              onClick={() => setShowDocs(prev => !prev)}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                showDocs
                  ? (isBlackAndWhite ? "bg-slate-900 text-white" : "bg-brand-500 text-white shadow-xs")
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              )}
              title={showDocs ? "Hide algorithm documentation" : "How the algorithm works"}
              aria-label="How the algorithm works"
              aria-expanded={showDocs}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              id="btn-close-strategy-modal"
              onClick={onClose}
              disabled={isSaving}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors disabled:opacity-50"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Toggle 1: Require 1 Handler & 1 Rim */}
          <div
            id="card-require-roles"
            onClick={handleToggleRoles}
            className={cn(
              "flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.99] select-none",
              localSettings.requireRoles
                ? (isBlackAndWhite ? "bg-slate-100 border-slate-900" : "bg-brand-50/60 border-brand-300 shadow-xs")
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0 mt-0.5",
                  localSettings.requireRoles
                    ? (isBlackAndWhite ? "bg-slate-900 text-white" : "bg-brand-500 text-white")
                    : "bg-slate-100 text-slate-500"
                )}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    Require 1 Handler & 1 Rim per period
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Prevents lineups without ball-handlers or rebounders.
                </p>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={localSettings.requireRoles}
              id="toggle-require-roles"
              onClick={e => {
                e.stopPropagation();
                handleToggleRoles();
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5",
                localSettings.requireRoles
                  ? (isBlackAndWhite ? "bg-slate-900" : "bg-brand-500")
                  : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  localSettings.requireRoles ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Toggle 2: Balance Defensive Ratings */}
          <div
            id="card-balance-defense"
            onClick={handleToggleDefense}
            className={cn(
              "flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.99] select-none",
              localSettings.balanceDefense
                ? (isBlackAndWhite ? "bg-slate-100 border-slate-900" : "bg-emerald-50/60 border-emerald-300 shadow-xs")
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0 mt-0.5",
                  localSettings.balanceDefense
                    ? (isBlackAndWhite ? "bg-slate-900 text-white" : "bg-emerald-600 text-white")
                    : "bg-slate-100 text-slate-500"
                )}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  Balance Defensive Ratings
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Spreads out A and B defenders so no period is defensively weak.
                </p>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={localSettings.balanceDefense}
              id="toggle-balance-defense"
              onClick={e => {
                e.stopPropagation();
                handleToggleDefense();
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5",
                localSettings.balanceDefense
                  ? (isBlackAndWhite ? "bg-slate-900" : "bg-emerald-600")
                  : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  localSettings.balanceDefense ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Toggle 3: Stagger Depth Players */}
          <div
            id="card-stagger-depth"
            onClick={handleToggleStaggerDepth}
            className={cn(
              "flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.99] select-none",
              localSettings.staggerDepth
                ? (isBlackAndWhite ? "bg-slate-100 border-slate-900" : "bg-violet-50/60 border-violet-300 shadow-xs")
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0 mt-0.5",
                  localSettings.staggerDepth
                    ? (isBlackAndWhite ? "bg-slate-900 text-white" : "bg-violet-600 text-white")
                    : "bg-slate-100 text-slate-500"
                )}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  Stagger Depth Players
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Prevents the bottom two ranked players from sharing the floor.
                </p>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={localSettings.staggerDepth}
              id="toggle-stagger-depth"
              onClick={e => {
                e.stopPropagation();
                handleToggleStaggerDepth();
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5",
                localSettings.staggerDepth
                  ? (isBlackAndWhite ? "bg-slate-900" : "bg-violet-600")
                  : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  localSettings.staggerDepth ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Option 3: Extra Minutes Strategy */}
          <div className="pt-2">
            <div className="mb-2">
              <label className="font-bold text-sm text-slate-900 block">
                Extra Minutes Strategy
              </label>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Decides who gets a 3rd period when minutes are uneven.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Development (Fairness) */}
              <button
                type="button"
                id="radio-strategy-development"
                onClick={() => handleSetExtraMinutes('development')}
                className={cn(
                  "flex flex-col items-start p-3 sm:p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] relative",
                  localSettings.extraMinutes === 'development'
                    ? (isBlackAndWhite
                        ? "bg-slate-100 border-slate-900 ring-1 ring-slate-900"
                        : "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300")
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className={cn(
                      "w-4 h-4",
                      localSettings.extraMinutes === 'development'
                        ? (isBlackAndWhite ? "text-slate-900" : "text-indigo-600")
                        : "text-slate-400"
                    )} />
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      Development (Fairness)
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                      localSettings.extraMinutes === 'development'
                        ? (isBlackAndWhite ? "border-slate-900 bg-slate-900 text-white" : "border-indigo-600 bg-indigo-600 text-white")
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {localSettings.extraMinutes === 'development' && (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Prioritizes players with fewer accumulated season minutes.
                </p>
              </button>

              {/* Option B: Competitive (Win Now) */}
              <button
                type="button"
                id="radio-strategy-competitive"
                onClick={() => handleSetExtraMinutes('competitive')}
                className={cn(
                  "flex flex-col items-start p-3 sm:p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] relative",
                  localSettings.extraMinutes === 'competitive'
                    ? (isBlackAndWhite
                        ? "bg-slate-100 border-slate-900 ring-1 ring-slate-900"
                        : "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300")
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    <Trophy className={cn(
                      "w-4 h-4",
                      localSettings.extraMinutes === 'competitive'
                        ? (isBlackAndWhite ? "text-slate-900" : "text-amber-600")
                        : "text-slate-400"
                    )} />
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      Competitive (Win Now)
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                      localSettings.extraMinutes === 'competitive'
                        ? (isBlackAndWhite ? "border-slate-900 bg-slate-900 text-white" : "border-amber-600 bg-amber-600 text-white")
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {localSettings.extraMinutes === 'competitive' && (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Prioritizes top defensive tier and primary handlers for crunch time.
                </p>
              </button>
            </div>
          </div>

          {/* Expandable Algorithm Documentation Panel */}
          {showDocs && (
            <div
              id="strategy-algorithm-docs"
              className={cn(
                "rounded-xl border p-3.5 sm:p-4 text-xs sm:text-sm max-h-60 sm:max-h-72 overflow-y-auto space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs",
                isBlackAndWhite
                  ? "bg-slate-100 border-slate-300 text-slate-800"
                  : "bg-slate-50/90 border-slate-200 text-slate-700"
              )}
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <BookOpen className="w-4 h-4 text-slate-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  How the Algorithm Works
                </h3>
              </div>

              {/* 1. Roster Order (The 3 Tiers) */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  1. Roster Order (The 3 Tiers)
                </h4>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  The algorithm reads your roster from top to bottom to break ties and assign minutes. Order your players by overall impact:
                </p>
                <ul className="space-y-1.5 pl-3 border-l-2 border-slate-300 text-xs sm:text-sm">
                  <li>
                    <span className="font-bold text-slate-800">Tier 1 (Top 3): The Closers.</span>{' '}
                    <span className="text-slate-600">Your most reliable players. The 'Win Now' strategy prioritizes these slots for extra minutes.</span>
                  </li>
                  <li>
                    <span className="font-bold text-slate-800">Tier 2 (Middle): The Glue.</span>{' '}
                    <span className="text-slate-600">Versatile players who keep the rotation stable when starters rest.</span>
                  </li>
                  <li>
                    <span className="font-bold text-slate-800">Tier 3 (Bottom): Development.</span>{' '}
                    <span className="text-slate-600">Players mastering fundamentals.</span>
                  </li>
                </ul>
              </div>

              {/* 2. Stagger Depth Players */}
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  2. Stagger Depth Players
                </h4>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  When toggled on, the engine looks at the bottom two active players on your roster list and guarantees they never share the court at the same time.
                </p>
              </div>

              {/* 3. Extra Minutes Strategy */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  3. Extra Minutes Strategy
                </h4>
                <ul className="space-y-1.5 pl-3 border-l-2 border-slate-300 text-xs sm:text-sm">
                  <li>
                    <span className="font-bold text-slate-800">Fairness:</span>{' '}
                    <span className="text-slate-600">Awards extra periods to players with the lowest Season Total (STOT) to balance playing time over the season.</span>
                  </li>
                  <li>
                    <span className="font-bold text-slate-800">Competitive:</span>{' '}
                    <span className="text-slate-600">Awards extra periods to top-tier Defenders (A/B) and Handlers, using Roster Order as the ultimate tie-breaker.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            "px-5 py-3.5 border-t flex items-center justify-end gap-2.5 shrink-0",
            isBlackAndWhite
              ? "bg-slate-100 border-slate-300"
              : "bg-slate-50/80 border-slate-100"
          )}
        >
          <button
            type="button"
            id="btn-cancel-strategy"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-save-strategy"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white transition-all shadow-sm active:scale-95 disabled:opacity-50",
              isBlackAndWhite ? "bg-slate-900 hover:bg-slate-800" : "bg-brand-500 hover:bg-brand-600"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Strategy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
