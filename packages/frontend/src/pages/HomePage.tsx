import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Calendar, AlertCircle, Loader2, Plus, Pencil, Trash2 } from '../components/icons';
import type { WishlistItem } from '@wishlist/shared';
import { formatDate } from '@wishlist/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { AppHeader } from '../components/AppHeader';
import { DeleteConfirmDialog } from '../components/wishlist/DeleteConfirmDialog';
import { useWishlist } from '../contexts/WishlistContext';

export default function HomePage() {
  const { items, loading, error, deleteItem } = useWishlist();
  const navigate = useNavigate();
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null);

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
      <AppHeader
        actions={
          <>
            <Button onClick={() => navigate('/add')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              Profile
            </Button>
          </>
        }
      />

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

                <div className="flex gap-2">
                  {item.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Link
                    </Button>
                  )}
                  {!item.url && <div className="flex-1" />}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/edit/${item.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingItem(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        itemTitle={deletingItem?.title || ''}
        onConfirm={async () => {
          if (deletingItem) {
            await deleteItem(deletingItem.id);
          }
        }}
      />
    </div>
  );
}
