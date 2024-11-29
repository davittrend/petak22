import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAccountStore } from '@/lib/store';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });
  const initializeStore = useAccountStore((state) => state.initializeStore);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
      });

      // Initialize store when user is authenticated
      if (user) {
        initializeStore(user.uid);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [initializeStore]);

  return authState;
}
