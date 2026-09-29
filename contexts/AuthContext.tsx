import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Push notification on new sign-up, via ntfy.sh (no account/backend needed -- any POST
// to this topic URL buzzes whoever has subscribed to it in the ntfy app). The topic name
// is a random, unguessable string since ntfy topics are public to anyone who knows them
// and this message includes the new user's email. Best-effort only: never let a failed
// notification affect the actual sign-in flow.
const SIGNUP_NOTIFY_TOPIC = 'coachybl-signups-ccdfaf9cb656';

function notifyNewSignup(user: User): void {
  fetch(`https://ntfy.sh/${SIGNUP_NOTIFY_TOPIC}`, {
    method: 'POST',
    body: `${user.displayName || 'Someone'} just signed up: ${user.email}`,
    headers: { Title: 'New Coach YBL App sign-up' },
  }).catch((error) => {
    console.error('Error sending new sign-up notification:', error);
  });
}

// Creates /users/{uid} on first sign-in; leaves it untouched on subsequent sign-ins.
async function ensureUserProfile(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });
    notifyNewSignup(user);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await ensureUserProfile(firebaseUser);
        } catch (error) {
          console.error('Error ensuring user profile in Firestore:', error);
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
