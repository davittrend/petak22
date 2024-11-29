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
