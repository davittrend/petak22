import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onValue, ref } from 'firebase/database';
import { database } from '../firebase';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

interface AccountState {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  boards: Record<string, PinterestBoard[]>;
  setAccounts: (accounts: PinterestAccount[]) => void;
  setSelectedAccount: (accountId: string) => void;
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

      setAccounts: (accounts) => set({ accounts }),
      
      setSelectedAccount: (accountId) => set({ selectedAccountId: accountId }),
      
      setBoards: (accountId, boards) => 
        set((state) => ({
          boards: { ...state.boards, [accountId]: boards }
        })),
      
      getAccount: (accountId) => 
        get().accounts.find(a => a.id === accountId),

      initializeStore: (userId) => {
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
          set({ accounts });
          
          // Update selected account if needed
          const { selectedAccountId } = get();
          if (selectedAccountId && !accounts.find(a => a.id === selectedAccountId)) {
            set({ selectedAccountId: accounts[0]?.id || null });
          }
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
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
    }
  )
);
