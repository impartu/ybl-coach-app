import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { RotateCcw, AlertCircle, Wand2, HelpCircle, Save, Bookmark, BookmarkPlus, Trash2, FileJson, ChevronDown, Settings, ArrowLeft, LogOut, MoreHorizontal, Image as ImageIcon, BarChart3 } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';
import { useAuth } from '../hooks/useAuth';
import { getTeam } from '../services/teamService';
import { getRoster, saveRoster, saveAssignSettings, getDefaultRoster } from '../services/rosterService';
import { getGames, saveGame, updateGame, deleteGame } from '../services/gameService';
import { getFavorites, saveFavorite, deleteFavorite } from '../services/favoriteService';
import { PERIOD_NAMES } from '../constants';
import { Player, RotationState, TOTAL_PERIODS, SLOTS_PER_PERIOD, MINUTES_PER_PERIOD, PlayerSeasonStats, AssignSettings, DEFAULT_ASSIGN_SETTINGS, SavedGame, SavedGamePlayer, FavoriteItem, Team } from '../types';
import { DroppableSlot } from '../components/DroppableSlot';
import { PlayerSelectionModal } from '../components/PlayerSelectionModal';
import { PlayerMatrix } from '../components/PlayerMatrix';
import { HelpModal } from '../components/HelpModal';
import { RosterSettings } from '../components/RosterSettings';
import { SaveExportModal } from '../components/SaveExportModal';
import { AssignStrategyModal } from '../components/AssignStrategyModal';
import { AdminGameLog } from '../components/AdminGameLog';
import { cn } from '../utils/cn';

