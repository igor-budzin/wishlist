import { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import type { WishlistItem, ApiResponse } from '@wishlist/shared';
import { formatDate } from '@wishlist/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';

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

  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold md:text-2xl">My Wishlist</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-screen-2xl py-6 md:py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading your wishlist...</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Error</CardTitle>
              </div>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && !error && items.length === 0 && (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="text-2xl">No items yet</CardTitle>
              <CardDescription className="text-base">
                Start adding items to your wishlist!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Responsive Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col transition-all hover:shadow-lg"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <Badge variant={getPriorityVariant(item.priority)}>
                    {item.priority}
                  </Badge>
                </div>
                {item.description && (
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-end space-y-3">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  {formatDate(new Date(item.createdAt))}
                </div>

                {item.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Link
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container max-w-screen-2xl text-center text-sm text-muted-foreground">
          <p>
            Made with <span className="text-primary">♥</span> for tracking your wishes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
