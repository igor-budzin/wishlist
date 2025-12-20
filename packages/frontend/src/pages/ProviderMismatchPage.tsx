import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Google, Facebook, GitHub } from '../components/icons';
import { AppHeader } from '../components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

type Provider = 'google' | 'facebook' | 'github';

const PROVIDER_LABELS: Record<Provider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  github: 'GitHub',
};

export default function ProviderMismatchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const attemptedProvider = (searchParams.get('attemptedWith') || '').toLowerCase() as
    | Provider
    | '';
  const registeredProvider = (searchParams.get('registeredWith') || '').toLowerCase() as
    | Provider
    | '';

  const effectiveProvider: Provider | '' = useMemo(() => {
    if (registeredProvider && PROVIDER_LABELS[registeredProvider]) {
      return registeredProvider;
    }
    if (attemptedProvider && PROVIDER_LABELS[attemptedProvider]) {
      return attemptedProvider;
    }
    return '';
  }, [attemptedProvider, registeredProvider]);

  const handleSocialLogin = (provider: Provider) => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container max-w-screen-2xl flex items-center justify-center py-12 md:py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Use your existing login</CardTitle>
            <CardDescription>
              {effectiveProvider ? (
                <>
                  This email is already registered with {PROVIDER_LABELS[effectiveProvider]}. Please
                  continue with {PROVIDER_LABELS[effectiveProvider]} to sign in.
                </>
              ) : (
                <>
                  This email is already registered. Please continue with your original login method.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {effectiveProvider && (
              <Button
                variant="outline"
                className="w-full h-[40px]"
                onClick={() => handleSocialLogin(effectiveProvider)}
              >
                {effectiveProvider === 'google' && <Google className="mr-2 h-5 w-5" />}
                {effectiveProvider === 'facebook' && <Facebook className="mr-2 h-5 w-5" />}
                {effectiveProvider === 'github' && <GitHub className="mr-2 h-5 w-5" />}
                Continue with {PROVIDER_LABELS[effectiveProvider]}
              </Button>
            )}
            <Button variant="ghost" className="w-full h-[40px]" onClick={() => navigate('/login')}>
              Back to login
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
