import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ref, set, onValue } from 'firebase/database';
import { database, auth } from './firebase';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';
import { getBoards, getAccount } from './database';

interface AccountStore {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  boards: Record<string, PinterestBoard[]>;
  initialized: boolean;
  addAccount: (account: PinterestAccount) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  setSelectedAccount: (accountId: string) => void;
  setBoards: (accountId: string, boards: PinterestBoard[]) => Promise<void>;
  getAccount: (accountId: string) => PinterestAccount | undefined;
  initializeStore: () => Promise<void>;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccountId: null,
      boards: {},
      initialized: false,

      initializeStore: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId || get().initialized) return;

        try {
          // Listen to accounts changes
          const accountsRef = ref(database, `users/${userId}/accounts`);
          onValue(accountsRef, (snapshot) => {
            const accounts: PinterestAccount[] = [];
            snapshot.forEach((childSnapshot) => {
              accounts.push({
                id: childSnapshot.key!,
                ...childSnapshot.val(),
              });
            });
            set({ accounts, initialized: true });
          });

          // Listen to boards changes
          const boardsRef = ref(database, `users/${userId}/boards`);
          onValue(boardsRef, (snapshot) => {
            const boards: Record<string, PinterestBoard[]> = {};
            snapshot.forEach((childSnapshot) => {
              boards[childSnapshot.key!] = childSnapshot.val();
            });
            set({ boards });
          });
        } catch (error) {
          console.error('Error initializing store:', error);
          set({ initialized: true }); // Mark as initialized even on error
        }
      },

      addAccount: async (account) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        await set(ref(database, `users/${userId}/accounts/${account.id}`), account);
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        await set(ref(database, `users/${userId}/accounts/${accountId}`), null);
        await set(ref(database, `users/${userId}/boards/${accountId}`), null);
        
        set((state) => ({
          selectedAccountId:
            state.selectedAccountId === accountId
              ? state.accounts.find(a => a.id !== accountId)?.id || null
              : state.selectedAccountId,
        }));
      },

      setSelectedAccount: (accountId) => set({ selectedAccountId: accountId }),

      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('User not authenticated');

        await set(ref(database, `users/${userId}/boards/${accountId}`), boards);
      },

      getAccount: (accountId) => {
        return get().accounts?.find(a => a.id === accountId);
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
    }
  )
);
Update the Accounts component to handle initialization:

// src/pages/dashboard/Accounts.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { getPinterestAuthUrl, fetchPinterestBoards } from '@/lib/pinterest';
import { useAccountStore } from '@/lib/store';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Accounts() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { 
    accounts, 
    selectedAccountId, 
    boards, 
    removeAccount, 
    setSelectedAccount, 
    setBoards,
    initializeStore 
  } = useAccountStore();

  useEffect(() => {
    if (user) {
      initializeStore().catch(console.error);
    }
  }, [user]);

  const handleConnectPinterest = async () => {
    try {
      setIsConnecting(true);
      const authUrl = await getPinterestAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Pinterest:', error);
      toast.error('Failed to connect to Pinterest');
    } finally {
      setIsConnecting(false);
    }
  };

  // Rest of the component remains the same...
}
