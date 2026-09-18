import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { FavoriteItem, RotationState } from '../types';

function favoritesCollectionRef(teamId: string) {
  return collection(db, 'teams', teamId, 'favorites');
}

export async function getFavorites(teamId: string): Promise<FavoriteItem[]> {
  try {
    const snapshot = await getDocs(query(favoritesCollectionRef(teamId), orderBy('createdAt', 'desc')));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Untitled Favorite',
        gridState: (data.gridState as RotationState) || {},
        createdAt: data.createdAt,
        createdBy: data.createdBy,
      } as FavoriteItem;
    });
  } catch (error) {
    // Fallback if the orderBy index isn't built yet.
    console.error('Error listing favorites with ordered query, falling back:', error);
    const snapshot = await getDocs(favoritesCollectionRef(teamId));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Untitled Favorite',
        gridState: (data.gridState as RotationState) || {},
        createdAt: data.createdAt,
        createdBy: data.createdBy,
      } as FavoriteItem;
    });
  }
}

export async function saveFavorite(
  teamId: string,
  name: string,
  gridState: RotationState,
  createdBy: string
): Promise<string> {
  const docRef = await addDoc(favoritesCollectionRef(teamId), {
    name: name.trim(),
    gridState,
    createdAt: serverTimestamp(),
    createdBy,
  });
  return docRef.id;
}

export async function deleteFavorite(teamId: string, favoriteId: string): Promise<void> {
  await deleteDoc(doc(db, 'teams', teamId, 'favorites', favoriteId));
}
