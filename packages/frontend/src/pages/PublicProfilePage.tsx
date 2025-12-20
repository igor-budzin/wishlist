import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { PublicUserProfile, ApiResponse } from '@wishlist/shared';
import { AppHeader } from '../components/AppHeader';
import { BackButton } from '../components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, AlertCircle } from '../components/icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/users/${userId}`, {
          credentials: 'include',
        });

        const data: ApiResponse<PublicUserProfile> = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load profile');
        }

        setProfile(data.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const initials = useMemo(() => {
    if (!profile) return '';
    return profile.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container max-w-3xl py-6 md:py-8">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container max-w-3xl py-6 md:py-8">
          <BackButton className="mb-2" />
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Profile Not Found</CardTitle>
              </div>
              <CardDescription>{error || 'The requested profile could not be found.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button variant="outline">Go to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-3xl py-6 md:py-8 space-y-6">
        <BackButton className="mb-2" />

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{profile.name}&apos;s Wishlist</CardTitle>
            <CardDescription>Public profile</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium leading-tight">{profile.name}</p>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Wishlist Stats</CardTitle>
            <CardDescription>Overview of {profile.name}&apos;s wishlist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1 rounded-lg border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Total items</p>
                <p className="text-2xl font-semibold">{profile.stats.totalItems}</p>
                <Badge variant="outline" className="mt-1">
                  All priorities
                </Badge>
              </div>
              <div className="space-y-1 rounded-lg border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">High priority</p>
                <p className="text-2xl font-semibold">{profile.stats.highPriority}</p>
                <Badge variant="destructive" className="mt-1">
                  Important
                </Badge>
              </div>
              <div className="space-y-1 rounded-lg border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Medium priority</p>
                <p className="text-2xl font-semibold">{profile.stats.mediumPriority}</p>
                <Badge variant="warning" className="mt-1">
                  Nice to have
                </Badge>
              </div>
              <div className="space-y-1 rounded-lg border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Low priority</p>
                <p className="text-2xl font-semibold">{profile.stats.lowPriority}</p>
                <Badge variant="success" className="mt-1">
                  Someday
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
