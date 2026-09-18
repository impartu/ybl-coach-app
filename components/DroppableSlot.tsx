import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { X, Plus } from 'lucide-react';
import { cn } from '../utils/cn';
import { Player } from '../types';

interface DroppableSlotProps {
  periodIndex: number;
  slotIndex: number;
  assignedPlayerId: string | null;
  playerDetails?: Player;
  onRemove: (pIdx: number, sIdx: number) => void;
  onClick: (pIdx: number, sIdx: number) => void;
  isInvalid?: boolean; // Used for visual feedback during drag if invalid
  isStayer?: boolean; // True if player was in the previous period
  isBlackAndWhite?: boolean;
}

export const DroppableSlot: React.FC<DroppableSlotProps> = ({
  periodIndex,
  slotIndex,
  assignedPlayerId,
  playerDetails,
  onRemove,
  onClick,
  isInvalid,
  isStayer,
  isBlackAndWhite = false
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${periodIndex}-${slotIndex}`,
    data: {
      periodIndex,
      slotIndex,
    },
  });

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the slot click
    onRemove(periodIndex, slotIndex);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={() => onClick(periodIndex, slotIndex)}
      className={cn(
        "relative flex items-center justify-center h-10 sm:h-14 md:h-16 text-sm border rounded-md transition-all duration-200 mb-1 sm:mb-2 cursor-pointer group",
        // Base Drop/Hover States
        isOver && !assignedPlayerId && !isInvalid && (
          isBlackAndWhite 
            ? "bg-slate-100 border-slate-900 ring-2 ring-slate-300" 
            : "bg-brand-50 border-brand-400 ring-2 ring-brand-200"
        ),
        isOver && isInvalid && "bg-red-50 border-red-400 ring-2 ring-red-200",
        !isOver && !assignedPlayerId && (
          isBlackAndWhite
            ? "bg-white border-dashed border-gray-300 hover:border-slate-600 hover:bg-slate-50 text-gray-400"
            : "bg-white border-dashed border-gray-300 hover:border-brand-400 hover:bg-brand-50/20 text-gray-400"
        ),
        
        // Assigned Player States
        // Fresh (Orange turns to White with bold dark border in B&W mode)
        assignedPlayerId && !isStayer && (
          isBlackAndWhite 
            ? "bg-white border-2 border-slate-900 text-slate-900 shadow-sm hover:bg-slate-50" 
            : "bg-brand-500 border-brand-600 text-white shadow-sm hover:bg-brand-600"
        ),
        // Stayer (Light Orange turns to light shade gray in B&W mode)
        assignedPlayerId && isStayer && (
          isBlackAndWhite 
            ? "bg-slate-200 border border-slate-400 text-slate-900 shadow-sm hover:bg-slate-300" 
            : "bg-brand-300 border-brand-400 text-brand-950 shadow-sm hover:bg-brand-400"
        )
      )}
      title={assignedPlayerId ? "Click to replace" : "Click to assign"}
    >
      {assignedPlayerId && playerDetails ? (
        <div className="w-full h-full flex items-center justify-between px-1 sm:px-2">
          {/* Text Container - giving it explicit height/padding to avoid clipping */}
          <div className="flex-1 overflow-hidden flex flex-col justify-center pt-1 pb-1.5 min-w-0">
            <span className="font-bold text-[10px] sm:text-xs md:text-sm whitespace-nowrap text-ellipsis leading-snug block w-full text-center sm:text-left">
              {playerDetails.name.split(' ')[0]} {playerDetails.name.split(' ')[1]?.[0]}.
            </span>
            <span className={cn(
              "text-[9px] sm:text-[10px] md:text-xs font-mono leading-none text-center sm:text-left opacity-90 truncate block",
              isBlackAndWhite
                ? "text-slate-600 font-semibold"
                : (isStayer ? "text-brand-900" : "text-brand-100")
            )}>
              {`#${(playerDetails.jersey || playerDetails.number || '').replace(/^#/, '')} ${playerDetails.height || ''} ${(Array.isArray(playerDetails.roles) ? playerDetails.roles.join('') : (playerDetails.code || '')).trim()} ${playerDetails.defense || ''}`.trim()}
            </span>
          </div>
          
          <button
            onClick={handleRemoveClick}
            className={cn(
              "opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1 rounded-full flex-shrink-0 ml-0.5 sm:ml-1",
              isBlackAndWhite
                ? "hover:bg-slate-300 text-slate-700"
                : (isStayer ? "hover:bg-brand-400 text-brand-950" : "hover:bg-brand-700/50 text-white")
            )}
            aria-label="Remove player"
          >
            <X size={12} className="sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          {isOver ? (
             <span className={cn("font-bold text-[10px] sm:text-sm", isBlackAndWhite ? "text-slate-900" : "text-brand-600")}>
               {isInvalid ? 'Full' : 'Drop'}
             </span>
          ) : (
            <>
               <span className={cn(
                 "text-[10px] sm:text-xs font-medium pointer-events-none",
                 isBlackAndWhite ? "group-hover:text-slate-700" : "group-hover:text-brand-500"
               )}>
                 Empty
               </span>
               <Plus size={10} className={cn(
                 "opacity-0 group-hover:opacity-100 transition-opacity",
                 isBlackAndWhite ? "text-slate-700" : "text-brand-500"
               )} />
            </>
          )}
        </div>
      )}
    </div>
  );
};
