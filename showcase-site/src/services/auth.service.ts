/**
 * Authentication Service
 * Handles OAuth flows via backend VPS and JWT token management
 */

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  user: {
    id: string;
    email: string;
  };
  profile?: UserProfile;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AuthService {
  /**
   * Get current authenticated user from localStorage JWT
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode JWT to get user info (simple base64 decode, no verification needed client-side)
      const payload = JSON.parse(atob(token.split('.')[1]));

      return {
        user: {
          id: payload.userId,
          email: payload.email,
        },
      };
    } catch (error) {
      console.error('Error decoding JWT:', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Get stored auth token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Store auth token and user info in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
    
    // Also decode and store user info for app redirect
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) localStorage.setItem('user_id', payload.userId);
      if (payload.email) localStorage.setItem('user_email', payload.email);
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }

  /**
   * Clear auth token and user info from localStorage
   */
  clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Initiate Google OAuth flow
   * Redirects to backend VPS which handles the OAuth flow
   * @param source - 'app' if coming from desktop app, 'web' otherwise
   */
  initiateGoogleOAuth(source?: 'app' | 'web'): void {
    const params = new URLSearchParams();
    if (source === 'app') {
      params.set('source', 'app');
    }
    const queryString = params.toString();
    window.location.href = `${API_URL}/auth/google${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Initiate Notion OAuth flow
   * Redirects to backend VPS which handles the OAuth flow
   * @param source - 'app' if coming from desktop app, 'web' otherwise
   */
  initiateNotionOAuth(source?: 'app' | 'web'): void {
    const params = new URLSearchParams();
    if (source === 'app') {
      params.set('source', 'app');
    }
    const queryString = params.toString();
    window.location.href = `${API_URL}/auth/notion${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, fullName?: string): Promise<AuthTokens> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign up');
    }

    const data = await response.json();

    // Store token
    if (data.tokens?.accessToken) {
      this.setToken(data.tokens.accessToken);
    }

    return data.tokens;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthTokens> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign in');
    }

    const data = await response.json();

    // Store token
    if (data.tokens?.accessToken) {
      this.setToken(data.tokens.accessToken);
    }

    return data.tokens;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      // Call backend logout endpoint (optional, mainly for logging)
      const token = this.getToken();
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local token
      this.clearToken();
    }
  }

  /**
   * Handle OAuth success callback
   * Extracts token from URL and stores it
   */
  handleOAuthCallback(token: string): void {
    this.setToken(token);
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send password reset email');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(accessToken: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get user profile with avatar
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
