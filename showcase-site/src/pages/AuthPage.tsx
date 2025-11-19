import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { NotionClipperLogo } from '../assets/Logo.tsx';
import { authService } from '../services/auth.service';
import { Button, Input, Alert } from '../components/ui';
import { pageVariants, fadeVariants, slideUpVariants } from '../lib/animations';

type AuthMode = 'choice' | 'signup' | 'login';

export default function AuthPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingNotion, setLoadingNotion] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  // Real-time validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  // Email validation (real-time)
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation (real-time)
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Handle Notion OAuth
  const handleNotionOAuth = () => {
    try {
      setLoadingNotion(true);
      setError('');
      authService.initiateNotionOAuth();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Notion authentication');
      setLoadingNotion(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleOAuth = () => {
    try {
      setLoadingGoogle(true);
      setError('');
      authService.initiateGoogleOAuth();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google authentication');
      setLoadingGoogle(false);
    }
  };

  // Handle Email Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setLoading(false);
      return;
    }

    try {
      await authService.signUpWithEmail(email, password, fullName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('errors.signup', 'Failed to sign up'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setLoading(false);
      return;
    }

    try {
      await authService.signInWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('errors.login', 'Failed to sign in'));
    } finally {
      setLoading(false);
    }
  };

  // Choice Mode
  if (mode === 'choice') {
    const oauthLoading = loadingNotion || loadingGoogle;

    return (
      <motion.div
        className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        {/* Back Button */}
        <motion.div
          className="absolute top-8 left-8 z-20"
          variants={fadeVariants}
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('choice.back', 'Back to Home')}</span>
          </Link>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          className="relative z-10 w-full max-w-md px-4"
          variants={slideUpVariants}
        >
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
                <NotionClipperLogo size={64} />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('choice.title', 'Welcome to NotionClipper')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('choice.subtitle', 'Connect your account to get started')}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {/* Notion OAuth */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNotionOAuth}
                disabled={oauthLoading}
                isLoading={loadingNotion}
                leftIcon={
                  !loadingNotion && (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                      alt="Notion"
                      width="20"
                      height="20"
                      className="object-contain"
                    />
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

              {/* Divider */}
              <div className="divider my-6">
                <span>{t('choice.divider', 'or')}</span>
              </div>

              {/* Email Signup Button */}
              <Button
                variant="accent"
                size="lg"
                fullWidth
                onClick={() => setMode('signup')}
              >
                {t('choice.email', 'Continue with Email')}
              </Button>

              <button
                onClick={() => setMode('login')}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              >
                {t('choice.hasAccount', 'Already have an account?')}{' '}
                <span className="underline font-medium">
                  {t('choice.signInLink', 'Sign in')}
                </span>
              </button>
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

  // Signup Mode
  if (mode === 'signup') {
    return (
      <motion.div
        className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        {/* Back */}
        <motion.button
          onClick={() => {
            setMode('choice');
            setError('');
            setEmailError('');
            setPasswordError('');
          }}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors z-20"
          variants={fadeVariants}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>

        {/* Signup Card */}
        <motion.div
          className="relative z-10 w-full max-w-md px-4"
          variants={slideUpVariants}
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-apple-xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('signup.title', 'Create your account')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('signup.subtitle', 'Start saving to Notion for free')}
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <Input
                label={t('signup.fullName', 'Full Name')}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User size={18} />}
                helperText={t('signup.optional', '(optional)')}
              />

              <Input
                label={t('signup.email', 'Email')}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                leftIcon={<Mail size={18} />}
                error={emailError}
                required
              />

              <Input
                label={t('signup.password', 'Password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                error={passwordError}
                helperText={
                  !passwordError
                    ? t('signup.passwordHint', 'At least 8 characters')
                    : undefined
                }
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
                      variant="error"
                      closable
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                {loading
                  ? t('signup.buttonLoading', 'Creating account...')
                  : t('signup.button', 'Create account')}
              </Button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              >
                {t('signup.hasAccount', 'Already have an account?')}{' '}
                <span className="underline font-medium">
                  {t('signup.signInLink', 'Sign in')}
                </span>
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Login Mode
  return (
    <motion.div
      className="relative min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex items-center justify-center"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {/* Back */}
      <motion.button
        onClick={() => {
          setMode('choice');
          setError('');
          setEmailError('');
          setPasswordError('');
        }}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors z-20"
        variants={fadeVariants}
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </motion.button>

      {/* Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md px-4"
        variants={slideUpVariants}
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-apple-xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('login.title', 'Welcome back')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('login.subtitle', 'Sign in to your account')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label={t('login.email', 'Email')}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              leftIcon={<Mail size={18} />}
              error={emailError}
              required
            />

            <Input
              label={t('login.password', 'Password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              leftIcon={<Lock size={18} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              error={passwordError}
              required
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="error" closable onClose={() => setError('')}>
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              {loading
                ? t('login.buttonLoading', 'Signing in...')
                : t('login.button', 'Sign in')}
            </Button>

            <button
              type="button"
              onClick={() => setMode('signup')}
              className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
            >
              {t('login.noAccount', "Don't have an account?")}{' '}
              <span className="underline font-medium">
                {t('login.signUpLink', 'Sign up')}
              </span>
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
