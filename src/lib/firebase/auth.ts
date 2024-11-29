import { Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirebaseApp } from './init';

let auth: Auth | undefined;

export async function initializeAuth(): Promise<Auth> {
  if (!auth) {
    try {
      auth = getAuth(getFirebaseApp());
      await setPersistence(auth, browserLocalPersistence);
    } catch (error) {
      console.error('Error initializing Auth:', error);
      throw error;
    }
  }
  return auth;
}

export function getAuth(): Auth {
  if (!auth) {
    throw new Error('Auth not initialized');
  }
  return auth;
}

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
