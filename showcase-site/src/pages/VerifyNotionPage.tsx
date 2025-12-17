/**
 * VerifyNotionPage - Complete Notion registration after email verification
 * 
 * This page is shown after user clicks the verification link in their email.
 * It completes the Notion user registration and redirects to dashboard or app.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ClipperProLogo } from '../assets/Logo.tsx';
import { Button } from '../components/ui';
import { pageVariants, slideUpVariants } from '../lib/animations';

type PageState = 'verifying' | 'success' | 'error';

export default function VerifyNotionPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<PageState>('verifying');
  const [error, setError] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const completeVerification = async () => {
      const params = new URLSearchParams(location.search);
      const workspaceId = params.get('workspace');
      
      // Supabase adds these params after email verification
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (!workspaceId) {
        setError('Missing workspace information');
        setState('error');
        return;
      }

      try {
        // Call backend to finalize the Notion registration
        const response = await fetch(`${apiUrl}/auth/notion/finalize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            workspaceId,
            accessToken,
            refreshToken,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Verification failed');
        }

        // Store tokens
        if (data.data?.tokens?.accessToken) {
          localStorage.setItem('token', data.data.tokens.accessToken);
        }
        if (data.data?.user) {
          localStorage.setItem('user_id', data.data.user.id);
          localStorage.setItem('user_email', data.data.user.email);
        }

        setState('success');

        // Check if this was from app
        const source = sessionStorage.getItem('notion_auth_source');
        
        // Redirect after short delay
        setTimeout(() => {
          if (source === 'app' && data.data?.tokens?.accessToken) {
            // Redirect to app via deep link
            const deepLinkUrl = `notion-clipper://auth/callback?token=${encodeURIComponent(data.data.tokens.accessToken)}&userId=${encodeURIComponent(data.data.user?.id || '')}&email=${encodeURIComponent(data.data.user?.email || '')}`;
            window.location.href = deepLinkUrl;
          } else {
            // Web flow - go to dashboard
            navigate('/dashboard');
          }
        }, 2000);

      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Failed to complete verification');
        setState('error');
      }
    };

    completeVerification();
  }, [location, navigate, apiUrl]);

  // Verifying state
  if (state === 'verifying') {
    return (
      <motion.div
        className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

        <motion.div className="relative z-10 w-full max-w-md px-4" variants={slideUpVariants}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
            <div className="flex justify-center mb-6">
              <ClipperProLogo size={64} />
            </div>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('verifyNotion.verifying', 'Completing your registration...')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('verifyNotion.pleaseWait', 'Please wait while we set up your account.')}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <motion.div
        className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

        <motion.div className="relative z-10 w-full max-w-md px-4" variants={slideUpVariants}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('verifyNotion.success', 'Email verified!')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('verifyNotion.successMessage', 'Your account is ready. Redirecting...')}
            </p>
            <Loader2 className="w-6 h-6 mx-auto text-purple-500 animate-spin" />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Error state
  return (
    <motion.div
      className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-red-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

      <motion.div className="relative z-10 w-full max-w-md px-4" variants={slideUpVariants}>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('verifyNotion.error', 'Verification failed')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || t('verifyNotion.errorMessage', 'Something went wrong. Please try again.')}
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/auth')}
            >
              {t('verifyNotion.tryAgain', 'Try again')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
