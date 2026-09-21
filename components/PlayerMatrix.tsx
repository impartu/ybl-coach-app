import React from 'react';
import { Check } from 'lucide-react';
import { Player, PlayerSeasonStats } from '../types';
import { cn } from '../utils/cn';

interface PlayerMatrixProps {
  players: Player[];
  rotation: Record<string, string | null>;
  onTogglePeriod: (playerId: string, periodIndex: number) => void;
  onToggleStatus: (playerId: string) => void;
  periodNames: string[];
  isBlackAndWhite?: boolean;
  seasonTotals?: Record<string, number>;
  seasonStats?: Record<string, PlayerSeasonStats>;
  isExpandedView?: boolean;
}

export const PlayerMatrix: React.FC<PlayerMatrixProps> = ({
  players,
  rotation,
  onTogglePeriod,
  onToggleStatus,
  periodNames,
  isBlackAndWhite = false,
  seasonTotals = {},
  seasonStats = {},
  isExpandedView = false
}) => {
  
  const isPlayerInPeriod = (playerId: string, periodIndex: number) => {
    for (let s = 0; s < 5; s++) {
      if (rotation[`${periodIndex}-${s}`] === playerId) return true;
    }
    return false;
  };

  const getPlayerTotalPeriods = (playerId: string) => {
    return Object.values(rotation).filter(id => id === playerId).length;
  };

  const getPlayerSeasonTotal = (player: Player) => {
    if (player.id && seasonTotals[player.id] !== undefined) {
      return seasonTotals[player.id];
    }
    return seasonTotals[player.name.trim().toLowerCase()] ?? 0;
  };

  const getPlayerSeasonStats = (player: Player): PlayerSeasonStats => {
    if (player.id && seasonStats[player.id]) {
      return seasonStats[player.id];
    }
    const nameKey = player.name.trim().toLowerCase();
    if (seasonStats[nameKey]) {
      return seasonStats[nameKey];
    }
    const stot = getPlayerSeasonTotal(player);
    return { stot, gp: 0, avg: '0.0' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col w-full">
      <div className="w-full overflow-x-auto scrollbar-hide relative">
        <table className={cn("w-full text-xs sm:text-sm text-left border-collapse", isExpandedView ? "min-w-[560px] sm:min-w-full" : "")}>
          <thead className="text-[10px] sm:text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              {/* Player Column */}
              <th className="px-1.5 sm:px-3 py-2 font-medium text-left w-28 sm:w-32 md:w-auto">Player</th>
              
              {/* Responsive Period Headers */}
              {periodNames.map((name, idx) => (
                <th key={idx} className="px-0.5 sm:px-1 py-2 font-medium text-center w-7 sm:w-9 md:w-auto">
                  <span className="md:hidden">P{idx + 1}</span>
                  <span className="hidden md:inline">{name}</span>
                </th>
              ))}
              
              {/* Total Header */}
              <th className="bg-gray-50 px-1 sm:px-2 py-2 font-bold text-center w-7 sm:w-10 md:w-16 border-l border-gray-100 text-[10px] sm:text-xs">
                TOT
              </th>

              {/* Season Total Header */}
              <th className="bg-gray-50 px-1 sm:px-2 py-2 font-bold text-center w-8 sm:w-10 md:w-16 border-l border-gray-100 text-[10px] sm:text-xs">
                STOT
              </th>

              {/* Conditional Games Played (GP) & Average Periods (AVG) */}
              {isExpandedView && (
                <th 
                  className="bg-gray-50 px-1 sm:px-2 py-2 font-bold text-center w-8 sm:w-10 md:w-16 border-l border-gray-100 text-[10px] sm:text-xs"
                  title="Games Played (Snapshots with >0 periods)"
                >
                  GP
                </th>
              )}
              {isExpandedView && (
                <th 
                  className="bg-gray-50 px-1 sm:px-2 py-2 font-bold text-center w-9 sm:w-12 md:w-16 border-l border-gray-100 text-[10px] sm:text-xs"
                  title="Average Periods Per Game (STOT / GP)"
                >
                  AVG
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {players.filter(p => p.isActiveOnRoster !== false).map((player) => {
              const stats = getPlayerSeasonStats(player);

              return (
              <tr 
                key={player.id} 
                className={cn(
                  "transition-colors", 
                  player.isAvailable ? "hover:bg-gray-50" : "bg-gray-50/40 hover:bg-gray-100/50"
                )}
              >
                {/* Player Name Cell - Tap to Toggle Availability */}
                <td
                  onClick={() => onToggleStatus(player.id)}
                  className={cn(
                    "px-1.5 sm:px-3 py-1 sm:py-2 cursor-pointer group select-none relative border-l-2 sm:border-l-4 transition-all w-28 sm:w-32 md:w-auto max-w-[115px] sm:max-w-none",
                    // 1. Status Slivers (Left Border)
                    player.isAvailable
                      ? (isBlackAndWhite ? "border-slate-900" : "border-brand-500") // Checked In
                      : (isBlackAndWhite ? "border-slate-300" : "border-red-500"),   // Checked Out
                  )}
                  title={player.isAvailable ? "Tap to Bench (Mark Unavailable)" : "Tap to Activate"}
                >
                  <div className="flex flex-col justify-center h-full pl-0.5 sm:pl-1 pb-0.5">
                    {/* Name and Number/Codes */}
                    <span className={cn(
                      "text-xs sm:text-sm font-bold block truncate leading-tight sm:leading-relaxed",
                      player.isAvailable ? "text-slate-900" : "text-slate-500"
                    )}>
                      {player.name}
                    </span>
                    <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
                      <span className={cn(
                        "text-[9px] sm:text-xs font-medium font-mono whitespace-nowrap truncate",
                        player.isAvailable ? "text-slate-500" : "text-gray-400"
                      )}>
                        {`#${(player.jersey || player.number || '').replace(/^#/, '')} ${player.height || ''} ${(Array.isArray(player.roles) ? player.roles.join(' ') : (player.code || '')).trim()} ${player.defense || ''}`.trim()}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Period Cells */}
                {periodNames.map((_, pIndex) => {
                  const isAssigned = isPlayerInPeriod(player.id, pIndex);
                  
                  return (
                    <td key={pIndex} className="px-0.5 py-1 sm:px-1 sm:py-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          if (player.isAvailable) onTogglePeriod(player.id, pIndex);
                        }}
                        disabled={!player.isAvailable}
                        className={cn(
                          "w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded sm:rounded-md flex items-center justify-center mx-auto transition-all border",
                          !player.isAvailable 
                            ? "border-transparent bg-transparent text-transparent cursor-not-allowed"
                            : isAssigned
                              ? (isBlackAndWhite 
                                  ? "bg-slate-900 border-slate-950 text-white shadow-sm hover:bg-slate-800" 
                                  : "bg-brand-500 border-brand-600 text-white shadow-sm hover:bg-brand-600")
                              : (isBlackAndWhite
                                  ? "bg-white border-slate-300 text-transparent hover:border-slate-500 hover:bg-slate-100"
                                  : "bg-slate-50 border-slate-200 text-transparent hover:border-brand-300 hover:bg-brand-50")
                        )}
                      >
                        <Check strokeWidth={3} className={cn("w-3 h-3 sm:w-4 sm:h-4 transition-transform", isAssigned ? "scale-100" : "scale-0")} />
                      </button>
                    </td>
                  );
                })}

                {/* Total Cell */}
                <td className="px-1 sm:px-2 py-1 sm:py-2 text-center border-l border-gray-100">
                   <span className={cn(
                     "font-bold text-xs sm:text-sm md:text-base",
                     getPlayerTotalPeriods(player.id) > 4 
                       ? (isBlackAndWhite ? "text-slate-950 underline font-black" : "text-red-600") 
                       : "text-slate-800",
                     !player.isAvailable && "opacity-30"
                   )}>
                     {getPlayerTotalPeriods(player.id)}
                   </span>
                </td>

                {/* Season Total Cell */}
                <td className="px-1 sm:px-2 py-1 sm:py-2 text-center border-l border-gray-100">
                   <span className={cn(
                     "font-bold text-xs sm:text-sm md:text-base",
                     isBlackAndWhite ? "text-slate-900" : "text-slate-700",
                     !player.isAvailable && "opacity-30"
                   )}>
                     {stats.stot}
                   </span>
                </td>

                {/* Conditional Games Played (GP) Cell */}
                {isExpandedView && (
                  <td className="px-1 sm:px-2 py-1 sm:py-2 text-center border-l border-gray-100">
                    <span className={cn(
                      "font-bold text-xs sm:text-sm md:text-base",
                      isBlackAndWhite ? "text-slate-900" : "text-slate-700",
                      !player.isAvailable && "opacity-30"
                    )}>
                      {stats.gp}
                    </span>
                  </td>
                )}

                {/* Conditional Average Periods Per Game (AVG) Cell */}
                {isExpandedView && (
                  <td className="px-1 sm:px-2 py-1 sm:py-2 text-center border-l border-gray-100">
                    <span className={cn(
                      "font-bold text-xs sm:text-sm md:text-base font-mono",
                      isBlackAndWhite ? "text-slate-900" : "text-slate-700",
                      !player.isAvailable && "opacity-30"
                    )}>
                      {stats.avg}
                    </span>
                  </td>
                )}
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
};