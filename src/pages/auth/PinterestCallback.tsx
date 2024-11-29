import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangePinterestCode, fetchPinterestBoards } from '@/lib/pinterest';
import { useAccountStore } from '@/lib/store';
import type { PinterestAccount } from '@/types/pinterest';
import { toast } from 'sonner';

export function PinterestCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { addAccount, setBoards } = useAccountStore();

  useEffect(() => {
    const processCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');

      if (!code) {
        toast.error('Invalid callback URL');
        navigate('/dashboard/accounts');
        return;
      }

      try {
        setIsProcessing(true);
        // Exchange code for token and user data
        const { token, user } = await exchangePinterestCode(code);
        
        // Create new account object
        const newAccount: PinterestAccount = {
          id: user.username,
          user,
          token,
          lastRefreshed: Date.now(),
        };

        // First save the account
        await addAccount(newAccount);
        
        // Then fetch and save boards
        const boards = await fetchPinterestBoards(token.access_token);
        await setBoards(newAccount.id, boards);
        
        toast.success('Pinterest account connected successfully!');
        
        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 500);
      } catch (error) {
        console.error('Error processing Pinterest callback:', error);
        toast.error('Failed to connect Pinterest account. Please try again.');
        navigate('/dashboard/accounts');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isProcessing ? 'Connecting your Pinterest account...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
