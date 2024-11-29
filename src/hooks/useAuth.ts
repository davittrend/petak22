import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getAuth } from '@/lib/firebase/auth';
import { useAccountStore } from '@/lib/store';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const initializeStore = useAccountStore((state) => state.initializeStore);
  const initialized = useAccountStore((state) => state.initialized);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getAuth();
      
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setAuthState({
            user,
            loading: false,
            error: null,
          });

          if (user && !initialized) {
            initializeStore(user.uid);
          }
        },
        (error) => {
          console.error('Auth state change error:', error);
          setAuthState({
            user: null,
            loading: false,
            error,
          });
        }
      );
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to initialize auth'),
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeStore, initialized]);

  return authState;
}
