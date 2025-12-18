import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Google, Apple, Facebook, GitHub } from '../components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Check for OAuth error in query params
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      toast.error('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already authenticated
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSocialLogin = (provider: string) => {
    // Redirect to OAuth flow
    window.location.href = `${API_URL}/api/auth/${provider.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container max-w-screen-2xl flex items-center justify-center py-12 md:py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-[40px]"
              onClick={() => handleSocialLogin('Google')}
            >
              <Google className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
            {/* APPLE AUTH DISABLED - Uncomment to re-enable
            <Button
              variant="outline"
              className="w-full h-[40px]"
              onClick={() => handleSocialLogin('Apple')}
            >
              <Apple className="mr-2 h-5 w-5" />
              Continue with Apple
            </Button>
            */}
            <Button
              variant="outline"
              className="w-full h-[40px]"
              onClick={() => handleSocialLogin('Facebook')}
            >
              <Facebook className="mr-2 h-5 w-5" />
              Continue with Facebook
            </Button>
            <Button
              variant="outline"
              className="w-full h-[40px]"
              onClick={() => handleSocialLogin('GitHub')}
            >
              <GitHub className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
