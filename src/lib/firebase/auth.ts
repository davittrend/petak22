import { Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirebaseApp } from './init';

let auth: Auth | undefined;

export function initializeAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
      });
  }
  return auth;
}

export function getAuth() {
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
