import { useState } from 'react';
import { Link } from 'react-router-dom';

import { AppHeader } from '../components/AppHeader';
import { BackButton } from '../components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

type Subscription = {
  id: string;
  name: string;
  bio: string;
  avatarColor: string;
  itemsCount: number;
  newWishesCount: number;
};

const mockSubscriptions: Subscription[] = [
  {
    id: 'user_2',
    name: 'Jamie Explorer',
    bio: 'Collects ideas for travel, books, and life experiments.',
    avatarColor: 'bg-blue-500/10 text-blue-500',
    itemsCount: 18,
    newWishesCount: 3,
  },
  {
    id: 'user_3',
    name: 'Morgan Builder',
    bio: 'Always planning the next side project or gadget upgrade.',
    avatarColor: 'bg-emerald-500/10 text-emerald-500',
    itemsCount: 27,
    newWishesCount: 5,
  },
  {
    id: 'user_4',
    name: 'Riley Dreamer',
    bio: 'Wishlist full of experiences, workshops, and skills to learn.',
    avatarColor: 'bg-purple-500/10 text-purple-500',
    itemsCount: 12,
    newWishesCount: 1,
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const handleConfirmUnsubscribe = () => {
    if (selectedSub) {
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== selectedSub.id));
      setSelectedSub(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container max-w-3xl py-6 md:py-8 space-y-6">
        <BackButton to="/profile" label="Back to profile" className="mb-2" />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;ll get notified when these users add new wishes to their lists.
          </p>
        </div>

        {subscriptions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">No subscriptions yet</CardTitle>
              <CardDescription>
                Follow other users to stay up to date with their latest wishes.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <Card
                key={sub.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <CardHeader className="flex flex-row items-start gap-4 p-4 pb-2 md:pb-4">
                  <div className="relative">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${sub.avatarColor}`}
                    >
                      {getInitials(sub.name)}
                    </div>
                    {sub.newWishesCount > 0 && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-background bg-primary text-[10px] font-semibold text-primary-foreground">
                        {sub.newWishesCount}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        <Link to="/" className="hover:underline">
                          {sub.name}
                        </Link>
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs md:text-sm">{sub.bio}</CardDescription>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{sub.itemsCount} wishes</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col items-start gap-2 p-4 pt-0 md:pt-4 md:items-end">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive/5"
                      onClick={() => setSelectedSub(sub)}
                    >
                      Unsubscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsubscribe from updates?</AlertDialogTitle>
            <AlertDialogDescription>
              You will stop receiving updates when{' '}
              <span className="font-semibold">{selectedSub?.name}</span> adds new wishes to their
              list. You can always subscribe again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmUnsubscribe}
            >
              Unsubscribe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
