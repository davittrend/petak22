import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';

// Initialize Firebase only if no apps exist
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
