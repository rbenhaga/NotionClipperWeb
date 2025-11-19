import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('You\'re all set. Redirecting you to the app...');

  useEffect(() => {
    // OAuth success (token from Google/Notion)
    if (token) {
      localStorage.setItem('auth_token', token);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      return;
    }

    // Stripe payment success (session_id from Stripe)
    if (sessionId) {
      setMessage('Payment successful! Redirecting you to your dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      return;
    }

    // No params, redirect immediately
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  }, [token, sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full text-center p-12 border border-gray-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {sessionId ? 'Payment Successful!' : 'Authentication Successful!'}
        </h1>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  );
}
