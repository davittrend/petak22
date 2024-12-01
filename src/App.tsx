//
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';
import { getApps } from 'firebase/app';
import { useEffect, useState } from 'react';  // Add this new import
import { auth } from '@/lib/firebase';        // Add this new import

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
]);

export default function App() {
  // Add this new state
  const [isInitialized, setIsInitialized] = useState(false);

  // Add this new useEffect
  useEffect(() => {
    if (getApps().length === 0) {
      console.error('Firebase not initialized');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Add this new conditional rendering
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  // Your existing return statement
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}
