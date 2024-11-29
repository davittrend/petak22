import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { initializeAuth } from '@/lib/firebase';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
]);

export default function App() {
  useEffect(() => {
    // Initialize Firebase Auth
    initializeAuth();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}
