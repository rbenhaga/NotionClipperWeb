import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Database, ExternalLink } from 'lucide-react';
import { ClipperProLogo } from '../assets/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'checking-notion' | 'need-notion' | 'success' | 'error'>('processing');
  const [connectingNotion, setConnectingNotion] = useState(false);
  
  // 🔧 FIX: Check source BEFORE render to avoid flash
  const source = searchParams.get('source');
  const isAppRedirect = source === 'app';

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      console.log('📝 AuthSuccess: Token received:', token.substring(0, 20) + '...');
      console.log('📝 AuthSuccess: Source:', source);
      
      // Save token first
      localStorage.setItem('token', token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) localStorage.setItem('user_id', payload.userId);
        if (payload.email) localStorage.setItem('user_email', payload.email);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
      
      // 🔧 FIX: For desktop app, check if user has Notion workspace BEFORE redirecting
      if (isAppRedirect) {
        console.log('🖥️ Desktop app detected - checking Notion workspace...');
        setStatus('checking-notion');
        
        // Check if user has Notion workspace
        fetch(`${API_URL}/user/app-data`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(result => {
            const appData = result.data || result;
            console.log('📊 App data:', { hasNotionWorkspace: appData.hasNotionWorkspace });
            
            if (appData.hasNotionWorkspace) {
              // User has Notion workspace, redirect to app
              console.log('✅ User has Notion workspace, redirecting to app...');
              redirectToApp(token);
            } else {
              // User needs to connect Notion first
              console.log('⚠️ User needs to connect Notion workspace');
              setStatus('need-notion');
            }
          })
          .catch(err => {
            console.error('Error checking Notion workspace:', err);
            // On error, still redirect to app (it will handle the missing workspace)
            redirectToApp(token);
          });
        
        return;
      }
      
      // Web flow: save token and redirect to dashboard
      console.log('🌐 Web flow - saving token to localStorage');
      localStorage.setItem('token', token);
      
      // Also store user info from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) localStorage.setItem('user_id', payload.userId);
        if (payload.email) localStorage.setItem('user_email', payload.email);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
      
      console.log('✅ Token saved. Verifying...');
      const savedToken = localStorage.getItem('token');
      console.log('🔍 Verification - Token in localStorage:', savedToken ? 'YES' : 'NO');

      setStatus('success');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        console.log('🚀 Redirecting to /dashboard');
        navigate('/dashboard');
      }, 2000);
    } else {
      console.error('❌ No token in URL params');
      setStatus('error');
      // Redirect to auth page after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  }, [searchParams, navigate]);

  // Helper function to redirect to desktop app
  const redirectToApp = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || '';
      const email = payload.email || '';
      const deepLinkUrl = `notion-clipper://auth/callback?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`;
      console.log('🔗 Deep link URL:', deepLinkUrl);
      window.location.href = deepLinkUrl;
    } catch (e) {
      console.error('❌ Error decoding token:', e);
      window.location.href = `notion-clipper://auth/callback?token=${encodeURIComponent(token)}`;
    }
  };

  // Handle Notion connection
  const handleConnectNotion = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setConnectingNotion(true);
    
    // Redirect to Notion OAuth with addToAccount=true
    const params = new URLSearchParams({
      source: 'app', // Keep app source so callback knows to redirect to app
      addToAccount: 'true',
      userToken: token
    });
    
    window.location.href = `${API_URL}/auth/notion?${params.toString()}`;
  };

  // 🔧 FIX: Show "Connect Notion" screen if user needs to connect workspace
  if (status === 'need-notion') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <ClipperProLogo size={56} />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
              Dernière étape !
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Connectez votre workspace Notion pour commencer à clipper
            </p>

            {/* Notion Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                <Database className="w-10 h-10 text-gray-900 dark:text-white" />
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={handleConnectNotion}
              disabled={connectingNotion}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {connectingNotion ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                    alt="Notion"
                    className="w-5 h-5"
                  />
                  Connecter Notion
                  <ExternalLink className="w-4 h-4 opacity-60" />
                </>
              )}
            </button>

            {/* Info */}
            <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
              Vous serez redirigé vers Notion pour autoriser l'accès à votre workspace
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🔧 FIX: For app redirects, show minimal UI while checking/redirecting
  if (isAppRedirect && (status === 'processing' || status === 'checking-notion')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <ClipperProLogo size={48} />
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {status === 'checking-notion' ? 'Vérification...' : 'Ouverture de l\'application...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background Orbs - Same as AuthPage */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/30 dark:bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-apple-xl border border-gray-100 dark:border-gray-700 p-8">
          {status === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <Loader className="w-12 h-12 text-purple-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Authenticating...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Setting up your account
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Logo Animation instead of green check */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
                className="flex justify-center mb-6"
              >
                <ClipperProLogo size={64} />
              </motion.div>

              <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Clipper Pro
              </h1>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Successfully Connected!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchParams.get('source') === 'app' 
                  ? 'Redirecting to the desktop app...'
                  : 'Redirecting to your dashboard...'}
              </p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                />
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting back to login...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
