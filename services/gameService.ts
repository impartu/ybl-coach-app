import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { SavedGame, SavedGamePlayer } from '../types';

function gamesCollectionRef(teamId: string) {
  return collection(db, 'teams', teamId, 'games');
}

export async function getGames(teamId: string): Promise<SavedGame[]> {
  try {
    const snapshot = await getDocs(query(gamesCollectionRef(teamId), orderBy('timestamp', 'desc')));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        timestamp: data.timestamp,
        roster: Array.isArray(data.roster) ? data.roster : [],
      } as SavedGame;
    });
  } catch (error) {
    // Fallback if the orderBy index isn't built yet.
    console.error('Error listing games with ordered query, falling back:', error);
    const snapshot = await getDocs(gamesCollectionRef(teamId));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        timestamp: data.timestamp,
        roster: Array.isArray(data.roster) ? data.roster : [],
      } as SavedGame;
    });
  }
}

export async function saveGame(
  teamId: string,
  roster: SavedGamePlayer[],
  createdBy: string
): Promise<string> {
  const docRef = await addDoc(gamesCollectionRef(teamId), {
    roster,
    timestamp: serverTimestamp(),
    createdBy,
  });
  return docRef.id;
}

export async function updateGame(
  teamId: string,
  gameId: string,
  roster: SavedGamePlayer[]
): Promise<void> {
  await updateDoc(doc(db, 'teams', teamId, 'games', gameId), {
    roster,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGame(teamId: string, gameId: string): Promise<void> {
  await deleteDoc(doc(db, 'teams', teamId, 'games', gameId));
}
