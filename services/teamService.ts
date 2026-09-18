import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Team } from '../types';

const TEAM_SUBCOLLECTIONS = ['games', 'favorites', 'roster', 'settings'] as const;

export async function createTeam(uid: string, name: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'teams'), {
    name: name.trim(),
    ownerId: uid,
    memberIds: [uid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function listMyTeams(uid: string): Promise<Team[]> {
  const q = query(
    collection(db, 'teams'),
    where('memberIds', 'array-contains', uid),
    orderBy('createdAt', 'desc')
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Team));
  } catch (error) {
    // Fallback if the composite (memberIds + createdAt) index isn't built yet.
    console.error('Error listing teams with ordered query, falling back:', error);
    const fallbackSnapshot = await getDocs(
      query(collection(db, 'teams'), where('memberIds', 'array-contains', uid))
    );
    return fallbackSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Team));
  }
}

export async function renameTeam(teamId: string, newName: string): Promise<void> {
  await updateDoc(doc(db, 'teams', teamId), {
    name: newName.trim(),
    updatedAt: serverTimestamp(),
  });
}

// Firestore doesn't cascade-delete subcollections, so we clean up
// roster/games/favorites/settings docs before removing the team itself.
export async function deleteTeam(teamId: string): Promise<void> {
  for (const sub of TEAM_SUBCOLLECTIONS) {
    const snapshot = await getDocs(collection(db, 'teams', teamId, sub));
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  }
  await deleteDoc(doc(db, 'teams', teamId));
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const snap = await getDoc(doc(db, 'teams', teamId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Team;
}