export function RotationManagerScreen() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, signOutUser } = useAuth();
  const uid = user?.uid ?? '';

  // --- Team State ---
  const [team, setTeam] = useState<Team | null>(null);
  const [isTeamLoading, setIsTeamLoading] = useState(true);

  // --- State ---
  // Dynamic roster state initialized with 10 generic, empty slots (overwritten by
  // fetchRoster() once the team's saved roster, if any, loads from Firestore).
  const [roster, setRoster] = useState<Player[]>(() => getDefaultRoster());
  const players = roster;
  const [rotation, setRotation] = useState<RotationState>({});
  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingRoster, setIsSavingRoster] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSaveExportModalOpen, setIsSaveExportModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isSavingStrategy, setIsSavingStrategy] = useState(false);
  const [assignSettings, setAssignSettings] = useState<AssignSettings>(DEFAULT_ASSIGN_SETTINGS);
  const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
  const [seasonTotals, setSeasonTotals] = useState<Record<string, number>>({});
  const [seasonStats, setSeasonStats] = useState<Record<string, PlayerSeasonStats>>({});
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Favorites State
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<string>('');
  const [favoriteTitle, setFavoriteTitle] = useState<string>('');
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [isDeletingFavorite, setIsDeletingFavorite] = useState(false);

  // Saved Games State (Admin Game Log)
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(false);

  // Master Toggle States for Collapsible Sections (persisted in localStorage)
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(true);
  const [isAdminLogOpen, setIsAdminLogOpen] = useState<boolean>(false);

  // Hydration-safe loading of persisted accordion states from localStorage
  useEffect(() => {
    try {
      const savedRoster = localStorage.getItem('isRosterOpen');
      if (savedRoster !== null) {
        setIsRosterOpen(savedRoster === 'true');
      }
      const savedAdminLog = localStorage.getItem('isAdminLogOpen');
      if (savedAdminLog !== null) {
        setIsAdminLogOpen(savedAdminLog === 'true');
      }
    } catch (err) {
      console.error('Error reading accordion preferences from localStorage:', err);
    }
  }, []);

  const handleToggleRosterOpen = () => {
    setIsRosterOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('isRosterOpen', String(next));
      } catch (err) {
        console.error('Error saving isRosterOpen to localStorage:', err);
      }
      return next;
    });
  };

  const handleToggleAdminLogOpen = () => {
    setIsAdminLogOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('isAdminLogOpen', String(next));
      } catch (err) {
        console.error('Error saving isAdminLogOpen to localStorage:', err);
      }
      return next;
    });
  };

  const fetchSeasonData = async () => {
    if (!teamId) return;
    setIsLoadingGames(true);
    try {
      const gamesList = await getGames(teamId);
      const totals: Record<string, number> = {};
      const gamesCount: Record<string, number> = {};

      gamesList.forEach((game) => {
        const roster = Array.isArray(game.roster) ? game.roster : [];

        roster.forEach((playerData: any) => {
          if (playerData) {
            // Helper to get normalized period count
            const getP = (v: any): number => {
              if (typeof v === 'number') return v > 5 ? v / MINUTES_PER_PERIOD : v;
              const n = parseFloat(v);
              if (isNaN(n)) return 0;
              return n > 5 ? n / MINUTES_PER_PERIOD : n;
            };

            let periods = 0;
            if (typeof playerData.tot_periods === 'number') {
              periods = playerData.tot_periods > 5 ? playerData.tot_periods / MINUTES_PER_PERIOD : playerData.tot_periods;
            } else if (playerData.p1 !== undefined || playerData.p2 !== undefined) {
              periods = getP(playerData.p1) + getP(playerData.p2) + getP(playerData.p3) + getP(playerData.p4) + getP(playerData.p5);
            } else if (typeof playerData.TOT === 'number') {
              periods = playerData.TOT;
            } else {
              periods = Number(playerData.tot_periods || playerData.TOT) || 0;
            }

            // Map by stable player id
            if (playerData.id) {
              totals[playerData.id] = (totals[playerData.id] || 0) + periods;
              if (periods > 0) {
                gamesCount[playerData.id] = (gamesCount[playerData.id] || 0) + 1;
              }
            }
            // Map by name for fallback compatibility with legacy games
            if (playerData.name) {
              const nameKey = String(playerData.name).trim().toLowerCase();
              totals[nameKey] = (totals[nameKey] || 0) + periods;
              if (periods > 0) {
                gamesCount[nameKey] = (gamesCount[nameKey] || 0) + 1;
              }
            }
          }
        });
      });

      // Sort games chronologically descending (newest first) - belt-and-suspenders
      // in case the service fell back to an unordered read (missing index).
      gamesList.sort((a, b) => {
        const getMillis = (ts: any): number => {
          if (!ts) return 0;
          if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate().getTime();
          if (ts instanceof Date) return ts.getTime();
          if (ts.seconds) return ts.seconds * 1000;
          const parsed = new Date(ts).getTime();
          return isNaN(parsed) ? 0 : parsed;
        };
        return getMillis(b.timestamp) - getMillis(a.timestamp);
      });

      setSavedGames(gamesList);

      const stats: Record<string, PlayerSeasonStats> = {};
      const allKeys = new Set([...Object.keys(totals), ...Object.keys(gamesCount)]);
      allKeys.forEach((key) => {
        const stot = totals[key] || 0;
        const gp = gamesCount[key] || 0;
        const avg = gp > 0 ? (stot / gp).toFixed(1) : '0.0';
        stats[key] = { stot, gp, avg };
      });

      setSeasonTotals(totals);
      setSeasonStats(stats);
    } catch (error) {
      console.error('Error fetching season data:', error);
    } finally {
      setIsLoadingGames(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!teamId) return;
    try {
      await deleteGame(teamId, gameId);
      await fetchSeasonData();
    } catch (error) {
      console.error('Error deleting game document from Firestore:', error);
      alert('Failed to delete game document. Please check your connection.');
    }
  };

  const handleUpdateGameRow = async (gameId: string, playerIndex: number, updatedPlayer: SavedGamePlayer) => {
    if (!teamId) return;
    try {
      const targetGame = savedGames.find(g => g.id === gameId);
      if (!targetGame) return;
      const updatedRoster = [...targetGame.roster];
      updatedRoster[playerIndex] = updatedPlayer;

      await updateGame(teamId, gameId, updatedRoster);
      await fetchSeasonData();
    } catch (error) {
      console.error('Error updating game row in Firestore:', error);
      alert('Failed to update game record. Please check your connection.');
    }
  };

  const fetchFavorites = async () => {
    if (!teamId) return;
    try {
      const favs = await getFavorites(teamId);
      setFavorites(favs);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Fetch dynamic roster from Firestore
  const fetchRoster = async () => {
    if (!teamId) return;
    try {
      const rosterDoc = await getRoster(teamId);
      if (rosterDoc) {
        // Load assignSettings if saved
        if (rosterDoc.assignSettings) {
          setAssignSettings({
            requireRoles: typeof rosterDoc.assignSettings.requireRoles === 'boolean' ? rosterDoc.assignSettings.requireRoles : false,
            extraMinutes: rosterDoc.assignSettings.extraMinutes === 'competitive' ? 'competitive' : 'development',
            balanceDefense: typeof rosterDoc.assignSettings.balanceDefense === 'boolean' ? rosterDoc.assignSettings.balanceDefense : false,
            staggerDepth: typeof rosterDoc.assignSettings.staggerDepth === 'boolean' ? rosterDoc.assignSettings.staggerDepth : false,
          });
        }

        const loadedRoster = Array.isArray(rosterDoc.roster) ? rosterDoc.roster : null;

        if (loadedRoster && loadedRoster.length > 0) {
          setRoster(prev => {
            return loadedRoster.map((p: any, idx: number) => {
              const existingById = p.id ? prev.find(ep => ep.id === p.id) : null;
              const existingByName = p.name ? prev.find(ep => ep.name.trim().toLowerCase() === String(p.name).trim().toLowerCase()) : null;
              const existing = existingById || existingByName || prev[idx] || {};

              const id = String(p.id || existing.id || `p${idx + 1}`);
              const jersey = String(p.jersey ?? p.number ?? existing.jersey ?? `${idx + 1}`);
              const roles = Array.isArray(p.roles)
                ? p.roles
                : (typeof p.roles === 'string' ? p.roles.split('').filter(Boolean) : (existing.roles || ['C']));
              const defense = String(p.defense ?? existing.defense ?? 'B');
              const height = String(p.height ?? existing.height ?? '');
              const isAvailable = typeof p.isAvailable === 'boolean' ? p.isAvailable : (existing.isAvailable ?? true);
              const isActiveOnRoster = typeof p.isActiveOnRoster === 'boolean'
                ? p.isActiveOnRoster
                : (typeof existing.isActiveOnRoster === 'boolean' ? existing.isActiveOnRoster : true);
              const name = String(p.name ?? existing.name ?? `Player ${idx + 1}`);

              return {
                id,
                name,
                jersey,
                number: jersey,
                height,
                roles,
                defense,
                isAvailable,
                isActiveOnRoster,
                code: p.code || `${height} ${roles.join('')} ${defense}`.trim()
              };
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching roster from Firestore:', error);
    }
  };

  // Validate team access (must exist and this user must be a member) whenever the route's teamId changes.
  useEffect(() => {
    if (!teamId || !uid) return;
    let isActive = true;
    (async () => {
      setIsTeamLoading(true);
      try {
        const teamDoc = await getTeam(teamId);
        if (!isActive) return;
        if (!teamDoc || !teamDoc.memberIds.includes(uid)) {
          setTeam(null);
          return;
        }
        setTeam(teamDoc);
      } catch (error) {
        console.error('Error loading team:', error);
        if (isActive) setTeam(null);
      } finally {
        if (isActive) setIsTeamLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [teamId, uid]);

  useEffect(() => {
    if (!teamId) return;
    fetchSeasonData();
    fetchFavorites();
    fetchRoster();
  }, [teamId]);

  const handleUpdatePlayer = (index: number, updatedFields: Partial<Player>) => {
    setRoster(prev => {
      const next = [...prev];
      if (next[index]) {
        const updated = { ...next[index], ...updatedFields };
        if (updatedFields.jersey !== undefined) {
          updated.number = updatedFields.jersey;
        }
        const rolesStr = (updated.roles || []).join('');
        updated.code = `${updated.height || ''} ${rolesStr} ${updated.defense || ''}`.trim();
        next[index] = updated;

        // If deactivated from roster, remove from active rotation
        if (updatedFields.isActiveOnRoster === false) {
          const playerId = updated.id;
          setRotation(curr => {
            const rotNext = { ...curr };
            let changed = false;
            Object.keys(rotNext).forEach(key => {
              if (rotNext[key] === playerId) {
                delete rotNext[key];
                changed = true;
              }
            });
            return changed ? rotNext : curr;
          });
        }
      }
      return next;
    });
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    setRoster(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleSaveRoster = async () => {
    if (!teamId) return;
    setIsSavingRoster(true);
    try {
      await saveRoster(teamId, roster);
      alert('Roster Saved!');
    } catch (error) {
      console.error('Error saving roster to Firestore:', error);
      alert('Failed to save roster. Please check your connection.');
    } finally {
      setIsSavingRoster(false);
    }
  };

  const handleSaveAssignSettings = async (newSettings: AssignSettings) => {
    if (!teamId) return;
    setIsSavingStrategy(true);
    try {
      await saveAssignSettings(teamId, newSettings);
      setAssignSettings(newSettings);
      setIsStrategyModalOpen(false);
    } catch (error) {
      console.error('Error saving assign strategy settings to Firestore:', error);
      alert('Failed to save strategy settings. Please check your connection.');
    } finally {
      setIsSavingStrategy(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!teamId) return;
    if (!favoriteTitle.trim()) {
      alert('Please enter a title for the favorite.');
      return;
    }
    setIsSavingFavorite(true);
    try {
      const newId = await saveFavorite(teamId, favoriteTitle.trim(), rotation, uid);
      alert('Favorite Saved!');
      setFavoriteTitle('');
      await fetchFavorites();
      setSelectedFavoriteId(newId);
    } catch (error) {
      console.error('Error saving favorite:', error);
      alert('Failed to save favorite. Please check your connection.');
    } finally {
      setIsSavingFavorite(false);
    }
  };

  const handleLoadFavorite = () => {
    if (!selectedFavoriteId) {
      alert('Please select a saved favorite from the dropdown.');
      return;
    }
    const fav = favorites.find(f => f.id === selectedFavoriteId);
    if (!fav) {
      alert('Favorite not found.');
      return;
    }
    setRotation(fav.gridState || {});
  };

  const handleDeleteFavorite = async () => {
    if (!teamId) return;
    if (!selectedFavoriteId) {
      alert('Please select a favorite to delete.');
      return;
    }
    const fav = favorites.find(f => f.id === selectedFavoriteId);
    const confirmed = window.confirm(`Delete favorite "${fav?.name || 'Lineup'}"?`);
    if (!confirmed) return;

    setIsDeletingFavorite(true);
    try {
      await deleteFavorite(teamId, selectedFavoriteId);
      setSelectedFavoriteId('');
      await fetchFavorites();
    } catch (error) {
      console.error('Error deleting favorite:', error);
      alert('Failed to delete favorite.');
    } finally {
      setIsDeletingFavorite(false);
    }
  };

  // Key to force full UI remount on reset
  const [resetKey, setResetKey] = useState(0);

  // Modal State
  const [selectionSlot, setSelectionSlot] = useState<{pIndex: number, sIndex: number} | null>(null);

  // --- Sensors ---
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // --- Helpers ---

  const getPlayer = useCallback((id: string) => players.find(p => p.id === id), [players]);

  const isPlayerInPeriod = useCallback((playerId: string, periodIndex: number, currentRotation: RotationState = rotation) => {
    for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
      if (currentRotation[`${periodIndex}-${s}`] === playerId) {
        return true;
      }
    }
    return false;
  }, [rotation]);

  const getOccupiedIdsInPeriod = useCallback((pIndex: number): Set<string> => {
    const ids = new Set<string>();
    for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
      const pid = rotation[`${pIndex}-${s}`];
      if (pid) ids.add(pid);
    }
    return ids;
  }, [rotation]);

  // --- Auto Assign Logic (Adaptive Monte Carlo Strategy) ---

  const handleAutoAssign = () => {
    // Explicitly filter out inactive roster players (isActiveOnRoster === false) AND absent players (!p.isAvailable)
    const availablePlayers = players.filter(p => p.isAvailable && p.isActiveOnRoster !== false);
    const playerCount = availablePlayers.length;

    if (playerCount < 5) {
      alert("Need at least 5 available players to create a valid rotation.");
      return;
    }

    // 1. Capture User Constraints for Period 1
    const p1Locks: { [slot: number]: string } = {};
    const p1LockedIds = new Set<string>();

    for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
      const pid = rotation[`0-${s}`];
      if (pid && availablePlayers.find(p => p.id === pid)) {
        p1Locks[s] = pid;
        p1LockedIds.add(pid);
      }
    }

    // Monte Carlo Configuration
    const MAX_ATTEMPTS = 2000;
    let bestRotation: RotationState | null = null;
    let fewestViolations = Infinity;

    // Simulation Loop
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const tempRotation: RotationState = {};

      // Helper to generate a random period (returns array of IDs)
      const generateRandomPeriod = (periodIndex: number, lockedSlots: { [s: number]: string } = {}) => {
        const periodIds: string[] = [];
        const lockedIds = new Set(Object.values(lockedSlots));

        // Pool of players available to be picked (excluding those locked in this period)
        const pool = availablePlayers.filter(p => !lockedIds.has(p.id));
        // Shuffle pool
        const shuffled = [...pool].sort(() => Math.random() - 0.5);

        let poolIdx = 0;
        // Try to fill all 5 slots
        for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
          if (lockedSlots[s]) {
            tempRotation[`${periodIndex}-${s}`] = lockedSlots[s];
            periodIds.push(lockedSlots[s]);
          } else {
            // Pick next from shuffled pool
            if (poolIdx < shuffled.length) {
              const pid = shuffled[poolIdx].id;
              tempRotation[`${periodIndex}-${s}`] = pid;
              periodIds.push(pid);
              poolIdx++;
            }
          }
        }
        return periodIds;
      };

      // Generate P1 (Respecting Locks)
      generateRandomPeriod(0, p1Locks);

      // Generate P2, P3, P4 (Pure Random Selection of 5)
      generateRandomPeriod(1);
      generateRandomPeriod(2);
      generateRandomPeriod(3);

      // --- CHECK CONSTRAINTS ---
      let currentAttemptViolations = 0;

      // Helper to check if player is in a specific period in this temp rotation
      const checkPlay = (pid: string, pIdx: number) => {
        for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
          if (tempRotation[`${pIdx}-${s}`] === pid) return true;
        }
        return false;
      };

      // Calculate Empty Spots (Constraint E) - Heavily penalized
      let emptySpots = 0;
      for(let p = 0; p < 4; p++) {
           for(let s = 0; s < SLOTS_PER_PERIOD; s++) {
               if (!tempRotation[`${p}-${s}`]) emptySpots++;
           }
      }
      // Penalize empty spots massively to ensure "Best Fit" prioritizes a full grid
      currentAttemptViolations += (emptySpots * 10000);

      if (playerCount === 5) {
        // STRATEGY: 5 Players
        // Just fill every box. No fairness rules apply (everyone plays everything).
        // Since we prioritized empty spots above, violations are just 0 if full.
      }
      else if (playerCount === 6) {
        // STRATEGY: 6 Players
        // Relaxed Rule: Allow up to 2 players to play all 4 initial periods.

        let playersPlayingAll4 = 0;
        for (const p of availablePlayers) {
             if (checkPlay(p.id, 0) && checkPlay(p.id, 1) && checkPlay(p.id, 2) && checkPlay(p.id, 3)) {
                 playersPlayingAll4++;
             }
        }

        if (playersPlayingAll4 > 2) {
             // Penalize each extra player playing 4 straight periods
             currentAttemptViolations += (playersPlayingAll4 - 2) * 10;
        }
      }
      else {
        // STRATEGY: 7+ Players
        // Strict Rule: APPLY ALL RULES.

        // Constraint A: Every player plays AT LEAST 1 period in P1 or P2.
        for (const p of availablePlayers) {
          if (!checkPlay(p.id, 0) && !checkPlay(p.id, 1)) {
            currentAttemptViolations++;
          }
        }

        // Constraint B: Every player plays AT LEAST 1 period in P3 or P4.
        for (const p of availablePlayers) {
          if (!checkPlay(p.id, 2) && !checkPlay(p.id, 3)) {
            currentAttemptViolations++;
          }
        }

        // Constraint C: Every player sits out AT LEAST 1 period in the first 4 periods (P1-P4).
        for (const p of availablePlayers) {
          if (checkPlay(p.id, 0) && checkPlay(p.id, 1) && checkPlay(p.id, 2) && checkPlay(p.id, 3)) {
            currentAttemptViolations++;
          }
        }
      }

      // Evaluation
      if (currentAttemptViolations === 0) {
        bestRotation = tempRotation;
        break; // Found a perfect schedule!
      }

      // Keep track of the best imperfect schedule
      if (currentAttemptViolations < fewestViolations) {
        fewestViolations = currentAttemptViolations;
        bestRotation = tempRotation;
      }
    }

    // If we failed completely (should rely on fallback)
    if (!bestRotation) return;

    // Constraint D: Period 5 (Coach's Choice / Fairness with Extra Minutes Strategy)
    // Calculate play counts from P1-P4 in the best rotation
    const counts: Record<string, number> = {};
    availablePlayers.forEach(p => counts[p.id] = 0);

    Object.values(bestRotation).forEach(pid => {
      if (pid && counts[pid] !== undefined) counts[pid]++;
    });

    // Helper to get season average for a player
    const getSeasonAvg = (p: Player): number => {
      const stat = seasonStats[p.id] || seasonStats[p.name?.trim().toLowerCase()];
      if (!stat || !stat.avg) return 0;
      const num = parseFloat(stat.avg);
      return isNaN(num) ? 0 : num;
    };

    const defRank: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
    const getDefRank = (p: Player): number => defRank[p.defense?.toUpperCase()] || 2;

    const getRoleScore = (p: Player): number => {
      let score = 0;
      if (p.roles?.includes('H')) score += 2;
      if (p.roles?.includes('R')) score += 1;
      return score;
    };

    const compareExtraMinutes = (a: Player, b: Player): number => {
      if (assignSettings.extraMinutes === 'development') {
        // Development: lowest averages get extra periods first (ascending)
        const avgA = getSeasonAvg(a);
        const avgB = getSeasonAvg(b);
        if (avgA !== avgB) return avgA - avgB;
        return Math.random() - 0.5;
      } else {
        // Competitive: Defense rating (A gets priority, then B, C, D)
        const defA = getDefRank(a);
        const defB = getDefRank(b);
        if (defA !== defB) return defB - defA;

        // Then by Roles (favoring 'H' and 'R')
        const roleA = getRoleScore(a);
        const roleB = getRoleScore(b);
        if (roleA !== roleB) return roleB - roleA;

        // Roster order as ultimate tie-breaker: player closer to index 0 gets extra period
        const idxA = roster.findIndex(p => p.id === a.id);
        const idxB = roster.findIndex(p => p.id === b.id);
        if (idxA !== -1 && idxB !== -1 && idxA !== idxB) return idxA - idxB;

        return Math.random() - 0.5;
      }
    };

    // Sort players by play time (Ascending), and break ties with Extra Minutes Strategy
    const sortedForP5 = [...availablePlayers].sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      const diff = countA - countB;
      if (diff !== 0) return diff; // Those who played fewer periods in P1-P4 MUST play first
      return compareExtraMinutes(a, b);
    });

    // Fill P5 with the 5 players who need/earn the period
    const p5Players = sortedForP5.slice(0, SLOTS_PER_PERIOD);
    p5Players.forEach((p, sIdx) => {
      bestRotation![`4-${sIdx}`] = p.id;
    });

    // --- Post-Draft Swaps ---

    // Helper to check if a player is in a given period in bestRotation
    const isPlayerInRotPeriod = (grid: RotationState, pid: string, pIdx: number): boolean => {
      for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
        if (grid[`${pIdx}-${s}`] === pid) return true;
      }
      return false;
    };

    // Helper to get players in a given period in bestRotation with their slot index
    const getPeriodSlots = (grid: RotationState, pIdx: number) => {
      const slots: { slot: number; player: Player }[] = [];
      for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
        const pid = grid[`${pIdx}-${s}`];
        const pl = availablePlayers.find(p => p.id === pid);
        if (pl) slots.push({ slot: s, player: pl });
      }
      return slots;
    };

    // Helper to ensure swaps do not break the 1-per-half league rule logic
    // Constraint A: Every player plays at least 1 in P1 or P2.
    // Constraint B: Every player plays at least 1 in P3 or P4.
    // Constraint C: Every player sits at least 1 in P1-P4 (for rosters >= 7).
    const satisfiesLeagueHalfRules = (grid: RotationState, pAId: string, pBId: string): boolean => {
      const pCount = availablePlayers.length;
      if (pCount <= 5) return true;

      const checkPlayer = (pid: string) => {
        let p1p2 = 0;
        let p3p4 = 0;
        let p1p4Total = 0;
        for (let p = 0; p < 4; p++) {
          for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
            if (grid[`${p}-${s}`] === pid) {
              if (p < 2) p1p2++;
              else p3p4++;
              p1p4Total++;
            }
          }
        }
        if (p1p2 < 1) return false;
        if (p3p4 < 1) return false;
        if (pCount >= 7 && p1p4Total >= 4) return false;
        return true;
      };

      return checkPlayer(pAId) && checkPlayer(pBId);
    };

    // 2. Role Constraint (Post-Draft Swap)
    if (assignSettings.requireRoles) {
      // 2a. Ensure every period has at least one Handler ('H')
      let handlerSwapAttempts = 0;
      while (handlerSwapAttempts < 50) {
        let deficientPeriod = -1;
        for (let p = 0; p < TOTAL_PERIODS; p++) {
          const slots = getPeriodSlots(bestRotation, p);
          const hasH = slots.some(s => s.player.roles?.includes('H'));
          if (!hasH) {
            deficientPeriod = p;
            break;
          }
        }

        if (deficientPeriod === -1) break; // All periods have a handler!

        let swapped = false;
        const otherPeriods = [0, 1, 2, 3, 4].filter(p => p !== deficientPeriod);
        // Prefer donor periods that have more handlers
        otherPeriods.sort((pA, pB) => {
          const countA = getPeriodSlots(bestRotation, pA).filter(s => s.player.roles?.includes('H')).length;
          const countB = getPeriodSlots(bestRotation, pB).filter(s => s.player.roles?.includes('H')).length;
          return countB - countA;
        });

        const deficientSlots = getPeriodSlots(bestRotation, deficientPeriod);

        for (const donorP of otherPeriods) {
          if (swapped) break;
          const donorSlots = getPeriodSlots(bestRotation, donorP);
          const handlersInDonor = donorSlots.filter(s => s.player.roles?.includes('H'));

          for (const hSlot of handlersInDonor) {
            if (swapped) break;
            const hPlayer = hSlot.player;

            // hPlayer must not already be in deficientPeriod
            if (isPlayerInRotPeriod(bestRotation, hPlayer.id, deficientPeriod)) continue;

            for (const defSlot of deficientSlots) {
              const candidate = defSlot.player;
              // Never swap locked slots
              if (deficientPeriod === 0 && p1Locks[defSlot.slot]) continue;
              if (donorP === 0 && p1Locks[hSlot.slot]) continue;

              // candidate must not already be in donorP
              if (!isPlayerInRotPeriod(bestRotation, candidate.id, donorP)) {
                bestRotation[`${deficientPeriod}-${defSlot.slot}`] = hPlayer.id;
                bestRotation[`${donorP}-${hSlot.slot}`] = candidate.id;
                swapped = true;
                break;
              }
            }
          }
        }

        handlerSwapAttempts++;
        if (!swapped) break; // Cannot resolve swap without violating period constraints
      }

      // 2b. Ensure every period has at least one Rim ('R')
      let rimSwapAttempts = 0;
      while (rimSwapAttempts < 50) {
        let deficientPeriod = -1;
        for (let p = 0; p < TOTAL_PERIODS; p++) {
          const slots = getPeriodSlots(bestRotation, p);
          const hasR = slots.some(s => s.player.roles?.includes('R'));
          if (!hasR) {
            deficientPeriod = p;
            break;
          }
        }

        if (deficientPeriod === -1) break; // All periods have a rim!

        let swapped = false;
        const otherPeriods = [0, 1, 2, 3, 4].filter(p => p !== deficientPeriod);
        otherPeriods.sort((pA, pB) => {
          const countA = getPeriodSlots(bestRotation, pA).filter(s => s.player.roles?.includes('R')).length;
          const countB = getPeriodSlots(bestRotation, pB).filter(s => s.player.roles?.includes('R')).length;
          return countB - countA;
        });

        const deficientSlots = getPeriodSlots(bestRotation, deficientPeriod);

        for (const donorP of otherPeriods) {
          if (swapped) break;
          const donorSlots = getPeriodSlots(bestRotation, donorP);
          const rimsInDonor = donorSlots.filter(s => s.player.roles?.includes('R'));

          for (const rSlot of rimsInDonor) {
            if (swapped) break;
            const rPlayer = rSlot.player;

            // rPlayer must not already be in deficientPeriod
            if (isPlayerInRotPeriod(bestRotation, rPlayer.id, deficientPeriod)) continue;

            for (const defSlot of deficientSlots) {
              const candidate = defSlot.player;
              if (candidate.roles?.includes('R')) continue; // Don't remove another rim
              if (deficientPeriod === 0 && p1Locks[defSlot.slot]) continue;
              if (donorP === 0 && p1Locks[rSlot.slot]) continue;

              // Ensure swapping candidate doesn't leave deficientPeriod with 0 handlers
              if (candidate.roles?.includes('H')) {
                const hCountInDeficient = deficientSlots.filter(s => s.player.roles?.includes('H')).length;
                if (hCountInDeficient <= 1 && !rPlayer.roles?.includes('H')) {
                  continue; // Would remove the only handler
                }
              }

              // candidate must not already be in donorP
              if (!isPlayerInRotPeriod(bestRotation, candidate.id, donorP)) {
                bestRotation[`${deficientPeriod}-${defSlot.slot}`] = rPlayer.id;
                bestRotation[`${donorP}-${rSlot.slot}`] = candidate.id;
                swapped = true;
                break;
              }
            }
          }
        }

        rimSwapAttempts++;
        if (!swapped) break;
      }
    }

    // 3. Stagger Depth Logic (Post-Draft Swap)
    // Prevents the bottom two ranked active players in the roster array from sharing the floor
    if (assignSettings.staggerDepth && availablePlayers.length >= 2) {
      const depthPlayer1 = availablePlayers[availablePlayers.length - 1];
      const depthPlayer2 = availablePlayers[availablePlayers.length - 2];
      const depthIds = new Set([depthPlayer1.id, depthPlayer2.id]);

      let staggerAttempts = 0;
      while (staggerAttempts < 50) {
        let conflictPeriod = -1;
        for (let p = 0; p < TOTAL_PERIODS; p++) {
          const hasD1 = isPlayerInRotPeriod(bestRotation, depthPlayer1.id, p);
          const hasD2 = isPlayerInRotPeriod(bestRotation, depthPlayer2.id, p);
          if (hasD1 && hasD2) {
            conflictPeriod = p;
            break;
          }
        }

        if (conflictPeriod === -1) break; // All periods staggered!

        let swapped = false;
        const depthCandidates = [depthPlayer1, depthPlayer2];

        for (const dPlayer of depthCandidates) {
          if (swapped) break;
          const otherDPlayerId = dPlayer.id === depthPlayer1.id ? depthPlayer2.id : depthPlayer1.id;

          // Find slot of dPlayer in conflictPeriod
          let dSlot = -1;
          for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
            if (bestRotation[`${conflictPeriod}-${s}`] === dPlayer.id) {
              dSlot = s;
              break;
            }
          }
          if (dSlot === -1 || (conflictPeriod === 0 && p1Locks[dSlot])) continue;

          // Candidate donor periods that do not already have either depth player
          const candidatePeriods = [0, 1, 2, 3, 4].filter(p => p !== conflictPeriod);

          for (const otherP of candidatePeriods) {
            if (swapped) break;
            if (isPlayerInRotPeriod(bestRotation, dPlayer.id, otherP)) continue;
            if (isPlayerInRotPeriod(bestRotation, otherDPlayerId, otherP)) continue;

            const otherSlots = getPeriodSlots(bestRotation, otherP);
            for (const candSlot of otherSlots) {
              const candidate = candSlot.player;
              // Must be a higher-ranked player (not one of the two depth players)
              if (depthIds.has(candidate.id)) continue;
              if (otherP === 0 && p1Locks[candSlot.slot]) continue;
              if (isPlayerInRotPeriod(bestRotation, candidate.id, conflictPeriod)) continue;

              // Temporarily test swap
              bestRotation[`${conflictPeriod}-${dSlot}`] = candidate.id;
              bestRotation[`${otherP}-${candSlot.slot}`] = dPlayer.id;

              // Check League 1-per-half rules
              const halfRulesValid = satisfiesLeagueHalfRules(bestRotation, dPlayer.id, candidate.id);

              // Check role constraints if enabled
              let rolesValid = true;
              if (assignSettings.requireRoles) {
                const confSlots = getPeriodSlots(bestRotation, conflictPeriod);
                const othSlots = getPeriodSlots(bestRotation, otherP);
                const hasHConf = confSlots.some(s => s.player.roles?.includes('H'));
                const hasRConf = confSlots.some(s => s.player.roles?.includes('R'));
                const hasHOth = othSlots.some(s => s.player.roles?.includes('H'));
                const hasROth = othSlots.some(s => s.player.roles?.includes('R'));
                if (!hasHConf || !hasRConf || !hasHOth || !hasROth) {
                  rolesValid = false;
                }
              }

              if (halfRulesValid && rolesValid) {
                swapped = true;
                break;
              } else {
                // Revert test swap
                bestRotation[`${conflictPeriod}-${dSlot}`] = dPlayer.id;
                bestRotation[`${otherP}-${candSlot.slot}`] = candidate.id;
              }
            }
          }
        }

        staggerAttempts++;
        if (!swapped) break;
      }
    }

    // 4. Defense Balance (Post-Draft Swap)
    if (assignSettings.balanceDefense) {
      const defScoreMap: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
      const getDefScore = (p: Player): number => defScoreMap[p.defense?.toUpperCase()] || 2;

      const calcPeriodDef = (pIdx: number) => {
        const slots = getPeriodSlots(bestRotation!, pIdx);
        return slots.reduce((sum, s) => sum + getDefScore(s.player), 0);
      };

      let balanceAttempts = 0;
      while (balanceAttempts < 50) {
        const periodScores = [0, 1, 2, 3, 4].map(p => ({
          period: p,
          score: calcPeriodDef(p)
        }));

        periodScores.sort((a, b) => b.score - a.score);
        const highest = periodScores[0];
        const lowest = periodScores[periodScores.length - 1];

        // While difference between highest and lowest period is greater than 2
        if (highest.score - lowest.score <= 2) {
          break; // Balanced!
        }

        const highSlots = getPeriodSlots(bestRotation, highest.period);
        const lowSlots = getPeriodSlots(bestRotation, lowest.period);

        // Find an 'A' or 'B' defender in highest period (score >= 3)
        // and a 'C' or 'D' defender in lowest period (score <= 2)
        const candidatesHigh = highSlots.filter(s => getDefScore(s.player) >= 3);
        const candidatesLow = lowSlots.filter(s => getDefScore(s.player) <= 2);

        let swapped = false;

        for (const highCandidate of candidatesHigh) {
          if (swapped) break;
          if (highest.period === 0 && p1Locks[highCandidate.slot]) continue;
          if (isPlayerInRotPeriod(bestRotation, highCandidate.player.id, lowest.period)) continue;

          for (const lowCandidate of candidatesLow) {
            if (lowest.period === 0 && p1Locks[lowCandidate.slot]) continue;
            if (isPlayerInRotPeriod(bestRotation, lowCandidate.player.id, highest.period)) continue;

            // Swapping must improve the defensive balance
            if (getDefScore(highCandidate.player) <= getDefScore(lowCandidate.player)) continue;

            // If staggerDepth is active, ensure we don't bring both depth players together into highest or lowest period
            if (assignSettings.staggerDepth && availablePlayers.length >= 2) {
              const d1Id = availablePlayers[availablePlayers.length - 1].id;
              const d2Id = availablePlayers[availablePlayers.length - 2].id;
              if (lowCandidate.player.id === d1Id && isPlayerInRotPeriod(bestRotation, d2Id, highest.period)) continue;
              if (lowCandidate.player.id === d2Id && isPlayerInRotPeriod(bestRotation, d1Id, highest.period)) continue;
              if (highCandidate.player.id === d1Id && isPlayerInRotPeriod(bestRotation, d2Id, lowest.period)) continue;
              if (highCandidate.player.id === d2Id && isPlayerInRotPeriod(bestRotation, d1Id, lowest.period)) continue;
            }

            // If requireRoles is active, ensure we don't break handler or rim requirement in either period
            if (assignSettings.requireRoles) {
              const highHandlers = highSlots.filter(s => s.player.roles?.includes('H')).length;
              const lowHandlers = lowSlots.filter(s => s.player.roles?.includes('H')).length;
              const highIsH = highCandidate.player.roles?.includes('H');
              const lowIsH = lowCandidate.player.roles?.includes('H');
              if (highIsH && !lowIsH && highHandlers <= 1) continue;
              if (lowIsH && !highIsH && lowHandlers <= 1) continue;

              const highRims = highSlots.filter(s => s.player.roles?.includes('R')).length;
              const lowRims = lowSlots.filter(s => s.player.roles?.includes('R')).length;
              const highIsR = highCandidate.player.roles?.includes('R');
              const lowIsR = lowCandidate.player.roles?.includes('R');
              if (highIsR && !lowIsR && highRims <= 1) continue;
              if (lowIsR && !highIsR && lowRims <= 1) continue;
            }

            // Perform swap and check 1-per-half league rules
            bestRotation[`${highest.period}-${highCandidate.slot}`] = lowCandidate.player.id;
            bestRotation[`${lowest.period}-${lowCandidate.slot}`] = highCandidate.player.id;

            if (!satisfiesLeagueHalfRules(bestRotation, highCandidate.player.id, lowCandidate.player.id)) {
              bestRotation[`${highest.period}-${highCandidate.slot}`] = highCandidate.player.id;
              bestRotation[`${lowest.period}-${lowCandidate.slot}`] = lowCandidate.player.id;
              continue;
            }

            swapped = true;
            break;
          }
        }

        balanceAttempts++;
        if (!swapped) {
          // If no valid pair can be swapped without constraint violations, break
          break;
        }
      }
    }

    setRotation(bestRotation);
  };

  // --- Handlers ---

  const handleToggleStatus = (id: string) => {
    setRoster(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = !p.isAvailable;
        if (!newStatus) {
          // Remove from all slots if marking unavailable
          setRotation(curr => {
            const next = { ...curr };
            Object.keys(next).forEach(key => {
              if (next[key] === id) {
                delete next[key];
              }
            });
            return next;
          });
        }
        return { ...p, isAvailable: newStatus };
      }
      return p;
    }));
  };

  const handleMatrixTogglePeriod = (playerId: string, periodIndex: number) => {
    if (isPlayerInPeriod(playerId, periodIndex)) {
      // Remove player from this period
      setRotation(prev => {
        const next = { ...prev };
        for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
          if (next[`${periodIndex}-${s}`] === playerId) {
            delete next[`${periodIndex}-${s}`];
          }
        }
        return next;
      });
    } else {
      // Add player to this period (Find first empty slot)
      let emptySlotIndex = -1;
      for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
        if (!rotation[`${periodIndex}-${s}`]) {
          emptySlotIndex = s;
          break;
        }
      }

      if (emptySlotIndex !== -1) {
        setRotation(prev => ({
          ...prev,
          [`${periodIndex}-${emptySlotIndex}`]: playerId
        }));
      } else {
        alert(`Period ${periodIndex + 1} is full! Remove a player first.`);
      }
    }
  };

  const handleRemovePlayer = (periodIndex: number, slotIndex: number) => {
    const key = `${periodIndex}-${slotIndex}`;
    setRotation(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleReset = () => {
    if (!window.confirm('Reset rotation? This clears the grid and marks everyone available again.')) {
      return;
    }

    // 1. Clear Data State
    setRotation({});
    setRoster(prev => prev.map(p => ({ ...p, isAvailable: true })));
    setActiveDragPlayerId(null);
    setDragError(null);
    setSelectionSlot(null);

    // 2. Increment Key to Force Full Re-Mount
    // This ensures a clean slate by destroying and recreating the DOM tree
    setResetKey(prev => prev + 1);
  };

  const handleExportImage = async (asBW: boolean, mode: 'save' | 'print') => {
    const previousBW = isBlackAndWhite;
    setIsExporting(true);

    // Open the print window synchronously, before any await, so browsers don't
    // treat it as a blocked popup (the user-gesture context is lost after an
    // async yield). We fill in its content once the canvas is ready.
    let printWindow: Window | null = null;
    if (mode === 'print') {
      printWindow = window.open('', '_blank');
    }

    const element = document.getElementById('app-capture');

    try {
      if (!element) return;

      if (asBW) {
        setIsBlackAndWhite(true);
        // Allow DOM to re-render in high-contrast black & white
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (previousBW) {
        setIsBlackAndWhite(false);
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        // Slight delay to allow UI states to settle
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // html2canvas estimates its own text line-height rather than using the
      // browser's, and reliably underestimates it for the "Inter" web font,
      // clipping the tops of glyphs across the whole capture. Forcing extra
      // line-height room on the real DOM before capturing (so the browser
      // itself lays out taller, already-correct boxes) gives html2canvas's
      // undershoot somewhere safe to land instead of clipping.
      element.classList.add('export-capture-safe-lineheight');
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: asBW ? '#ffffff' : '#f8fafc', // Matches background
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      if (mode === 'save') {
        const filename = asBW ? 'Coach_YBL_Rotation_BW.jpg' : 'Coach_YBL_Rotation.jpg';
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      } else if (printWindow) {
        printWindow.document.write(
          `<html><head><title>Print Rotation</title></head><body style="margin:0"><img src="${dataUrl}" style="width:100%" onload="window.print()" /></body></html>`
        );
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
      printWindow?.close();
    } finally {
      element?.classList.remove('export-capture-safe-lineheight');
      if (asBW) {
        // Automatically revert back to color mode
        setIsBlackAndWhite(false);
      }
      setIsExporting(false);
    }
  };

  const handleSaveGame = async () => {
    if (!teamId) return;
    setIsSaving(true);
    try {
      const activePlayers = players.filter(p => p.isActiveOnRoster !== false);
      const gameRoster = activePlayers.map(player => {
        const isAssigned = (pIdx: number) => {
          for (let s = 0; s < SLOTS_PER_PERIOD; s++) {
            if (rotation[`${pIdx}-${s}`] === player.id) return true;
          }
          return false;
        };

        const p1 = isAssigned(0) ? 1 : 0;
        const p2 = isAssigned(1) ? 1 : 0;
        const p3 = isAssigned(2) ? 1 : 0;
        const p4 = isAssigned(3) ? 1 : 0;
        const p5 = isAssigned(4) ? 1 : 0;

        const tot_periods = p1 + p2 + p3 + p4 + p5;
        const tot_minutes = tot_periods * MINUTES_PER_PERIOD;

        return {
          id: player.id,
          name: player.name,
          jersey: player.jersey || player.number,
          tot_periods,
          tot_minutes,
          p1,
          p2,
          p3,
          p4,
          p5
        };
      });

      await saveGame(teamId, gameRoster, uid);
      await fetchSeasonData();

      alert('Game Saved!');
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Error saving game. Please check your connection and Firestore rules.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Export Season Data ---
  const handleExportSeasonData = async () => {
    if (!teamId) return;
    setIsExportingData(true);
    try {
      const gamesList = await getGames(teamId);

      const formatted = gamesList.map((game) => {
        let formattedTimestamp: string | null = null;
        const ts: any = game.timestamp;
        if (ts?.toDate) {
          formattedTimestamp = ts.toDate().toISOString();
        } else if (ts instanceof Date) {
          formattedTimestamp = ts.toISOString();
        } else if (ts?.seconds) {
          formattedTimestamp = new Date(ts.seconds * 1000).toISOString();
        } else if (typeof ts === 'string') {
          formattedTimestamp = ts;
        }

        return {
          id: game.id,
          roster: game.roster,
          ...(formattedTimestamp ? { timestamp: formattedTimestamp } : {})
        };
      });

      const jsonString = JSON.stringify(formatted, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ybl_season_data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting season data:', error);
      alert('Failed to export season data. Please check your connection.');
    } finally {
      setIsExportingData(false);
    }
  };

  // Slot Click Handler
  const handleSlotClick = (pIndex: number, sIndex: number) => {
    setSelectionSlot({ pIndex, sIndex });
  };

  // Modal Selection Handler
  const handleModalSelect = (playerId: string) => {
    if (!selectionSlot) return;
    const { pIndex, sIndex } = selectionSlot;
    const targetKey = `${pIndex}-${sIndex}`;
    setRotation(prev => ({
      ...prev,
      [targetKey]: playerId
    }));
    setSelectionSlot(null);
  };

  // --- DnD Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const playerId = active.data.current?.playerId;
    if (playerId) {
      setActiveDragPlayerId(playerId);
      setDragError(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Intentionally empty
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragPlayerId(null);
    setDragError(null);

    if (!over) return;

    const playerId = active.data.current?.playerId;
    const periodIndex = over.data.current?.periodIndex;
    const slotIndex = over.data.current?.slotIndex;

    if (!playerId || periodIndex === undefined || slotIndex === undefined) return;

    const targetKey = `${periodIndex}-${slotIndex}`;

    // If dropping in same spot
    if (rotation[targetKey] === playerId) return;

    // Check constraints
    if (isPlayerInPeriod(playerId, periodIndex)) {
      setDragError(`${getPlayer(playerId)?.name} is already playing in Period ${periodIndex + 1}!`);
      setTimeout(() => setDragError(null), 3000);
      return;
    }

    setRotation(prev => ({
      ...prev,
      [targetKey]: playerId
    }));
  };

  const activePlayerDetails = activeDragPlayerId ? getPlayer(activeDragPlayerId) : null;

  // --- Route Guards (after all hooks, so hook order stays stable across renders) ---

  if (!teamId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isTeamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="text-sm text-slate-500">Loading team...</span>
      </div>
    );
  }

  if (!team) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/*
          KEY REMOUNT STRATEGY:
          The key={resetKey} ensures that when resetKey increments, React completely
          destroys and recreates this div and all children. This guarantees all local
          state, selection highlights, and third-party library artifacts are cleared.
      */}
      <div
        id="app-capture"
        key={resetKey}
        className={cn(
          "min-h-screen font-sans pb-20 transition-colors w-full max-w-full overflow-x-hidden",
          isBlackAndWhite ? "bg-white" : "bg-slate-50"
        )}
      >

        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 h-14 sm:h-16 flex flex-nowrap items-center gap-1.5 sm:gap-3">
            {/* Back to Dashboard */}
            <Link
              to="/dashboard"
              data-html2canvas-ignore
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-600 transition-colors shrink-0"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            {/* Team selector: logo + name + chevron, one compact unit, flexible width */}
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 group select-none transition-opacity hover:opacity-90"
              title="Switch team"
            >
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg text-white transition-all shrink-0 group-hover:scale-105",
                isBlackAndWhite ? "bg-slate-900" : "bg-brand-500 shadow-brand-200 shadow-md"
              )}>
                <img src="/icon.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="font-bold text-sm sm:text-base text-slate-800 truncate group-hover:text-brand-600 transition-colors min-w-0">
                {team.name}
              </h1>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-brand-600 transition-colors shrink-0" />
            </Link>

            {/* Primary + utility actions, then overflow */}
            <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 shrink-0" data-html2canvas-ignore>
              {/* Auto Assign - primary action */}
              <button
                id="btn-auto-assign"
                onClick={handleAutoAssign}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 sm:px-4 h-10 text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 text-white shrink-0",
                  isBlackAndWhite ? "bg-slate-800 hover:bg-slate-900" : "bg-brand-500 hover:bg-brand-600 shadow-brand-200"
                )}
                title="Fill remaining slots based on Period 1"
              >
                <Wand2 className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Auto</span>
              </button>

              {/* Strategy Settings - quiet icon button */}
              <button
                id="btn-assign-strategy"
                onClick={() => setIsStrategyModalOpen(true)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg transition-all shadow-sm active:scale-95 border shrink-0",
                  isBlackAndWhite
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                    : "bg-white border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50"
                )}
                title="Auto-Assign Strategy Settings"
                aria-label="Auto-Assign Strategy Settings"
              >
                <Settings className="w-4 h-4 shrink-0" />
              </button>

              {/* Reset - quiet icon button, confirms before clearing */}
              <button
                id="btn-reset-grid"
                onClick={handleReset}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg transition-all shadow-sm active:scale-95 border shrink-0",
                  isBlackAndWhite
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                    : "bg-white border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                )}
                title="Reset Grid"
                aria-label="Reset Grid"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
              </button>

              {/* More - overflow menu */}
              <div className="relative shrink-0">
                <button
                  id="btn-more-menu"
                  onClick={() => setIsMoreMenuOpen(prev => !prev)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg transition-all shadow-sm active:scale-95 border shrink-0",
                    isBlackAndWhite
                      ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                      : "bg-white border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50"
                  )}
                  title="More actions"
                  aria-label="More actions"
                  aria-expanded={isMoreMenuOpen}
                >
                  <MoreHorizontal className="w-4 h-4 shrink-0" />
                </button>

                {isMoreMenuOpen && (
                  <>
                    {/* Click-outside overlay */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-40 py-1.5 overflow-hidden">
                      <button
                        onClick={() => { setIsHelpOpen(true); setIsMoreMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Help &amp; How to Use</span>
                      </button>

                      <div className="my-1 border-t border-slate-100" />
                      <div className="px-3.5 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Save / Export
                      </div>

                      <button
                        onClick={() => { setIsSaveExportModalOpen(true); setIsMoreMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Save or print rotation image</span>
                      </button>
                      <button
                        onClick={() => { handleSaveGame(); setIsMoreMenuOpen(false); }}
                        disabled={isSaving}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{isSaving ? 'Saving...' : 'Add game to season'}</span>
                      </button>
                      <button
                        onClick={() => { handleExportSeasonData(); setIsMoreMenuOpen(false); }}
                        disabled={isExportingData}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                      >
                        <FileJson className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{isExportingData ? 'Exporting...' : 'Export season JSON'}</span>
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => { setIsExpandedView(prev => !prev); setIsMoreMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        <BarChart3 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{isExpandedView ? 'Hide' : 'Show'} season stats</span>
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => { setIsMoreMenuOpen(false); signOutUser(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full overflow-x-hidden">

          {/* Error Toast */}
          {dragError && (
            <div className="fixed top-20 right-4 z-50 bg-white border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right">
              <AlertCircle size={20} />
              <span className="font-medium">{dragError}</span>
            </div>
          )}

          {/* Section 1: Player Matrix (Quick Assign) */}
          <section className="w-full overflow-x-auto">
            <PlayerMatrix
              players={players.filter(p => p.isActiveOnRoster !== false)}
              rotation={rotation}
              periodNames={PERIOD_NAMES}
              onTogglePeriod={handleMatrixTogglePeriod}
              onToggleStatus={handleToggleStatus}
              isBlackAndWhite={isBlackAndWhite}
              seasonTotals={seasonTotals}
              seasonStats={seasonStats}
              isExpandedView={isExpandedView}
            />
          </section>

          {/* Section 2: Rotation Grid */}
          <section className="space-y-3 pt-4">
            <h2 className="text-lg font-bold text-slate-800">Rotation Grid</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Grid Container - removed min-w and overflow for mobile fit */}
              <div className="w-full">
                {/* Grid Header */}
                <div className={cn(
                  "grid grid-cols-5 border-b divide-x",
                  isBlackAndWhite ? "bg-white" : "bg-slate-50/80"
                )}>
                  {PERIOD_NAMES.map((name, idx) => (
                    <div key={idx} className="py-2 sm:py-3 text-center font-semibold text-slate-600 text-xs sm:text-sm">
                      <span className="hidden sm:inline">{name}</span>
                      <span className="sm:hidden">P{idx + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Grid Slots */}
                {/* Changed: added items-start to prevent stretching columns */}
                <div className="grid grid-cols-5 divide-x items-start">
                  {Array.from({ length: TOTAL_PERIODS }).map((_, pIndex) => {
                    // Sorting Logic: "Stayers to the Top"
                    // 1. Determine who was in the previous period
                    const prevPeriodIds = pIndex > 0 ? getOccupiedIdsInPeriod(pIndex - 1) : new Set<string>();

                    // 2. Create a list of slot indices to sort [0, 1, 2, 3, 4]
                    const slotIndices = Array.from({ length: SLOTS_PER_PERIOD }, (_, i) => i);

                    // 3. Sort indices based on player status
                    slotIndices.sort((a, b) => {
                      const pidA = rotation[`${pIndex}-${a}`];
                      const pidB = rotation[`${pIndex}-${b}`];

                      // Priority 1: Is Stayer? (In prev period)
                      const isStayerA = pidA ? prevPeriodIds.has(pidA) : false;
                      const isStayerB = pidB ? prevPeriodIds.has(pidB) : false;

                      if (isStayerA && !isStayerB) return -1; // A comes first
                      if (!isStayerA && isStayerB) return 1;  // B comes first

                      // Priority 2: Filled vs Empty (Filled first)
                      if (pidA && !pidB) return -1;
                      if (!pidA && pidB) return 1;

                      // Priority 3: Original Index (Stability)
                      return a - b;
                    });

                    return (
                      <div key={`period-${pIndex}`} className={cn(
                        "p-1 sm:p-3 flex flex-col gap-1 sm:gap-2 h-fit",
                        isBlackAndWhite ? "bg-white" : "bg-slate-50/20"
                      )}>
                        {slotIndices.map((sIndex) => {
                          const assignedId = rotation[`${pIndex}-${sIndex}`] || null;
                          const isInvalidDrop = activeDragPlayerId
                            ? isPlayerInPeriod(activeDragPlayerId, pIndex) && rotation[`${pIndex}-${sIndex}`] !== activeDragPlayerId
                            : false;

                          // Identify if this player is a "Stayer" (was in prev period)
                          const isStayer = assignedId ? prevPeriodIds.has(assignedId) : false;

                          return (
                            <DroppableSlot
                              key={`slot-${pIndex}-${sIndex}`}
                              periodIndex={pIndex}
                              slotIndex={sIndex}
                              assignedPlayerId={assignedId}
                              playerDetails={assignedId ? getPlayer(assignedId) : undefined}
                              onRemove={handleRemovePlayer}
                              onClick={handleSlotClick}
                              isInvalid={isInvalidDrop}
                              isStayer={isStayer}
                              isBlackAndWhite={isBlackAndWhite}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Assignment Favorites */}
          <section className="space-y-2 pt-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Assignment Favorites</span>
            </h2>

            <div className={cn(
              "rounded-xl shadow-sm border p-2.5 sm:p-3 transition-colors",
              isBlackAndWhite
                ? "bg-white border-slate-200"
                : "bg-white border-gray-200"
            )}>
              <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center justify-between">
                {/* Save Current as Favorite */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={favoriteTitle}
                    onChange={(e) => setFavoriteTitle(e.target.value)}
                    placeholder="Favorite title (e.g., Balanced Lineup 1)"
                    className={cn(
                      "h-9 px-3 py-1.5 text-xs sm:text-sm rounded-lg border outline-none transition-all flex-1",
                      "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                      isBlackAndWhite ? "border-slate-300 text-slate-900" : "border-gray-200 text-slate-800"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveFavorite();
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveFavorite}
                    disabled={isSavingFavorite}
                    className={cn(
                      "h-9 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-white transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-50",
                      isBlackAndWhite ? "bg-slate-900 hover:bg-slate-800" : "bg-brand-600 hover:bg-brand-700"
                    )}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{isSavingFavorite ? "Saving..." : "Save Current as Favorite"}</span>
                  </button>
                </div>

                {/* Responsive Divider */}
                <div className="hidden lg:block w-px h-6 bg-gray-200" />
                <div className="block lg:hidden h-px w-full bg-gray-100" />

                {/* Load & Delete Favorites */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                  <select
                    value={selectedFavoriteId}
                    onChange={(e) => setSelectedFavoriteId(e.target.value)}
                    className={cn(
                      "h-9 px-3 py-1.5 text-xs sm:text-sm rounded-lg border outline-none transition-all flex-1 bg-white cursor-pointer",
                      "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
                      isBlackAndWhite ? "border-slate-300 text-slate-900" : "border-gray-200 text-slate-800"
                    )}
                  >
                    <option value="">Select a saved favorite...</option>
                    {favorites.map((fav) => (
                      <option key={fav.id} value={fav.id}>
                        {fav.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleLoadFavorite}
                      disabled={!selectedFavoriteId}
                      className={cn(
                        "h-9 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-white transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed",
                        isBlackAndWhite ? "bg-slate-800 hover:bg-slate-700" : "bg-emerald-600 hover:bg-emerald-700"
                      )}
                    >
                      <span>Load Favorite</span>
                    </button>

                    <button
                      onClick={handleDeleteFavorite}
                      disabled={!selectedFavoriteId || isDeletingFavorite}
                      title="Delete Selected Favorite"
                      className={cn(
                        "h-9 w-9 p-0 text-xs sm:text-sm font-medium rounded-lg border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0",
                        isBlackAndWhite
                          ? "border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                          : "border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Team Roster Settings */}
          <RosterSettings
            roster={roster}
            onUpdatePlayer={handleUpdatePlayer}
            onMovePlayer={handleMovePlayer}
            onSaveRoster={handleSaveRoster}
            isSaving={isSavingRoster}
            isBlackAndWhite={isBlackAndWhite}
            isOpen={isRosterOpen}
            onToggleOpen={handleToggleRosterOpen}
          />

          {/* Section 5: Admin Game Log */}
          <AdminGameLog
            games={savedGames}
            seasonStats={seasonStats}
            onDeleteGame={handleDeleteGame}
            onUpdateGameRow={handleUpdateGameRow}
            isLoading={isLoadingGames}
            isBlackAndWhite={isBlackAndWhite}
            isOpen={isAdminLogOpen}
            onToggleOpen={handleToggleAdminLogOpen}
          />

        </main>

        <DragOverlay>
          {activePlayerDetails ? (
            <div className={cn(
              "px-4 py-2 rounded shadow-xl font-bold flex items-center gap-2 cursor-grabbing border",
              isBlackAndWhite
                ? "bg-white border-2 border-slate-900 text-slate-900"
                : "bg-brand-500 border-brand-600 text-white"
            )}>
               {activePlayerDetails.name}
            </div>
          ) : null}
        </DragOverlay>

        <PlayerSelectionModal
          isOpen={!!selectionSlot}
          onClose={() => setSelectionSlot(null)}
          onSelect={handleModalSelect}
          players={players.filter(p => p.isActiveOnRoster !== false)}
          currentPeriodIndex={selectionSlot ? selectionSlot.pIndex : -1}
          periodName={selectionSlot ? PERIOD_NAMES[selectionSlot.pIndex] : ''}
          occupiedPlayerIdsInPeriod={selectionSlot ? getOccupiedIdsInPeriod(selectionSlot.pIndex) : new Set()}
          isBlackAndWhite={isBlackAndWhite}
        />

        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          isBlackAndWhite={isBlackAndWhite}
        />

        <SaveExportModal
          isOpen={isSaveExportModalOpen}
          onClose={() => setIsSaveExportModalOpen(false)}
          onComplete={(asBW, mode) => handleExportImage(asBW, mode)}
          isExporting={isExporting}
        />

        <AssignStrategyModal
          isOpen={isStrategyModalOpen}
          onClose={() => setIsStrategyModalOpen(false)}
          assignSettings={assignSettings}
          onSave={handleSaveAssignSettings}
          isSaving={isSavingStrategy}
          isBlackAndWhite={isBlackAndWhite}
        />
      </div>
    </DndContext>
  );
}
