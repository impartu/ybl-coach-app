export interface Player {
  id: string;
  name: string;
  jersey: string;
  height: string;
  roles: string[]; // e.g., ['R', 'H', 'C']
  defense: string; // 'A', 'B', 'C', 'D'
  isAvailable: boolean;
  isActiveOnRoster?: boolean;
  number?: string;
  code?: string;
}

export interface RotationState {
  [key: string]: string | null; // Key: "periodIndex-slotIndex", Value: playerId
}

export const TOTAL_PERIODS = 5;
export const SLOTS_PER_PERIOD = 5;
export const MINUTES_PER_PERIOD = 8;

export interface SavedGamePlayer {
  id?: string;
  name: string;
  jersey?: string;
  p1?: number;
  p2?: number;
  p3?: number;
  p4?: number;
  p5?: number;
  tot_periods?: number;
  tot_minutes?: number;
  [key: string]: any;
}

export interface SavedGame {
  id: string;
  timestamp: any;
  roster: SavedGamePlayer[];
}

export interface PlayerSeasonStats {
  stot: number;
  gp: number;
  avg: string;
}

export interface AssignSettings {
  requireRoles: boolean;
  extraMinutes: 'development' | 'competitive';
  balanceDefense: boolean;
  staggerDepth: boolean;
}

export const DEFAULT_ASSIGN_SETTINGS: AssignSettings = {
  requireRoles: false,
  extraMinutes: 'development',
  balanceDefense: false,
  staggerDepth: false,
};

// Helper type for Drag and Drop data
export interface DraggableData {
  type: 'PLAYER' | 'SLOT_ITEM';
  playerId: string;
  originSlotId?: string; // If dragged from a slot
}

export interface DroppableData {
  periodIndex: number;
  slotIndex: number;
}