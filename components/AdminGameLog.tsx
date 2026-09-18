import React, { useState } from 'react';
import { Trash2, Pencil, Check, X, Calendar, Clock, Database, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SavedGame, SavedGamePlayer, PlayerSeasonStats, MINUTES_PER_PERIOD } from '../types';
import { cn } from '../utils/cn';

interface AdminGameLogProps {
  games: SavedGame[];
  seasonStats: Record<string, PlayerSeasonStats>;
  onDeleteGame: (gameId: string) => Promise<void>;
  onUpdateGameRow: (gameId: string, playerIndex: number, updatedPlayer: SavedGamePlayer) => Promise<void>;
  isLoading?: boolean;
  isBlackAndWhite?: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export const AdminGameLog: React.FC<AdminGameLogProps> = ({
  games,
  seasonStats,
  onDeleteGame,
  onUpdateGameRow,
  isLoading = false,
  isBlackAndWhite = false,
  isOpen = false,
  onToggleOpen,
}) => {
  // Collapsed rows state: tracks which game IDs are currently expanded (all collapsed by default)
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  // Editing state: tracks which game and player row is currently being edited
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;
  } | null>(null);
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);

  const toggleGameExpanded = (gameId: string) => {
    setExpandedGames((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  };

  // Helper to normalize period counts from historical records (which might store minutes e.g. 8, or periods e.g. 1)
  const getPeriodCount = (val: any): number => {
    if (typeof val === 'number') {
      return val > 5 ? val / MINUTES_PER_PERIOD : val;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    return num > 5 ? num / MINUTES_PER_PERIOD : num;
  };

  // Helper to format timestamps gracefully
  const formatDateTime = (ts: any): string => {
    if (!ts) return 'Unknown Date';
    try {
      let date: Date;
      if (ts.toDate && typeof ts.toDate === 'function') {
        date = ts.toDate();
      } else if (ts instanceof Date) {
        date = ts;
      } else if (typeof ts === 'number' || typeof ts === 'string') {
        date = new Date(ts);
      } else if (ts.seconds) {
        date = new Date(ts.seconds * 1000);
      } else {
        return 'Unknown Date';
      }
      if (isNaN(date.getTime())) return 'Unknown Date';
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown Date';
    }
  };

  const handleStartEdit = (gameId: string, playerIndex: number, player: SavedGamePlayer) => {
    const key = `${gameId}-${playerIndex}`;
    setEditingRowKey(key);
    setEditValues({
      p1: getPeriodCount(player.p1),
      p2: getPeriodCount(player.p2),
      p3: getPeriodCount(player.p3),
      p4: getPeriodCount(player.p4),
      p5: getPeriodCount(player.p5),
    });
  };

  const handleCancelEdit = () => {
    setEditingRowKey(null);
    setEditValues(null);
  };

  const handleSaveEdit = async (gameId: string, playerIndex: number, originalPlayer: SavedGamePlayer) => {
    if (!editValues) return;
    setIsSavingRow(true);
    try {
      const p1 = Math.max(0, Number(editValues.p1) || 0);
      const p2 = Math.max(0, Number(editValues.p2) || 0);
      const p3 = Math.max(0, Number(editValues.p3) || 0);
      const p4 = Math.max(0, Number(editValues.p4) || 0);
      const p5 = Math.max(0, Number(editValues.p5) || 0);

      const tot_periods = p1 + p2 + p3 + p4 + p5;
      const tot_minutes = tot_periods * MINUTES_PER_PERIOD;

      const updatedPlayer: SavedGamePlayer = {
        ...originalPlayer,
        p1,
        p2,
        p3,
        p4,
        p5,
        tot_periods,
        tot_minutes,
      };

      await onUpdateGameRow(gameId, playerIndex, updatedPlayer);
      setEditingRowKey(null);
      setEditValues(null);
    } catch (error) {
      console.error('Failed to save row edits:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSavingRow(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this game record?');
    if (!confirmed) return;

    setDeletingGameId(gameId);
    try {
      await onDeleteGame(gameId);
    } finally {
      setDeletingGameId(null);
    }
  };

  return (
    <section id="admin-game-log-section" className="mt-8 space-y-3">
      {/* Section Header (Clickable Accordion Toggle) */}
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
        title={isOpen ? "Click to collapse Admin Game Log" : "Click to expand Admin Game Log"}
        className={cn(
          "flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none",
          isOpen
            ? (isBlackAndWhite ? "bg-slate-100/80 border-slate-300 shadow-2xs" : "bg-white border-slate-200 shadow-2xs")
            : (isBlackAndWhite ? "bg-white border-slate-200 hover:bg-slate-50" : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300")
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "p-2 rounded-lg shrink-0",
              isBlackAndWhite ? "bg-slate-900 text-white" : "bg-slate-800 text-white"
            )}
          >
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Admin Game Log
              </h2>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-[11px] sm:text-xs">
                {games.length} {games.length === 1 ? 'Game' : 'Games'} Saved
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Review, edit 5th period substitutions, and manage historical game documents.
            </p>
          </div>
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

      {/* Main Table / Container (Rendered when isOpen is true) */}
      {isOpen && (
        <div
          id="admin-table-container"
          className={cn(
            "w-full overflow-x-auto rounded-xl border shadow-xs transition-colors animate-in fade-in duration-150",
            isBlackAndWhite ? "bg-white border-slate-300" : "bg-white border-slate-200"
          )}
        >
        {isLoading && games.length === 0 ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span>Loading historical game logs...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No Games in Firestore Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Save your first game using the "Save / Export" menu above to populate this admin log.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {games.map((game, gIdx) => {
              const gameDateStr = formatDateTime(game.timestamp);
              const isDeletingThis = deletingGameId === game.id;
              const rosterList = Array.isArray(game.roster) ? game.roster : [];
              const isExpanded = expandedGames.has(game.id);

              return (
                <div key={game.id || `game-${gIdx}`} className="p-3 sm:p-4 space-y-2.5">
                  {/* Game Header Row (Accordion Toggle) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleGameExpanded(game.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleGameExpanded(game.id);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all cursor-pointer select-none",
                      isExpanded
                        ? "bg-slate-100/90 border-slate-300 shadow-2xs"
                        : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300"
                    )}
                    aria-expanded={isExpanded}
                    title={isExpanded ? "Click to collapse" : "Click to expand"}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                        {gameDateStr}
                      </span>
                      <span className="hidden sm:inline-block text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {rosterList.length} Players Recorded
                      </span>
                    </div>

                    {/* Right Controls: Chevron & Delete Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Expand / Collapse Chevron Icon Button */}
                      <div
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-1 py-1 rounded transition-colors"
                        title={isExpanded ? "Collapse game details" : "Expand game details"}
                      >
                        <span className="hidden md:inline text-[11px] font-medium text-slate-400">
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        )}
                      </div>

                      {/* Delete Game Button (stops propagation to prevent accordion toggling) */}
                      <button
                        type="button"
                        id={`btn-delete-game-${game.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(game.id);
                        }}
                        disabled={isDeletingThis}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all active:scale-95 shrink-0",
                          "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50"
                        )}
                        title="Delete this entire game record from database"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete Game</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-Table for This Game (only rendered when expanded) */}
                  {isExpanded && (
                    <div className="overflow-x-auto pt-1 animate-in fade-in duration-150">
                      <table className="w-full text-xs text-left border-collapse min-w-[620px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 bg-slate-50/40">
                          <th className="py-2 px-2.5 font-semibold text-slate-700 w-36 sm:w-44">Player Name</th>
                          <th className="py-2 px-1 text-center w-12" title="Period 1 Minutes">P1</th>
                          <th className="py-2 px-1 text-center w-12" title="Period 2 Minutes">P2</th>
                          <th className="py-2 px-1 text-center w-12" title="Period 3 Minutes">P3</th>
                          <th className="py-2 px-1 text-center w-12" title="Period 4 Minutes">P4</th>
                          <th className="py-2 px-1 text-center w-14" title="Period 5 Minutes">P5</th>
                          <th className="py-2 px-2 text-center w-14 font-extrabold text-slate-900 bg-slate-100/60 border-l border-r border-slate-200" title="Game Total Minutes">TOT</th>
                          <th className="py-2 px-2 text-center w-14 font-semibold text-slate-600" title="Season Total Periods">STOT</th>
                          <th className="py-2 px-1 text-center w-12 font-semibold text-slate-600" title="Games Played">GP</th>
                          <th className="py-2 px-1 text-center w-12 font-semibold text-slate-600" title="Average Periods Per Game">AVG</th>
                          <th className="py-2 px-2 text-center w-16 text-slate-400">Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rosterList.map((player, pIdx) => {
                          const rowKey = `${game.id}-${pIdx}`;
                          const isEditing = editingRowKey === rowKey;

                          // Normalized period counts
                          const p1Period = getPeriodCount(player.p1);
                          const p2Period = getPeriodCount(player.p2);
                          const p3Period = getPeriodCount(player.p3);
                          const p4Period = getPeriodCount(player.p4);
                          const p5Period = getPeriodCount(player.p5);

                          // Calculated minutes for display
                          const p1Min = p1Period * MINUTES_PER_PERIOD;
                          const p2Min = p2Period * MINUTES_PER_PERIOD;
                          const p3Min = p3Period * MINUTES_PER_PERIOD;
                          const p4Min = p4Period * MINUTES_PER_PERIOD;
                          const p5Min = p5Period * MINUTES_PER_PERIOD;

                          const totMinutes = (p1Period + p2Period + p3Period + p4Period + p5Period) * MINUTES_PER_PERIOD;

                          // Lookup current Season Stats for this player
                          const stat = (player.id && seasonStats[player.id])
                            ? seasonStats[player.id]
                            : (player.name && seasonStats[player.name.trim().toLowerCase()])
                            ? seasonStats[player.name.trim().toLowerCase()]
                            : { stot: 0, gp: 0, avg: '0.0' };

                          // Calculate dynamic live total during inline editing
                          const liveTotMinutes = editValues
                            ? (Number(editValues.p1 || 0) +
                               Number(editValues.p2 || 0) +
                               Number(editValues.p3 || 0) +
                               Number(editValues.p4 || 0) +
                               Number(editValues.p5 || 0)) * MINUTES_PER_PERIOD
                            : totMinutes;

                          return (
                            <tr
                              key={rowKey}
                              className={cn(
                                "hover:bg-slate-50/70 transition-colors",
                                isEditing ? "bg-amber-50/50" : (pIdx % 2 === 1 ? "bg-slate-50/20" : "bg-white")
                              )}
                            >
                              {/* Player Name */}
                              <td className="py-1.5 px-2.5 font-medium text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  {player.jersey && (
                                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                                      #{player.jersey}
                                    </span>
                                  )}
                                  <span className="truncate">{player.name || `Player ${pIdx + 1}`}</span>
                                </div>
                              </td>

                              {/* P1 */}
                              <td className="py-1.5 px-1 text-center font-mono">
                                {isEditing && editValues ? (
                                  <div className="flex flex-col items-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="2"
                                      value={editValues.p1}
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          p1: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-12 h-6 text-center text-xs font-bold font-mono rounded border border-amber-400 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <span className="text-[9px] text-slate-400 font-sans">
                                      {(editValues.p1 * MINUTES_PER_PERIOD).toFixed(0)}m
                                    </span>
                                  </div>
                                ) : (
                                  <span className={cn("text-xs", p1Min > 0 ? "font-semibold text-slate-900" : "text-slate-300")}>
                                    {p1Min > 0 ? p1Min : '0'}
                                  </span>
                                )}
                              </td>

                              {/* P2 */}
                              <td className="py-1.5 px-1 text-center font-mono">
                                {isEditing && editValues ? (
                                  <div className="flex flex-col items-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="2"
                                      value={editValues.p2}
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          p2: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-12 h-6 text-center text-xs font-bold font-mono rounded border border-amber-400 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <span className="text-[9px] text-slate-400 font-sans">
                                      {(editValues.p2 * MINUTES_PER_PERIOD).toFixed(0)}m
                                    </span>
                                  </div>
                                ) : (
                                  <span className={cn("text-xs", p2Min > 0 ? "font-semibold text-slate-900" : "text-slate-300")}>
                                    {p2Min > 0 ? p2Min : '0'}
                                  </span>
                                )}
                              </td>

                              {/* P3 */}
                              <td className="py-1.5 px-1 text-center font-mono">
                                {isEditing && editValues ? (
                                  <div className="flex flex-col items-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="2"
                                      value={editValues.p3}
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          p3: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-12 h-6 text-center text-xs font-bold font-mono rounded border border-amber-400 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <span className="text-[9px] text-slate-400 font-sans">
                                      {(editValues.p3 * MINUTES_PER_PERIOD).toFixed(0)}m
                                    </span>
                                  </div>
                                ) : (
                                  <span className={cn("text-xs", p3Min > 0 ? "font-semibold text-slate-900" : "text-slate-300")}>
                                    {p3Min > 0 ? p3Min : '0'}
                                  </span>
                                )}
                              </td>

                              {/* P4 */}
                              <td className="py-1.5 px-1 text-center font-mono">
                                {isEditing && editValues ? (
                                  <div className="flex flex-col items-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="2"
                                      value={editValues.p4}
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          p4: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-12 h-6 text-center text-xs font-bold font-mono rounded border border-amber-400 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <span className="text-[9px] text-slate-400 font-sans">
                                      {(editValues.p4 * MINUTES_PER_PERIOD).toFixed(0)}m
                                    </span>
                                  </div>
                                ) : (
                                  <span className={cn("text-xs", p4Min > 0 ? "font-semibold text-slate-900" : "text-slate-300")}>
                                    {p4Min > 0 ? p4Min : '0'}
                                  </span>
                                )}
                              </td>

                              {/* P5 (Coach's choice / subs) */}
                              <td className="py-1.5 px-1 text-center font-mono">
                                {isEditing && editValues ? (
                                  <div className="flex flex-col items-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="2"
                                      value={editValues.p5}
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          p5: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-12 h-6 text-center text-xs font-bold font-mono rounded border border-amber-400 bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <span className="text-[9px] text-slate-400 font-sans">
                                      {(editValues.p5 * MINUTES_PER_PERIOD).toFixed(0)}m
                                    </span>
                                  </div>
                                ) : (
                                  <span className={cn("text-xs", p5Min > 0 ? "font-semibold text-slate-900" : "text-slate-300")}>
                                    {p5Min > 0 ? p5Min : '0'}
                                  </span>
                                )}
                              </td>

                              {/* TOT (Game Total Minutes) */}
                              <td className="py-1.5 px-2 text-center font-bold font-mono text-slate-900 bg-slate-100/40 border-l border-r border-slate-200">
                                {isEditing ? (
                                  <span className="text-amber-700 font-extrabold">{liveTotMinutes}m</span>
                                ) : (
                                  <span>{totMinutes}m</span>
                                )}
                              </td>

                              {/* STOT (Season Total Periods) */}
                              <td className="py-1.5 px-2 text-center font-mono text-slate-700 font-semibold">
                                {stat.stot}
                              </td>

                              {/* GP (Games Played) */}
                              <td className="py-1.5 px-1 text-center font-mono text-slate-600">
                                {stat.gp}
                              </td>

                              {/* AVG (Average Periods Per Game) */}
                              <td className="py-1.5 px-1 text-center font-mono text-slate-600">
                                {stat.avg}
                              </td>

                              {/* Inline Edit Action */}
                              <td className="py-1.5 px-2 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(game.id, pIdx, player)}
                                      disabled={isSavingRow}
                                      className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-xs"
                                      title="Save row changes to Firestore"
                                    >
                                      {isSavingRow ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      disabled={isSavingRow}
                                      className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all active:scale-95"
                                      title="Cancel editing"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(game.id, pIdx, player)}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all active:scale-95"
                                    title="Edit period substitution minutes for this player"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>
      )}
    </section>
  );
};
