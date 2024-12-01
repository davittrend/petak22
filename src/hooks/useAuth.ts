import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAccountStore } from '@/lib/store';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const initializeStore = useAccountStore((state) => state.initializeStore);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.uid); // Debug log

      try {
        if (currentUser) {
          await initializeStore(currentUser.uid);
          setUser(currentUser);
        } else {
          setUser(null); // Ensure user is null if logged out
        }
      } catch (error) {
        console.error('Error initializing store:', error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    });

    // Cleanup on component unmount
    return () => unsubscribe();
  }, [initializeStore]);

  // Ensure we initialize the store with the current user on initial load
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && !authInitialized) {
      console.log('Initial auth state:', currentUser.uid); // Debug log
      initializeStore(currentUser.uid);
      setUser(currentUser);
      setLoading(false);
      setAuthInitialized(true);
    }
  }, [authInitialized, initializeStore]);

  return { 
    user, 
    loading, 
    authInitialized,
    isAuthenticated: !!user && authInitialized 
  };
}
