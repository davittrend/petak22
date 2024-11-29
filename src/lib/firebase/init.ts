import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';

// Initialize Firebase only if no apps exist
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { app };
