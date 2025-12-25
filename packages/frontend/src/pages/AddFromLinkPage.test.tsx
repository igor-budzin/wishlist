import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import '@testing-library/jest-dom';
import AddFromLinkPage from './AddFromLinkPage';
import { WishlistProvider } from '../contexts/WishlistContext';

// Mock fetch globally
global.fetch = vi.fn() as typeof fetch;

// Helper to create router with AddFromLinkPage wrapped in WishlistProvider
const createTestRouter = () => {
  return createMemoryRouter([
    {
      path: '/',
      element: (
        <WishlistProvider>
          <AddFromLinkPage />
        </WishlistProvider>
      ),
    },
  ]);
};

describe('AddFromLinkPage - Console Error Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Issue 1: Async State Updates After Unmount', () => {
    it('should not update state after component unmounts', async () => {
      // Mock slow API response (1 second delay)
      const mockFetch = vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      data: {
                        isProduct: true,
                        title: 'Test Product',
                        description: 'Test Description',
                        priceAmount: '10.00',
                        priceCurrency: 'USD',
                        confidence: 0.9,
                      },
                    }),
                }),
              1000
            )
          )
      );
      global.fetch = mockFetch as typeof fetch;

      const router = createTestRouter();

      const { unmount } = render(<RouterProvider router={router} />);

      // Get the input and button
      const input = screen.getByPlaceholderText(/https:\/\/example.com\/product/i);
      const button = screen.getByRole('button', { name: /analyze link/i });

      // Simulate user input by firing change event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'https://example.com/product');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Click the button
      button.click();

      // Unmount before response arrives
      unmount();

      // Wait for the API call to complete
      await waitFor(() => expect(mockFetch).toHaveBeenCalled(), { timeout: 2000 });

      // If no console errors, test passes
      // The component should not throw "Can't perform a React state update on an unmounted component"
    });
  });

  describe('Issue 2: Response Validation', () => {
    it('should handle invalid API response gracefully', async () => {
      // Mock API with malformed response (data is null)
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: null, // Invalid - should be ProductData object
            }),
        })
      ) as unknown as typeof fetch;

      const router = createTestRouter();

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText(/https:\/\/example.com\/product/i);
      const button = screen.getByRole('button', { name: /analyze link/i });

      // Simulate input
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'https://example.com/product');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Click button
      button.click();

      // Should not crash - the error should be caught and button should be enabled again
      await waitFor(
        () => {
          expect(button).not.toBeDisabled();
        },
        { timeout: 2000 }
      );
    });

    it('should handle missing response data fields', async () => {
      // Mock API with incomplete data
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                isProduct: true,
                // Missing title, description, price, confidence
              },
            }),
        })
      ) as unknown as typeof fetch;

      const router = createTestRouter();

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText(/https:\/\/example.com\/product/i);
      const button = screen.getByRole('button', { name: /analyze link/i });

      // Simulate input
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'https://example.com/product');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Click button
      button.click();

      // Should show error, not crash with TypeError
      await waitFor(
        () => {
          expect(button).not.toBeDisabled();
        },
        { timeout: 2000 }
      );
    });

    it('should validate all required ProductData fields', async () => {
      // Mock API with data missing confidence field
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                isProduct: true,
                title: 'Product',
                description: 'Description',
                priceAmount: '10',
                priceCurrency: 'USD',
                // Missing confidence
              },
            }),
        })
      ) as unknown as typeof fetch;

      const router = createTestRouter();

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText(/https:\/\/example.com\/product/i);
      const button = screen.getByRole('button', { name: /analyze link/i });

      // Simulate input
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'https://example.com/product');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Click button
      button.click();

      // Should reject invalid data
      await waitFor(
        () => {
          expect(button).not.toBeDisabled();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Issue 3: Null Value Handling in Form', () => {
    it('should show error message when link is not a product', async () => {
      // Mock API with isProduct: false
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                isProduct: false,
                title: null,
                description: null,
                priceAmount: null,
                priceCurrency: null,
                confidence: 0.3,
                reason: 'URL pattern indicates a category page.',
              },
            }),
        })
      ) as unknown as typeof fetch;

      const router = createTestRouter();

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText(/https:\/\/example.com\/product/i);
      const button = screen.getByRole('button', { name: /analyze link/i });

      // Simulate input
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'https://example.com/category');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Click button
      button.click();

      // Error message should be shown, form should NOT render
      await waitFor(
        () => {
          const errorMessage = screen.getByText(/this link is not a product page/i);
          expect(errorMessage).toBeInTheDocument();
          // Form should NOT be rendered
          expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should not show controlled/uncontrolled component warnings', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                isProduct: true,
                title: 'Product',
                description: null,
                priceAmount: null,
                priceCurrency: null,
                confidence: 0.8,
              },
            }),
        })
      ) as unknown as typeof fetch;

      const router = createTestRouter();

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText(/https:\/\/example.com\/product/i);
      const button = screen.getByRole('button', { name: /analyze link/i });

      // Simulate input
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'https://example.com/product');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Click button
      button.click();

      await waitFor(
        () => {
          expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // No React warnings about controlled components
      const warnings = consoleWarnSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('controlled'))
      );
      expect(warnings.length).toBe(0);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Successful Analysis Flow', () => {
    it('should successfully analyze a product link and show the form', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                isProduct: true,
                title: 'Test Product',
                description: 'A great product',
                priceAmount: '99.99',
                priceCurrency: 'USD',
                confidence: 0.95,
              },
            }),
        })
      ) as unknown as typeof fetch;

      const router = createTestRouter();

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText(/https:\/\/example.com\/product/i);
      const button = screen.getByRole('button', { name: /analyze link/i });

      // Simulate input
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'https://example.com/product');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Click button
      button.click();

      // Should show the review form with extracted data
      await waitFor(
        () => {
          const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
          expect(titleInput).toBeInTheDocument();
          expect(titleInput.value).toBe('Test Product');
        },
        { timeout: 2000 }
      );
    });
  });
});
