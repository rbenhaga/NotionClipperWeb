/**
 * AuthPage - OAuth only (Google + Notion)
 * Email signup/login has been removed for simplicity
 */

import { useState, useEffect, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipperProLogo } from '../assets/Logo.tsx';
import { authService } from '../services/auth.service';
import { Button, Alert } from '../components/ui';
import { pageVariants, fadeVariants, slideUpVariants } from '../lib/animations';

// Check token synchronously before component renders
const checkTokenSync = () => {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  const token = localStorage.getItem('token');

  if (source === 'app' && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;

      if (!exp || Date.now() < exp * 1000) {
        return {
          shouldRedirect: true,
          token,
          userId: payload.userId,
          email: payload.email,
          isFromApp: true,
        };
      }
    } catch {
      // Invalid token
    }
  }

  return { shouldRedirect: false, isFromApp: source === 'app' };
};

export default function AuthPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();

  const [redirectInfo] = useState(() => checkTokenSync());
  const [hasRedirected, setHasRedirected] = useState(false);
  const [loadingNotion, setLoadingNotion] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(
    redirectInfo.isFromApp || redirectInfo.shouldRedirect
  );

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const searchParams = new URLSearchParams(location.search);
  const isFromApp = searchParams.get('source') === 'app';

  // Redirect immediately using useLayoutEffect
  useLayoutEffect(() => {
    if (redirectInfo.shouldRedirect && !hasRedirected) {
      setHasRedirected(true);
      const deepLinkUrl = `notion-clipper://auth/callback?token=${encodeURIComponent(redirectInfo.token!)}&userId=${encodeURIComponent(redirectInfo.userId || '')}&email=${encodeURIComponent(redirectInfo.email || '')}`;
      console.log('[Auth] ✅ Redirecting to app immediately');
      window.location.href = deepLinkUrl;
    }
  }, [redirectInfo, hasRedirected]);

  // Check if user is already authenticated
  useEffect(() => {
    if (redirectInfo.shouldRedirect) return;

    const checkAuth = async () => {
      const source = searchParams.get('source');
      const plan = searchParams.get('plan');
      const checkout = searchParams.get('checkout');

      console.log('[Auth] Checking auth status, source:', source);

      try {
        const token = localStorage.getItem('token');

        if (source === 'app') {
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const exp = payload.exp;
              if (exp && Date.now() >= exp * 1000) {
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_email');
              }
            } catch {
              localStorage.removeItem('token');
              localStorage.removeItem('user_id');
              localStorage.removeItem('user_email');
            }
          }
          setIsCheckingAuth(false);
          return;
        }

        const user = await authService.getCurrentUser();
        if (user) {
          console.log('[Auth] ✅ User authenticated:', user.user.email);

          if (checkout === 'true' && plan) {
            const success = await initiateDirectCheckout(plan);
            if (!success) navigate('/pricing');
            return;
          }

          // Redirect to landing page (waitlist section) instead of dashboard
          navigate('/#waitlist');
          return;
        }

        console.log('[Auth] ℹ️ No user found, showing auth page');
      } catch (error) {
        console.error('[Auth] Error checking auth:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate, location]);

  const initiateDirectCheckout = async (planType: string) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planType }),
      });

      const result = await response.json();
      if (result.data?.url) {
        window.location.href = result.data.url;
        return true;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
    return false;
  };

  const handleNotionOAuth = () => {
    try {
      setLoadingNotion(true);
      setError('');
      authService.initiateNotionOAuth(isFromApp ? 'app' : 'web');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Notion authentication');
      setLoadingNotion(false);
    }
  };

  const handleGoogleOAuth = () => {
    try {
      setLoadingGoogle(true);
      setError('');
      authService.initiateGoogleOAuth(isFromApp ? 'app' : 'web');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google authentication');
      setLoadingGoogle(false);
    }
  };

  // Loading screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.loading', 'Loading...')}
          </p>
        </div>
      </div>
    );
  }

  const oauthLoading = loadingNotion || loadingGoogle;

  return (
    <motion.div
      className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-indigo-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-pink-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="absolute bottom-1/3 right-1/3 w-[24rem] h-[24rem] bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '4s' }}
      />

      {/* Back Button */}
      <motion.div className="absolute top-8 left-8 z-20" variants={fadeVariants}>
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('choice.back', 'Back to Home')}</span>
        </Link>
      </motion.div>

      {/* Auth Card */}
      <motion.div className="relative z-10 w-full max-w-md px-4" variants={slideUpVariants}>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-apple-xl p-8 border border-gray-200 dark:border-gray-800">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
            >
              <ClipperProLogo size={64} />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('choice.title', 'Welcome to Clipper Pro')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('choice.subtitle', 'Connect your account to get started')}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-4">
            {/* Notion OAuth - Primary */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNotionOAuth}
              disabled={oauthLoading}
              isLoading={loadingNotion}
              leftIcon={
                !loadingNotion && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" fill="#fff" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" fill="#000" />
                  </svg>

                )
              }
            >
              {loadingNotion
                ? t('choice.connecting', 'Connecting...')
                : t('choice.notion', 'Continue with Notion')}
            </Button>

            {/* Divider */}
            <div className="divider my-6">
              <span>{t('choice.divider', 'or')}</span>
            </div>

            {/* Google OAuth */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleGoogleOAuth}
              disabled={oauthLoading}
              isLoading={loadingGoogle}
              leftIcon={
                !loadingGoogle && (
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                )
              }
            >
              {loadingGoogle
                ? t('choice.connecting', 'Connecting...')
                : t('choice.google', 'Continue with Google')}
            </Button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert
                  variant="error"
                  title={t('choice.error', 'Authentication Error')}
                  closable
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Badge */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t(
                'choice.trust',
                'Your data is encrypted and secure. We never access your Notion content without your permission.'
              )}
            </p>
          </div>

          {/* Privacy & Terms */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <Link
              to="/privacy"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('choice.privacy', 'Privacy Policy')}
            </Link>
            <span>•</span>
            <Link
              to="/terms"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('choice.terms', 'Terms of Service')}
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
