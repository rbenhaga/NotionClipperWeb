/**
 * NotionEmailPage - Collect email for Notion OAuth users
 * 
 * Notion OAuth doesn't provide user email, so we need to collect it
 * and verify it before completing the registration.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipperProLogo } from '../assets/Logo.tsx';
import { Button, Input, Alert } from '../components/ui';
import { pageVariants, fadeVariants, slideUpVariants } from '../lib/animations';

type PageMode = 'email-input' | 'verify-email';

export default function NotionEmailPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mode, setMode] = useState<PageMode>('email-input');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Get workspace ID and source from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const workspace = params.get('workspace');
    const source = params.get('source');
    
    if (!workspace) {
      // No workspace ID, redirect to auth
      navigate('/auth');
      return;
    }
    
    setWorkspaceId(workspace);
    
    // Store source for later redirect
    if (source === 'app') {
      sessionStorage.setItem('notion_auth_source', 'app');
    }
  }, [location, navigate]);

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(t('errors.invalidEmail', 'Please enter a valid email address'));
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handle email submission
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${apiUrl}/auth/notion/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId,
          email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to complete registration');
      }
      
      // Email verification required
      setMode('verify-email');
    } catch (err: any) {
      setError(err.message || t('errors.generic', 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to resend verification');
      }
      
      setError('✅ ' + t('verify.resent', 'Verification email sent!'));
      setTimeout(() => setError(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Email input mode
  if (mode === 'email-input') {
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
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Back Button */}
        <motion.div className="absolute top-8 left-8 z-20" variants={fadeVariants}>
          <Link
            to="/auth"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('common.back', 'Back')}</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div className="relative z-10 w-full max-w-md px-4" variants={slideUpVariants}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-apple-xl p-8 border border-gray-200 dark:border-gray-800">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <motion.div
                className="flex justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              >
                <ClipperProLogo size={64} />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('notionEmail.title', 'One more step')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('notionEmail.subtitle', 'Notion doesn\'t share your email. Please enter it to complete your registration.')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitEmail} className="space-y-5">
              <Input
                label={t('notionEmail.emailLabel', 'Your email address')}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                leftIcon={<Mail size={18} />}
                error={emailError}
                helperText={t('notionEmail.emailHelper', 'We\'ll send a verification link to this email')}
                required
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert
                      variant={error.startsWith('✅') ? 'success' : 'error'}
                      closable
                      onClose={() => setError('')}
                    >
                      {error.replace('✅ ', '')}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                {loading
                  ? t('notionEmail.submitting', 'Sending verification...')
                  : t('notionEmail.submit', 'Continue')}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('notionEmail.privacy', 'Your email is used for account recovery and important notifications only.')}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Verify email mode
  return (
    <motion.div
      className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div className="relative z-10 w-full max-w-md px-4" variants={slideUpVariants}>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
          {/* Email icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Mail className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('verify.title', 'Check your email')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t('verify.subtitle', 'We sent a verification link to:')}
          </p>
          <p className="text-purple-600 dark:text-purple-400 font-medium mb-6">
            {email}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('verify.instructions', 'Click the link in the email to verify your account, then come back here to sign in.')}
          </p>

          {/* Error/Success message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert
                  variant={error.startsWith('✅') ? 'success' : 'error'}
                  closable
                  onClose={() => setError('')}
                >
                  {error.replace('✅ ', '')}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleResendVerification}
              isLoading={loading}
            >
              {t('verify.resendButton', 'Resend verification email')}
            </Button>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/auth')}
            >
              {t('verify.goToLogin', 'Go to Sign In')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
