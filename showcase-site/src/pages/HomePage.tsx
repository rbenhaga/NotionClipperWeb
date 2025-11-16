import Header from '../components/Header';
import { Zap, Lock, Cloud, Smartphone, Image, FileText } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="section pt-32">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
              <span className="gradient-text">Capture anything</span>
              <br />
              to Notion instantly
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-10 text-balance animate-slide-up">
              The fastest way to save content to Notion. Capture text, images, links and more from anywhere with a single shortcut.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-primary px-8 py-4 text-lg">
                Get Started Free
              </a>
              <a href="#features" className="btn-secondary px-8 py-4 text-lg">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Powerful features that make saving to Notion effortless</p>
          </div>

          <div className="feature-grid">
            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white dark:text-gray-900" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Clip content to Notion in milliseconds with our optimized capture engine
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="text-white dark:text-gray-900" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is encrypted and never leaves your Notion workspace
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <Cloud className="text-white dark:text-gray-900" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cloud Sync</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access your clips from any device, anywhere, anytime
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-white dark:text-gray-900" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Platform</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Available on macOS, Windows, Linux, and browser extension
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <Image className="text-white dark:text-gray-900" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rich Media</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Capture images, PDFs, and documents with perfect formatting
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-white dark:text-gray-900" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Markdown Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced Markdown parsing for perfect Notion formatting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container-custom">
          <div className="glass rounded-4xl p-12 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of users who save hours every week with Notion Clipper
            </p>
            <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-primary px-8 py-4 text-lg">
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="container-custom">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Notion Clipper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
