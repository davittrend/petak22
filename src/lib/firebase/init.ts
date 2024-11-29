import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;

export async function initializeFirebase(): Promise<FirebaseApp> {
  if (!app && !getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
  return app!;
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error('Firebase not initialized');
  }
  return app;
}
