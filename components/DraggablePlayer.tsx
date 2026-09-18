import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { Player } from '../types';

interface DraggablePlayerProps {
  player: Player;
  periodCount: number;
  onToggleStatus: (id: string) => void;
}

export const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ 
  player, 
  periodCount, 
  onToggleStatus 
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `roster-${player.id}`,
    data: {
      type: 'PLAYER',
      playerId: player.id,
    },
    disabled: !player.isAvailable,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-3 mb-2 rounded-lg shadow-sm border transition-all no-select",
        player.isAvailable ? "bg-white border-gray-200 hover:border-brand-400" : "bg-gray-50 border-gray-200 opacity-75",
        isDragging && "z-50 shadow-xl ring-2 ring-brand-500 opacity-90 rotate-1 scale-105"
      )}
    >
      {/* Drag Handle & Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div 
          {...listeners} 
          {...attributes} 
          className={cn(
            "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100",
            !player.isAvailable && "cursor-not-allowed text-gray-300"
          )}
        >
          <GripVertical size={20} className="text-gray-400" />
        </div>
        
        <div className="flex flex-col">
          <span className={cn("font-semibold truncate text-sm md:text-base", !player.isAvailable && "text-gray-500 line-through")}>
            {player.name}{' '}
            <span className="text-xs text-gray-500 font-normal font-mono">
              {`#${(player.jersey || player.number || '').replace(/^#/, '')} ${player.height || ''} ${(Array.isArray(player.roles) ? player.roles.join(' ') : (player.code || '')).trim()} ${player.defense || ''}`.trim()}
            </span>
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
             <span className={cn(
               "font-medium px-1.5 py-0.5 rounded",
               periodCount > 5 ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
             )}>
              {periodCount} periods
             </span>
          </div>
        </div>
      </div>

      {/* Availability Toggle */}
      <button
        onClick={() => onToggleStatus(player.id)}
        className={cn(
          "ml-2 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          player.isAvailable 
            ? "text-brand-500 hover:bg-brand-50 focus:ring-brand-500" 
            : "text-red-500 hover:bg-red-50 focus:ring-red-500"
        )}
        aria-label={player.isAvailable ? "Mark unavailable" : "Mark available"}
      >
        {player.isAvailable ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
      </button>
    </div>
  );
};