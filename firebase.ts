import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkmkpt8hfobMqt_KS9x9cj4dFVfspPhXo",
  authDomain: "ybl-manager.firebaseapp.com",
  projectId: "ybl-manager",
  storageBucket: "ybl-manager.firebasestorage.app",
  messagingSenderId: "664793941403",
  appId: "1:664793941403:web:c9206cf8d7dd3e25c78d3e",
  measurementId: "G-8L716RX1EP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
