-- ============================================
-- Migration: Drop Unused Tables
-- Date: 2025-11-18
-- Description: Remove redundant and unused tables to optimize database schema
-- Author: Backend Optimization - Apple/Notion Quality Standards
-- ============================================

-- SAFETY: Create backup schema first (optional, comment out in production if not needed)
-- CREATE SCHEMA IF NOT EXISTS backup_20251118;

-- ============================================
-- DROP REDUNDANT TABLES
-- ============================================

-- Drop table: users (redundant with user_profiles)
-- Reason: user_profiles is the single source of truth for user data
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop table: notion_workspaces (redundant with notion_connections)
-- Reason: notion_connections handles encrypted tokens properly
DROP TABLE IF EXISTS public.notion_workspaces CASCADE;

-- ============================================
-- DROP UNUSED FEATURE TABLES
-- ============================================

-- Drop table: clip_history
-- Reason: Clipping history is managed locally by the desktop app
DROP TABLE IF EXISTS public.clip_history CASCADE;

-- Drop table: user_favorites
-- Reason: Favorites are a UI feature managed by the desktop app
DROP TABLE IF EXISTS public.user_favorites CASCADE;

-- Drop table: mode_sessions
-- Reason: Focus/Compact mode sessions are not a priority feature
DROP TABLE IF EXISTS public.mode_sessions CASCADE;

-- Drop table: notion_api_keys
-- Reason: Not used in current implementation (OAuth only)
DROP TABLE IF EXISTS public.notion_api_keys CASCADE;

-- ============================================
-- SUMMARY
-- ============================================
-- Tables removed: 6
-- Tables remaining: 5 (user_profiles, subscriptions, usage_records, usage_events, notion_connections)
-- Database complexity reduction: ~55%
--
-- Benefits:
-- - Cleaner schema
-- - Faster queries
-- - Easier maintenance
-- - Better performance
-- ============================================
