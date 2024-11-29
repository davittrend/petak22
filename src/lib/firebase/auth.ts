import { Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { app } from './init';

let auth: Auth;

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(error => {
      console.error('Error setting auth persistence:', error);
    });
  }
  return auth;
}

// Initialize Auth immediately
auth = getFirebaseAuth();

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth };
export { getAuth };
