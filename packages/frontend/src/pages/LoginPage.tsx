import { toast } from 'sonner';
import { Sparkles, Google, Apple, Facebook, GitHub } from '../components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/theme-toggle';

export default function LoginPage() {
  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon!`);
    // Future: redirect to OAuth flow
    // window.location.href = `/api/auth/${provider.toLowerCase()}`;
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
            <Button
              variant="outline"
              className="w-full h-[40px]"
              onClick={() => handleSocialLogin('Apple')}
            >
              <Apple className="mr-2 h-5 w-5" />
              Continue with Apple
            </Button>
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
