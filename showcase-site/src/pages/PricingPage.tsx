import Header from '../components/Header';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div>
      <Header />

      <section className="section pt-32">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Choose the plan that's right for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="card p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Perfect for individuals getting started</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span>100 clips per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span>10 file uploads per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span>60 minutes focus mode</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span>Basic Markdown support</span>
                </li>
              </ul>

              <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-secondary w-full">
                Get Started
              </a>
            </div>

            {/* Premium Plan */}
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold">$9</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">For power users who clip daily</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span className="font-semibold">Unlimited clips</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span className="font-semibold">Unlimited file uploads</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span className="font-semibold">Unlimited focus mode</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span>Advanced Markdown parsing</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0" size={20} />
                  <span>Early access to new features</span>
                </li>
              </ul>

              <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-primary w-full">
                Start Free Trial
              </a>
            </div>
          </div>

          <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
            <p>All plans include a 14-day free trial. No credit card required.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 mt-20">
        <div className="container-custom">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Notion Clipper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
