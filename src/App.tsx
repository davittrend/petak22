import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase/init';
import { initializeAuth } from '@/lib/firebase/auth';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
]);

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize Firebase first
        await initializeFirebase();
        // Then initialize Auth
        await initializeAuth();
        setIsInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize app'));
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}
