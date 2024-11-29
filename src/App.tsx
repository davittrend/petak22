import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';
import { getApps } from 'firebase/app';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
]);

export default function App() {
  // Check if Firebase is initialized
  if (getApps().length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to initialize app</h1>
          <p className="text-gray-600">Please check your configuration</p>
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
