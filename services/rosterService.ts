import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Player, AssignSettings, RosterDoc } from '../types';

function rosterDocRef(teamId: string) {
  return doc(db, 'teams', teamId, 'roster', 'current');
}

// Starting point for a brand-new team: generic slots, no real player data.
// Used whenever a team has no roster/current doc yet (i.e. it was just created).
export function getDefaultRoster(): Player[] {
  return Array.from({ length: 10 }, (_, idx) => {
    const n = idx + 1;
    return {
      id: `p${n}`,
      name: `Player ${n}`,
      jersey: String(n),
      number: String(n),
      height: '',
      roles: [],
      defense: '',
      isAvailable: true,
      isActiveOnRoster: true,
      code: '',
    };
  });
}

export async function getRoster(teamId: string): Promise<RosterDoc | null> {
  const snap = await getDoc(rosterDocRef(teamId));
  if (!snap.exists()) return null;
  return snap.data() as RosterDoc;
}

// Mirrors the app's existing "Save Roster" action: persists the roster array,
// merging so assignSettings (saved separately) isn't clobbered.
export async function saveRoster(teamId: string, roster: Player[]): Promise<void> {
  await setDoc(
    rosterDocRef(teamId),
    {
      roster: roster.map((p) => ({
        id: p.id,
        name: p.name,
        jersey: p.jersey,
        height: p.height,
        roles: p.roles,
        defense: p.defense,
        isAvailable: p.isAvailable,
        isActiveOnRoster: p.isActiveOnRoster !== false,
      })),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Mirrors the app's existing "Save Strategy" action on the AssignStrategyModal.
export async function saveAssignSettings(teamId: string, assignSettings: AssignSettings): Promise<void> {
  await setDoc(
    rosterDocRef(teamId),
    {
      assignSettings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
