import i18next from './i18n';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

/**
 * Get current language for Accept-Language header
 */
function getAcceptLanguageHeader(): string {
  const language = i18next.language || 'en';
  return language;
}

/**
 * Refresh the access token using the refresh token
 * Returns true if successful, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': getAcceptLanguageHeader(),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.accessToken) {
        localStorage.setItem('access_token', data.data.accessToken);
        return true;
      }
    }

    // Refresh failed - clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
  }
}

/**
 * Make an API request with automatic token refresh on 401
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('access_token');

  // Add Authorization header if we have a token
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Add Accept-Language header
  headers.set('Accept-Language', getAcceptLanguageHeader());

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh the token and retry
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the request with the new token
      const newAccessToken = localStorage.getItem('access_token');
      if (newAccessToken) {
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        return fetch(url, {
          ...options,
          headers,
        });
      }
    }

    // If refresh failed, redirect to login
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?error=session_expired';
    }
  }

  return response;
}

/**
 * Helper to get the full API URL
 */
export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}
