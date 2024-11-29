import { Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { app } from './init';

let auth: Auth;

try {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(error => {
    console.error('Error setting auth persistence:', error);
  });
} catch (error) {
  console.error('Error initializing Auth:', error);
  throw error;
}

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth };
