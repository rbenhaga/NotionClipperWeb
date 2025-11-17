import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { NotionClipperLogo } from '../assets/Logo.tsx';

type CallbackState = 'loading' | 'success' | 'error';

export default function NotionCallbackPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>('loading');
  const [error, setError] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setState('loading');

        // Get code and state from URL params
        const code = searchParams.get('code');
        const stateParam = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // Check for OAuth provider error
        if (errorParam) {
          throw new Error(searchParams.get('error_description') || errorParam);
        }

        // Validate required parameters
        if (!code || !stateParam) {
          throw new Error('Missing required OAuth parameters (code or state)');
        }

        // Exchange code for token and create user session
        const result = await authService.handleNotionCallback(code, stateParam);

        // Set workspace name for display
        setWorkspaceName(result.workspace?.name || 'Notion Workspace');

        // Success!
        setState('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err: any) {
        console.error('Notion OAuth callback error:', err);
        setState('error');
        setError(err.message || 'Failed to complete Notion authentication');

        // Redirect back to auth page after error
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden flex items-center justify-center">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Callback Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <NotionClipperLogo size={64} />
            </div>

            {/* Loading State */}
            {state === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('callback.loading', 'Connecting to Notion...')}
                </h2>
                <p className="text-gray-600">
                  {t('callback.loadingDesc', 'Please wait while we connect your workspace')}
                </p>
              </>
            )}

            {/* Success State */}
            {state === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('callback.success', 'Connected successfully!')}
                </h2>
                {workspaceName && (
                  <p className="text-gray-600 mb-2">
                    {t('callback.workspace', 'Workspace:')} <span className="font-semibold">{workspaceName}</span>
                  </p>
                )}
                <p className="text-gray-600">
                  {t('callback.successDesc', 'Redirecting to your dashboard...')}
                </p>
              </>
            )}

            {/* Error State */}
            {state === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('callback.error', 'Connection failed')}
                </h2>
                <p className="text-gray-600 mb-4">
                  {error || t('callback.errorDesc', 'Failed to connect to your Notion workspace')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('callback.errorRedirect', 'Redirecting back to login...')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
