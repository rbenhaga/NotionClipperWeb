import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  BarChart3,
  Brain,
} from 'lucide-react';
import { ClipperProLogo } from '../../assets/Logo';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardSidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();

  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const navItems = [
    {
      icon: LayoutDashboard,
      label: t('dashboard.nav.overview', 'Overview'),
      to: '/dashboard',
    },
    {
      icon: BarChart3,
      label: t('dashboard.nav.activity', 'Activity'),
      to: '/dashboard/activity',
    },
    {
      icon: Brain,
      label: t('dashboard.nav.analytics', 'Analytics'),
      to: '/dashboard/analytics',
      badge: 'NEW',
    },
    {
      icon: CreditCard,
      label: t('dashboard.nav.billing', 'Billing'),
      to: '/dashboard/billing',
    },
    {
      icon: Settings,
      label: t('dashboard.nav.settings', 'Settings'),
      to: '/dashboard/settings',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="relative">
            <ClipperProLogo size={36} />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Clipper Pro
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Dashboard
            </span>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-xl object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm ${user.avatar_url ? 'hidden' : ''}`}>
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {t('dashboard.nav.menu', 'Menu')}
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1">{item.label}</span>
            {'badge' in item && item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-600 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* External Links */}
        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {t('dashboard.nav.links', 'Links')}
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all duration-150"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="flex-1">{t('dashboard.nav.website', 'Website')}</span>
          </a>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        {/* Language Toggle - Improved Design */}
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            {t('dashboard.nav.language', 'Language')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                i18n.changeLanguage('en');
                localStorage.setItem('language', 'en');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentLang === 'en'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => {
                i18n.changeLanguage('fr');
                localStorage.setItem('language', 'fr');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentLang === 'fr'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <span>🇫🇷</span>
              <span>FR</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left">{t('common.logout', 'Log out')}</span>
        </button>
      </div>
    </aside>
  );
};
