import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', token);

      // Redirect to app or dashboard after 2 seconds
      setTimeout(() => {
        // TODO: Redirect to actual app URL
        window.location.href = '/dashboard';
      }, 2000);
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="card max-w-md w-full text-center p-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-4">Authentication Successful!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You're all set. Redirecting you to the app...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    </div>
  );
}
