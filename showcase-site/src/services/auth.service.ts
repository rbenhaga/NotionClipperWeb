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
    return localStorage.getItem('auth_token');
  }

  /**
   * Store auth token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear auth token from localStorage
   */
  clearToken(): void {
    localStorage.removeItem('auth_token');
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
   */
  initiateGoogleOAuth(): void {
    window.location.href = `${API_URL}/auth/google`;
  }

  /**
   * Initiate Notion OAuth flow
   * Redirects to backend VPS which handles the OAuth flow
   */
  initiateNotionOAuth(): void {
    window.location.href = `${API_URL}/auth/notion`;
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
}

export const authService = new AuthService();
