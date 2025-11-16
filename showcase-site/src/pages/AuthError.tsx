import { useSearchParams, Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Unknown error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="card max-w-md w-full text-center p-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-600 dark:text-red-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error}
        </p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
