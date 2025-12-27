import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse tokens from URL fragment (#access_token=...&refresh_token=...)
    const hash = window.location.hash.substring(1); // Remove the '#'
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      // Clear URL hash for security
      window.history.replaceState(null, '', '/');

      // Redirect to home page
      navigate('/', { replace: true });
    } else {
      // No tokens found - authentication failed
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
        <p className="text-lg text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
