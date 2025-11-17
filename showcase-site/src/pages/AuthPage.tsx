import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotionClipperLogo } from '../assets/Logo.tsx';
import { authService } from '../services/auth.service';

export default function AuthPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [loadingNotion, setLoadingNotion] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const session = await authService.getSession();
      if (session) {
        // User already authenticated, redirect to dashboard
        navigate('/dashboard');
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle Notion OAuth
  const handleNotionOAuth = async () => {
    try {
      setLoadingNotion(true);
      setError('');

      // Get the redirect URI (current origin + callback path)
      const redirectUri = `${window.location.origin}/auth/callback/notion`;

      // Generate Notion OAuth URL
      const authUrl = authService.initiateNotionOAuth(redirectUri);

      // Redirect to Notion OAuth page
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Notion authentication');
      setLoadingNotion(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleOAuth = async () => {
    try {
      setLoadingGoogle(true);
      setError('');

      // Get the redirect URI (Supabase handles this automatically)
      const redirectTo = `${window.location.origin}/auth/callback`;

      // Initiate Google OAuth via Supabase
      await authService.signInWithGoogle(redirectTo);

      // Supabase will redirect automatically
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google authentication');
      setLoadingGoogle(false);
    }
  };

  const loading = loadingNotion || loadingGoogle;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden flex items-center justify-center">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '6s' }}></div>
        </div>
      </div>

      {/* Back Button */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors z-20">
        <ArrowLeft size={20} />
        <span>{t('choice.back', 'Back to Home')}</span>
      </Link>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <NotionClipperLogo size={64} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('choice.title', 'Welcome to NotionClipper')}
            </h1>
            <p className="text-gray-600">
              {t('choice.subtitle', 'Connect your account to get started')}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Notion OAuth */}
            <button
              onClick={handleNotionOAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
            >
              {loadingNotion ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                  alt="Notion"
                  width="20"
                  height="20"
                  className="object-contain"
                />
              )}
              <span>
                {loadingNotion
                  ? t('choice.connecting', 'Connecting...')
                  : t('choice.notion', 'Continue with Notion')}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  {t('choice.divider', 'or')}
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleOAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
            >
              {loadingGoogle ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              )}
              <span>
                {loadingGoogle
                  ? t('choice.connecting', 'Connecting...')
                  : t('choice.google', 'Continue with Google')}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t('choice.error', 'Authentication Error')}</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Trust Badge */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              {t('choice.trust', 'Your data is encrypted and secure. We never access your Notion content without your permission.')}
            </p>
          </div>

          {/* Privacy & Terms */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">
              {t('choice.privacy', 'Privacy Policy')}
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">
              {t('choice.terms', 'Terms of Service')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
