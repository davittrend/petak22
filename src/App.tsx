import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { initializeFirebase } from '@/lib/firebase/init';
import { initializeAuth } from '@/lib/firebase/auth';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
]);

export default function App() {
  useEffect(() => {
    // Initialize Firebase and Auth
    initializeFirebase();
    initializeAuth();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}
