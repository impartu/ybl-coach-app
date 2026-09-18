import React from 'react';
import { Users, Save, Shield, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Player } from '../types';
import { cn } from '../utils/cn';

interface RosterSettingsProps {
  roster: Player[];
  onUpdatePlayer: (index: number, updatedFields: Partial<Player>) => void;
  onMovePlayer: (index: number, direction: 'up' | 'down') => void;
  onSaveRoster: () => Promise<void>;
  isSaving: boolean;
  isBlackAndWhite?: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const AVAILABLE_ROLES = [
  { code: 'R', label: 'Rim (R)' },
  { code: 'H', label: 'Handler (H)' },
  { code: 'C', label: 'Connector (C)' },
];

const DEFENSE_RATINGS = ['A', 'B', 'C', 'D'];

export const RosterSettings: React.FC<RosterSettingsProps> = ({
  roster,
  onUpdatePlayer,
  onMovePlayer,
  onSaveRoster,
  isSaving,
  isBlackAndWhite = false,
  isOpen = true,
  onToggleOpen,
}) => {
  const handleRoleToggle = (playerIndex: number, roleCode: string) => {
    const player = roster[playerIndex];
    if (!player) return;

    const currentRoles = Array.isArray(player.roles) ? [...player.roles] : [];
    const exists = currentRoles.includes(roleCode);
    const updatedRoles = exists
      ? currentRoles.filter(r => r !== roleCode)
      : [...currentRoles, roleCode];

    onUpdatePlayer(playerIndex, { roles: updatedRoles });
  };

  return (
    <section className="space-y-2 pt-1">
      {/* Section Title & Subtitle (Clickable Collapsible Toggle) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleOpen?.();
          }
        }}
        aria-expanded={isOpen}
        title={isOpen ? "Click to collapse Team Roster Settings" : "Click to expand Team Roster Settings"}
        className={cn(
          "flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none",
          isOpen
            ? (isBlackAndWhite ? "bg-slate-100/80 border-slate-300" : "bg-white border-gray-200 shadow-2xs")
            : (isBlackAndWhite ? "bg-white border-slate-200 hover:bg-slate-50" : "bg-white border-gray-200 hover:bg-slate-50 hover:border-slate-300")
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Users className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0", isBlackAndWhite ? "text-slate-700" : "text-brand-600")} />
          <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">
            Team Roster Settings
          </h2>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            • Use ↑ / ↓ to reorder lineup display
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
          <span className="hidden md:inline text-[11px] font-medium text-slate-400">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          )}
        </div>
      </div>

      {/* Main Container (Only rendered when isOpen is true) */}
      {isOpen && (
        <div
          className={cn(
            "rounded-xl shadow-sm border p-2.5 sm:p-3 transition-colors animate-in fade-in duration-150",
            isBlackAndWhite ? "bg-white border-slate-200" : "bg-white border-gray-200"
          )}
        >
          {/* Single Column Layout across all screen sizes */}
          <div className="flex flex-col gap-2 sm:gap-2.5">
          {roster.map((player, idx) => (
            <div
              key={player.id || `slot-${idx}`}
              className={cn(
                "p-2 sm:p-2.5 rounded-lg border transition-all flex flex-col gap-2",
                isBlackAndWhite
                  ? (player.isActiveOnRoster === false ? "bg-slate-100/50 border-slate-200 opacity-75" : "bg-slate-50/70 border-slate-200")
                  : (player.isActiveOnRoster === false
                      ? "bg-slate-100/60 border-slate-200/90 opacity-75"
                      : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300")
              )}
            >
              {/* Row 1: Reordering Controls, Slot Badge & Basic Inputs */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Move Up / Down Buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMovePlayer(idx, 'up')}
                    disabled={idx === 0}
                    aria-label={`Move ${player.name || `Player ${idx + 1}`} up`}
                    title={idx === 0 ? "Already at top" : "Move Up"}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed",
                      isBlackAndWhite
                        ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300"
                    )}
                  >
                    <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMovePlayer(idx, 'down')}
                    disabled={idx === roster.length - 1}
                    aria-label={`Move ${player.name || `Player ${idx + 1}`} down`}
                    title={idx === roster.length - 1 ? "Already at bottom" : "Move Down"}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed",
                      isBlackAndWhite
                        ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300"
                    )}
                  >
                    <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Slot Order Badge */}
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight shrink-0 w-7 sm:w-8 text-center">
                  #{idx + 1}
                </span>

                {/* Name Input */}
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => onUpdatePlayer(idx, { name: e.target.value })}
                  placeholder="Player Name"
                  title="Player Name"
                  className={cn(
                    "h-8 px-2 py-1 text-xs sm:text-sm font-medium rounded-md border outline-none transition-all flex-1 min-w-0 bg-white",
                    "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                    isBlackAndWhite ? "border-slate-300 text-slate-900" : "border-gray-200 text-slate-800"
                  )}
                />

                {/* Jersey # Input */}
                <input
                  type="text"
                  value={player.jersey}
                  onChange={(e) => onUpdatePlayer(idx, { jersey: e.target.value })}
                  placeholder="#"
                  title="Jersey Number"
                  className={cn(
                    "h-8 w-11 sm:w-12 px-1 text-center font-mono text-xs sm:text-sm font-medium rounded-md border outline-none transition-all shrink-0 bg-white",
                    "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                    isBlackAndWhite ? "border-slate-300 text-slate-900" : "border-gray-200 text-slate-800"
                  )}
                />

                {/* Height Input */}
                <input
                  type="text"
                  value={player.height}
                  onChange={(e) => onUpdatePlayer(idx, { height: e.target.value })}
                  placeholder="Height"
                  title="Height (e.g. 4'11&quot;)"
                  className={cn(
                    "h-8 w-14 sm:w-16 px-1 text-center text-xs sm:text-sm font-medium rounded-md border outline-none transition-all shrink-0 bg-white",
                    "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                    isBlackAndWhite ? "border-slate-300 text-slate-900" : "border-gray-200 text-slate-800"
                  )}
                />
              </div>

              {/* Row 2: Roles (Multiple-choice Checkboxes) & Defense Rating (Dropdown) */}
              <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-200/60 flex-wrap">
                {/* Roles Checkboxes */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
                    Roles:
                  </span>
                  {AVAILABLE_ROLES.map((r) => {
                    const isChecked = Array.isArray(player.roles) && player.roles.includes(r.code);
                    return (
                      <label
                        key={r.code}
                        className={cn(
                          "flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer select-none font-medium px-1.5 py-0.5 rounded transition-colors",
                          isChecked
                            ? (isBlackAndWhite ? "bg-slate-200 text-slate-900 font-semibold" : "bg-brand-50 text-brand-800 font-semibold")
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleRoleToggle(idx, r.code)}
                          className={cn(
                            "w-3.5 h-3.5 rounded transition cursor-pointer",
                            isBlackAndWhite
                              ? "accent-slate-800"
                              : "accent-brand-600"
                          )}
                        />
                        <span>{r.label}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Active Checkbox (Sitting in the empty space between Connector (C) and DEF:) */}
                <label
                  className={cn(
                    "flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer select-none font-medium px-1.5 py-0.5 rounded transition-colors ml-auto",
                    player.isActiveOnRoster !== false
                      ? (isBlackAndWhite ? "bg-slate-200 text-slate-900 font-semibold" : "bg-emerald-50 text-emerald-800 font-semibold")
                      : "text-slate-400 hover:text-slate-600 bg-slate-100/80"
                  )}
                  title="Include in game-day checklist and rotation"
                >
                  <input
                    type="checkbox"
                    checked={player.isActiveOnRoster !== false}
                    onChange={(e) => onUpdatePlayer(idx, { isActiveOnRoster: e.target.checked })}
                    className={cn(
                      "w-3.5 h-3.5 rounded transition cursor-pointer",
                      isBlackAndWhite ? "accent-slate-800" : "accent-emerald-600"
                    )}
                  />
                  <span>Active</span>
                </label>

                {/* Defense Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-0.5">
                    <Shield className="w-3 h-3 inline" />
                    <span>Def:</span>
                  </span>
                  <select
                    value={player.defense || 'B'}
                    onChange={(e) => onUpdatePlayer(idx, { defense: e.target.value })}
                    className={cn(
                      "h-7 px-2 py-0 text-xs sm:text-sm font-bold rounded-md border outline-none transition-all bg-white cursor-pointer",
                      "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                      isBlackAndWhite ? "border-slate-300 text-slate-900" : "border-gray-200 text-slate-800"
                    )}
                  >
                    {DEFENSE_RATINGS.map((def) => (
                      <option key={def} value={def}>
                        {def}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Footer: Save Roster Button */}
        <div className="pt-3 mt-2 border-t border-gray-100 flex justify-end">
          <button
            onClick={onSaveRoster}
            disabled={isSaving}
            className={cn(
              "h-9 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg text-white transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-50",
              isBlackAndWhite
                ? "bg-slate-900 hover:bg-slate-800"
                : "bg-brand-600 hover:bg-brand-700"
            )}
            title="Save Roster to Database"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isSaving ? "Saving..." : "Save Roster to Database"}</span>
          </button>
        </div>
      </div>
      )}
    </section>
  );
};
