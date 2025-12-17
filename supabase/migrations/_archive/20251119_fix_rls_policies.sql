-- Migration: Fix RLS Policies for OAuth
-- Date: 2025-11-19
-- Description: Permet au service role de gérer les user_profiles pour OAuth

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Service role can insert user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can update user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can select user_profiles" ON user_profiles;

-- Créer les nouvelles politiques pour le service role
CREATE POLICY "Service role can insert user_profiles"
ON user_profiles
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update user_profiles"
ON user_profiles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can select user_profiles"
ON user_profiles
FOR SELECT
TO service_role
USING (true);

-- Vérifier les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
