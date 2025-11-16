/**
 * PM2 Ecosystem Configuration for Notion Clipper Backend
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 logs
 */

export default {
  apps: [
    {
      name: 'notion-clipper-backend',
      script: './dist/server.js',
      instances: 2, // 2 instances pour load balancing (VPS has 4 vCPU)
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Auto-restart configuration
      autorestart: true,
      watch: false, // Don't watch in production
      max_memory_restart: '1G',

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful reload
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Health check
      min_uptime: '10s',
      max_restarts: 10,

      // Advanced features
      instance_var: 'INSTANCE_ID',
      post_update: ['pnpm install', 'pnpm build'],
    },
  ],
};
