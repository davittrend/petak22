import { useEffect, useState } from 'react';
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
      console.log('Callback process started...');

      // Wait for authentication to initialize
      if (loading || !authInitialized) {
        console.log('Auth not initialized yet.');
        return;
      }

      console.log('Auth initialized:', { user });

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Handle errors from Pinterest
      if (error) {
        console.error('Pinterest authorization error:', error);
        toast.error(`Pinterest authorization failed: ${error}`);
        navigate('/dashboard/accounts');
        return;
      }

      // Store the code in sessionStorage for further use
      if (code) {
        console.log('Pinterest authorization code received:', code);
        sessionStorage.setItem('pinterest_callback_code', code);
      }

      // Redirect to sign in if no user is authenticated
      if (!user) {
        console.log('No user authenticated, redirecting to sign in...');
        navigate('/signin', { state: { returnTo: '/callback' } });
        return;
      }

      // Retrieve the stored code
      const storedCode = sessionStorage.getItem('pinterest_callback_code');
      if (!storedCode) {
        console.error('No Pinterest code found in session storage.');
        toast.error('Invalid callback URL');
        navigate('/dashboard/accounts');
        return;
      }

      try {
        console.log('Connecting Pinterest account...');
        setIsProcessing(true);
        await connectPinterestAccount(storedCode);
        sessionStorage.removeItem('pinterest_callback_code'); // Clean up
        toast.success('Pinterest account connected successfully!');
        console.log('Redirecting to /dashboard/accounts...');
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

  // Show loading spinner or processing message
  if (loading || !authInitialized || isProcessing) {
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

  return null; // This should never render if the above conditions are met.
}
