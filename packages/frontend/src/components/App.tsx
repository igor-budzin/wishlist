import { useState, useEffect } from 'react';
import type { WishlistItem, ApiResponse } from '@wishlist/shared';
import { formatDate } from '@wishlist/shared';

function App() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
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
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {loading && <div className="text-center text-gray-600">Loading...</div>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center text-gray-600">
            No items yet. Start adding to your wishlist!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h2>
              {item.description && <p className="text-gray-600 mb-4">{item.description}</p>}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span
                  className={`px-2 py-1 rounded ${
                    item.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : item.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.priority}
                </span>
                <span>{formatDate(new Date(item.createdAt))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
