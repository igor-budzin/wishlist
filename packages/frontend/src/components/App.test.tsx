import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './theme-provider';
import App from './App';

describe('App Smoke Tests', () => {
  it('should render the App component with router', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <App />,
          children: [
            {
              index: true,
              element: <div data-testid="test-content">Test Content</div>,
            },
          ],
        },
      ],
      {
        initialEntries: ['/'],
      }
    );

    render(
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should render with proper layout structure', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <App />,
          children: [
            {
              index: true,
              element: <div>Child Route</div>,
            },
          ],
        },
      ],
      {
        initialEntries: ['/'],
      }
    );

    const { container } = render(
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    );

    const appContainer = container.querySelector('.min-h-screen.bg-background');
    expect(appContainer).toBeInTheDocument();
  });

  it('should render Toaster component', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <App />,
          children: [
            {
              index: true,
              element: <div>Test</div>,
            },
          ],
        },
      ],
      {
        initialEntries: ['/'],
      }
    );

    const { container } = render(
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    );

    // Toaster creates a section with aria-label containing "Notifications"
    const toaster = container.querySelector('section[aria-label*="Notifications"]');
    expect(toaster).toBeInTheDocument();
  });
});
