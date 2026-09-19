import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID specified in config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth and sign in anonymously for secure session
export const auth = getAuth(app);

// Silent anonymous sign-in to establish authenticated session
signInAnonymously(auth).catch((err) => {
  console.warn('Firebase anonymous auth notice:', err);
});
