import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotionClipperLogo } from '../assets/Logo.tsx';

type AuthMode = 'choice' | 'signup' | 'login';

export default function AuthPage() {
  const { t } = useTranslation('auth');
  const [mode, setMode] = useState<AuthMode>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingNotion, setLoadingNotion] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Notion OAuth
  const handleNotionOAuth = () => {
    setLoadingNotion(true);
    setLoading(true);
    window.location.href = `${apiUrl}/auth/notion`;
  };

  // Google OAuth
  const handleGoogleOAuth = () => {
    setLoadingGoogle(true);
    setLoading(true);
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Email Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError(t('errors.required'));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('errors.passwordLength'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.signup'));
      }

      // Redirect to success page or dashboard
      window.location.href = `/auth/success?email=${encodeURIComponent(email)}`;
    } catch (err: any) {
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // Email Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError(t('errors.required'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.login'));
      }

      // Redirect to success page or dashboard
      window.location.href = `/auth/success?email=${encodeURIComponent(email)}`;
    } catch (err: any) {
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // Choice Mode
  if (mode === 'choice') {
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
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
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
                {t('choice.title')}
              </h1>
              <p className="text-gray-600">
                {t('choice.subtitle')}
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
                <span>{loadingNotion ? t('choice.connecting') : t('choice.notion')}</span>
              </button>

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
                <span>{loadingGoogle ? t('choice.connecting') : t('choice.google')}</span>
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">{t('choice.divider')}</span>
                </div>
              </div>

              {/* Email */}
              <button
                onClick={() => setMode('signup')}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                {t('choice.email')}
              </button>

              <button
                onClick={() => setMode('login')}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                {t('choice.hasAccount')} <span className="underline font-medium">{t('choice.signInLink')}</span>
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Trust Badge */}
            <div className="mt-8 text-center text-xs text-gray-500">
              {t('choice.trust')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup Mode
  if (mode === 'signup') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden flex items-center justify-center">
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-[10px] opacity-50">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => {
            setMode('choice');
            setError('');
          }}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Signup Card */}
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('signup.title')}
              </h2>
              <p className="text-gray-600">
                {t('signup.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('signup.email')}
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    placeholder={t('signup.emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('signup.password')}
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    placeholder={t('signup.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('signup.passwordHint')}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {loading ? t('signup.buttonLoading') : t('signup.button')}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                {t('signup.hasAccount')} <span className="underline font-medium">{t('signup.signInLink')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Login Mode
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden flex items-center justify-center">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Back */}
      <button
        onClick={() => {
          setMode('choice');
          setError('');
        }}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('login.title')}
            </h2>
            <p className="text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  placeholder={t('login.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? t('login.buttonLoading') : t('login.button')}
            </button>

            <button
              type="button"
              onClick={() => setMode('signup')}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
            >
              {t('login.noAccount')} <span className="underline font-medium">{t('login.signUpLink')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
