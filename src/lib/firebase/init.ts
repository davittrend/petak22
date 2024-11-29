import { initializeApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;

export function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseApp() {
  if (!app) {
    throw new Error('Firebase not initialized');
  }
  return app;
}
