import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Parse tokens from URL fragment (#access_token=...&refresh_token=...)
        const hash = window.location.hash.substring(1); // Remove the '#'
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          // Store tokens in localStorage
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);

          // Update auth state with the new tokens and wait for it to complete
          await checkAuth();

          // Only navigate if component is still mounted
          if (isMounted) {
            // Navigate to home page (this will clear the hash from the URL)
            navigate('/', { replace: true });
          }
        } else {
          // No tokens found - authentication failed
          if (isMounted) {
            navigate('/login?error=auth_failed', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        if (isMounted) {
          navigate('/login?error=auth_failed', { replace: true });
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, checkAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
        <p className="text-lg text-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
