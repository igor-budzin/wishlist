import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { WishlistItem, ApiResponse } from '@wishlist/shared';
import type { WishlistItemFormData } from '../lib/validations';
import { apiRequest, getApiUrl } from '../lib/api';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  createItem: (data: WishlistItemFormData) => Promise<boolean>;
  updateItem: (id: string, data: WishlistItemFormData) => Promise<boolean>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => WishlistItem | undefined;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const response = await apiRequest(getApiUrl('/api/items'));

      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      const data: ApiResponse<WishlistItem[]> = await response.json();

      if (data.success && data.data) {
        setItems(data.data);
      } else {
        setError(data.error || 'Failed to fetch items');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (data: WishlistItemFormData) => {
    try {
      const response = await apiRequest(getApiUrl('/api/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return false;
      }

      const result: ApiResponse<WishlistItem> = await response.json();

      if (result.success && result.data) {
        setItems([result.data, ...items]);
        toast.success('Item added successfully!');
        return true;
      } else {
        toast.error(result.error || 'Failed to add item');
        return false;
      }
    } catch (err) {
      toast.error('Failed to connect to server');
      return false;
    }
  };

  const updateItem = async (id: string, data: WishlistItemFormData) => {
    try {
      const response = await apiRequest(getApiUrl(`/api/items/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return false;
      }

      const result: ApiResponse<WishlistItem> = await response.json();

      if (result.success && result.data) {
        setItems(items.map((item) => (item.id === id ? result.data! : item)));
        toast.success('Item updated successfully!');
        return true;
      } else {
        toast.error(result.error || 'Failed to update item');
        return false;
      }
    } catch (err) {
      toast.error('Failed to connect to server');
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await apiRequest(getApiUrl(`/api/items/${id}`), {
        method: 'DELETE',
      });

      if (response.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        setItems(items.filter((item) => item.id !== id));
        toast.success('Item deleted');
      } else {
        toast.error(result.error || 'Failed to delete item');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    }
  };

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  const value: WishlistContextType = {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItemById,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
