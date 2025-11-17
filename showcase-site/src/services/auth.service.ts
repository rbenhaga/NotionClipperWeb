import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

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
  user: User;
  session: Session;
  profile?: UserProfile;
}

class AuthService {
  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Get current user with profile
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;

    // Fetch user profile from Edge Function
    const profile = await this.getUserProfile(session.user.id);

    return {
      user: session.user,
      session,
      profile: profile || undefined,
    };
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return null;

      const response = await fetch(`${supabaseUrl}/functions/v1/get-user-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        // User doesn't exist yet, will be created on first action
        return null;
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Sign in with Notion OAuth (custom flow)
   * Returns the authorization URL to redirect to
   */
  initiateNotionOAuth(redirectUri: string): string {
    const notionClientId = import.meta.env.VITE_NOTION_CLIENT_ID;

    if (!notionClientId) {
      throw new Error('VITE_NOTION_CLIENT_ID is not configured');
    }

    // Generate random state for CSRF protection
    const state = this.generateState();
    sessionStorage.setItem('notion_oauth_state', state);
    sessionStorage.setItem('notion_oauth_redirect', redirectUri);

    // Build Notion OAuth URL
    const params = new URLSearchParams({
      client_id: notionClientId,
      response_type: 'code',
      owner: 'user',
      redirect_uri: redirectUri,
      state,
    });

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handle Notion OAuth callback
   * Exchanges code for token via Edge Function
   */
  async handleNotionCallback(code: string, state: string): Promise<{ userId: string; workspace: any }> {
    // Verify state
    const savedState = sessionStorage.getItem('notion_oauth_state');
    if (!savedState || savedState !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Get redirect URI from session
    const redirectUri = sessionStorage.getItem('notion_oauth_redirect') || window.location.origin;

    // Clear session storage
    sessionStorage.removeItem('notion_oauth_state');
    sessionStorage.removeItem('notion_oauth_redirect');

    // Call Edge Function to exchange code for token
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/notion-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete Notion OAuth');
    }

    const data = await response.json();

    // Create Supabase session for this user
    // The Edge Function should have created the user, now we sign them in
    await this.createSupabaseSession(data.userId);

    return {
      userId: data.userId,
      workspace: data.workspace,
    };
  }

  /**
   * Create Supabase auth session after Notion OAuth
   * This is a workaround since Notion OAuth is custom
   */
  private async createSupabaseSession(userId: string): Promise<void> {
    // For now, we'll use a custom session approach
    // You'll need to implement a custom Edge Function that creates a session token
    // Or use Supabase's admin API to create a session

    // Store userId in localStorage for now (not ideal but works for demo)
    localStorage.setItem('clipper_user_id', userId);
  }

  /**
   * Handle Google OAuth callback
   * Supabase handles this automatically, just need to create/update user profile
   */
  async handleGoogleCallback(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No session found after Google OAuth');
    }

    // Call create-user Edge Function to ensure user profile exists
    await this.ensureUserProfile(session.user);
  }

  /**
   * Ensure user profile exists in database
   */
  private async ensureUserProfile(user: User): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return;

    try {
      await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name,
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        }),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Don't throw - user can still use the app
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('clipper_user_id');

    if (error) {
      throw error;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Generate random state for OAuth CSRF protection
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export const authService = new AuthService();
