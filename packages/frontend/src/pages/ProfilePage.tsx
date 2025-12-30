import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AppHeader } from '../components/AppHeader';
import { BackButton } from '../components/BackButton';
import { ShareProfileButton } from '../components/ShareProfileButton';
import { LanguageSelector } from '../components/LanguageSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, loading } = useWishlist();
  const { user, logout } = useAuth();

  const stats = useMemo(() => {
    if (!user) return { total: 0, high: 0, medium: 0, low: 0 };
    const total = items.length;
    const high = items.filter((item) => item.priority === 'high').length;
    const medium = items.filter((item) => item.priority === 'medium').length;
    const low = items.filter((item) => item.priority === 'low').length;

    return { total, high, medium, low };
  }, [items, user]);

  const initials = useMemo(() => {
    if (!user) return '';
    return user.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }, [user]);

  if (!user) {
    return null;
  }

  const handleEditProfile = () => {
    toast.info('Profile editing coming soon!');
  };

  const handleChangeAvatar = () => {
    toast.info('Avatar customization coming soon!');
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader actions={<ShareProfileButton userId={user.id} />} />

      {/* Main Content */}
      <main className="container max-w-3xl py-6 md:py-8 space-y-6">
        <BackButton className="mb-2" />

        {/* Profile Overview */}
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <CardTitle>{t('profile.title')}</CardTitle>
              <CardDescription>
                {t('profile.description')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              {t('profile.editProfile')}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-base font-medium leading-tight">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">via {user.provider}</p>
              </div>
            </div>
            <div className="md:ml-auto">
              <Button variant="outline" size="sm" onClick={handleChangeAvatar}>
                {t('profile.changeAvatar')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.accountDetails')}</CardTitle>
            <CardDescription>
              {t('profile.accountDetailsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t('profile.fullName')}</Label>
                <Input id="name" value={user.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.emailAddress')}</Label>
                <Input id="email" type="email" value={user.email} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist stats */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.wishlistStats')}</CardTitle>
            <CardDescription>{t('profile.wishlistStatsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">{t('profile.loadingStats')}</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">{t('profile.totalItems')}</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                  <Badge variant="outline" className="mt-1">
                    {t('profile.allPriorities')}
                  </Badge>
                </div>
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">{t('profile.highPriority')}</p>
                  <p className="text-2xl font-semibold">{stats.high}</p>
                  <Badge variant="destructive" className="mt-1">
                    {t('profile.important')}
                  </Badge>
                </div>
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">{t('profile.mediumPriority')}</p>
                  <p className="text-2xl font-semibold">{stats.medium}</p>
                  <Badge variant="warning" className="mt-1">
                    {t('profile.niceToHave')}
                  </Badge>
                </div>
                <div className="space-y-1 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">{t('profile.lowPriority')}</p>
                  <p className="text-2xl font-semibold">{stats.low}</p>
                  <Badge variant="success" className="mt-1">
                    {t('profile.someday')}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.accountActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('profile.language')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('profile.languageDescription')}
                </p>
              </div>
              <div className="flex gap-2">
                <LanguageSelector />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('profile.subscriptionsTitle')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('profile.subscriptionsDescription')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/subscriptions')}>
                  {t('profile.manageSubscriptions')}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('profile.signOut')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('profile.signOutDescription')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  {t('profile.signOut')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
