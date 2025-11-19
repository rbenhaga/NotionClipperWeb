import { Star, Users, TrendingUp } from 'lucide-react';

export default function SocialProof() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="text-green-600">✓</span>
        <span>No credit card</span>
      </div>
      <span className="hidden sm:inline text-gray-300">•</span>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="text-green-600">✓</span>
        <span>14-day trial</span>
      </div>
      <span className="hidden sm:inline text-gray-300">•</span>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="text-green-600">✓</span>
        <span>10 clips free forever</span>
      </div>
    </div>
  );
}
