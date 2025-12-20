import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './components/App';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import './styles/index.css';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AddItemPage = lazy(() => import('./pages/AddItemPage'));
const EditItemPage = lazy(() => import('./pages/EditItemPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const ProviderMismatchPage = lazy(() => import('./pages/ProviderMismatchPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
  </div>
);

// Wrapper component for lazy loaded routes
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <LazyRoute>
            <ProtectedLayout>
              <HomePage />
            </ProtectedLayout>
          </LazyRoute>
        ),
      },
      {
        path: 'add',
        element: (
          <LazyRoute>
            <ProtectedLayout>
              <AddItemPage />
            </ProtectedLayout>
          </LazyRoute>
        ),
      },
      {
        path: 'edit/:id',
        element: (
          <LazyRoute>
            <ProtectedLayout>
              <EditItemPage />
            </ProtectedLayout>
          </LazyRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <LazyRoute>
            <LoginPage />
          </LazyRoute>
        ),
      },
      {
        path: 'auth/provider-mismatch',
        element: (
          <LazyRoute>
            <ProviderMismatchPage />
          </LazyRoute>
        ),
      },
      {
        path: 'user/:userId',
        element: (
          <LazyRoute>
            <PublicProfilePage />
          </LazyRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <LazyRoute>
            <ProtectedLayout>
              <ProfilePage />
            </ProtectedLayout>
          </LazyRoute>
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <LazyRoute>
            <ProtectedLayout>
              <SubscriptionsPage />
            </ProtectedLayout>
          </LazyRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
