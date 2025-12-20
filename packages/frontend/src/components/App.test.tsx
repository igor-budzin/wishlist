import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock fetch
global.fetch = vi.fn();

type MockFetch = ReturnType<typeof vi.fn>;

describe('App Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app title', () => {
    (global.fetch as unknown as MockFetch).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<App />);
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    (global.fetch as unknown as MockFetch).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display empty state when no items exist', async () => {
    (global.fetch as unknown as MockFetch).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No items yet. Start adding to your wishlist!')).toBeInTheDocument();
    });
  });

  it('should display items when data is loaded', async () => {
    const mockItems = [
      {
        id: '1',
        title: 'Test Item 1',
        description: 'Test description',
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Test Item 2',
        description: null,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (global.fetch as unknown as MockFetch).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockItems }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('should display error message when API fails', async () => {
    (global.fetch as unknown as MockFetch).mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Failed to fetch items' }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch items')).toBeInTheDocument();
    });
  });

  it('should display error when network request fails', async () => {
    (global.fetch as unknown as MockFetch).mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
    });
  });

  it('should call /api/items endpoint on mount', async () => {
    (global.fetch as unknown as MockFetch).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/items');
    });
  });
});
