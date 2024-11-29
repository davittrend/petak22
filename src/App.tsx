import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/auth';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
]);

export default function App() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Verify auth is initialized
      getFirebaseAuth();
    } catch (err) {
      console.error('Auth verification error:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize app'));
    }
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

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}
