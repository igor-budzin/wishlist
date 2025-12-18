import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './components/App';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import HomePage from './pages/HomePage';
import AddItemPage from './pages/AddItemPage';
import EditItemPage from './pages/EditItemPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import './styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedLayout>
            <HomePage />
          </ProtectedLayout>
        ),
      },
      {
        path: 'add',
        element: (
          <ProtectedLayout>
            <AddItemPage />
          </ProtectedLayout>
        ),
      },
      {
        path: 'edit/:id',
        element: (
          <ProtectedLayout>
            <EditItemPage />
          </ProtectedLayout>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'profile',
        element: (
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <ProtectedLayout>
            <SubscriptionsPage />
          </ProtectedLayout>
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
