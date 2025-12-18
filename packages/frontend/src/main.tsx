import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './components/App';
import { ThemeProvider } from './components/theme-provider';
import { WishlistProvider } from './contexts/WishlistContext';
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
      { index: true, element: <HomePage /> },
      { path: 'add', element: <AddItemPage /> },
      { path: 'edit/:id', element: <EditItemPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
      </WishlistProvider>
    </ThemeProvider>
  </React.StrictMode>
);
