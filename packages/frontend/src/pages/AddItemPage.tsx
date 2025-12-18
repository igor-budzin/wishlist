import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AppHeader } from '../components/AppHeader';
import { BackButton } from '../components/BackButton';
import { ItemForm } from '../components/wishlist/ItemForm';
import { useWishlist } from '../contexts/WishlistContext';
import type { WishlistItemFormData } from '../lib/validations';

export default function AddItemPage() {
  const { createItem } = useWishlist();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: WishlistItemFormData) => {
    setIsSubmitting(true);
    try {
      const success = await createItem(data);
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
      <AppHeader />

      {/* Main Content */}
      <main className="container max-w-2xl py-6 md:py-8">
        <BackButton />

        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
            <CardDescription>
              Add a new item to your wishlist. Fill in the details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemForm
              onSubmit={handleSubmit}
              submitLabel="Add Item"
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
