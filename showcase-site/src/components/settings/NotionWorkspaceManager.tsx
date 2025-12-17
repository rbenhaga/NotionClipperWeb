/**
 * NotionWorkspaceManager Component
 * Manages Notion workspace connections in Settings
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  Star,
  StarOff,
  RefreshCw,
  Crown,
  Lock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../contexts/SubscriptionContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Workspace {
  id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_icon?: string;
  is_active: boolean;
  is_default: boolean;
  connection_status: 'active' | 'disconnected' | 'expired' | 'revoked';
  last_used_at?: string;
  created_at: string;
}

export const NotionWorkspaceManager: React.FC = () => {
  const { t } = useTranslation();
  const { subscription } = useSubscription();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if user is premium
  const isPremium = subscription?.tier === 'PREMIUM' || subscription?.status === 'active' || subscription?.status === 'trialing';
  const maxWorkspaces = isPremium ? Infinity : 1;

  // Check for success/error messages in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('workspace_added') === 'true') {
      setSuccess(t('settings.workspaces.addedSuccess', 'Workspace added successfully!'));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    const errorParam = params.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [t]);

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/workspace/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch workspaces');

      const data = await response.json();
      setWorkspaces(data.data?.workspaces || []);
      setError(null);
    } catch (err) {
      setError(t('settings.workspaces.fetchError', 'Failed to load workspaces'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Set default workspace
  const handleSetDefault = async (workspaceId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setActionLoading(workspaceId);
    try {
      const response = await fetch(`${API_URL}/workspace/set-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId })
      });

      if (!response.ok) throw new Error('Failed to set default');

      await fetchWorkspaces();
    } catch (err) {
      setError(t('settings.workspaces.setDefaultError', 'Failed to set default workspace'));
    } finally {
      setActionLoading(null);
    }
  };

  // Disconnect workspace
  const handleDisconnect = async (workspaceId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm(t('settings.workspaces.confirmDisconnect', 'Are you sure you want to disconnect this workspace? You can reconnect it later.'))) {
      return;
    }

    setActionLoading(workspaceId);
    try {
      const response = await fetch(`${API_URL}/workspace/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId })
      });

      if (!response.ok) throw new Error('Failed to disconnect');

      await fetchWorkspaces();
    } catch (err) {
      setError(t('settings.workspaces.disconnectError', 'Failed to disconnect workspace'));
    } finally {
      setActionLoading(null);
    }
  };

  // Connect new workspace (redirect to Notion OAuth)
  const handleConnectNew = () => {
    // Check workspace limit for free users
    if (!isPremium && activeWorkspaces.length >= maxWorkspaces) {
      setError(t('settings.workspaces.limitReached', 'Free users can only connect 1 workspace. Upgrade to Premium for unlimited workspaces.'));
      return;
    }

    const token = localStorage.getItem('token');
    // Pass token in state so callback knows to add workspace to existing account
    const params = new URLSearchParams({
      source: 'web',
      addToAccount: 'true'
    });
    if (token) {
      params.set('userToken', token);
    }
    window.location.href = `${API_URL}/auth/notion?${params.toString()}`;
  };

  // Navigate to upgrade
  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const activeWorkspaces = workspaces.filter(w => w.is_active);
  const disconnectedWorkspaces = workspaces.filter(w => !w.is_active);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('settings.workspaces.title', 'Notion Workspaces')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.workspaces.description', 'Manage your connected Notion workspaces')}
            </p>
          </div>
        </div>
        {/* Show limit for free users */}
        {!isPremium && activeWorkspaces.length >= maxWorkspaces ? (
          <button
            onClick={handleUpgrade}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors text-sm font-medium"
          >
            <Crown className="w-4 h-4" />
            {t('settings.workspaces.upgrade', 'Upgrade for more')}
          </button>
        ) : (
          <button
            onClick={handleConnectNew}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('settings.workspaces.addNew', 'Add Workspace')}
          </button>
        )}
      </div>

      {/* Success */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
          >
            <Check className="w-4 h-4" />
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto hover:text-green-800">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-800">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <>
          {/* Active Workspaces */}
          {activeWorkspaces.length > 0 ? (
            <div className="space-y-3">
              {activeWorkspaces.map((workspace) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    workspace.is_default 
                      ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Notion Logo */}
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" fill="#fff"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" fill="currentColor" className="text-gray-900 dark:text-white"/>
                        </svg>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {workspace.workspace_name}
                          </span>
                          {workspace.is_default && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full">
                              {t('settings.workspaces.default', 'Default')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {workspace.last_used_at 
                            ? t('settings.workspaces.lastUsed', 'Last used: {{date}}', { 
                                date: new Date(workspace.last_used_at).toLocaleDateString() 
                              })
                            : t('settings.workspaces.neverUsed', 'Never used')
                          }
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!workspace.is_default && (
                        <button
                          onClick={() => handleSetDefault(workspace.id)}
                          disabled={actionLoading === workspace.id}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                          title={t('settings.workspaces.setAsDefault', 'Set as default')}
                        >
                          {actionLoading === workspace.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDisconnect(workspace.workspace_id)}
                        disabled={actionLoading === workspace.id}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title={t('settings.workspaces.disconnect', 'Disconnect')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('settings.workspaces.noWorkspaces', 'No workspaces connected')}
              </p>
              <button
                onClick={handleConnectNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {t('settings.workspaces.connectFirst', 'Connect your first workspace')}
              </button>
            </div>
          )}

          {/* Disconnected Workspaces */}
          {disconnectedWorkspaces.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {t('settings.workspaces.disconnected', 'Disconnected Workspaces')}
              </h3>
              <div className="space-y-2">
                {disconnectedWorkspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <StarOff className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {workspace.workspace_name}
                      </span>
                    </div>
                    <button
                      onClick={handleConnectNew}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('settings.workspaces.reconnect', 'Reconnect')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workspace limit info for free users */}
          {!isPremium && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-1">
                    {t('settings.workspaces.freeLimit', 'Free plan: 1 workspace')}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {t('settings.workspaces.freeLimitDesc', 'Upgrade to Premium for unlimited Notion workspaces.')}
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="mt-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" />
                    {t('settings.workspaces.upgradeNow', 'Upgrade now')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>{t('settings.workspaces.note', 'Note:')}</strong>{' '}
              {t('settings.workspaces.noteText', 'Each Notion workspace can only be linked to one Clipper Pro account. This helps prevent abuse and ensures fair usage.')}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default NotionWorkspaceManager;
