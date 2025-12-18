import { useMemo } from 'react';
import { toast } from 'sonner';
import type { User } from '@wishlist/shared';

import { AppHeader } from '../components/AppHeader';
import { BackButton } from '../components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useWishlist } from '../contexts/WishlistContext';

const mockUser: User & { bio: string; joinedAt: string } = {
  id: 'user_1',
  name: 'Alex Wishlist',
  email: 'alex@example.com',
  bio: 'Loves discovering new gadgets, books, and experiences. Uses this wishlist to keep track of meaningful goals and treats.',
  joinedAt: 'January 2025',
};

export default function ProfilePage() {
  const { items, loading } = useWishlist();

  const stats = useMemo(() => {
    const total = items.length;
    const high = items.filter((item) => item.priority === 'high').length;
    const medium = items.filter((item) => item.priority === 'medium').length;
    const low = items.filter((item) => item.priority === 'low').length;

    return { total, high, medium, low };
  }, [items]);

  const initials = useMemo(
    () =>
      mockUser.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .slice(0, 2)
        .join(''),
    []
  );

  const handleEditProfile = () => {
    toast.info('Profile editing coming soon!');
  };

  const handleChangeAvatar = () => {
    toast.info('Avatar customization coming soon!');
  };

  const handleSignOut = () => {
    toast.info('Sign out flow coming soon!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container max-w-3xl py-6 md:py-8 space-y-6">
        <BackButton className="mb-2" />

        {/* Profile Overview */}
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Your profile</CardTitle>
              <CardDescription>
                Manage how your information appears in your wishlist.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              Edit profile
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {initials}
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium leading-tight">{mockUser.name}</p>
                <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                <p className="text-xs text-muted-foreground">Joined {mockUser.joinedAt}</p>
              </div>
            </div>
            <div className="md:ml-auto">
              <Button variant="outline" size="sm" onClick={handleChangeAvatar}>
                Change avatar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account details */}
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>
              These details are currently read-only. Editing will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={mockUser.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={mockUser.email} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist stats */}
        <Card>
          <CardHeader>
            <CardTitle>Wishlist stats</CardTitle>
            <CardDescription>
              A quick overview of how you are using your wishlist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading your wishlist stats...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">Total items</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                  <Badge variant="outline" className="mt-1">
                    All priorities
                  </Badge>
                </div>
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">High priority</p>
                  <p className="text-2xl font-semibold">{stats.high}</p>
                  <Badge variant="destructive" className="mt-1">
                    Important
                  </Badge>
                </div>
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">Medium priority</p>
                  <p className="text-2xl font-semibold">{stats.medium}</p>
                  <Badge variant="warning" className="mt-1">
                    Nice to have
                  </Badge>
                </div>
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">Low priority</p>
                  <p className="text-2xl font-semibold">{stats.low}</p>
                  <Badge variant="success" className="mt-1">
                    Someday
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll be able to securely sign out of your account from here.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
