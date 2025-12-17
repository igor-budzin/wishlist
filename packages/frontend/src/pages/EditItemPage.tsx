import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/theme-toggle';
import { ItemForm } from '../components/wishlist/ItemForm';
import { Skeleton } from '../components/ui/skeleton';
import { useWishlist } from '../contexts/WishlistContext';
import type { WishlistItemFormData } from '../lib/validations';

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const { loading, updateItem, getItemById } = useWishlist();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const item = id ? getItemById(id) : null;

  const handleSubmit = async (data: WishlistItemFormData) => {
    setIsSubmitting(true);
    try {
      const success = await updateItem(id!, data);
      if (success) {
        navigate('/');
      }
      return success;
    } finally {
      setIsSubmitting(false);
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
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl py-6 md:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wishlist
        </Button>

        {loading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !item && (
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Item Not Found</CardTitle>
              </div>
              <CardDescription>
                The item you're trying to edit doesn't exist or may have been deleted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Wishlist
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && item && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Item</CardTitle>
              <CardDescription>
                Update the details of your wishlist item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemForm
                defaultValues={{
                  title: item.title,
                  description: item.description || '',
                  url: item.url || '',
                  priority: item.priority,
                }}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
