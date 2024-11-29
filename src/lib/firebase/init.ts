import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;

export function initializeFirebase(): FirebaseApp {
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

// Initialize Firebase immediately
try {
  app = initializeFirebase();
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { app };
