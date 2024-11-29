import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectPinterestAccount } from '@/lib/pinterest';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function PinterestCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      // Ensure user is authenticated
      if (!user) {
        toast.error('Please sign in first');
        navigate('/signin');
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error(`Pinterest authorization failed: ${error}`);
        navigate('/dashboard/accounts');
        return;
      }

      if (!code) {
        toast.error('Invalid callback URL');
        navigate('/dashboard/accounts');
        return;
      }

      try {
        setIsProcessing(true);
        await connectPinterestAccount(code);
        toast.success('Pinterest account connected successfully!');
        navigate('/dashboard/accounts');
      } catch (error) {
        console.error('Error processing Pinterest callback:', error);
        toast.error('Failed to connect Pinterest account. Please try again.');
        navigate('/dashboard/accounts');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, user]);

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
