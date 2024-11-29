import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { onValue, ref } from 'firebase/database';
import { database } from '../firebase/database';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

interface AccountState {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  boards: Record<string, PinterestBoard[]>;
  initialized: boolean;
  setAccounts: (accounts: PinterestAccount[]) => void;
  setSelectedAccount: (accountId: string | null) => void;
  setBoards: (accountId: string, boards: PinterestBoard[]) => void;
  getAccount: (accountId: string) => PinterestAccount | undefined;
  initializeStore: (userId: string) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccountId: null,
      boards: {},
      initialized: false,

      setAccounts: (accounts) => set(
        produce((state) => {
          state.accounts = accounts;
        })
      ),
      
      setSelectedAccount: (accountId) => set(
        produce((state) => {
          state.selectedAccountId = accountId;
        })
      ),
      
      setBoards: (accountId, boards) => set(
        produce((state) => {
          state.boards[accountId] = boards;
        })
      ),
      
      getAccount: (accountId) => 
        get().accounts.find(a => a.id === accountId),

      initializeStore: (userId) => {
        if (get().initialized) return;

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
          
          set(
            produce((state) => {
              state.accounts = accounts;
              state.initialized = true;
              
              // Update selected account if needed
              if (state.selectedAccountId && !accounts.find(a => a.id === state.selectedAccountId)) {
                state.selectedAccountId = accounts[0]?.id || null;
              }
            })
          );
        });

        // Listen to boards changes
        const boardsRef = ref(database, `users/${userId}/boards`);
        onValue(boardsRef, (snapshot) => {
          const boards: Record<string, PinterestBoard[]> = {};
          snapshot.forEach((childSnapshot) => {
            boards[childSnapshot.key!] = childSnapshot.val();
          });
          
          set(
            produce((state) => {
              state.boards = boards;
            })
          );
        });
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
