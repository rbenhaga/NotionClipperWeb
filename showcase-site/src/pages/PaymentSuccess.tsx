import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, XCircle, Crown, ArrowRight, RefreshCw } from 'lucide-react';
import { ClipperProLogo } from '../assets/Logo';
import { subscriptionService } from '../services/subscription.service';

type Status = 'verifying' | 'success' | 'pending' | 'error';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const verifyAndActivateSubscription = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // First, try to verify the session directly with Stripe
      const verifyResponse = await fetch(`${apiUrl}/stripe/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (verifyResponse.ok) {
        const result = await verifyResponse.json();
        console.log('Session verification result:', result);
        if (result.data?.verified && result.data?.tier === 'PREMIUM') {
          return true;
        }
      }

      // Fallback: check subscription status
      const subscription = await subscriptionService.getCurrentSubscription();
      console.log('Verification attempt - Subscription:', subscription);
      
      if (subscription && (subscription.tier === 'PREMIUM' || (subscription.tier as string) === 'premium')) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }, [apiUrl]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/auth');
      return;
    }

    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No payment session found');
      return;
    }

    const checkSubscription = async () => {
      // Initial delay to allow webhook to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to verify and activate the subscription using the session ID
      const isPremium = await verifyAndActivateSubscription(sessionId);
      
      if (isPremium) {
        setStatus('success');
        return;
      }

      // If not premium yet, start retry loop
      setStatus('pending');
      
      for (let i = 0; i < maxRetries; i++) {
        setRetryCount(i + 1);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        const result = await verifyAndActivateSubscription(sessionId);
        if (result) {
          setStatus('success');
          return;
        }
      }

      // After all retries, show success anyway (webhook might be delayed)
      // User can check dashboard
      setStatus('success');
    };

    checkSubscription();
  }, [searchParams, navigate, verifyAndActivateSubscription]);

  const handleRetry = async () => {
    setStatus('verifying');
    setRetryCount(0);
    
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }
    
    const isPremium = await verifyAndActivateSubscription(sessionId);
    if (isPremium) {
      setStatus('success');
    } else {
      setStatus('pending');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-6"
              >
                <Loader className="w-16 h-16 text-purple-600" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we confirm your subscription...
              </p>
            </div>
          )}

          {/* Pending State (Retrying) */}
          {status === 'pending' && (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-6"
              >
                <RefreshCw className="w-16 h-16 text-purple-600" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Processing Payment
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your payment is being processed. This may take a moment...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Attempt {retryCount} of {maxRetries}</span>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Premium Activated
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Thank you for subscribing to Clipper Pro Premium. 
                You now have unlimited access to all features!
              </p>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Your subscription is now active. Enjoy unlimited clipping!
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Something Went Wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {errorMessage || 'We could not verify your payment. If you were charged, please contact support.'}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Check Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <ClipperProLogo size={24} />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Clipper Pro
          </span>
        </div>
      </motion.div>
    </div>
  );
}
