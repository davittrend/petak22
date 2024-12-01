// useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectPinterestAccount } from '@/lib/pinterest';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function PinterestCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { user, loading, authInitialized } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      // Wait for auth to be initialized
      if (loading || !authInitialized) return;

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Store the code in sessionStorage
      if (code) {
        sessionStorage.setItem('pinterest_callback_code', code);
      }

      if (error) {
        console.error('Pinterest authorization error:', error);
        toast.error(`Pinterest authorization failed: ${error}`);
        navigate('/dashboard/accounts');
        return;
      }

      // If no user, redirect to sign in
      if (!user) {
        console.log('No user found, redirecting to signin');
        navigate('/signin', { state: { returnTo: '/callback' } });
        return;
      }

      // Get code from storage
      const storedCode = sessionStorage.getItem('pinterest_callback_code');
      if (!storedCode) {
        toast.error('Invalid callback URL');
        navigate('/dashboard/accounts');
        return;
      }

      try {
        setIsProcessing(true);
        await connectPinterestAccount(storedCode);
        sessionStorage.removeItem('pinterest_callback_code'); // Clean up
        toast.success('Pinterest account connected successfully!');
        navigate('/dashboard/accounts');
      } catch (error) {
        console.error('Error connecting Pinterest account:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to connect Pinterest account');
        navigate('/dashboard/accounts');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, user, loading, authInitialized]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {loading ? 'Loading...' : isProcessing ? 'Connecting your Pinterest account...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
