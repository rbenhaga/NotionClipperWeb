import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Palette, Globe, LogOut, Moon, Sun, Monitor, Check, Pencil, Save, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { NotionWorkspaceManager } from '../components/settings/NotionWorkspaceManager';
import { AvatarUpload } from '../components/settings/AvatarUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type ThemeMode = 'light' | 'dark' | 'system';

// Switch Component - Fixed and improved
const Switch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean }> = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) onChange();
    }}
    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  // Update editName when user changes
  useEffect(() => {
    if (user?.name) setEditName(user.name);
  }, [user?.name]);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSavingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: editName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setIsEditingProfile(false);
      // Refresh the page to get updated user data
      window.location.reload();
    } catch (err) {
      setProfileError(t('settings.profile.error', 'Failed to save changes'));
    } finally {
      setSavingProfile(false);
    }
  };

  // Initialize theme from localStorage or detect current theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else {
      // No saved theme - detect current state
      const isDarkMode = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // If current state matches system preference, it's likely "system" mode
      // Otherwise, detect based on current class
      if (isDarkMode === prefersDark) {
        setThemeMode('system');
      } else {
        setThemeMode(isDarkMode ? 'dark' : 'light');
      }
    }
  }, []);

  // Apply theme
  const applyTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
    
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', mode === 'dark');
    }
  };

  // Change language
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const themeOptions = [
    { value: 'light' as ThemeMode, label: t('settings.theme.light', 'Light'), icon: Sun },
    { value: 'dark' as ThemeMode, label: t('settings.theme.dark', 'Dark'), icon: Moon },
    { value: 'system' as ThemeMode, label: t('settings.theme.system', 'System'), icon: Monitor },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div {...fadeInUp} transition={{ duration: 0.3 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          {t('settings.title', 'Settings')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('settings.subtitle', 'Manage your account preferences')}
        </p>
      </motion.div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Profile Section */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('settings.profile.title', 'Profile')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.profile.description', 'Your account information')}
              </p>
            </div>
          </div>
          
          {/* Profile Info */}
          {isEditingProfile ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('settings.profile.name', 'Display Name')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={t('settings.profile.namePlaceholder', 'Enter your name')}
                />
              </div>
              {profileError && (
                <p className="text-sm text-red-500">{profileError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('settings.profile.save', 'Save')}
                </button>
                <button
                  onClick={() => { setIsEditingProfile(false); setEditName(user?.name || ''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('settings.profile.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                {/* Avatar compact */}
                <AvatarUpload
                  currentAvatar={user?.avatar}
                  userName={user?.name}
                  userEmail={user?.email}
                  compact
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title={t('settings.profile.edit', 'Edit profile')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Notion Workspaces Section */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <NotionWorkspaceManager />
        </motion.div>

        {/* Language Section */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('settings.language.title', 'Language')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.language.description', 'Choose your preferred language')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => changeLanguage('en')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                currentLang === 'en'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="font-medium text-gray-900 dark:text-white">English</span>
              {currentLang === 'en' && (
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
            <button
              onClick={() => changeLanguage('fr')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                currentLang === 'fr'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="font-medium text-gray-900 dark:text-white">Français</span>
              {currentLang === 'fr' && (
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Theme Section */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('settings.appearance.title', 'Appearance')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.appearance.description', 'Customize the look and feel')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => applyTheme(option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  themeMode === option.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <option.icon className={`w-5 h-5 ${
                  themeMode === option.value 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  themeMode === option.value 
                    ? 'text-purple-700 dark:text-purple-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('settings.notifications.title', 'Notifications')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.notifications.description', 'Manage your notification preferences')}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {t('settings.notifications.email', 'Email notifications')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('settings.notifications.emailDescription', 'Receive updates via email')}
                </p>
              </div>
              <Switch checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {t('settings.notifications.inApp', 'In-app notifications')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('settings.notifications.inAppDescription', 'Show notifications in the app')}
                </p>
              </div>
              <Switch checked={inAppNotifications} onChange={() => setInAppNotifications(!inAppNotifications)} />
            </div>
          </div>
        </motion.div>

        {/* Account Section */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('settings.danger.title', 'Account')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.danger.description', 'Manage your account')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              {t('settings.danger.logout', 'Log out')}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl transition-colors font-medium text-sm">
              {t('settings.danger.delete', 'Delete Account')}
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
