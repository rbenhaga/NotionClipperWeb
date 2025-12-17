/**
 * ReferralRedirect - Handles /r/:code referral links
 * Redirects to landing page with referral code in query params
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to landing page with referral code
    if (code) {
      navigate(`/?ref=${code}#waitlist`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [code, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Redirection...</p>
      </div>
    </div>
  );
}
