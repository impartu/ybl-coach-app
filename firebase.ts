import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBRpjFghg9CQx5BEdciCwRtD2PXJR8W-WU",
  authDomain: "ybl-coach-app.firebaseapp.com",
  projectId: "ybl-coach-app",
  storageBucket: "ybl-coach-app.firebasestorage.app",
  messagingSenderId: "400781229040",
  appId: "1:400781229040:web:f328415349c18d95673b35",
  measurementId: "G-YHQC9XET26"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
