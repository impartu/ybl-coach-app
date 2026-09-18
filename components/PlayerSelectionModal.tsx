import React from 'react';
import { X, User, AlertCircle } from 'lucide-react';
import { Player } from '../types';
import { cn } from '../utils/cn';

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (playerId: string) => void;
  players: Player[];
  currentPeriodIndex: number;
  occupiedPlayerIdsInPeriod: Set<string>;
  periodName: string;
  isBlackAndWhite?: boolean;
}

export const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  players,
  currentPeriodIndex,
  occupiedPlayerIdsInPeriod,
  periodName,
  isBlackAndWhite = false
}) => {
  if (!isOpen) return null;

  // Filter only available and active players for the list
  const availablePlayers = players.filter(p => p.isAvailable && p.isActiveOnRoster !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Assign Player</h3>
            <p className="text-sm text-slate-500">Select a player for {periodName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {availablePlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
              <p>No available players found.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {availablePlayers.map((player) => {
                const isAlreadyInPeriod = occupiedPlayerIdsInPeriod.has(player.id);
                
                return (
                  <button
                    key={player.id}
                    onClick={() => !isAlreadyInPeriod && onSelect(player.id)}
                    disabled={isAlreadyInPeriod}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                      isAlreadyInPeriod 
                        ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                        : isBlackAndWhite
                          ? "bg-white border-gray-200 hover:border-slate-900 hover:ring-1 hover:ring-slate-900 hover:bg-slate-50"
                          : "bg-white border-gray-200 hover:border-brand-500 hover:ring-1 hover:ring-brand-500 hover:bg-brand-50/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        isAlreadyInPeriod 
                          ? "bg-gray-200 text-gray-500" 
                          : isBlackAndWhite 
                            ? "bg-slate-200 text-slate-800" 
                            : "bg-brand-100 text-brand-600"
                      )}>
                        <User size={18} />
                      </div>
                      <div>
                        <span className="font-medium block">{player.name}</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {`#${(player.jersey || player.number || '').replace(/^#/, '')} ${player.height || ''} ${(Array.isArray(player.roles) ? player.roles.join(' ') : (player.code || '')).trim()} ${player.defense || ''}`.trim()}
                        </span>
                      </div>
                    </div>
                    
                    {isAlreadyInPeriod && (
                      <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded text-gray-500">
                        Playing
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};