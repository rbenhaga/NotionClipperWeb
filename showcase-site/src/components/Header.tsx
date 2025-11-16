import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-lg" />
            <span className="text-xl font-semibold">Notion Clipper</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/pricing" className="text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Pricing
            </Link>
            <a href="#" className="text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Download
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-secondary">
              Sign In
            </a>
            <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-primary">
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-base text-gray-700 dark:text-gray-300">Home</Link>
              <Link to="/pricing" className="text-base text-gray-700 dark:text-gray-300">Pricing</Link>
              <a href="#" className="text-base text-gray-700 dark:text-gray-300">Download</a>
              <div className="pt-4 flex flex-col space-y-2">
                <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-secondary w-full">
                  Sign In
                </a>
                <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-primary w-full">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
