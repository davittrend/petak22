import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';

let app: FirebaseApp;

export function initializeFirebase(): FirebaseApp {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  } else {
    app = getApps()[0];
  }
  return app;
}

// Initialize Firebase immediately
app = initializeFirebase();

export { app };
